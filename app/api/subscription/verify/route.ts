import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { 
  updateUserPlan, 
  getUserByEmail, 
  createStripeCustomer, 
  getStripeCustomerByUserId,
  createSubscription,
  updateSubscription,
  getSubscriptionByStripeId,
  createInvoice,
  getInvoiceByStripeId,
  updateInvoice,
  createPaymentMethod,
  getPaymentMethodsByUserId
} from '@/lib/db';
import { getPlan } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    console.log('🔍 Subscription verification requested:', {
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    });
    
    if (!sessionId) {
      console.log('❌ No session ID provided');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log('✅ Verifying subscription for session:', sessionId);

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe session:', {
      id: session.id,
      customer: session.customer,
      subscription: session.subscription,
      customer_details: session.customer_details
    });

    if (!session.subscription) {
      return NextResponse.json(
        { error: 'No subscription found in session' },
        { status: 400 }
      );
    }

    // Get the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    console.log('Stripe subscription:', {
      id: subscription.id,
      customer: subscription.customer,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      trial_end: subscription.trial_end,
      metadata: subscription.metadata
    });

    // Get customer email
    const customerEmail = session.customer_details?.email || subscription.customer_details?.email;
    if (!customerEmail) {
      return NextResponse.json(
        { error: 'No customer email found' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await getUserByEmail(customerEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomer = await getStripeCustomerByUserId(user.id);
    if (!stripeCustomer) {
      stripeCustomer = await createStripeCustomer(user.id, subscription.customer as string, customerEmail);
    }

    // Extract plan information
    const planId = subscription.metadata?.planId || 'unknown';
    const planName = subscription.metadata?.planName || 'Unknown Plan';
    const billingCycle = subscription.metadata?.billingCycle || 'monthly';

    // Get plan details for pricing
    const plan = getPlan(planId, billingCycle as 'monthly' | 'annual');
    const planTier = plan?.name || planName;

    // Helper function to safely parse Stripe timestamps
    const parseStripeTimestamp = (timestamp: number | undefined): Date => {
      if (!timestamp || isNaN(timestamp)) {
        // Default to 30 days from now if no valid timestamp
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
      return new Date(timestamp * 1000);
    };

    // Check if subscription already exists in database
    let existingSubscription = await getSubscriptionByStripeId(subscription.id);
    
    if (existingSubscription) {
      // Update existing subscription
      await updateSubscription(subscription.id, {
        status: subscription.status,
        currentPeriodStart: parseStripeTimestamp(subscription.current_period_start),
        currentPeriodEnd: parseStripeTimestamp(subscription.current_period_end),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? parseStripeTimestamp(subscription.trial_end) : undefined,
        planId: planId,
        planName: planName,
        billingCycle: billingCycle
      });
      console.log('Updated existing subscription in database');
    } else {
      try {
        // Create new subscription
        await createSubscription({
          userId: user.id,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          planId: planId,
          planName: planName,
          billingCycle: billingCycle,
          status: subscription.status,
          currentPeriodStart: parseStripeTimestamp(subscription.current_period_start),
          currentPeriodEnd: parseStripeTimestamp(subscription.current_period_end),
          trialEnd: subscription.trial_end ? parseStripeTimestamp(subscription.trial_end) : undefined
        });
        console.log('Created new subscription in database');
      } catch (error: any) {
        // If it's a duplicate key error, just update the existing one
        if (error.code === '23505' && error.detail?.includes('stripe_subscription_id')) {
          console.log('Subscription already exists, updating instead');
          await updateSubscription(subscription.id, {
            status: subscription.status,
            currentPeriodStart: parseStripeTimestamp(subscription.current_period_start),
            currentPeriodEnd: parseStripeTimestamp(subscription.current_period_end),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialEnd: subscription.trial_end ? parseStripeTimestamp(subscription.trial_end) : undefined,
            planId: planId,
            planName: planName,
            billingCycle: billingCycle
          });
        } else {
          throw error;
        }
      }
    }

    // Update user's plan in the users table
    await updateUserPlan(user.id, {
      planId: planId,
      planName: planName,
      billingCycle: billingCycle,
      status: subscription.status
    });

    console.log('User plan updated successfully');

    // Create payment method record if not already exists
    try {
      // Get customer's payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: subscription.customer as string,
        type: 'card'
      });

      console.log('Found payment methods:', paymentMethods.data.length);

      for (const stripePaymentMethod of paymentMethods.data) {
        // Check if payment method already exists in database
        const existingPaymentMethods = await getPaymentMethodsByUserId(user.id);
        const alreadyExists = existingPaymentMethods.some(pm => 
          pm.stripe_payment_method_id === stripePaymentMethod.id
        );

        if (!alreadyExists) {
          await createPaymentMethod({
            userId: user.id,
            stripePaymentMethodId: stripePaymentMethod.id,
            type: stripePaymentMethod.type,
            last4: stripePaymentMethod.card?.last4,
            brand: stripePaymentMethod.card?.brand,
            expMonth: stripePaymentMethod.card?.exp_month,
            expYear: stripePaymentMethod.card?.exp_year,
            isDefault: false
          });
          console.log('Created payment method record:', stripePaymentMethod.id);
        } else {
          console.log('Payment method already exists:', stripePaymentMethod.id);
        }
      }
    } catch (paymentMethodError) {
      console.log('Failed to create payment method record:', paymentMethodError);
      // Don't fail the whole verification if payment method creation fails
    }

    // Create invoice record for this subscription
    try {
      // Get the latest invoice from Stripe
      const invoices = await stripe.invoices.list({
        subscription: subscription.id,
        limit: 1
      });

      if (invoices.data.length > 0) {
        const stripeInvoice = invoices.data[0];
        
        // Check if invoice already exists in database
        const existingInvoice = await getInvoiceByStripeId(stripeInvoice.id);
        
        if (existingInvoice) {
          // Update existing invoice
          await updateInvoice(stripeInvoice.id, {
            amountPaid: stripeInvoice.amount_paid,
            status: stripeInvoice.status,
            invoiceNumber: stripeInvoice.number,
            invoicePdfUrl: stripeInvoice.invoice_pdf
          });
          console.log('Updated existing invoice record:', stripeInvoice.id);
        } else {
          // Get the subscription ID from our database
          const dbSubscription = await getSubscriptionByStripeId(subscription.id);
          if (!dbSubscription) {
            console.log('Subscription not found in database, skipping invoice creation');
            return;
          }
          
          // Create new invoice with duplicate handling
          try {
            await createInvoice({
              userId: user.id,
              stripeInvoiceId: stripeInvoice.id,
              subscriptionId: dbSubscription.id,
              amountPaid: stripeInvoice.amount_paid,
              status: stripeInvoice.status,
              invoiceNumber: stripeInvoice.number,
              invoicePdfUrl: stripeInvoice.invoice_pdf,
              createdAt: new Date(stripeInvoice.created * 1000)
            });
            console.log('Created new invoice record:', stripeInvoice.id);
          } catch (invoiceError: any) {
            // If it's a duplicate key error, just update the existing one
            if (invoiceError.code === '23505' && invoiceError.detail?.includes('stripe_invoice_id')) {
              console.log('Invoice already exists, updating instead:', stripeInvoice.id);
              await updateInvoice(stripeInvoice.id, {
                amountPaid: stripeInvoice.amount_paid,
                status: stripeInvoice.status,
                invoiceNumber: stripeInvoice.number,
                invoicePdfUrl: stripeInvoice.invoice_pdf
              });
              console.log('Updated existing invoice record:', stripeInvoice.id);
            } else {
              throw invoiceError;
            }
          }
        }
      } else {
        // Create a placeholder invoice for trial subscriptions
        const trialInvoiceId = `trial_${subscription.id}`;
        const existingTrialInvoice = await getInvoiceByStripeId(trialInvoiceId);
        
        if (!existingTrialInvoice) {
          // Get the subscription ID from our database
          const dbSubscription = await getSubscriptionByStripeId(subscription.id);
          if (!dbSubscription) {
            console.log('Subscription not found in database, skipping trial invoice creation');
            return;
          }
          
          // Create trial invoice with duplicate handling
          try {
            await createInvoice({
              userId: user.id,
              stripeInvoiceId: trialInvoiceId,
              subscriptionId: dbSubscription.id,
              amountPaid: 0,
              status: 'paid',
              invoiceNumber: `TRIAL-${Date.now()}`,
              invoicePdfUrl: null,
              createdAt: new Date()
            });
            console.log('Created trial invoice record');
          } catch (trialInvoiceError: any) {
            // If it's a duplicate key error, just log it
            if (trialInvoiceError.code === '23505' && trialInvoiceError.detail?.includes('stripe_invoice_id')) {
              console.log('Trial invoice already exists, skipping creation');
            } else {
              throw trialInvoiceError;
            }
          }
        } else {
          console.log('Trial invoice already exists');
        }
      }
    } catch (invoiceError) {
      console.log('Failed to create/update invoice record:', invoiceError);
      // Don't fail the whole verification if invoice creation fails
    }

    return NextResponse.json({
      success: true,
      status: subscription.status,
      planTier: planTier,
      planId: planId,
      planName: planName,
      billingCycle: billingCycle,
      currentPeriodEnd: parseStripeTimestamp(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });

  } catch (error) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json(
      { error: 'Failed to verify subscription' },
      { status: 500 }
    );
  }
}

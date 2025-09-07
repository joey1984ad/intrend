import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { 
  createSubscription, 
  updateSubscription, 
  createInvoice, 
  createPaymentMethod,
  getUserByEmail,
  createStripeCustomer,
  getStripeCustomerByUserId,
  getSubscriptionByStripeId,
  updateUserPlan,
  updateAdAccountSubscriptionStatus,
  addPerAccountBillingHistory
} from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  console.log('🔔 Webhook received:', {
    hasSignature: !!signature,
    bodyLength: body.length,
    timestamp: new Date().toISOString()
  });

  if (!signature) {
    console.log('❌ Missing stripe signature');
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('✅ Webhook signature verified, event type:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
        break;

      case 'payment_method.detached':
        await handlePaymentMethodDetached(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log('Handling subscription created:', subscription.id);
    
    const customerEmail = subscription.customer_details?.email || subscription.customer?.email;
    if (!customerEmail) {
      console.error('No customer email found for subscription:', subscription.id);
      return;
    }

    // Get or create user
    let user = await getUserByEmail(customerEmail);
    if (!user) {
      console.error('User not found for email:', customerEmail);
      return;
    }

    // Get or create Stripe customer
    let stripeCustomer = await getStripeCustomerByUserId(user.id);
    if (!stripeCustomer) {
      stripeCustomer = await createStripeCustomer(user.id, subscription.customer, customerEmail);
    }

    // Check if this is a per-account subscription
    if (subscription.metadata?.type === 'per_account') {
      console.log('Handling per-account subscription creation');
      
      // Update per-account subscription status
      await updateAdAccountSubscriptionStatus(
        parseInt(subscription.metadata.subscriptionId || '0'),
        subscription.status,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000)
      );

      console.log('Per-account subscription status updated');
    } else {
      // Handle regular subscription
      await createSubscription({
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer,
        planId: subscription.metadata.planId || 'unknown',
        planName: subscription.metadata.planName || 'Unknown Plan',
        billingCycle: subscription.metadata.billingCycle || 'monthly',
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined
      });

      // Update user's plan in the users table
      await updateUserPlan(user.id, {
        planId: subscription.metadata.planId || 'unknown',
        planName: subscription.metadata.planName || 'Unknown Plan',
        billingCycle: subscription.metadata.billingCycle || 'monthly',
        status: subscription.status
      });

      console.log('Regular subscription created successfully in database and user plan updated');
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log('Handling subscription updated:', subscription.id);
    console.log('Full subscription object:', JSON.stringify(subscription, null, 2));
    
    // Extract plan information from subscription metadata
    const planId = subscription.metadata?.planId;
    const planName = subscription.metadata?.planName;
    const billingCycle = subscription.metadata?.billingCycle;
    
    console.log('Plan update info:', { planId, planName, billingCycle });
    
    // Get current subscription from database to compare
    const currentSubscription = await getSubscriptionByStripeId(subscription.id);
    console.log('Current subscription in database:', currentSubscription);
    
    await updateSubscription(subscription.id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
      planId: planId,
      planName: planName,
      billingCycle: billingCycle
    });

    // Update user's plan in the users table
    const customerEmail = subscription.customer_details?.email || subscription.customer?.email;
    if (customerEmail) {
      const user = await getUserByEmail(customerEmail);
      if (user) {
        await updateUserPlan(user.id, {
          planId: planId || 'unknown',
          planName: planName || 'Unknown Plan',
          billingCycle: billingCycle || 'monthly',
          status: subscription.status
        });
        console.log('User plan updated in users table');
      }
    }

    // Get updated subscription to verify changes
    const updatedSubscription = await getSubscriptionByStripeId(subscription.id);
    console.log('Updated subscription in database:', updatedSubscription);
    
    console.log('Subscription updated successfully in database with plan info');
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    console.log('Handling subscription deleted:', subscription.id);
    
    // Note: We don't delete the subscription record, just update the status
    await updateSubscription(subscription.id, {
      status: 'canceled'
    });

    // Update user's plan to free when subscription is canceled
    const customerEmail = subscription.customer_details?.email || subscription.customer?.email;
    if (customerEmail) {
      const user = await getUserByEmail(customerEmail);
      if (user) {
        await updateUserPlan(user.id, {
          planId: 'free',
          planName: 'Free',
          billingCycle: 'monthly',
          status: 'canceled'
        });
        console.log('User plan reset to free after subscription cancellation');
      }
    }

    console.log('Subscription marked as canceled in database');
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    console.log('Handling payment succeeded:', invoice.id);
    
    if (invoice.subscription) {
      // Get subscription to find user
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const customerEmail = subscription.customer_details?.email || subscription.customer?.email;
      
      if (customerEmail) {
        const user = await getUserByEmail(customerEmail);
        if (user) {
          // Check if this is a per-account subscription
          if (subscription.metadata?.type === 'per_account') {
            console.log('Handling per-account payment succeeded');
            
            // Add to per-account billing history
            await addPerAccountBillingHistory(
              parseInt(subscription.metadata.subscriptionId || '0'),
              user.id,
              subscription.metadata.adAccountId || 'unknown',
              invoice.id,
              invoice.amount_paid,
              new Date(subscription.current_period_start * 1000),
              new Date(subscription.current_period_end * 1000),
              'paid',
              new Date(invoice.created * 1000)
            );

            console.log('Per-account billing history added');
          } else {
            // Handle regular invoice
            await createInvoice({
              userId: user.id,
              stripeInvoiceId: invoice.id,
              subscriptionId: parseInt(invoice.subscription),
              amountPaid: invoice.amount_paid,
              status: invoice.status,
              invoicePdfUrl: invoice.invoice_pdf,
              invoiceNumber: invoice.number,
              createdAt: new Date(invoice.created * 1000)
            });

            console.log('Regular invoice created successfully in database');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    console.log('Handling payment failed:', invoice.id);
    
    // Update subscription status to past_due if needed
    if (invoice.subscription) {
      await updateSubscription(invoice.subscription, {
        status: 'past_due'
      });
    }

    console.log('Payment failure handled');
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleTrialWillEnd(subscription: any) {
  try {
    console.log('Handling trial will end:', subscription.id);
    
    // You can send email notifications here
    // For now, just log the event
    console.log('Trial ending soon for subscription:', subscription.id);
  } catch (error) {
    console.error('Error handling trial will end:', error);
  }
}

async function handlePaymentMethodAttached(paymentMethod: any) {
  try {
    console.log('🔍 Handling payment method attached:', paymentMethod.id);
    console.log('Payment method details:', {
      id: paymentMethod.id,
      customer: paymentMethod.customer,
      type: paymentMethod.type,
      card: paymentMethod.card
    });
    
    if (paymentMethod.customer) {
      const customer = await stripe.customers.retrieve(paymentMethod.customer);
      console.log('Customer details:', {
        id: customer.id,
        email: customer.email
      });
      
      const customerEmail = customer.email;
      
      if (customerEmail) {
        const user = await getUserByEmail(customerEmail);
        console.log('User found:', user ? { id: user.id, email: user.email } : 'Not found');
        
        if (user) {
          const createdPaymentMethod = await createPaymentMethod({
            userId: user.id,
            stripePaymentMethodId: paymentMethod.id,
            type: paymentMethod.type,
            last4: paymentMethod.card?.last4,
            brand: paymentMethod.card?.brand,
            expMonth: paymentMethod.card?.exp_month,
            expYear: paymentMethod.card?.exp_year,
            isDefault: false
          });

          console.log('✅ Payment method created successfully in database:', {
            id: createdPaymentMethod.id,
            stripePaymentMethodId: createdPaymentMethod.stripe_payment_method_id,
            type: createdPaymentMethod.type,
            last4: createdPaymentMethod.last4
          });
        } else {
          console.log('❌ User not found for email:', customerEmail);
        }
      } else {
        console.log('❌ No customer email found');
      }
    } else {
      console.log('❌ No customer associated with payment method');
    }
  } catch (error) {
    console.error('❌ Error handling payment method attached:', error);
  }
}

async function handlePaymentMethodDetached(paymentMethod: any) {
  try {
    console.log('Handling payment method detached:', paymentMethod.id);
    
    // Note: We'll handle payment method deletion through the API
    // This is just for logging purposes
    console.log('Payment method detached:', paymentMethod.id);
  } catch (error) {
    console.error('Error handling payment method detached:', error);
  }
}

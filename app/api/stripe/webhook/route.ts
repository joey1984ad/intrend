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
  getStripeCustomerByUserId
} from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
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
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
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

    // Create subscription in database
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

    console.log('Subscription created successfully in database');
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log('Handling subscription updated:', subscription.id);
    
    await updateSubscription(subscription.id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined
    });

    console.log('Subscription updated successfully in database');
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
          // Create invoice record
          await createInvoice({
            userId: user.id,
            stripeInvoiceId: invoice.id,
            subscriptionId: parseInt(invoice.subscription),
            amountPaid: invoice.amount_paid,
            currency: invoice.currency,
            status: invoice.status,
            invoicePdfUrl: invoice.invoice_pdf,
            invoiceNumber: invoice.number
          });

          console.log('Invoice created successfully in database');
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
    console.log('Handling payment method attached:', paymentMethod.id);
    
    if (paymentMethod.customer) {
      const customer = await stripe.customers.retrieve(paymentMethod.customer);
      const customerEmail = customer.email;
      
      if (customerEmail) {
        const user = await getUserByEmail(customerEmail);
        if (user) {
          await createPaymentMethod({
            userId: user.id,
            stripePaymentMethodId: paymentMethod.id,
            type: paymentMethod.type,
            last4: paymentMethod.card?.last4,
            brand: paymentMethod.card?.brand,
            expMonth: paymentMethod.card?.exp_month,
            expYear: paymentMethod.card?.exp_year,
            isDefault: false
          });

          console.log('Payment method created successfully in database');
        }
      }
    }
  } catch (error) {
    console.error('Error handling payment method attached:', error);
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

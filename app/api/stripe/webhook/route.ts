import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdAccountSubscription, getUserById } from '@/lib/db';
import { headers } from 'next/headers';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const sig = headersList.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('🔔 Stripe webhook received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
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
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Error handling webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log('🎉 Checkout session completed:', session.id);
  
  const { metadata } = session;
  const userId = parseInt(metadata.userId);
  const planId = metadata.planId;
  const billingCycle = metadata.billingCycle;
  const adAccountIds = JSON.parse(metadata.adAccountIds || '[]');
  const adAccountNames = JSON.parse(metadata.adAccountNames || '[]');

  console.log('📝 Creating subscriptions for ad accounts:', { userId, planId, billingCycle, adAccountCount: adAccountIds.length });

  try {
    // Get the subscription from the session
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Create database records for each ad account
    // Note: All accounts share the same Stripe subscription but have separate records for tracking
    for (let i = 0; i < adAccountIds.length; i++) {
      const adAccountId = adAccountIds[i];
      const adAccountName = adAccountNames[i];
      
      console.log(`📝 Creating subscription record for account: ${adAccountName} (${adAccountId})`);
      
      await createAdAccountSubscription(
        userId,
        adAccountId,
        adAccountName,
        subscription.id, // Same subscription ID for all accounts in this checkout
        subscription.items.data[0].price.id, // Stripe Price ID
        session.customer,
        billingCycle,
        subscription.items.data[0].price.unit_amount || 0
      );
    }

    console.log('✅ All ad account subscription records created successfully');
  } catch (error) {
    console.error('❌ Error creating ad account subscriptions:', error);
    // Don't throw - we still want to respond with success to Stripe
  }
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('📝 Subscription created:', subscription.id);
  // Additional logic if needed
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('📝 Subscription updated:', subscription.id);
  // Handle subscription updates
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('📝 Subscription deleted:', subscription.id);
  // Handle subscription cancellations
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log('💰 Invoice payment succeeded:', invoice.id);
  // Handle successful payments
}

async function handleInvoicePaymentFailed(invoice: any) {
  console.log('❌ Invoice payment failed:', invoice.id);
  // Handle failed payments
}
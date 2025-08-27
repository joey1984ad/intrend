import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

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
        const subscriptionCreated = event.data.object;
        console.log('Subscription created:', subscriptionCreated.id);
        // Handle subscription creation
        // Update user's subscription status in your database
        break;

      case 'customer.subscription.updated':
        const subscriptionUpdated = event.data.object;
        console.log('Subscription updated:', subscriptionUpdated.id);
        // Handle subscription updates
        // Update user's subscription status in your database
        break;

      case 'customer.subscription.deleted':
        const subscriptionDeleted = event.data.object;
        console.log('Subscription deleted:', subscriptionDeleted.id);
        // Handle subscription cancellation
        // Update user's subscription status in your database
        break;

      case 'invoice.payment_succeeded':
        const invoiceSucceeded = event.data.object;
        console.log('Payment succeeded:', invoiceSucceeded.id);
        // Handle successful payment
        // Update user's billing status in your database
        break;

      case 'invoice.payment_failed':
        const invoiceFailed = event.data.object;
        console.log('Payment failed:', invoiceFailed.id);
        // Handle failed payment
        // Update user's billing status in your database
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

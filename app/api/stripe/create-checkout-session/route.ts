import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PRICING_PLANS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { planId, customerEmail, successUrl, cancelUrl } = await request.json();

    // Get plan details
    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS];
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // For free plan, redirect to success
    if (plan.price === 0) {
      return NextResponse.json({
        success: true,
        redirectUrl: successUrl
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        planId: plan.id,
        planName: plan.name,
      },
      subscription_data: {
        metadata: {
          planId: plan.id,
          planName: plan.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

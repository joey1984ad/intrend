import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PRICING_PLANS, getPlan } from '@/lib/stripe';
import { createUser, createStripeCustomer, getUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { planId, billingCycle, customerEmail, successUrl, cancelUrl } = await request.json();
    
    console.log('Checkout session request:', { planId, billingCycle, customerEmail, successUrl, cancelUrl });

    // Validate billing cycle
    if (!billingCycle || !['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be monthly or annual.' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = getPlan(planId, billingCycle as 'monthly' | 'annual');
    console.log('Plan lookup result:', { planId, billingCycle, plan: plan ? { id: plan.id, name: plan.name, price: plan.currentPricing.price } : null });
    
    if (!plan) {
      console.log('Plan not found for:', { planId, billingCycle });
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // For free plan, redirect to success
    if (plan.currentPricing.price === 0 || plan.currentPricing.stripePriceId === 'free') {
      return NextResponse.json({
        success: true,
        redirectUrl: successUrl,
        message: 'Free plan selected - no payment required'
      });
    }

    // Check if Stripe is configured and price ID exists
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    if (!plan.currentPricing.stripePriceId || plan.currentPricing.stripePriceId === 'free') {
      return NextResponse.json(
        { error: `Stripe price ID not configured for ${plan.name} ${billingCycle} plan. Please contact support.` },
        { status: 400 }
      );
    }

    // Handle user creation/retrieval
    let userId: number | undefined;
    let stripeCustomerId: string | null = null;

    if (customerEmail && customerEmail.trim() && customerEmail.includes('@')) {
      // Check if user exists
      let user = await getUserByEmail(customerEmail);
      
      if (!user) {
        // Create new user
        user = await createUser(customerEmail);
      }
      
      userId = user.id;

      // Check if user has Stripe customer
      const stripeCustomer = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });

      if (stripeCustomer.data.length > 0) {
        stripeCustomerId = stripeCustomer.data[0].id;
      }
    }

    // Create Stripe checkout session
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.currentPricing.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        billingCycle: billingCycle,
        userId: userId?.toString() || 'unknown'
      },
      subscription_data: {
        metadata: {
          planId: plan.id,
          planName: plan.name,
          billingCycle: billingCycle,
          userId: userId?.toString() || 'unknown'
        },
        trial_period_days: plan.id === 'pro' ? 7 : undefined, // 7-day trial for pro plan
      },
    };

    // Add customer email OR customer ID (not both)
    if (stripeCustomerId) {
      sessionConfig.customer = stripeCustomerId;
    } else if (customerEmail && customerEmail.trim() && customerEmail.includes('@')) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      planId: plan.id,
      billingCycle: billingCycle,
      price: plan.currentPricing.price
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

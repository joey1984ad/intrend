import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PRICING_PLANS, getPlan } from '@/lib/stripe';
import { createUser, createStripeCustomer, getUserByEmail, getSubscriptionByUserId } from '@/lib/db';

// Helper function to create a proration coupon for downgrades
async function createProrationCoupon(amountOff: number) {
  try {
    if (!stripe) {
      console.error('Stripe is not configured');
      return null;
    }
    
    const couponId = `proration_${Date.now()}`;
    const coupon = await stripe.coupons.create({
      id: couponId,
      amount_off: amountOff,
      currency: 'usd',
      duration: 'once',
      name: `Proration Credit - $${(amountOff / 100).toFixed(2)}`,
      metadata: {
        type: 'proration_credit',
        amount_off: amountOff.toString()
      }
    });
    return coupon.id;
  } catch (error) {
    console.error('Error creating proration coupon:', error);
    // If coupon creation fails, return null to continue without discount
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { planId, billingCycle, customerEmail, successUrl, cancelUrl, adAccounts, userId: requestUserId, userEmail, type } = await request.json();
    
    console.log('Checkout session request:', { planId, billingCycle, customerEmail, successUrl, cancelUrl, adAccounts, userId: requestUserId, userEmail, type });

    // Validate billing cycle
    if (!billingCycle || !['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be monthly or annual.' },
        { status: 400 }
      );
    }

    // Handle per-account subscriptions
    if (type === 'per_account' && adAccounts && adAccounts.length > 0) {
      return await handlePerAccountCheckout(planId, billingCycle, adAccounts, requestUserId, userEmail, successUrl, cancelUrl);
    }

    // Get plan details for traditional subscriptions
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

    // Check if Stripe is configured
    if (!stripe) {
      console.error('Stripe is not configured. STRIPE_SECRET_KEY is missing.');
      
      // For development/testing, simulate a successful checkout
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating successful checkout');
        return NextResponse.json({
          success: true,
          redirectUrl: successUrl,
          message: 'Development mode: Stripe not configured, simulating successful checkout',
          development: true,
          planId: plan.id,
          billingCycle: billingCycle,
          price: plan.currentPricing.price
        });
      }
      
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Check if price ID is configured
    if (!plan.currentPricing.stripePriceId || plan.currentPricing.stripePriceId === 'free') {
      console.error(`Stripe price ID not configured for ${plan.name} ${billingCycle} plan.`);
      console.error('Environment variables:', {
        STRIPE_STARTUP_MONTHLY_PRICE_ID: process.env.STRIPE_STARTUP_MONTHLY_PRICE_ID,
        STRIPE_STARTUP_ANNUAL_PRICE_ID: process.env.STRIPE_STARTUP_ANNUAL_PRICE_ID,
        STRIPE_PRO_MONTHLY_PRICE_ID: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        STRIPE_PRO_ANNUAL_PRICE_ID: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
      });
      
      // For development/testing, simulate a successful checkout
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating successful checkout despite missing price IDs');
        return NextResponse.json({
          success: true,
          redirectUrl: successUrl,
          message: 'Development mode: Price IDs not configured, simulating successful checkout',
          development: true,
          sessionId: 'cs_test_development_mode',
          planId: plan.id,
          billingCycle: billingCycle,
          price: plan.currentPricing.price
        });
      }
      
      return NextResponse.json(
        { error: `Stripe price ID not configured for ${plan.name} ${billingCycle} plan. Please contact support.` },
        { status: 400 }
      );
    }

    // Handle user creation/retrieval
    let userId: number | undefined;
    let stripeCustomerId: string | null = null;
    let isDowngrade = false;
    let prorationCredit = 0;

    // Check if user is logged out (no customer email provided)
    if (!customerEmail || !customerEmail.trim() || !customerEmail.includes('@')) {
      console.log('No customer email provided - user is logged out');
      
      // Store checkout intent in session/cookie and redirect to signup
      const checkoutIntent = {
        planId,
        billingCycle,
        successUrl,
        cancelUrl,
        timestamp: Date.now()
      };
      
      // For now, we'll encode this in the response and handle it in the frontend
      // In a production app, you might want to store this in a database or session
      return NextResponse.json({
        success: false,
        requiresSignup: true,
        checkoutIntent: btoa(JSON.stringify(checkoutIntent)), // Base64 encode for URL safety
        redirectUrl: `/signup?checkout=${btoa(JSON.stringify(checkoutIntent))}`,
        message: 'Please sign up to continue with your purchase'
      });
    }

    if (customerEmail && customerEmail.trim() && customerEmail.includes('@')) {
      try {
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

        // Check if this is a downgrade and calculate proration credit
        const currentSubscription = await getSubscriptionByUserId(user.id);
        if (currentSubscription && currentSubscription.status === 'active') {
          const currentPlan = getPlan(currentSubscription.plan_id, currentSubscription.billing_cycle as 'monthly' | 'annual');
          const newPlan = getPlan(planId, billingCycle as 'monthly' | 'annual');
          
          if (currentPlan && newPlan) {
            // Check if this is a downgrade (new plan is cheaper)
            if (newPlan.currentPricing.price < currentPlan.currentPricing.price) {
              isDowngrade = true;
              console.log('Downgrade detected:', {
                from: currentPlan.name,
                to: newPlan.name,
                currentPrice: currentPlan.currentPricing.price,
                newPrice: newPlan.currentPricing.price
              });

              // Calculate proration credit based on remaining time
              const now = new Date();
              const periodEnd = new Date(currentSubscription.current_period_end);
              const remainingDays = Math.max(0, (periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const totalDays = (periodEnd.getTime() - new Date(currentSubscription.current_period_start).getTime()) / (1000 * 60 * 60 * 24);
              
              if (remainingDays > 0 && totalDays > 0) {
                const dailyRate = currentPlan.currentPricing.price / totalDays;
                prorationCredit = Math.floor(dailyRate * remainingDays);
                console.log('Proration credit calculated:', {
                  remainingDays,
                  totalDays,
                  dailyRate,
                  prorationCredit
                });
              }
            }
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Continue without user creation - Stripe can handle this
      }
    }

    // Helper function to properly construct success URL with session_id
    const constructSuccessUrl = (baseUrl: string) => {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}session_id={CHECKOUT_SESSION_ID}`;
    };

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
      success_url: constructSuccessUrl(successUrl),
      cancel_url: cancelUrl,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        billingCycle: billingCycle,
        userId: userId?.toString() || 'unknown',
        isDowngrade: isDowngrade.toString(),
        prorationCredit: prorationCredit.toString()
      },
      subscription_data: {
        metadata: {
          planId: plan.id,
          planName: plan.name,
          billingCycle: billingCycle,
          userId: userId?.toString() || 'unknown',
          isDowngrade: isDowngrade.toString(),
          prorationCredit: prorationCredit.toString()
        },
        trial_period_days: plan.id === 'pro' ? 7 : undefined, // 7-day trial for pro plan
      },
    };

    // If this is a downgrade with proration credit, add it as a discount
    if (isDowngrade && prorationCredit > 0) {
      const couponId = await createProrationCoupon(prorationCredit);
      if (couponId) {
        sessionConfig.discounts = [
          {
            coupon: couponId
          }
        ];
        console.log('Applied proration discount:', prorationCredit);
      } else {
        console.log('Failed to create proration coupon, proceeding without discount');
      }
    }

    // Add customer email OR customer ID (not both)
    if (stripeCustomerId) {
      sessionConfig.customer = stripeCustomerId;
    } else if (customerEmail && customerEmail.trim() && customerEmail.includes('@')) {
      sessionConfig.customer_email = customerEmail;
    }

    console.log('Creating Stripe session with config:', {
      price: plan.currentPricing.stripePriceId,
      planId: plan.id,
      billingCycle: billingCycle,
      customerEmail: customerEmail,
      stripeCustomerId: stripeCustomerId
    });

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      planId: plan.id,
      billingCycle: billingCycle,
      price: plan.currentPricing.price,
      isDowngrade: isDowngrade,
      prorationCredit: prorationCredit
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    
    // Return more specific error information
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Failed to create checkout session: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Handle per-account subscription checkout
async function handlePerAccountCheckout(planId: string, billingCycle: string, adAccounts: any[], userId: number, userEmail: string, successUrl: string, cancelUrl: string) {
  try {
    console.log('Creating per-account checkout session:', { planId, billingCycle, adAccounts, userId, userEmail });

    // Get user and create Stripe customer if needed
    let user = await getUserByEmail(userEmail);
    if (!user) {
      user = await createUser(userEmail);
    }

    let stripeCustomer = await createStripeCustomer(user.id, userEmail, '');
    if (!stripeCustomer) {
      return NextResponse.json(
        { error: 'Failed to create Stripe customer' },
        { status: 500 }
      );
    }

    // Get per-account plan details
    const { PER_ACCOUNT_PRICING_PLANS, getPerAccountPlan } = await import('@/lib/stripe');
    const plan = getPerAccountPlan(planId, billingCycle as 'monthly' | 'annual');
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid per-account plan selected' },
        { status: 400 }
      );
    }

    // Calculate total cost
    const totalCost = adAccounts.length * plan.currentPricing.price;
    const totalCostCents = Math.round(totalCost * 100);

    // Create Stripe checkout session
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripe_customer_id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.name} Plan - ${adAccounts.length} Ad Account${adAccounts.length > 1 ? 's' : ''}`,
              description: `Per-account subscription for ${adAccounts.length} Facebook ad account${adAccounts.length > 1 ? 's' : ''}`,
            },
            unit_amount: totalCostCents,
            recurring: {
              interval: billingCycle === 'annual' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      metadata: {
        userId: userId.toString(),
        planId,
        billingCycle,
        type: 'per_account',
        adAccountCount: adAccounts.length.toString(),
        adAccountIds: adAccounts.map(acc => acc.id).join(','),
        adAccountNames: adAccounts.map(acc => acc.name).join(',')
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          planId,
          billingCycle,
          type: 'per_account',
          adAccountCount: adAccounts.length.toString(),
          adAccountIds: adAccounts.map(acc => acc.id).join(','),
          adAccountNames: adAccounts.map(acc => acc.name).join(',')
        }
      }
    });

    console.log('Per-account checkout session created:', session.id);

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      totalCost: totalCost,
      adAccountCount: adAccounts.length,
      planName: plan.name
    });

  } catch (error) {
    console.error('Per-account checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create per-account checkout session' },
      { status: 500 }
    );
  }
}

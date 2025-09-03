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

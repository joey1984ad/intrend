import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPerAccountPlan } from '@/lib/stripe';
import { getUserByEmail, getStripeCustomerByUserId, createStripeCustomer } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, adAccounts, planId = 'basic', billingCycle = 'monthly' } = body;

    console.log('🛒 Creating checkout session:', { userEmail, planId, billingCycle, adAccountsCount: adAccounts?.length });

    if (!userEmail || !adAccounts || !Array.isArray(adAccounts) || adAccounts.length === 0) {
      return NextResponse.json(
        { error: 'userEmail and adAccounts array are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserByEmail(userEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomer = await getStripeCustomerByUserId(user.id);
    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || userEmail,
        metadata: { userId: user.id.toString() }
      });
      
      stripeCustomer = await createStripeCustomer(user.id, customer.id, userEmail);
    }

    // Get plan details
    const plan = getPerAccountPlan(planId, billingCycle);
    if (!plan || !plan.currentPricing.stripePriceId) {
      console.error('❌ Invalid plan or Stripe price ID not configured:', { planId, billingCycle });
      return NextResponse.json(
        { error: 'Invalid plan or Stripe price ID not configured' },
        { status: 400 }
      );
    }

    // Create line items for each ad account
    const lineItems = adAccounts.map(account => ({
      price: plan.currentPricing.stripePriceId,
      quantity: 1,
      metadata: {
        adAccountId: account.id,
        adAccountName: account.name
      }
    }));

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripe_customer_id,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${request.nextUrl.origin}/dashboard?canceled=true`,
      metadata: {
        userId: user.id.toString(),
        planId,
        billingCycle,
        adAccountIds: JSON.stringify(adAccounts.map(acc => acc.id)),
        adAccountNames: JSON.stringify(adAccounts.map(acc => acc.name))
      },
      subscription_data: {
        metadata: {
          userId: user.id.toString(),
          planId,
          billingCycle,
          type: 'per_account_multiple'
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    });

    console.log('✅ Checkout session created:', session.id);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

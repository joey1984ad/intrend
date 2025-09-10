import { NextRequest, NextResponse } from 'next/server';
import { createAdAccountSubscription, getUserByEmail, getStripeCustomerByUserId, createStripeCustomer } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { getPerAccountPlan } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, adAccounts, planId = 'basic', billingCycle = 'monthly' } = body;

    console.log('🟡 Creating subscriptions for:', { userId, userEmail, adAccountsCount: adAccounts?.length, planId, billingCycle });

    if (!userId || !userEmail || !adAccounts || !Array.isArray(adAccounts)) {
      return NextResponse.json(
        { error: 'userId, userEmail, and adAccounts array are required' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserByEmail(userEmail);
    if (!user) {
      console.error('❌ User not found for email:', userEmail);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', user.id);

    // Get or create Stripe customer
    let stripeCustomer = await getStripeCustomerByUserId(user.id);
    if (!stripeCustomer) {
      console.log('🔄 Creating new Stripe customer...');
      const newCustomer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId: user.id.toString() }
      });
      
      stripeCustomer = await createStripeCustomer(user.id, newCustomer.id);
      console.log('✅ Stripe customer created:', newCustomer.id);
    }

    // Get plan pricing
    const plan = getPerAccountPlan(planId, billingCycle);
    if (!plan) {
      console.error('❌ Invalid plan:', { planId, billingCycle });
      return NextResponse.json(
        { error: 'Invalid plan or billing cycle' },
        { status: 400 }
      );
    }

    console.log('✅ Plan found:', { planId, stripePriceId: plan.stripePriceId, priceInCents: plan.priceInCents });

    const subscriptions = [];
    const errors = [];

    // Create subscription for each account
    for (const account of adAccounts) {
      try {
        console.log(`🔄 Creating subscription for account: ${account.id} (${account.name})`);

        // Create Stripe subscription
        const subscription = await stripe.subscriptions.create({
          customer: stripeCustomer.stripe_customer_id,
          items: [{
            price: plan.stripePriceId,
          }],
          metadata: {
            userId: user.id.toString(),
            adAccountId: account.id,
            adAccountName: account.name,
            planId,
            billingCycle
          }
        });

        console.log('✅ Stripe subscription created:', subscription.id);

        // Save to database
        const dbSubscription = await createAdAccountSubscription(
          user.id,
          account.id,
          account.name,
          subscription.id,
          plan.stripePriceId,
          stripeCustomer.stripe_customer_id,
          billingCycle,
          plan.priceInCents
        );

        console.log('✅ Database subscription created:', dbSubscription);

        subscriptions.push({
          adAccountId: account.id,
          adAccountName: account.name,
          subscriptionId: subscription.id,
          status: subscription.status
        });

      } catch (error: any) {
        console.error(`❌ Error creating subscription for account ${account.id}:`, error);
        errors.push({
          adAccountId: account.id,
          adAccountName: account.name,
          error: error.message
        });
      }
    }

    console.log('🎉 Subscription creation completed:', { 
      successCount: subscriptions.length, 
      errorCount: errors.length 
    });

    return NextResponse.json({
      success: subscriptions.length > 0,
      subscriptions,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully created ${subscriptions.length} subscription(s)${
        errors.length > 0 ? ` with ${errors.length} error(s)` : ''
      }`
    });

  } catch (error: any) {
    console.error('❌ Error creating account subscriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscriptions' },
      { status: 500 }
    );
  }
}

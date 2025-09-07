import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { 
  createAdAccountSubscription, 
  getAdAccountSubscriptions, 
  getAdAccountSubscriptionByAccountId,
  updateAdAccountSubscriptionStatus,
  cancelAdAccountSubscription,
  getPerAccountPlanConfigs,
  addPerAccountBillingHistory,
  getPerAccountBillingHistory
} from '@/lib/db';
import { getPerAccountPlan, calculatePerAccountTotal } from '@/lib/stripe';

// Get all per-account subscriptions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeHistory = searchParams.get('includeHistory') === 'true';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const subscriptions = await getAdAccountSubscriptions(parseInt(userId));
    
    let billingHistory = [];
    if (includeHistory) {
      billingHistory = await getPerAccountBillingHistory(parseInt(userId));
    }

    return NextResponse.json({
      success: true,
      subscriptions,
      billingHistory
    });

  } catch (error) {
    console.error('Error getting per-account subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to get subscriptions' },
      { status: 500 }
    );
  }
}

// Create a new per-account subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      adAccountId, 
      adAccountName, 
      planId, 
      billingCycle,
      stripeCustomerId 
    } = body;

    if (!userId || !adAccountId || !adAccountName || !planId || !billingCycle || !stripeCustomerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existingSubscription = await getAdAccountSubscriptionByAccountId(
      parseInt(userId), 
      adAccountId
    );

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription already exists for this ad account' },
        { status: 409 }
      );
    }

    // Get plan details
    const plan = getPerAccountPlan(planId, billingCycle);
    if (!plan || !plan.currentPricing.stripePriceId) {
      return NextResponse.json(
        { error: 'Invalid plan or Stripe price ID not configured' },
        { status: 400 }
      );
    }

    // Create Stripe subscription
    const stripeSubscription = await stripe?.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: plan.currentPricing.stripePriceId,
        },
      ],
      metadata: {
        userId: userId.toString(),
        adAccountId,
        adAccountName,
        planId,
        billingCycle,
        type: 'per_account'
      },
      expand: ['latest_invoice.payment_intent'],
    });

    if (!stripeSubscription) {
      return NextResponse.json(
        { error: 'Failed to create Stripe subscription' },
        { status: 500 }
      );
    }

    // Save subscription to database
    const subscription = await createAdAccountSubscription(
      parseInt(userId),
      adAccountId,
      adAccountName,
      stripeSubscription.id,
      plan.currentPricing.stripePriceId,
      stripeCustomerId,
      billingCycle,
      plan.currentPricing.price * 100 // Convert to cents
    );

    return NextResponse.json({
      success: true,
      subscription,
      stripeSubscription: {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        current_period_start: stripeSubscription.current_period_start,
        current_period_end: stripeSubscription.current_period_end,
        latest_invoice: stripeSubscription.latest_invoice
      }
    });

  } catch (error) {
    console.error('Error creating per-account subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// Update subscription (change plan, billing cycle, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptionId, planId, billingCycle } = body;

    if (!subscriptionId || !planId || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = getPerAccountPlan(planId, billingCycle);
    if (!plan || !plan.currentPricing.stripePriceId) {
      return NextResponse.json(
        { error: 'Invalid plan or Stripe price ID not configured' },
        { status: 400 }
      );
    }

    // Update Stripe subscription
    const stripeSubscription = await stripe?.subscriptions.update(subscriptionId, {
      items: [
        {
          price: plan.currentPricing.stripePriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    if (!stripeSubscription) {
      return NextResponse.json(
        { error: 'Failed to update Stripe subscription' },
        { status: 500 }
      );
    }

    // Update database
    await updateAdAccountSubscriptionStatus(
      parseInt(subscriptionId),
      stripeSubscription.status,
      new Date(stripeSubscription.current_period_start * 1000),
      new Date(stripeSubscription.current_period_end * 1000)
    );

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscriptionId,
        status: stripeSubscription.status,
        current_period_start: stripeSubscription.current_period_start,
        current_period_end: stripeSubscription.current_period_end
      }
    });

  } catch (error) {
    console.error('Error updating per-account subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Cancel Stripe subscription
    const stripeSubscription = await stripe?.subscriptions.cancel(subscriptionId);

    if (!stripeSubscription) {
      return NextResponse.json(
        { error: 'Failed to cancel Stripe subscription' },
        { status: 500 }
      );
    }

    // Update database
    await cancelAdAccountSubscription(parseInt(subscriptionId));

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully'
    });

  } catch (error) {
    console.error('Error canceling per-account subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

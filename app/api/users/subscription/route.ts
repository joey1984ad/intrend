import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionByUserId } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const subscription = await getSubscriptionByUserId(parseInt(userId));
    
    if (!subscription) {
      return NextResponse.json({
        success: true,
        subscription: null
      });
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        planId: subscription.plan_id,
        planName: subscription.plan_name,
        billingCycle: subscription.billing_cycle,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at
      }
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}

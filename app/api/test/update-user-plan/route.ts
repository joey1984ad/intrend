import { NextRequest, NextResponse } from 'next/server';
import { updateUserPlan, getUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, planId, planName, billingCycle, status } = await request.json();
    
    console.log('Test plan update request:', { email, planId, planName, billingCycle, status });

    if (!email || !planId || !planName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, planId, planName' },
        { status: 400 }
      );
    }

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user plan
    const updatedUser = await updateUserPlan(user.id, {
      planId,
      planName,
      billingCycle: billingCycle || 'monthly',
      status: status || 'active'
    });

    console.log('User plan updated successfully:', updatedUser);

    return NextResponse.json({
      success: true,
      message: 'User plan updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        currentPlanId: updatedUser.current_plan_id,
        currentPlanName: updatedUser.current_plan_name,
        currentBillingCycle: updatedUser.current_billing_cycle,
        subscriptionStatus: updatedUser.subscription_status
      }
    });
  } catch (error) {
    console.error('Error updating user plan:', error);
    return NextResponse.json(
      { error: 'Failed to update user plan' },
      { status: 500 }
    );
  }
}

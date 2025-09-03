import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/db';

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

    const user = await getUserById(parseInt(userId));
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        // Include subscription/plan information
        currentPlanId: user.current_plan_id,
        currentPlanName: user.current_plan_name,
        currentBillingCycle: user.current_billing_cycle,
        subscriptionStatus: user.subscription_status
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, firstName, lastName, company } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser(parseInt(userId), {
      firstName,
      lastName,
      company
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        company: updatedUser.company,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
        // Include subscription/plan information
        currentPlanId: updatedUser.current_plan_id,
        currentPlanName: updatedUser.current_plan_name,
        currentBillingCycle: updatedUser.current_billing_cycle,
        subscriptionStatus: updatedUser.subscription_status
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

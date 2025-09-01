import { NextRequest, NextResponse } from 'next/server';
import { createAdAccount, getAdAccounts, deleteAdAccount, getActiveAdAccounts } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { getUserByEmail, getStripeCustomerByUserId } from '@/lib/db';

// Pricing configuration
const PRICE_PER_ACCOUNT = 10.00; // $10 per account per month

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

    const accounts = await getAdAccounts(parseInt(userId));
    
    return NextResponse.json({
      success: true,
      accounts,
      totalAccounts: accounts.length,
      pricePerAccount: PRICE_PER_ACCOUNT,
      nextCharge: accounts.length * PRICE_PER_ACCOUNT
    });
  } catch (error) {
    console.error('Error getting ad accounts:', error);
    return NextResponse.json(
      { error: 'Failed to get ad accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, accountName, accountId, platform = 'facebook' } = await request.json();

    if (!userId || !accountName) {
      return NextResponse.json(
        { error: 'User ID and account name are required' },
        { status: 400 }
      );
    }

    // Create the ad account
    const newAccount = await createAdAccount(parseInt(userId), accountName, accountId, platform);

    // Get current active accounts for billing calculation
    const activeAccounts = await getActiveAdAccounts(parseInt(userId));
    const newTotal = activeAccounts.length * PRICE_PER_ACCOUNT;

    return NextResponse.json({
      success: true,
      account: newAccount,
      totalAccounts: activeAccounts.length,
      nextCharge: newTotal,
      message: `Account "${accountName}" added successfully. You'll be charged $${PRICE_PER_ACCOUNT} for this account on your next billing cycle.`
    });
  } catch (error) {
    console.error('Error creating ad account:', error);
    return NextResponse.json(
      { error: 'Failed to create ad account' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const userId = searchParams.get('userId');

    if (!accountId || !userId) {
      return NextResponse.json(
        { error: 'Account ID and User ID are required' },
        { status: 400 }
      );
    }

    // Delete the account
    const deletedAccount = await deleteAdAccount(parseInt(accountId));

    // Get updated active accounts for billing calculation
    const activeAccounts = await getActiveAdAccounts(parseInt(userId));
    const newTotal = activeAccounts.length * PRICE_PER_ACCOUNT;

    return NextResponse.json({
      success: true,
      deletedAccount,
      totalAccounts: activeAccounts.length,
      nextCharge: newTotal,
      message: 'Account removed successfully. Billing will be adjusted for your next cycle.'
    });
  } catch (error) {
    console.error('Error deleting ad account:', error);
    return NextResponse.json(
      { error: 'Failed to delete ad account' },
      { status: 500 }
    );
  }
}

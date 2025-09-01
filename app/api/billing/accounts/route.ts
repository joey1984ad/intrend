import { NextRequest, NextResponse } from 'next/server';
import { getActiveAdAccounts, getLatestBillingCycle, getBillingHistory, getUserByEmail, getStripeCustomerByUserId } from '@/lib/db';
import { stripe } from '@/lib/stripe';

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

    const activeAccounts = await getActiveAdAccounts(parseInt(userId));
    const latestBillingCycle = await getLatestBillingCycle(parseInt(userId));
    const billingHistory = await getBillingHistory(parseInt(userId), 5);

    // Get user and Stripe customer info
    const user = await getUserByEmail(userId); // Assuming userId is email for now
    let stripeCustomer = null;
    let upcomingInvoice = null;

    if (user) {
      stripeCustomer = await getStripeCustomerByUserId(user.id);
      
      if (stripeCustomer) {
        try {
          upcomingInvoice = await stripe.invoices.retrieveUpcoming({
            customer: stripeCustomer.stripe_customer_id
          });
        } catch (error) {
          console.log('No upcoming invoice found');
        }
      }
    }

    return NextResponse.json({
      success: true,
      activeAccounts: activeAccounts.length,
      pricePerAccount: PRICE_PER_ACCOUNT,
      nextCharge: activeAccounts.length * PRICE_PER_ACCOUNT,
      nextBillingDate: upcomingInvoice?.next_payment_attempt || null,
      latestBillingCycle,
      billingHistory,
      accounts: activeAccounts
    });
  } catch (error) {
    console.error('Error getting billing info:', error);
    return NextResponse.json(
      { error: 'Failed to get billing information' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Report usage to Stripe (for metered billing)
    await reportAccountUsage(parseInt(userId));

    return NextResponse.json({
      success: true,
      message: 'Usage reported successfully'
    });
  } catch (error) {
    console.error('Error reporting usage:', error);
    return NextResponse.json(
      { error: 'Failed to report usage' },
      { status: 500 }
    );
  }
}

async function reportAccountUsage(userId: number) {
  try {
    const user = await getUserByEmail(userId.toString()); // Assuming userId is email
    if (!user) {
      console.error('User not found for usage reporting');
      return;
    }

    const activeAccounts = await getActiveAdAccounts(userId);
    const stripeCustomer = await getStripeCustomerByUserId(user.id);

    if (!stripeCustomer) {
      console.log('No Stripe customer found for user:', userId);
      return;
    }

    // Get user's subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomer.stripe_customer_id,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      console.log('No active subscription found for user:', userId);
      return;
    }

    const subscription = subscriptions.data[0];
    const subscriptionItem = subscription.items.data[0];

    // Report current month's usage
    await stripe.subscriptionItems.createUsageRecord(subscriptionItem.id, {
      quantity: activeAccounts.length,
      timestamp: Math.floor(Date.now() / 1000),
      action: 'set' // This sets the quantity for the current period
    });

    console.log(`Reported ${activeAccounts.length} accounts for user ${userId}`);
  } catch (error) {
    console.error('Error reporting account usage:', error);
    throw error;
  }
}

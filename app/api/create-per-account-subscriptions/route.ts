import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { 
  createAdAccountSubscription, 
  getAdAccountSubscriptionByAccountId 
} from '@/lib/db';
import { getPerAccountPlan } from '@/lib/stripe';

// Create per-account subscriptions for Facebook ad accounts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      adAccounts, 
      stripeCustomerId, 
      planId = 'basic', 
      billingCycle = 'monthly' 
    } = body;

    if (!userId || !adAccounts || !Array.isArray(adAccounts) || !stripeCustomerId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, adAccounts array, and stripeCustomerId' },
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

    const results = [];
    const errors = [];

    // Create subscriptions for each ad account
    for (const adAccount of adAccounts) {
      try {
        // Check if subscription already exists
        const existingSubscription = await getAdAccountSubscriptionByAccountId(
          parseInt(userId), 
          adAccount.id
        );

        if (existingSubscription) {
          console.log(`Subscription already exists for ad account: ${adAccount.id}`);
          results.push({
            adAccountId: adAccount.id,
            adAccountName: adAccount.name,
            status: 'already_exists',
            subscriptionId: existingSubscription.id
          });
          continue;
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
            adAccountId: adAccount.id,
            adAccountName: adAccount.name,
            planId,
            billingCycle,
            type: 'per_account'
          },
          expand: ['latest_invoice.payment_intent'],
        });

        if (!stripeSubscription) {
          throw new Error('Failed to create Stripe subscription');
        }

        // Save subscription to database
        const subscription = await createAdAccountSubscription(
          parseInt(userId),
          adAccount.id,
          adAccount.name,
          stripeSubscription.id,
          plan.currentPricing.stripePriceId,
          stripeCustomerId,
          billingCycle,
          plan.currentPricing.price * 100 // Convert to cents
        );

        results.push({
          adAccountId: adAccount.id,
          adAccountName: adAccount.name,
          status: 'created',
          subscriptionId: subscription.id,
          stripeSubscriptionId: stripeSubscription.id,
          stripeStatus: stripeSubscription.status
        });

        console.log(`✅ Created subscription for ad account: ${adAccount.name} (${adAccount.id})`);

      } catch (error) {
        console.error(`❌ Error creating subscription for ad account ${adAccount.id}:`, error);
        errors.push({
          adAccountId: adAccount.id,
          adAccountName: adAccount.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${adAccounts.length} ad accounts`,
      results,
      errors,
      summary: {
        total: adAccounts.length,
        created: results.filter(r => r.status === 'created').length,
        alreadyExists: results.filter(r => r.status === 'already_exists').length,
        errors: errors.length
      }
    });

  } catch (error) {
    console.error('Error creating per-account subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to create per-account subscriptions' },
      { status: 500 }
    );
  }
}

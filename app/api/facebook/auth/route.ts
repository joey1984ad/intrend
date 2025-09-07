import { NextRequest, NextResponse } from 'next/server';
import { saveFacebookSession, createAdAccountSubscription, getUserByEmail, getStripeCustomerByUserId, createStripeCustomer } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { getPerAccountPlan } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  console.log('🟡 API: /api/facebook/auth called');
  try {
    const body = await request.json();
    console.log('🟡 API: Request body keys:', Object.keys(body));
    
    const { accessToken, userEmail, planId = 'basic', billingCycle = 'monthly', adAccounts } = body;

    if (!accessToken) {
      console.log('❌ API: No access token provided');
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // If adAccounts are provided directly, skip Facebook API calls and go straight to subscription creation
    if (adAccounts && Array.isArray(adAccounts)) {
      console.log('📝 API: Creating subscriptions for provided ad accounts:', adAccounts.length);
      return await createSubscriptionsForAccounts(adAccounts, userEmail, planId, billingCycle);
    }

    console.log('🔍 API: Received access token length:', accessToken.length);
    console.log('🔍 API: Token starts with:', accessToken.substring(0, 20) + '...');

    // Use direct Graph API calls instead of Business SDK
    const baseUrl = 'https://graph.facebook.com/v23.0';

    // Get user info with timeout and retry logic
    console.log('🟡 API: Fetching user info from Facebook...');
    let userResponse;
    let userData;
    
    try {
      userResponse = await fetch(`${baseUrl}/me?access_token=${accessToken}`, {
        signal: AbortSignal.timeout(6000) // Reduced to 6 second timeout
      });
      
      if (!userResponse.ok) {
        throw new Error(`HTTP ${userResponse.status}: ${userResponse.statusText}`);
      }
      
      userData = await userResponse.json();
      console.log('🟡 API: User data response:', userData);
    } catch (userError) {
      console.error('❌ API: User API error:', userError);
      return NextResponse.json(
        { error: `Failed to fetch user info: ${userError instanceof Error ? userError.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    if (userData.error) {
      console.error('❌ API: User API error:', userData.error);
      return NextResponse.json(
        { error: `Facebook API error: ${userData.error.message}` },
        { status: 400 }
      );
    }

    // Get user's ad accounts with timeout and retry logic
    console.log('🟡 API: Fetching ad accounts from Facebook...');
    let adAccountsResponse;
    let adAccountsData;
    
    try {
      adAccountsResponse = await fetch(
        `${baseUrl}/me/adaccounts?fields=id,name,account_status,currency,timezone_name&access_token=${accessToken}`,
        {
          signal: AbortSignal.timeout(8000) // Reduced to 8 second timeout
        }
      );
      
      if (!adAccountsResponse.ok) {
        throw new Error(`HTTP ${adAccountsResponse.status}: ${adAccountsResponse.statusText}`);
      }
      
      adAccountsData = await adAccountsResponse.json();
      console.log('🟡 API: Ad accounts response:', adAccountsData);
    } catch (adAccountsError) {
      console.error('❌ API: Ad accounts API error:', adAccountsError);
      return NextResponse.json(
        { error: `Failed to fetch ad accounts: ${adAccountsError instanceof Error ? adAccountsError.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    if (adAccountsData.error) {
      console.error('❌ API: Ad accounts API error:', adAccountsData.error);
      return NextResponse.json(
        { error: `Facebook API error: ${adAccountsData.error.message}` },
        { status: 400 }
      );
    }

    // Save Facebook session for future use (but don't create subscriptions yet)
    console.log('📝 API: Ad accounts found:', adAccountsData.data?.length || 0);
    if (adAccountsData.data && adAccountsData.data.length > 0) {
      console.log('📝 API: Saving Facebook session for:', adAccountsData.data.map(acc => acc.name));
      
      try {
        // Get user from email (assuming we have user email from the request)
        const { userEmail } = body;
        if (userEmail) {
          const user = await getUserByEmail(userEmail);
          if (user) {
            // Save Facebook session to database for future use
            await saveFacebookSession(user.id.toString(), accessToken, userId);
            console.log('✅ API: Facebook session saved for user:', userEmail);
          } else {
            console.log('⚠️ API: User not found for email:', userEmail);
          }
        } else {
          console.log('⚠️ API: No user email provided, skipping session save');
        }
      } catch (sessionError) {
        console.error('❌ API: Error saving Facebook session:', sessionError);
        // Don't fail the entire request if session save fails
      }
    }

    console.log('✅ API: Successfully processed request, returning response');
    return NextResponse.json({
      success: true,
      user: userData,
      adAccounts: adAccountsData.data || []
    });

  } catch (error: any) {
    console.error('❌ API: Facebook auth error:', error);
    
    let errorMessage = 'Failed to authenticate with Facebook. Please check your permissions and try again.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout. Please check your internet connection and try again.';
    } else if (error.message) {
      errorMessage = `Authentication error: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Helper function to create subscriptions for provided ad accounts
async function createSubscriptionsForAccounts(adAccounts: any[], userEmail: string, planId: string, billingCycle: string) {
  try {
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required for subscription creation' },
        { status: 400 }
      );
    }

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
        metadata: {
          userId: user.id.toString()
        }
      });
      
      stripeCustomer = await createStripeCustomer(user.id, customer.id, userEmail);
    }

    // Get plan details
    const plan = getPerAccountPlan(planId, billingCycle);
    if (!plan || !plan.currentPricing.stripePriceId) {
      return NextResponse.json(
        { error: 'Invalid plan or Stripe price ID not configured' },
        { status: 400 }
      );
    }

    // Create subscriptions for each ad account
    const subscriptionResults = [];
    const errors = [];

    for (const adAccount of adAccounts) {
      try {
        // Create Stripe subscription
        const stripeSubscription = await stripe.subscriptions.create({
          customer: stripeCustomer.stripe_customer_id,
          items: [
            {
              price: plan.currentPricing.stripePriceId,
            },
          ],
          metadata: {
            userId: user.id.toString(),
            adAccountId: adAccount.id,
            adAccountName: adAccount.name,
            planId,
            billingCycle,
            type: 'per_account'
          },
          expand: ['latest_invoice.payment_intent'],
        });

        // Save subscription to database
        const subscription = await createAdAccountSubscription(
          user.id,
          adAccount.id,
          adAccount.name,
          stripeSubscription.id,
          plan.currentPricing.stripePriceId,
          stripeCustomer.stripe_customer_id,
          billingCycle,
          plan.currentPricing.price * 100 // Convert to cents
        );

        subscriptionResults.push({
          adAccountId: adAccount.id,
          adAccountName: adAccount.name,
          subscriptionId: subscription.id,
          stripeSubscriptionId: stripeSubscription.id,
          status: 'created'
        });

        console.log(`✅ Created subscription for ad account: ${adAccount.name} (${adAccount.id})`);
      } catch (subscriptionError) {
        console.error(`❌ Error creating subscription for ad account ${adAccount.id}:`, subscriptionError);
        errors.push({
          adAccountId: adAccount.id,
          adAccountName: adAccount.name,
          error: subscriptionError instanceof Error ? subscriptionError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created subscriptions for ${adAccounts.length} ad accounts`,
      subscriptionResults,
      errors,
      summary: {
        total: adAccounts.length,
        created: subscriptionResults.length,
        errors: errors.length
      }
    });

  } catch (error) {
    console.error('❌ API: Error creating subscriptions for accounts:', error);
    return NextResponse.json(
      { error: 'Failed to create subscriptions' },
      { status: 500 }
    );
  }
} 
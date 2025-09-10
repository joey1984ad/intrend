import { NextRequest, NextResponse } from 'next/server';
import { getStripeCustomerByUserId, getUserByEmail } from '@/lib/db';
import { getPerAccountPlan } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail') || 'test@example.com';
    
    console.log('🔍 Testing subscription setup for:', userEmail);
    
    // Get user
    const user = await getUserByEmail(userEmail);
    console.log('User found:', user ? `ID: ${user.id}` : 'Not found');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found', userEmail });
    }
    
    // Get Stripe customer
    const stripeCustomer = await getStripeCustomerByUserId(user.id);
    console.log('Stripe customer:', stripeCustomer ? `ID: ${stripeCustomer.stripe_customer_id}` : 'Not found');
    
    // Test plan loading
    const basicMonthly = getPerAccountPlan('basic', 'monthly');
    const basicAnnual = getPerAccountPlan('basic', 'annual');
    const proMonthly = getPerAccountPlan('pro', 'monthly');
    
    console.log('Plans loaded:', {
      basicMonthly: basicMonthly ? 'OK' : 'Missing',
      basicAnnual: basicAnnual ? 'OK' : 'Missing',
      proMonthly: proMonthly ? 'OK' : 'Missing'
    });
    
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      stripeCustomer: stripeCustomer ? { 
        id: stripeCustomer.stripe_customer_id,
        created: stripeCustomer.created_at 
      } : null,
      plans: {
        basicMonthly: basicMonthly ? {
          id: basicMonthly.id,
          stripePriceId: basicMonthly.currentPricing?.stripePriceId,
          price: basicMonthly.currentPricing?.price
        } : null,
        basicAnnual: basicAnnual ? {
          id: basicAnnual.id,
          stripePriceId: basicAnnual.currentPricing?.stripePriceId,
          price: basicAnnual.currentPricing?.price
        } : null,
        proMonthly: proMonthly ? {
          id: proMonthly.id,
          stripePriceId: proMonthly.currentPricing?.stripePriceId,
          price: proMonthly.currentPricing?.price
        } : null
      }
    });
    
  } catch (error: any) {
    console.error('❌ Test subscription error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🧪 Test subscription creation with body:', JSON.stringify(body, null, 2));
    
    const { userEmail, adAccounts, planId = 'basic', billingCycle = 'monthly' } = body;
    
    if (!userEmail || !adAccounts) {
      return NextResponse.json({ error: 'userEmail and adAccounts required' }, { status: 400 });
    }
    
    // Get user
    const user = await getUserByEmail(userEmail);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get Stripe customer
    const stripeCustomer = await getStripeCustomerByUserId(user.id);
    if (!stripeCustomer) {
      return NextResponse.json({ error: 'Stripe customer not found' }, { status: 404 });
    }
    
    // Test the actual subscription creation
    const response = await fetch(`${request.nextUrl.origin}/api/create-per-account-subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        adAccounts,
        stripeCustomerId: stripeCustomer.stripe_customer_id,
        planId,
        billingCycle
      })
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      result,
      testData: {
        userId: user.id,
        stripeCustomerId: stripeCustomer.stripe_customer_id,
        planId,
        billingCycle,
        adAccountsCount: adAccounts.length
      }
    });
    
  } catch (error: any) {
    console.error('❌ Test subscription POST error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

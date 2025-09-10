import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getStripeCustomerByUserId } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail } = body;

    console.log('🔧 Fixing default payment method for:', userEmail);

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
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

    console.log('✅ Using Stripe customer:', stripeCustomer.stripe_customer_id);

    // Get customer's payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomer.stripe_customer_id,
      type: 'card'
    });

    if (paymentMethods.data.length === 0) {
      return NextResponse.json({ 
        error: 'No payment methods found. Please add a payment method first.' 
      }, { status: 400 });
    }

    // Get current customer details
    const customer = await stripe.customers.retrieve(stripeCustomer.stripe_customer_id);
    console.log('🔍 Current default payment method:', customer.invoice_settings?.default_payment_method);

    if (customer.invoice_settings?.default_payment_method) {
      return NextResponse.json({
        success: true,
        message: 'Default payment method already set',
        defaultPaymentMethod: customer.invoice_settings.default_payment_method,
        totalPaymentMethods: paymentMethods.data.length
      });
    }

    // Set the first payment method as default
    const defaultPaymentMethod = paymentMethods.data[0];
    await stripe.customers.update(stripeCustomer.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: defaultPaymentMethod.id
      }
    });

    console.log(`✅ Set payment method ${defaultPaymentMethod.id} as default`);

    return NextResponse.json({
      success: true,
      message: 'Default payment method set successfully',
      defaultPaymentMethod: defaultPaymentMethod.id,
      paymentMethodDetails: {
        brand: defaultPaymentMethod.card?.brand,
        last4: defaultPaymentMethod.card?.last4,
        expMonth: defaultPaymentMethod.card?.exp_month,
        expYear: defaultPaymentMethod.card?.exp_year
      },
      totalPaymentMethods: paymentMethods.data.length
    });

  } catch (error: any) {
    console.error('❌ Error fixing default payment method:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fix default payment method',
      details: error.raw || error
    }, { status: 500 });
  }
}

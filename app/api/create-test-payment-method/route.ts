import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, getStripeCustomerByUserId, createStripeCustomer } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail } = body;

    console.log('🔧 Creating test payment method for:', userEmail);

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

    // Get or create Stripe customer
    let stripeCustomer = await getStripeCustomerByUserId(user.id);
    if (!stripeCustomer) {
      console.log('🔄 Creating Stripe customer...');
      const customer = await stripe.customers.create({
        email: userEmail,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || userEmail,
        metadata: { userId: user.id.toString() }
      });
      
      stripeCustomer = await createStripeCustomer(user.id, customer.id, userEmail);
      console.log('✅ Stripe customer created:', customer.id);
    }

    console.log('✅ Using Stripe customer:', stripeCustomer.stripe_customer_id);

    // Create a test payment method (card)
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242', // Stripe test card
        exp_month: 12,
        exp_year: 2030,
        cvc: '123',
      },
    });

    console.log('✅ Test payment method created:', paymentMethod.id);

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: stripeCustomer.stripe_customer_id,
    });

    console.log('✅ Payment method attached to customer');

    // Set as default payment method
    await stripe.customers.update(stripeCustomer.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    console.log('✅ Set as default payment method');

    return NextResponse.json({
      success: true,
      message: 'Test payment method created and set as default',
      paymentMethodId: paymentMethod.id,
      customerId: stripeCustomer.stripe_customer_id
    });

  } catch (error: any) {
    console.error('❌ Error creating test payment method:', error);
    return NextResponse.json({
      error: error.message || 'Failed to create test payment method',
      details: error.raw || error
    }, { status: 500 });
  }
}

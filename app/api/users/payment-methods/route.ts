import { NextRequest, NextResponse } from 'next/server';
import { getPaymentMethodsByUserId, createPaymentMethod } from '@/lib/db';

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

    const paymentMethods = await getPaymentMethodsByUserId(parseInt(userId));
    
    return NextResponse.json({
      success: true,
      paymentMethods: paymentMethods.map(pm => ({
        id: pm.id,
        stripePaymentMethodId: pm.stripe_payment_method_id,
        type: pm.type,
        last4: pm.last4,
        brand: pm.brand,
        expMonth: pm.exp_month,
        expYear: pm.exp_year,
        isDefault: pm.is_default,
        createdAt: pm.created_at
      }))
    });
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to get payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, stripePaymentMethodId, type, last4, brand, expMonth, expYear, isDefault } = body;

    if (!userId || !stripePaymentMethodId || !type) {
      return NextResponse.json(
        { error: 'User ID, Stripe Payment Method ID, and type are required' },
        { status: 400 }
      );
    }

    const paymentMethod = await createPaymentMethod({
      userId: parseInt(userId),
      stripePaymentMethodId,
      type,
      last4,
      brand,
      expMonth,
      expYear,
      isDefault
    });

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        stripePaymentMethodId: paymentMethod.stripe_payment_method_id,
        type: paymentMethod.type,
        last4: paymentMethod.last4,
        brand: paymentMethod.brand,
        expMonth: paymentMethod.exp_month,
        expYear: paymentMethod.exp_year,
        isDefault: paymentMethod.is_default,
        createdAt: paymentMethod.created_at
      }
    });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
}

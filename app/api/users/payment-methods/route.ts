import { NextRequest, NextResponse } from 'next/server';
import { getPaymentMethodsByUserId } from '@/lib/db';

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

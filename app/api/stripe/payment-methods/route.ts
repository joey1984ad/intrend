import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPaymentMethodsByUserId, deletePaymentMethod } from '@/lib/db';

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

export async function DELETE(request: NextRequest) {
  try {
    const { paymentMethodId } = await request.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    const deletedPaymentMethod = await deletePaymentMethod(parseInt(paymentMethodId));
    
    if (!deletedPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // Also delete from Stripe
    if (stripe) {
      try {
        await stripe.paymentMethods.detach(deletedPaymentMethod.stripe_payment_method_id);
      } catch (stripeError) {
        console.error('Error detaching payment method from Stripe:', stripeError);
        // Continue with database deletion even if Stripe fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}

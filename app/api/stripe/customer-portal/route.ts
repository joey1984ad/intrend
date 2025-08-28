import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { customerId, customerEmail, returnUrl } = await request.json();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    let stripeCustomerId = customerId;

    // If no customer ID provided, try to find customer by email
    if (!stripeCustomerId && customerEmail) {
      try {
        const customers = await stripe.customers.list({
          email: customerEmail,
          limit: 1
        });
        
        if (customers.data.length > 0) {
          stripeCustomerId = customers.data[0].id;
        }
      } catch (error) {
        console.error('Error finding customer by email:', error);
      }
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { 
          error: 'Customer ID or email is required. Please contact support if you need assistance.' 
        },
        { status: 400 }
      );
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/billing`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe customer portal error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid customer information. Please contact support.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer portal session. Please try again.' },
      { status: 500 }
    );
  }
}

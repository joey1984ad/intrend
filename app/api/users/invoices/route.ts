import { NextRequest, NextResponse } from 'next/server';
import { getInvoicesByUserId } from '@/lib/db';

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

    const invoices = await getInvoicesByUserId(parseInt(userId));
    
    return NextResponse.json({
      success: true,
      invoices: invoices.map(invoice => ({
        id: invoice.id,
        stripeInvoiceId: invoice.stripe_invoice_id,
        subscriptionId: invoice.subscription_id,
        amountPaid: invoice.amount_paid,
        status: invoice.status,
        invoicePdfUrl: invoice.invoice_pdf_url,
        invoiceNumber: invoice.invoice_number,
        createdAt: invoice.created_at
      }))
    });
  } catch (error) {
    console.error('Error getting invoices:', error);
    return NextResponse.json(
      { error: 'Failed to get invoices' },
      { status: 500 }
    );
  }
}

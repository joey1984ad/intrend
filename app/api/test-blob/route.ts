import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    // Test blob upload
    const testData = `Test export generated at ${new Date().toISOString()}\nCampaign data test\nDate range: last_30d`;
    
    const blob = await put('test-export.csv', testData, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'text/csv',
    });

    console.log(`✅ Blob test successful: ${blob.url}`);

    return NextResponse.json({
      success: true,
      message: 'Blob storage test successful',
      url: blob.url
    });
  } catch (error) {
    console.error('❌ Blob test error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test blob storage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
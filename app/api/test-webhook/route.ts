import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Test endpoint working",
    timestamp: new Date().toISOString(),
    version: "1.0"
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      status: "success",
      message: "Test webhook received",
      receivedData: body,
      timestamp: new Date().toISOString(),
      version: "1.0"
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Failed to parse request body",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      version: "1.0"
    }, { status: 400 });
  }
}

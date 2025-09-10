import { NextRequest, NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Initializing database schema...');
    await initDatabase();
    console.log('✅ Database schema initialized successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully'
    });
  } catch (error: any) {
    console.error('❌ Error initializing database:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
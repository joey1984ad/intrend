import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, company } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await sql`
      INSERT INTO users (first_name, last_name, email, password, company, created_at, updated_at)
      VALUES (${firstName}, ${lastName}, ${email}, ${hashedPassword}, ${company || null}, NOW(), NOW())
      RETURNING id, first_name, last_name, email, company, current_plan_id, current_plan_name, current_billing_cycle, subscription_status
    `;

    if (newUser.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    const user = newUser[0];

    // Create a simple session (in production, you'd use a proper session management system)
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    // Return user data and session token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        company: user.company,
        currentPlanId: user.current_plan_id,
        currentPlanName: user.current_plan_name,
        currentBillingCycle: user.current_billing_cycle,
        subscriptionStatus: user.subscription_status
      },
      sessionToken
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

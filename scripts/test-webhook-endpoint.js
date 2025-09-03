const crypto = require('crypto');

// Test webhook endpoint
async function testWebhookEndpoint() {
  console.log('🧪 Testing Stripe Webhook Endpoint\n');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.log('❌ STRIPE_WEBHOOK_SECRET not found in environment variables');
    console.log('Please add your webhook secret to .env.local');
    return;
  }

  console.log('✅ Webhook secret found');

  // Create a test event payload
  const testEvent = {
    id: 'evt_test_webhook',
    object: 'event',
    api_version: '2020-08-27',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'sub_test_webhook',
        object: 'subscription',
        customer: 'cus_test_webhook',
        customer_details: {
          email: 'test@example.com'
        },
        metadata: {
          planId: 'startup',
          planName: 'Startup',
          billingCycle: 'monthly'
        },
        status: 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        cancel_at_period_end: false
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_webhook',
      idempotency_key: null
    },
    type: 'customer.subscription.created'
  };

  // Create the webhook signature
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify(testEvent);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  const stripeSignature = `t=${timestamp},v1=${signature}`;

  console.log('📤 Sending test webhook to /api/stripe/webhook');
  console.log('Event type:', testEvent.type);
  console.log('Customer email:', testEvent.data.object.customer_details.email);
  console.log('Plan:', testEvent.data.object.metadata.planName);

  try {
    const response = await fetch('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': stripeSignature
      },
      body: payload
    });

    const responseText = await response.text();
    console.log('\n📥 Response:');
    console.log('Status:', response.status);
    console.log('Body:', responseText);

    if (response.ok) {
      console.log('\n✅ Webhook endpoint is working correctly!');
    } else {
      console.log('\n❌ Webhook endpoint returned an error');
    }

  } catch (error) {
    console.log('\n❌ Failed to send webhook:', error.message);
    console.log('\n💡 Make sure your development server is running:');
    console.log('   npm run dev');
  }
}

// Test the webhook endpoint
testWebhookEndpoint().catch(console.error);

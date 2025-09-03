// Open your browser console and run this code:

async function testVerification() {
  const sessionId = 'cs_test_a17YSvzMphn4vqDYdQGEN5IQgEqOmrQ96VJPd6U2aewhtJMD9e3msaFxqO';
  
  console.log('Testing verification for session:', sessionId);
  
  try {
    const response = await fetch('/api/subscription/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    
    const data = await response.json();
    console.log('Verification result:', data);
    
    if (data.success) {
      console.log('✅ Verification successful!');
      console.log('Plan updated to:', data.planTier);
      // Refresh the page to see the changes
      window.location.reload();
    } else {
      console.log('❌ Verification failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run this function
testVerification();

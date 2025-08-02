import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, adAccountId } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 HEALTH CHECK: Testing Facebook API connectivity`);

    const baseUrl = 'https://graph.facebook.com/v23.0';
    const healthChecks = [];

    // Test 1: Basic token validation
    try {
      const tokenUrl = `${baseUrl}/me?access_token=${accessToken}`;
      const tokenResponse = await fetch(tokenUrl);
      const tokenData = await tokenResponse.json();
      
      healthChecks.push({
        test: 'Token Validation',
        status: tokenData.error ? 'FAILED' : 'PASSED',
        result: tokenData.error ? tokenData.error.message : `Valid token for user: ${tokenData.name || tokenData.id}`,
        details: tokenData
      });
    } catch (error) {
      healthChecks.push({
        test: 'Token Validation',
        status: 'ERROR',
        result: 'Failed to validate token',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: Ad account access (if provided)
    if (adAccountId) {
      try {
        const accountUrl = `${baseUrl}/${adAccountId}?fields=id,name,timezone_name,currency,account_status&access_token=${accessToken}`;
        const accountResponse = await fetch(accountUrl);
        const accountData = await accountResponse.json();
        
        healthChecks.push({
          test: 'Ad Account Access',
          status: accountData.error ? 'FAILED' : 'PASSED',
          result: accountData.error ? accountData.error.message : `Account: ${accountData.name} (${accountData.account_status})`,
          details: accountData
        });
      } catch (error) {
        healthChecks.push({
          test: 'Ad Account Access',
          status: 'ERROR',
          result: 'Failed to access ad account',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Test 3: Ads endpoint access
    if (adAccountId) {
      try {
        const adsUrl = `${baseUrl}/${adAccountId}/ads?limit=1&fields=id,name,status&access_token=${accessToken}`;
        const adsResponse = await fetch(adsUrl);
        const adsData = await adsResponse.json();
        
        healthChecks.push({
          test: 'Ads Endpoint Access',
          status: adsData.error ? 'FAILED' : 'PASSED',
          result: adsData.error ? adsData.error.message : `Found ${adsData.data?.length || 0} ads`,
          details: adsData.error ? adsData : { count: adsData.data?.length || 0 }
        });
      } catch (error) {
        healthChecks.push({
          test: 'Ads Endpoint Access',
          status: 'ERROR',
          result: 'Failed to access ads endpoint',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Test 4: Permissions check
    try {
      const permissionsUrl = `${baseUrl}/me/permissions?access_token=${accessToken}`;
      const permissionsResponse = await fetch(permissionsUrl);
      const permissionsData = await permissionsResponse.json();
      
      const grantedPermissions = permissionsData.data?.filter((p: any) => p.status === 'granted').map((p: any) => p.permission) || [];
      const requiredPermissions = ['ads_read', 'ads_management', 'read_insights', 'pages_read_engagement'];
      const missingPermissions = requiredPermissions.filter(perm => !grantedPermissions.includes(perm));
      
      healthChecks.push({
        test: 'Permissions Check',
        status: missingPermissions.length === 0 ? 'PASSED' : 'WARNING',
        result: missingPermissions.length === 0 ? 'All required permissions granted' : `Missing: ${missingPermissions.join(', ')}`,
        details: {
          granted: grantedPermissions,
          missing: missingPermissions,
          required: requiredPermissions
        }
      });
    } catch (error) {
      healthChecks.push({
        test: 'Permissions Check',
        status: 'ERROR',
        result: 'Failed to check permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 5: Rate limit status
    try {
      const rateLimitUrl = `${baseUrl}/me?fields=id&access_token=${accessToken}`;
      const rateLimitResponse = await fetch(rateLimitUrl);
      const rateLimitHeaders = rateLimitResponse.headers;
      
      const usage = rateLimitHeaders.get('x-app-usage');
      const adUsage = rateLimitHeaders.get('x-ad-account-usage');
      
      healthChecks.push({
        test: 'Rate Limit Status',
        status: 'INFO',
        result: 'Rate limit headers checked',
        details: {
          appUsage: usage ? JSON.parse(usage) : null,
          adAccountUsage: adUsage ? JSON.parse(adUsage) : null
        }
      });
    } catch (error) {
      healthChecks.push({
        test: 'Rate Limit Status',
        status: 'ERROR',
        result: 'Failed to check rate limits',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Determine overall health
    const failedTests = healthChecks.filter(check => check.status === 'FAILED').length;
    const errorTests = healthChecks.filter(check => check.status === 'ERROR').length;
    
    let overallStatus = 'HEALTHY';
    if (errorTests > 0) overallStatus = 'CRITICAL';
    else if (failedTests > 0) overallStatus = 'DEGRADED';

    console.log(`✅ HEALTH CHECK: Completed with status ${overallStatus}`);

    return NextResponse.json({
      success: true,
      overallStatus,
      timestamp: new Date().toISOString(),
      healthChecks,
      summary: {
        total: healthChecks.length,
        passed: healthChecks.filter(check => check.status === 'PASSED').length,
        failed: failedTests,
        errors: errorTests,
        warnings: healthChecks.filter(check => check.status === 'WARNING').length
      }
    });

  } catch (error) {
    console.error('❌ HEALTH CHECK: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}

// GET endpoint for quick testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('accessToken');
  const adAccountId = searchParams.get('adAccountId');

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Access token is required as query parameter' },
      { status: 400 }
    );
  }

  // Redirect to POST method
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, adAccountId })
  }));
}
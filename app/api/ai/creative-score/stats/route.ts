import { NextRequest, NextResponse } from 'next/server';
import { getCreativeScoreStats } from '@/lib/db';

// GET /api/ai/creative-score/stats - Get AI scoring statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adAccountId = searchParams.get('adAccountId');
    const daysBack = parseInt(searchParams.get('daysBack') || '30');

    console.log('📊 AI Creative Score Stats: Retrieving stats', { adAccountId, daysBack });

    // Validate daysBack parameter
    if (isNaN(daysBack) || daysBack < 1 || daysBack > 365) {
      return NextResponse.json(
        { error: 'daysBack must be a number between 1 and 365' },
        { status: 400 }
      );
    }

    const stats = await getCreativeScoreStats(adAccountId || undefined, daysBack);

    // Format the response with proper types
    const formattedStats = {
      totalScores: parseInt(stats.total_scores || 0),
      avgScore: parseFloat(stats.avg_score || 0).toFixed(1),
      minScore: parseInt(stats.min_score || 0),
      maxScore: parseInt(stats.max_score || 0),
      distribution: {
        lowScores: parseInt(stats.low_scores || 0), // < 60
        mediumScores: parseInt(stats.medium_scores || 0), // 60-79
        highScores: parseInt(stats.high_scores || 0) // >= 80
      },
      avgProcessingTimeMs: parseInt(stats.avg_processing_time_ms || 0),
      period: {
        daysBack,
        adAccountId: adAccountId || 'all_accounts'
      }
    };

    console.log(`✅ AI Creative Score Stats: Retrieved stats for ${formattedStats.totalScores} scores`);

    return NextResponse.json({
      success: true,
      stats: formattedStats
    });

  } catch (error: any) {
    console.error('❌ AI Creative Score Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve AI creative score statistics' },
      { status: 500 }
    );
  }
}

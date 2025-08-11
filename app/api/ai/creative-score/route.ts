import { NextRequest, NextResponse } from 'next/server';
import { saveAICreativeScore } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const { creativeId, adAccountId, score, analysisData } = await request.json();

    // Validate required fields
    if (!creativeId || !adAccountId || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: creativeId, adAccountId, score' },
        { status: 400 }
      );
    }

    // Validate score range (0-10)
    if (typeof score !== 'number' || score < 0 || score > 10) {
      return NextResponse.json(
        { error: 'Score must be a number between 0 and 10' },
        { status: 400 }
      );
    }

    // Save the AI score to database
    const savedId = await saveAICreativeScore(creativeId, adAccountId, score, analysisData);

    console.log(`✅ AI score saved for creative ${creativeId}: ${score}/10`);

    return NextResponse.json({
      success: true,
      id: savedId,
      message: `AI score ${score}/10 saved for creative ${creativeId}`
    });

  } catch (error) {
    console.error('❌ Error saving AI creative score:', error);
    return NextResponse.json(
      { error: 'Failed to save AI creative score' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creativeId = searchParams.get('creativeId');
    const adAccountId = searchParams.get('adAccountId');

    if (!creativeId || !adAccountId) {
      return NextResponse.json(
        { error: 'Missing required query parameters: creativeId, adAccountId' },
        { status: 400 }
      );
    }

    // Import the function here to avoid circular dependency issues
    const { getAICreativeScore } = await import('../../../../lib/db');
    const scoreData = await getAICreativeScore(creativeId, adAccountId);

    if (!scoreData) {
      return NextResponse.json({ score: null, message: 'No AI score found for this creative' });
    }

    return NextResponse.json({
      success: true,
      score: scoreData.score,
      analysisData: scoreData.analysis_data,
      createdAt: scoreData.created_at,
      updatedAt: scoreData.updated_at
    });

  } catch (error) {
    console.error('❌ Error getting AI creative score:', error);
    return NextResponse.json(
      { error: 'Failed to get AI creative score' },
      { status: 500 }
    );
  }
}

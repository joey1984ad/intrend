import { NextRequest, NextResponse } from 'next/server';
import { saveCreativeScore, getCreativeScore, getCreativeScoresBatch } from '@/lib/db';

// POST /api/ai/creative-score - Save AI analysis results
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🤖 AI Creative Score API: Saving score for creative', body.creativeId);
    
    const {
      adAccountId,
      creativeId,
      imageUrl,
      imageHash,
      model,
      inputContext,
      score,
      insights,
      flags,
      processingTimeMs
    } = body;

    // Validate required fields
    if (!adAccountId || !creativeId || !model || !score || !insights) {
      return NextResponse.json(
        { error: 'Missing required fields: adAccountId, creativeId, model, score, insights' },
        { status: 400 }
      );
    }

    // Validate score structure
    if (typeof score.overall !== 'number' || !score.dimensions) {
      return NextResponse.json(
        { error: 'Invalid score structure. Expected: { overall: number, dimensions: object }' },
        { status: 400 }
      );
    }

    // Validate insights structure
    if (!insights.strengths || !insights.issues || !insights.suggestions) {
      return NextResponse.json(
        { error: 'Invalid insights structure. Expected: { strengths: string[], issues: string[], suggestions: string[] }' },
        { status: 400 }
      );
    }

    // Validate dimension scores exist
    const requiredDimensions = ['clarity', 'text_density', 'brand', 'value_prop', 'cta', 'contrast', 'thumbnail'];
    for (const dimension of requiredDimensions) {
      if (typeof score.dimensions[dimension] !== 'number') {
        return NextResponse.json(
          { error: `Missing or invalid dimension score: ${dimension}` },
          { status: 400 }
        );
      }
    }

    // Save to database
    const id = await saveCreativeScore({
      adAccountId,
      creativeId,
      imageHash,
      model,
      score,
      insights,
      flags,
      inputContext,
      processingTimeMs
    });

    console.log(`✅ AI Creative Score: Saved score ${score.overall} for creative ${creativeId}`);

    return NextResponse.json({
      success: true,
      id,
      message: `AI score saved for creative ${creativeId}`
    });

  } catch (error: any) {
    console.error('❌ AI Creative Score API error:', error);
    
    // Handle specific database constraint errors
    if (error.message?.includes('Invalid') && error.message?.includes('score')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save AI creative score' },
      { status: 500 }
    );
  }
}

// GET /api/ai/creative-score - Retrieve AI scores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creativeId = searchParams.get('creativeId');
    const creativeIds = searchParams.get('creativeIds'); // comma-separated for batch
    const imageHash = searchParams.get('imageHash');

    console.log('🤖 AI Creative Score API: Retrieving scores for creative(s)', creativeId || creativeIds);

    // Batch request
    if (creativeIds) {
      const ids = creativeIds.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.length === 0) {
        return NextResponse.json(
          { error: 'No valid creative IDs provided' },
          { status: 400 }
        );
      }

      const scores = await getCreativeScoresBatch(ids);
      const results: Record<string, any> = {};
      
      for (const [id, score] of scores.entries()) {
        results[id] = {
          id: score.id,
          creativeId: score.creative_id,
          imageHash: score.image_hash,
          model: score.model,
          scoreOverall: score.score_overall,
          scores: score.scores_json,
          insights: score.insights_json,
          flags: score.compliance_flags,
          inputContext: score.input_context,
          processingTimeMs: score.processing_time_ms,
          createdAt: score.created_at
        };
      }

      return NextResponse.json({
        success: true,
        scores: results,
        count: Object.keys(results).length
      });
    }

    // Single request
    if (!creativeId) {
      return NextResponse.json(
        { error: 'creativeId or creativeIds parameter is required' },
        { status: 400 }
      );
    }

    const score = await getCreativeScore(creativeId, imageHash || undefined);
    
    if (!score) {
      return NextResponse.json(
        { success: true, score: null, message: 'No AI score found for this creative' }
      );
    }

    const result = {
      id: score.id,
      creativeId: score.creative_id,
      imageHash: score.image_hash,
      model: score.model,
      scoreOverall: score.score_overall,
      scores: score.scores_json,
      insights: score.insights_json,
      flags: score.compliance_flags,
      inputContext: score.input_context,
      processingTimeMs: score.processing_time_ms,
      createdAt: score.created_at
    };

    console.log(`✅ AI Creative Score: Retrieved score ${score.score_overall} for creative ${creativeId}`);

    return NextResponse.json({
      success: true,
      score: result
    });

  } catch (error: any) {
    console.error('❌ AI Creative Score API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve AI creative score' },
      { status: 500 }
    );
  }
}

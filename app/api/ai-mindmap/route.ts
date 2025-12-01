import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { openRouterAI, MindMapData } from '@/lib/ai-mindmap';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenRouter API key not configured' 
      }, { status: 500 });
    }

    const body = await request.json();
    const { topic, complexity = 'detailed', type = 'topic' } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Topic is required and must be a non-empty string' 
      }, { status: 400 });
    }

    let mindMapData: MindMapData;

    if (type === 'text') {
      // Generate mindmap from text analysis
      mindMapData = await openRouterAI.generateMindMapFromText(topic);
    } else {
      // Generate mindmap from topic
      mindMapData = await openRouterAI.generateMindMap(topic, complexity);
    }

    return NextResponse.json({
      success: true,
      data: mindMapData,
      metadata: {
        userId,
        topic,
        complexity,
        type,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in mindmap generation API:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ 
          error: 'API configuration error' 
        }, { status: 500 });
      }
      
      if (error.message.includes('Invalid JSON')) {
        return NextResponse.json({ 
          error: 'AI response parsing error' 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: `Generation failed: ${error.message}` 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET method to check API status
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasApiKey = !!process.env.OPENROUTER_API_KEY;
    
    return NextResponse.json({
      status: 'API is running',
      hasApiKey,
      availableModels: ['google/gemini-2.5-flash'],
      supportedComplexity: ['simple', 'detailed', 'complex'],
      supportedTypes: ['topic', 'text']
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Service unavailable' 
    }, { status: 503 });
  }
}
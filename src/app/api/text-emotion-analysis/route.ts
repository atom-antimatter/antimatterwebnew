import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const HUME_API_KEY = process.env.HUME_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    console.log('Analyzing text:', text.substring(0, 100) + '...');

    // Parallel API calls to Hume and OpenAI
    const [humeEmotions, openaiAnalysis] = await Promise.all([
      analyzeWithHume(text),
      analyzeWithOpenAI(text)
    ]);

    // Combine the results
    const result = {
      emotions: humeEmotions,
      sentiment: openaiAnalysis.sentiment,
      intent: openaiAnalysis.intent,
      analysis: openaiAnalysis.analysis,
      emotionalMetrics: openaiAnalysis.emotionalMetrics,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Text emotion analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}

async function analyzeWithHume(text: string) {
  if (!HUME_API_KEY) {
    console.warn('Hume API key not configured - using mock data');
    return generateMockHumeEmotions();
  }

  try {
    // Use Hume's WebSocket API for text analysis
    const response = await fetch('https://api.hume.ai/v0/batch/jobs', {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': HUME_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        models: {
          language: {
            granularity: 'sentence'
          }
        },
        text: [text]
      }),
    });

    if (!response.ok) {
      console.error('Hume API error:', response.status);
      return generateMockHumeEmotions();
    }

    const data = await response.json();
    
    // Extract emotions from Hume response
    if (data.predictions && data.predictions[0]?.models?.language?.grouped_predictions) {
      const predictions = data.predictions[0].models.language.grouped_predictions[0]?.predictions || [];
      return predictions.map((p: any) => ({
        name: p.name,
        score: p.score
      })).sort((a: any, b: any) => b.score - a.score);
    }

    return generateMockHumeEmotions();
  } catch (error) {
    console.error('Hume analysis error:', error);
    return generateMockHumeEmotions();
  }
}

async function analyzeWithOpenAI(text: string) {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured - using mock data');
    return generateMockOpenAIAnalysis(text);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Latest GPT-4 model (GPT-5 not yet available)
      messages: [
        {
          role: 'system',
          content: `You are an expert emotional intelligence analyst. Analyze the given text and provide:
1. Overall sentiment (positive, negative, neutral, or mixed) with confidence score (0-100)
2. Primary intent (inform, persuade, express, request, question, etc.) with confidence score
3. Detailed emotional analysis
4. Six key emotional metrics on a 0-100 scale:
   - Emotional Intensity: How strongly emotions are expressed
   - Positivity: Degree of positive emotional content
   - Authenticity: How genuine and sincere the expression appears
   - Complexity: Emotional depth and nuance
   - Clarity: How clearly emotions are communicated
   - Energy: The vitality and engagement level

Return your analysis as valid JSON with this exact structure:
{
  "sentiment": {
    "label": "positive|negative|neutral|mixed",
    "confidence": 85,
    "description": "Brief explanation"
  },
  "intent": {
    "primary": "inform|persuade|express|request|question|other",
    "confidence": 90,
    "description": "Brief explanation"
  },
  "analysis": "Detailed emotional analysis paragraph",
  "emotionalMetrics": {
    "intensity": 75,
    "positivity": 80,
    "authenticity": 85,
    "complexity": 70,
    "clarity": 90,
    "energy": 75
  }
}`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return generateMockOpenAIAnalysis(text);
  }
}

function generateMockHumeEmotions() {
  return [
    { name: 'joy', score: 0.72 },
    { name: 'contentment', score: 0.65 },
    { name: 'interest', score: 0.58 },
    { name: 'calmness', score: 0.52 },
    { name: 'excitement', score: 0.45 },
  ];
}

function generateMockOpenAIAnalysis(text: string) {
  const hasPositiveWords = /great|good|happy|excellent|wonderful|love|amazing/i.test(text);
  const hasNegativeWords = /bad|terrible|awful|hate|sad|disappointed|angry/i.test(text);
  
  let sentiment = 'neutral';
  if (hasPositiveWords && !hasNegativeWords) sentiment = 'positive';
  else if (hasNegativeWords && !hasPositiveWords) sentiment = 'negative';
  else if (hasPositiveWords && hasNegativeWords) sentiment = 'mixed';

  return {
    sentiment: {
      label: sentiment,
      confidence: 75,
      description: `The text expresses a ${sentiment} sentiment based on word choice and tone.`
    },
    intent: {
      primary: 'express',
      confidence: 80,
      description: 'The primary intent appears to be expressing thoughts or feelings.'
    },
    analysis: 'This text demonstrates moderate emotional complexity with clear communicative intent. The language suggests a conversational tone with authentic expression.',
    emotionalMetrics: {
      intensity: 60,
      positivity: sentiment === 'positive' ? 80 : sentiment === 'negative' ? 30 : 50,
      authenticity: 75,
      complexity: 65,
      clarity: 80,
      energy: 70
    }
  };
}


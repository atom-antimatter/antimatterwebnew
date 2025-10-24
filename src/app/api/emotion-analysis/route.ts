import { NextRequest, NextResponse } from 'next/server';

const HUME_API_KEY = process.env.HUME_API_KEY;
const HUME_API_URL = 'https://api.hume.ai/v0/batch/jobs';

export async function POST(request: NextRequest) {
  try {
    console.log('Emotion analysis API called');
    console.log('Hume API key exists:', !!HUME_API_KEY);
    
    if (!HUME_API_KEY) {
      console.error('Hume API key not configured - returning mock data');
      // Return mock data for testing when API key is not available
      return NextResponse.json({
        facial: [
          { name: 'joy', score: 0.8 },
          { name: 'surprise', score: 0.6 },
          { name: 'interest', score: 0.5 },
          { name: 'amusement', score: 0.4 },
          { name: 'contentment', score: 0.3 }
        ]
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const text = formData.get('text') as string;

    if (!file && !text) {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 });
    }

    let responseData;

    if (file) {
      // Handle file upload (image or audio)
      console.log('Processing file:', file.name, file.type, file.size);
      const fileBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(fileBuffer).toString('base64');
      
      const payload = {
        models: {
          face: {
            prob_outputs: true,
            facs: {
              enabled: false
            }
          }
        },
        data: base64Data
      };

      console.log('Sending request to Hume API...');
      const response = await fetch(HUME_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUME_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Hume API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Hume API error response:', errorText);
        throw new Error(`Hume API error: ${response.status} - ${errorText}`);
      }

      responseData = await response.json();
      console.log('Hume API response data:', responseData);
    } else if (text) {
      // Handle text analysis
      const payload = {
        models: {
          language: {
            granularity: "sentence"
          }
        },
        data: text
      };

      const response = await fetch(HUME_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUME_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Hume API error: ${response.statusText}`);
      }

      responseData = await response.json();
    }

    // Process the response and extract emotion scores
    const processedData = processHumeResponse(responseData);
    
    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Emotion analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze emotions' }, 
      { status: 500 }
    );
  }
}

function processHumeResponse(response: any) {
  const result: any = {};

  if (response.predictions) {
    response.predictions.forEach((prediction: any) => {
      // Process facial expressions
      if (prediction.models?.face?.grouped_predictions) {
        const facePredictions = prediction.models.face.grouped_predictions[0];
        if (facePredictions?.predictions) {
          result.facial = facePredictions.predictions.map((p: any) => ({
            name: p.name,
            score: p.score
          }));
        }
      }

      // Process speech prosody
      if (prediction.models?.prosody?.grouped_predictions) {
        const prosodyPredictions = prediction.models.prosody.grouped_predictions[0];
        if (prosodyPredictions?.predictions) {
          result.prosody = prosodyPredictions.predictions.map((p: any) => ({
            name: p.name,
            score: p.score
          }));
        }
      }

      // Process vocal bursts
      if (prediction.models?.burst?.grouped_predictions) {
        const burstPredictions = prediction.models.burst.grouped_predictions[0];
        if (burstPredictions?.predictions) {
          result.burst = burstPredictions.predictions.map((p: any) => ({
            name: p.name,
            score: p.score
          }));
        }
      }

      // Process emotional language
      if (prediction.models?.language?.grouped_predictions) {
        const languagePredictions = prediction.models.language.grouped_predictions[0];
        if (languagePredictions?.predictions) {
          result.language = languagePredictions.predictions.map((p: any) => ({
            name: p.name,
            score: p.score
          }));
        }
      }
    });
  }

  return result;
}

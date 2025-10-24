import { NextRequest, NextResponse } from 'next/server';

const HUME_API_KEY = process.env.HUME_API_KEY;
const HUME_API_URL = 'https://api.hume.ai/v0/batch/jobs';

export async function POST(request: NextRequest) {
  try {
    if (!HUME_API_KEY) {
      return NextResponse.json({ error: 'Hume API key not configured' }, { status: 500 });
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
      const fileBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(fileBuffer).toString('base64');
      
      const payload = {
        models: {
          face: {
            prob_outputs: true,
            facs: {
              enabled: false
            }
          },
          prosody: {
            granularity: "utterance"
          },
          burst: {
            granularity: "utterance"
          }
        },
        transcription: {
          language: "en"
        },
        data: base64Data
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

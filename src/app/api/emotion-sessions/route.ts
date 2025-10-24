import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, startTime, endTime, analysisType, sessionData, summaryData } = body;

    if (!sessionId || !startTime || !sessionData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const duration = endTime ? Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000) : null;

    const { data, error } = await supabase
      .from('emotion_analysis_sessions')
      .insert({
        session_id: sessionId,
        start_time: startTime,
        end_time: endTime,
        duration_seconds: duration,
        analysis_type: analysisType,
        total_analyses: sessionData.length,
        session_data: sessionData,
        summary_data: summaryData,
        user_agent: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save session data' }, { status: 500 });
    }

    return NextResponse.json({ success: true, sessionId: data.id });
  } catch (error) {
    console.error('Session save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('emotion_analysis_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

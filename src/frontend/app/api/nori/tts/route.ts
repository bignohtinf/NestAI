import { NextRequest, NextResponse } from 'next/server';

const FPTAI_API_KEY = process.env.FPTAI_API_KEY || 'YcfMbjaOXUnefZtQ1mH7XQNq0HSdaDyl';
const FPT_TTS_URL = 'https://api.fpt.ai/hmi/tts/v5';

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'banmai', speed = '' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    // Strip markdown/emoji for cleaner speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/[•✅❌🌸🌿🍚🩸🥬⚠️💊🤰🏥📊📋😊🍋🫚🍘⏰💧👨‍⚕️🎙️]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Step 1: Call FPT.AI TTS to get audio URL
    const ttsRes = await fetch(FPT_TTS_URL, {
      method: 'POST',
      headers: {
        'api-key': FPTAI_API_KEY,
        'speed': speed,
        'voice': voice,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: Buffer.from(cleanText, 'utf-8'),
    });

    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      console.error('[TTS] FPT.AI error:', ttsRes.status, err);
      return NextResponse.json({ error: 'TTS request failed', detail: err }, { status: ttsRes.status });
    }

    const ttsJson = await ttsRes.json();
    console.log('[TTS] FPT.AI response:', ttsJson);

    if (ttsJson.error !== 0) {
      console.error('[TTS] FPT.AI error in response:', ttsJson);
      return NextResponse.json({ error: ttsJson.message || 'TTS failed' }, { status: 500 });
    }

    const audioUrl = ttsJson.async;
    if (!audioUrl) {
      return NextResponse.json({ error: 'No audio URL in response' }, { status: 500 });
    }

    // Step 2: Fetch the generated MP3 from FPT.AI storage
    // Retry a few times since generation might take a moment
    let audioRes: Response | null = null;
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 600));
      audioRes = await fetch(audioUrl);
      if (audioRes.ok) break;
    }

    if (!audioRes || !audioRes.ok) {
      console.error('[TTS] Failed to fetch audio from FPT.AI storage');
      return NextResponse.json({ error: 'Failed to fetch generated audio' }, { status: 502 });
    }

    const audioBuffer = await audioRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[TTS] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

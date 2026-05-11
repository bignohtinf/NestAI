import { NextRequest, NextResponse } from 'next/server';

const FPTAI_API_KEY = process.env.FPTAI_API_KEY || 'YcfMbjaOXUnefZtQ1mH7XQNq0HSdaDyl';
const FPT_ASR_URL = 'https://api.fpt.ai/hmi/asr/general';

export async function POST(req: NextRequest) {
  try {
    const audioBuffer = await req.arrayBuffer();

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'No audio data received' }, { status: 400 });
    }

    const asrRes = await fetch(FPT_ASR_URL, {
      method: 'POST',
      headers: {
        'api-key': FPTAI_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: audioBuffer,
    });

    if (!asrRes.ok) {
      const err = await asrRes.text();
      console.error('[STT] FPT.AI error:', asrRes.status, err);
      return NextResponse.json({ error: 'ASR request failed', detail: err }, { status: asrRes.status });
    }

    const asrJson = await asrRes.json();
    console.log('[STT] FPT.AI response:', asrJson);

    // FPT.AI ASR returns: { hypotheses: [{ utterance: "text" }], status: "0" }
    const transcript =
      asrJson?.hypotheses?.[0]?.utterance ||
      asrJson?.transcript ||
      '';

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript in response', raw: asrJson }, { status: 422 });
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('[STT] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

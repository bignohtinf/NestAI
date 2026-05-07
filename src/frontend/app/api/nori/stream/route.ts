import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const payloadStr = searchParams.get('payload');

    if (!payloadStr) {
      console.error('[Nori Stream] Missing payload in query params');
      return new Response('Missing payload', { status: 400 });
    }

    let payload;
    try {
      payload = JSON.parse(payloadStr);
    } catch (e) {
      console.error('[Nori Stream] Invalid payload JSON:', e);
      return new Response('Invalid payload JSON', { status: 400 });
    }

    console.info('[Nori Stream] Forwarding request to backend:', `${BACKEND_URL}/api/bot-pregnant/stream`);

    const response = await fetch(`${BACKEND_URL}/api/bot-pregnant/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Nori Stream] Backend returned error:', response.status, errorText);
      try {
        const errorDetail = JSON.parse(errorText);
        console.error('[Nori Stream] Error detail:', JSON.stringify(errorDetail, null, 2));
      } catch (e) {
        // Not JSON
      }
      return new Response(errorText, { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }


    // Proxy the stream and transform events for EventSource compatibility
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          console.error('[Nori Stream] No response body from backend');
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine) continue;

              if (trimmedLine.startsWith('data: ')) {
                try {
                  const dataStr = trimmedLine.slice(6);
                  const data = JSON.parse(dataStr);
                  
                  // Use the 'type' field from the backend JSON to set the SSE event name
                  // This allows frontend's addEventListener('token') or addEventListener('done') to work
                  const eventType = data.type || 'message';
                  
                  controller.enqueue(`event: ${eventType}\ndata: ${dataStr}\n\n`);
                } catch (e) {
                  // If not JSON, just pass through as a regular message
                  controller.enqueue(`${trimmedLine}\n\n`);
                }
              } else {
                // Pass through other potential SSE lines (event:, id:, etc.)
                controller.enqueue(`${trimmedLine}\n`);
              }
            }
          }
        } catch (error) {
          console.error('[Nori Stream] Error during stream processing:', error);
          controller.error(error);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[Nori Stream] Critical error in proxy route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

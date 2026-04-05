import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;
  const rememberMe = body?.rememberMe;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Missing email or password' },
      { status: 400 }
    );
  }

  const fastApiBaseUrl = process.env.FASTAPI_BASE_URL;
  if (!fastApiBaseUrl) {
    return NextResponse.json(
      { error: 'Missing FASTAPI_BASE_URL' },
      { status: 500 }
    );
  }

  const loginPath = process.env.FASTAPI_AUTH_LOGIN_PATH || '/auth/login';
  const base = fastApiBaseUrl.endsWith('/') ? fastApiBaseUrl : `${fastApiBaseUrl}/`;
  const url = new URL(loginPath.replace(/^\//, ''), base);

  try {
    const upstreamRes = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, rememberMe }),
    });

    const data = await upstreamRes.json().catch(() => null);
    if (!upstreamRes.ok) {
      return NextResponse.json(
        data ?? { error: 'Authentication failed' },
        { status: upstreamRes.status }
      );
    }

    // Contract flexibility: FastAPI can return `{ user: {...} }` or the user object directly.
    const user = data?.user ?? data;
    return NextResponse.json(user);
  } catch (error) {
    console.error('FastAPI auth proxy error:', error);
    return NextResponse.json(
      { error: 'Auth service unavailable' },
      { status: 502 }
    );
  }
}


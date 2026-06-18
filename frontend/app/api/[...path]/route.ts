import { NextRequest, NextResponse } from 'next/server';

// Public URL of the Express backend. Resolved at request time on the Node
// runtime, so there is no build-time env coupling. Override via env if needed.
const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ?? 'https://flowboard-api-w4b4.onrender.com';

const HOP_BY_HOP = new Set(['content-encoding', 'content-length', 'transfer-encoding']);

/**
 * Catch-all reverse proxy: forwards every `/api/*` request to the backend and
 * pipes the response back, preserving Set-Cookie. Keeping API traffic
 * same-origin means the httpOnly auth cookie stays first-party, so
 * `sameSite=lax` remains valid and the browser never treats it as a blocked
 * third-party cookie. Runs on the Node runtime — no edge bundling involved.
 */
async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await ctx.params;
  const target = `${BACKEND_URL}/api/${path.join('/')}${req.nextUrl.search}`;

  const forwardHeaders = new Headers(req.headers);
  // Let fetch derive these for the upstream request.
  forwardHeaders.delete('host');
  forwardHeaders.delete('content-length');
  forwardHeaders.delete('accept-encoding');

  const init: RequestInit = { method: req.method, headers: forwardHeaders, redirect: 'manual' };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text();
  }

  const upstream = await fetch(target, init);

  const res = new NextResponse(await upstream.arrayBuffer(), { status: upstream.status });
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie' || HOP_BY_HOP.has(key.toLowerCase())) return;
    res.headers.set(key, value);
  });
  // getSetCookie preserves multiple Set-Cookie headers individually.
  for (const cookie of upstream.headers.getSetCookie()) {
    res.headers.append('set-cookie', cookie);
  }
  return res;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

// Never cache proxied API responses.
export const dynamic = 'force-dynamic';

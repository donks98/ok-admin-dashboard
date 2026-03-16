import { NextRequest, NextResponse } from 'next/server';
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3000';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const res = await fetch(`${BACKEND}/api/v1/platform/stats`, { headers: { authorization: auth } });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: 'Backend unreachable' }, { status: 502 });
  }
}

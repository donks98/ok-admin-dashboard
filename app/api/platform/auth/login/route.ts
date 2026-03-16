import { NextRequest, NextResponse } from 'next/server';
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND}/api/v1/platform/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Backend unreachable' }, { status: 502 });
  }
}

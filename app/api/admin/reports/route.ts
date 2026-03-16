import { NextRequest, NextResponse } from 'next/server';
const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3000';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const type = req.nextUrl.searchParams.get('type') ?? 'users';
    const qs   = req.nextUrl.searchParams.toString();
    const res  = await fetch(`${BACKEND}/api/v1/admin/reports/${type}${qs ? `?${qs}` : ''}`, {
      headers: { authorization: auth },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ([]));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: 'Backend unreachable' }, { status: 502 });
  }
}

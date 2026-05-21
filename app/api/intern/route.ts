import { NextRequest, NextResponse } from 'next/server';
import { getInternByUid } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });
  try {
    const intern = await getInternByUid(uid);
    if (!intern) return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
    return NextResponse.json(intern);
  } catch (err) {
    console.error('GET /api/intern:', err);
    return NextResponse.json({ error: 'Failed to fetch intern data' }, { status: 500 });
  }
}

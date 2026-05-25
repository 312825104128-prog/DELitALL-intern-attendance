import { NextRequest, NextResponse } from 'next/server';
import { checkDuplicate } from '@/lib/firestore';

export async function GET(req: NextRequest) {
  const internId = req.nextUrl.searchParams.get('internId');
  const date = req.nextUrl.searchParams.get('date');
  if (!internId || !date) {
    return NextResponse.json({ error: 'internId and date required' }, { status: 400 });
  }
  try {
    const submitted = await checkDuplicate(internId, date);
    return NextResponse.json({ submitted });
  } catch (err) {
    console.error('GET /api/check-submission:', err);
    return NextResponse.json({ submitted: false });
  }
}

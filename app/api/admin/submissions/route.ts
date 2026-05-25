import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionsByIntern, getAllSubmissions } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const internId = req.nextUrl.searchParams.get('internId');
  try {
    const data = internId
      ? await getSubmissionsByIntern(internId)
      : await getAllSubmissions();
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/admin/submissions:', err);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

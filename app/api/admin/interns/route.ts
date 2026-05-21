import { NextRequest, NextResponse } from 'next/server';
import { getAllInterns, saveIntern, deleteIntern } from '@/lib/sheets';
import type { Intern } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const interns = await getAllInterns();
    return NextResponse.json(interns);
  } catch (err) {
    console.error('GET /api/admin/interns:', err);
    return NextResponse.json({ error: 'Failed to fetch interns' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const intern = (await req.json()) as Intern;
    if (!intern.uid || !intern.email || !intern.name) {
      return NextResponse.json({ error: 'uid, email, and name required' }, { status: 400 });
    }
    await saveIntern(intern);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/admin/interns:', err);
    return NextResponse.json({ error: 'Failed to save intern' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });
  try {
    await deleteIntern(uid);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/interns:', err);
    return NextResponse.json({ error: 'Failed to delete intern' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getAllInterns, getAllSubmissions } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [interns, subs] = await Promise.all([getAllInterns(), getAllSubmissions()]);
    const today = new Date().toISOString().split('T')[0];
    const nonAdmin = interns.filter(i => !i.isAdmin);
    const todaySubs = subs.filter(s => s.date === today);
    const todayIds = new Set(todaySubs.map(s => s.internId));
    const missing = nonAdmin.filter(i => !todayIds.has(i.id)).length;

    const domainBreakdown: Record<string, number> = {};
    for (const i of nonAdmin) {
      domainBreakdown[i.domain] = (domainBreakdown[i.domain] ?? 0) + 1;
    }

    const recent = [...subs]
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 10);

    return NextResponse.json({
      totalInterns: nonAdmin.length,
      submissionsToday: todaySubs.length,
      missingToday: missing,
      totalSubmissions: subs.length,
      domainBreakdown,
      recentActivity: recent,
      interns: nonAdmin,
      today,
    });
  } catch (err) {
    console.error('GET /api/admin/stats:', err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}

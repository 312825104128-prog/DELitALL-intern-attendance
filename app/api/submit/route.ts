import { NextRequest, NextResponse } from 'next/server';
import { appendSubmission, checkDuplicate, getAllInterns, getSubmissionsByIntern } from '@/lib/firestore';
import type { Submission } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.internId || !body.date) {
      return NextResponse.json({ error: 'internId and date are required' }, { status: 400 });
    }

    const dup = await checkDuplicate(body.internId, body.date);
    if (dup) {
      return NextResponse.json(
        { error: 'You have already submitted for today.' },
        { status: 409 }
      );
    }

    let progressPct = '0%';
    try {
      const interns = await getAllInterns();
      const intern = interns.find(i => i.id === body.internId);
      if (intern?.startDate && intern?.endDate) {
        const past = await getSubmissionsByIntern(intern.id);
        const total = Math.max(1, Math.round(
          (new Date(intern.endDate).getTime() - new Date(intern.startDate).getTime()) / 86400000
        ));
        const done = past.length + 1;
        progressPct = `${Math.min(100, Math.round((done / total) * 100))}%`;
      }
    } catch {
      // progress calc is non-critical
    }

    const submission: Submission = {
      id: `SUB-${Date.now()}`,
      internId: body.internId,
      internName: body.internName ?? '',
      email: body.email ?? '',
      domain: body.domain ?? 'Other',
      date: body.date,
      assignedTask: body.assignedTask ?? '',
      workStatus: body.workStatus ?? 'In Progress',
      hoursContributed: body.hoursContributed ?? '1-2 Hours',
      learningDetails: body.learningDetails ?? '',
      workCompleted: body.workCompleted ?? '',
      challengesFaced: body.challengesFaced ?? '',
      supportRequired: body.supportRequired ?? '',
      uploadedFileUrl: body.uploadedFileUrl ?? '',
      uploadedFileName: body.uploadedFileName ?? '',
      submittedAt: new Date().toISOString(),
    };

    await appendSubmission(submission, progressPct);
    return NextResponse.json({ success: true, id: submission.id });
  } catch (err) {
    console.error('POST /api/submit:', err);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}

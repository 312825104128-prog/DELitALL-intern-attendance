/**
 * lib/firestore.ts
 * Production Firestore data layer — replaces lib/sheets.ts entirely.
 * Uses Firebase Admin SDK (server-side only). Zero local filesystem usage.
 */

import { admin } from './firebase-admin';
import type { Intern, Submission } from '@/types';

function db() {
  return admin.firestore();
}

// ─────────────────────────────────────────────
//  INTERNS
//  Collection: interns/{uid}
// ─────────────────────────────────────────────

export async function getAllInterns(): Promise<Intern[]> {
  const snap = await db().collection('interns').get();
  return snap.docs.map((doc) => doc.data() as Intern);
}

export async function getInternByUid(uid: string): Promise<Intern | null> {
  const doc = await db().collection('interns').doc(uid).get();
  if (!doc.exists) return null;
  return doc.data() as Intern;
}

export async function saveIntern(intern: Intern): Promise<void> {
  // Use Firebase UID as the document ID for O(1) lookups
  await db()
    .collection('interns')
    .doc(intern.uid)
    .set(intern, { merge: true });
}

export async function deleteIntern(uid: string): Promise<void> {
  await db().collection('interns').doc(uid).delete();
}

// ─────────────────────────────────────────────
//  SUBMISSIONS
//  Collection: submissions/{submissionId}
// ─────────────────────────────────────────────

export async function getAllSubmissions(): Promise<Submission[]> {
  const snap = await db()
    .collection('submissions')
    .orderBy('submittedAt', 'desc')
    .get();
  return snap.docs.map((doc) => doc.data() as Submission);
}

export async function getSubmissionsByIntern(internId: string): Promise<Submission[]> {
  const snap = await db()
    .collection('submissions')
    .where('internId', '==', internId)
    .get();
  const submissions = snap.docs.map((doc) => doc.data() as Submission);
  // Sort in memory to avoid requiring a Firestore composite index on internId + submittedAt
  return submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export async function checkDuplicate(internId: string, date: string): Promise<boolean> {
  const snap = await db()
    .collection('submissions')
    .where('internId', '==', internId)
    .where('date', '==', date)
    .limit(1)
    .get();
  return !snap.empty;
}

export async function appendSubmission(
  submission: Submission,
  progressPct: string
): Promise<void> {
  // Store submission with progress percentage in Firestore
  await db()
    .collection('submissions')
    .doc(submission.id)
    .set({
      ...submission,
      progressPct,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}

import fs from 'fs/promises';
import path from 'path';
import type { Intern, Submission } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

const SUBMISSION_HEADERS = [
  'Date',
  'Submission Time',
  'Intern Name',
  'Intern ID',
  'Email',
  'Domain',
  'Assigned Task',
  'Work Status',
  'Hours',
  'Learning Details',
  'Work Completed',
  'Challenges',
  'Support Required',
  'File URL',
  'Submission ID',
  'Progress %',
];

const INTERN_HEADERS = [
  'Intern ID',
  'Name',
  'Email',
  'Firebase UID',
  'Domain',
  'Role',
  'Start Date',
  'End Date',
  'Is Admin',
];

// Helper to escape CSV strings
function escapeCsv(val: string | number | boolean | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Write headers to a new CSV if it doesn't exist
async function ensureCsvHeaders(filePath: string, headers: string[]) {
  try {
    await fs.access(filePath);
  } catch {
    // File doesn't exist, create it with headers
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, headers.map(escapeCsv).join(',') + '\n');
  }
}

// Append a row to CSV
async function appendToCsv(filePath: string, row: (string | number | boolean | null | undefined)[]) {
  await fs.appendFile(filePath, row.map(escapeCsv).join(',') + '\n');
}

// Read JSON safely
async function readJson<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

// Write JSON safely
async function writeJson<T>(filePath: string, data: T): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// ── INTERNS ──

export async function getAllInterns(): Promise<Intern[]> {
  const filePath = path.join(DATA_DIR, 'interns.json');
  return readJson<Intern[]>(filePath, []);
}

export async function getInternByUid(uid: string): Promise<Intern | null> {
  const interns = await getAllInterns();
  return interns.find(i => i.uid === uid) ?? null;
}

export async function saveIntern(intern: Intern): Promise<void> {
  const jsonPath = path.join(DATA_DIR, 'interns.json');
  const csvPath = path.join(DATA_DIR, 'interns.csv');
  
  await ensureCsvHeaders(csvPath, INTERN_HEADERS);

  const interns = await getAllInterns();
  const idx = interns.findIndex(i => i.uid === intern.uid);
  
  if (idx >= 0) {
    interns[idx] = intern;
  } else {
    interns.push(intern);
  }
  
  await writeJson(jsonPath, interns);

  // Re-write the entire CSV to maintain sync (since updates can happen)
  let csvContent = INTERN_HEADERS.map(escapeCsv).join(',') + '\n';
  interns.forEach(i => {
    const row = [
      i.id, i.name, i.email, i.uid,
      i.domain, i.role, i.startDate, i.endDate,
      i.isAdmin ? 'TRUE' : 'FALSE'
    ];
    csvContent += row.map(escapeCsv).join(',') + '\n';
  });
  await fs.writeFile(csvPath, csvContent);
}

export async function deleteIntern(uid: string): Promise<void> {
  const jsonPath = path.join(DATA_DIR, 'interns.json');
  const csvPath = path.join(DATA_DIR, 'interns.csv');
  
  const interns = await getAllInterns();
  const filtered = interns.filter(i => i.uid !== uid);
  
  if (interns.length === filtered.length) return; // No change

  await writeJson(jsonPath, filtered);

  let csvContent = INTERN_HEADERS.map(escapeCsv).join(',') + '\n';
  filtered.forEach(i => {
    const row = [
      i.id, i.name, i.email, i.uid,
      i.domain, i.role, i.startDate, i.endDate,
      i.isAdmin ? 'TRUE' : 'FALSE'
    ];
    csvContent += row.map(escapeCsv).join(',') + '\n';
  });
  await fs.writeFile(csvPath, csvContent);
}

// ── SUBMISSIONS ──

export async function getAllSubmissions(): Promise<Submission[]> {
  const filePath = path.join(DATA_DIR, 'submissions.json');
  return readJson<Submission[]>(filePath, []);
}

export async function getSubmissionsByIntern(internId: string): Promise<Submission[]> {
  const all = await getAllSubmissions();
  return all.filter(s => s.internId === internId);
}

export async function checkDuplicate(internId: string, date: string): Promise<boolean> {
  const subs = await getAllSubmissions();
  return subs.some(s => s.internId === internId && s.date === date);
}

export async function appendSubmission(submission: Submission, progressPct: string): Promise<void> {
  // 1. Write to Main Sheet (Overview)
  const mainJsonPath = path.join(DATA_DIR, 'submissions.json');
  const mainCsvPath = path.join(DATA_DIR, 'submissions.csv');
  
  await ensureCsvHeaders(mainCsvPath, SUBMISSION_HEADERS);
  const allSubmissions = await readJson<Submission[]>(mainJsonPath, []);
  allSubmissions.push(submission);
  await writeJson(mainJsonPath, allSubmissions);
  
  const row = [
    submission.date,
    submission.submittedAt,
    submission.internName,
    submission.internId,
    submission.email,
    submission.domain,
    submission.assignedTask,
    submission.workStatus,
    submission.hoursContributed,
    submission.learningDetails,
    submission.workCompleted,
    submission.challengesFaced ?? '',
    submission.supportRequired ?? '',
    submission.uploadedFileUrl ?? '',
    submission.id,
    progressPct,
  ];
  await appendToCsv(mainCsvPath, row);

  // 2. Write to Domain & Intern specific folder
  // Directory structure: data/domains/[Domain]/[InternName_InternID]/
  const safeDomain = (submission.domain || 'Other').replace(/[^a-zA-Z0-9 -]/g, '').trim();
  const safeName = (submission.internName || 'Unknown').replace(/[^a-zA-Z0-9 -]/g, '').trim();
  const safeId = (submission.internId || 'NoID').replace(/[^a-zA-Z0-9 -]/g, '').trim();
  
  const folderName = `${safeName}_${safeId}`;
  const internSpecificDir = path.join(DATA_DIR, 'domains', safeDomain, folderName);
  
  const internJsonPath = path.join(internSpecificDir, 'attendance.json');
  const internCsvPath = path.join(internSpecificDir, 'attendance.csv');

  await ensureCsvHeaders(internCsvPath, SUBMISSION_HEADERS);
  const internSubmissions = await readJson<Submission[]>(internJsonPath, []);
  internSubmissions.push(submission);
  await writeJson(internJsonPath, internSubmissions);
  await appendToCsv(internCsvPath, row);
}

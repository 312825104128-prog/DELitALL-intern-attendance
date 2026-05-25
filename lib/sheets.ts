/**
 * lib/sheets.ts
 * Legacy CSV/JSON sheets data layer delegate.
 * Fully refactored to delegate directly to lib/firestore.ts.
 * 100% serverless/Vercel compliant. No local filesystem usage.
 */

export {
  getAllInterns,
  getInternByUid,
  saveIntern,
  deleteIntern,
  getAllSubmissions,
  getSubmissionsByIntern,
  checkDuplicate,
  appendSubmission,
} from './firestore';

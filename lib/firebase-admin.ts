import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK safely
if (!admin.apps.length) {
  const serviceAccountEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'delitall-attendence';

  if (privateKey) {
    // Robust parsing for literal and escaped newlines in both Local and Vercel environments
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/\n/g, '\n');
  }

  if (!serviceAccountEmail || !privateKey || !projectId) {
    console.warn('Firebase Admin SDK missing required credentials in environment variables.');
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail: serviceAccountEmail,
          privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
      });
    } catch (err) {
      console.error('Firebase Admin SDK failed to initialize:', err);
    }
  }
}

export { admin };

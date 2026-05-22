import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK safely
if (!admin.apps.length) {
  const serviceAccountEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!serviceAccountEmail || !privateKey || !projectId) {
    console.warn('Firebase Admin SDK missing required credentials in environment variables.');
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail: serviceAccountEmail,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    });
  }
}

export { admin };

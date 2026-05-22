import { admin } from './firebase-admin';

export async function uploadFileToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string = 'application/octet-stream'
): Promise<string> {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK not initialized. Please check your environment variables.');
  }

  const bucket = admin.storage().bucket();
  
  // Clean filename to avoid issues
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const finalPath = `uploads/${Date.now()}-${safeName}`;
  const file = bucket.file(finalPath);
  
  // Upload to Firebase Storage
  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
    },
    resumable: false, // Better for serverless/Vercel functions
  });

  try {
    // Attempt to make public and use the standard public URL
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${finalPath}`;
  } catch (err) {
    // If bucket prevents public access, generate a long-lived signed URL
    console.warn('Could not make file public, falling back to signed URL.', err);
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '01-01-2100', // Far future expiration
    });
    return signedUrl;
  }
}

import fs from 'fs/promises';
import path from 'path';

export async function uploadFileToDrive(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Ensure the uploads directory exists
  await fs.mkdir(uploadsDir, { recursive: true });

  // To avoid file name collisions, we prepend a timestamp
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const finalName = `${Date.now()}-${safeName}`;
  const filePath = path.join(uploadsDir, finalName);
  
  // Write the file locally
  await fs.writeFile(filePath, buffer);

  // Return the relative URL to access it from the browser
  return `/uploads/${finalName}`;
}

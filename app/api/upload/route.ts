import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToDrive } from '@/lib/drive';

const ALLOWED = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png', 'image/jpeg',
  'application/zip', 'application/x-zip-compressed',
];
const MAX_MB = 10;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return NextResponse.json({ error: `Max ${MAX_MB}MB` }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const fileUrl = await uploadFileToDrive(buf, file.name);
    return NextResponse.json({ success: true, fileUrl, fileName: file.name });
  } catch (err) {
    console.error('POST /api/upload:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

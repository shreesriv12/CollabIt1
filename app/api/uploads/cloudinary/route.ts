import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary upload endpoint for client-side file uploads
export async function POST(request: NextRequest) {
  try {
    const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const API_KEY = process.env.CLOUDINARY_API_KEY;
    const API_SECRET = process.env.CLOUDINARY_API_SECRET;

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.error('Cloudinary config missing');
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
    }

    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
    });

    const form = await request.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name || `upload_${Date.now()}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    // upload to cloudinary (resource_type:auto handles images and pdfs)
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataUri,
        {
          folder: 'collabit/uploads',
          resource_type: 'auto',
          public_id: `${filename.replace(/\.[^/.]+$/, '')}_${Date.now()}`,
          overwrite: false,
        },
        (err: any, res: any) => {
          if (err) return reject(err);
          resolve(res);
        }
      );
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url || result.url,
      resource_type: result.resource_type,
      raw: result,
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    return NextResponse.json({ error: 'Upload failed', details: (err as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

import { NextRequest, NextResponse } from 'next/server';
import { 
  uploadToR2, 
  generateR2Key, 
  R2_FOLDERS, 
  validateFileType, 
  validateFileSize,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB
} from '@/lib/r2';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// Configure route segment to handle larger payloads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes timeout for large uploads

// Configure body parser for larger files
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Disable Next.js body parsing to handle large files manually
export const bodyParser = false;

export async function POST(request: NextRequest) {
  try {
    // Check content length before processing
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      console.log(`Upload request size: ${sizeInMB.toFixed(2)}MB`);
      
      // Check if request is too large (100MB limit)
      if (sizeInMB > 100) {
        return NextResponse.json(
          { error: `Request too large: ${sizeInMB.toFixed(2)}MB. Maximum allowed: 100MB` },
          { status: 413 }
        );
      }
    }

    // Verify admin authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Parse form data with error handling
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('FormData parsing error:', error);
      return NextResponse.json(
        { error: 'Failed to parse form data. File may be too large or corrupted.' },
        { status: 413 }
      );
    }
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string; // 'poster', 'gallery', 'video', 'hero', 'highlights', 'ticket-template'
    const eventId = formData.get('eventId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!uploadType || !['poster', 'gallery', 'video', 'hero', 'highlights', 'ticket-template'].includes(uploadType)) {
      return NextResponse.json(
        { error: 'Invalid upload type. Must be poster, gallery, video, hero, highlights, or ticket-template' },
        { status: 400 }
      );
    }

    // Generate eventId if not provided (for new events) or use hero for hero media
    const finalEventId = uploadType === 'hero' ? 'hero' : (eventId || `temp_${Date.now()}`);

    // Validate file type and size based on upload type
    let allowedTypes: string[];
    let maxSizeMB: number;
    let folder: string;

    switch (uploadType) {
      case 'poster':
      case 'ticket-template':
        allowedTypes = ALLOWED_IMAGE_TYPES;
        maxSizeMB = MAX_IMAGE_SIZE_MB;
        folder = R2_FOLDERS.POSTERS;
        break;
      case 'gallery':
        allowedTypes = ALLOWED_IMAGE_TYPES;
        maxSizeMB = MAX_IMAGE_SIZE_MB;
        folder = R2_FOLDERS.GALLERY;
        break;
      case 'video':
        allowedTypes = ALLOWED_VIDEO_TYPES;
        maxSizeMB = MAX_VIDEO_SIZE_MB;
        folder = R2_FOLDERS.VIDEOS;
        break;
      case 'hero':
        allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
        maxSizeMB = MAX_VIDEO_SIZE_MB; // Allow larger files for hero media
        folder = 'hero-media';
        break;
      case 'highlights':
        allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
        maxSizeMB = MAX_VIDEO_SIZE_MB; // Allow larger files for highlights
        folder = R2_FOLDERS.GALLERY; // Use gallery folder for highlights
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid upload type' },
          { status: 400 }
        );
    }

    // Validate file type
    if (!validateFileType(file.name, allowedTypes)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size, maxSizeMB)) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer efficiently
    let buffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      console.log(`File converted to buffer: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB`);
    } catch (error) {
      console.error('Error converting file to buffer:', error);
      return NextResponse.json(
        { error: 'Failed to process file. File may be corrupted or too large.' },
        { status: 413 }
      );
    }

    // Generate R2 key
    const key = generateR2Key(folder, finalEventId, file.name);
    console.log(`Generated R2 key: ${key}`);

    // Upload to R2 with error handling
    let url: string;
    try {
      url = await uploadToR2(buffer, key, file.type);
      console.log(`File uploaded successfully to R2: ${url}`);
    } catch (error) {
      console.error('R2 upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file to storage. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url,
      key,
      size: file.size,
      type: file.type,
      filename: file.name
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('too large') || error.message.includes('413')) {
        return NextResponse.json(
          { error: 'File too large. Please reduce file size and try again.' },
          { status: 413 }
        );
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Upload timeout. Please try again with a smaller file.' },
          { status: 408 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

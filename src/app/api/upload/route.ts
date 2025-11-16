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

export async function POST(request: NextRequest) {
  try {
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('type') as string; // 'poster', 'gallery', 'video', 'hero'
    const eventId = formData.get('eventId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!uploadType || !['poster', 'gallery', 'video', 'hero', 'highlights'].includes(uploadType)) {
      return NextResponse.json(
        { error: 'Invalid upload type. Must be poster, gallery, video, hero, or highlights' },
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

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate R2 key with proper folder structure
    const r2Key = generateR2Key(folder, finalEventId, file.name);

    // Upload to R2
    const publicUrl = await uploadToR2(buffer, r2Key, file.type);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key: r2Key,
      filename: file.name,
      size: file.size,
      type: uploadType,
      eventId: finalEventId
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
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

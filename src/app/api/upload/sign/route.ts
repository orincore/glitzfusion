import { NextRequest, NextResponse } from 'next/server';
import { 
  R2_FOLDERS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
  validateFileType,
  getSignedR2UploadUrl,
} from '@/lib/r2';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SignUploadBody {
  fileName: string;
  fileType: string;
  uploadType: 'poster' | 'gallery' | 'video' | 'hero' | 'highlights' | 'ticket-template';
  eventId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = (await request.json()) as Partial<SignUploadBody>;
    const { fileName, fileType, uploadType, eventId } = body;

    if (!fileName || !fileType || !uploadType) {
      return NextResponse.json({ error: 'fileName, fileType and uploadType are required' }, { status: 400 });
    }

    if (!['poster', 'gallery', 'video', 'hero', 'highlights', 'ticket-template'].includes(uploadType)) {
      return NextResponse.json({ error: 'Invalid uploadType' }, { status: 400 });
    }

    const finalEventId = uploadType === 'hero' ? 'hero' : (eventId || `temp_${Date.now()}`);

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
      case 'highlights':
        allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
        maxSizeMB = MAX_VIDEO_SIZE_MB;
        folder = R2_FOLDERS.GALLERY;
        break;
      default:
        return NextResponse.json({ error: 'Invalid uploadType' }, { status: 400 });
    }

    if (!validateFileType(fileName, allowedTypes)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const { uploadUrl, key, publicUrl } = await getSignedR2UploadUrl(
      folder,
      finalEventId,
      fileName,
      fileType,
    );

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl,
      maxSizeMB,
    });
  } catch (error) {
    console.error('Error creating signed upload URL:', error);
    return NextResponse.json({ error: 'Failed to create signed upload URL' }, { status: 500 });
  }
}

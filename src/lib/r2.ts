import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

// Folder structure for event assets
export const R2_FOLDERS = {
  EVENTS: 'events',
  POSTERS: 'events/posters',
  GALLERY: 'events/gallery',
  VIDEOS: 'events/videos',
  HERO_MEDIA: 'hero-media',
} as const;

// Generate unique filename with proper folder structure
export function generateR2Key(folder: string, eventId: string, originalFilename: string): string {
  const timestamp = Date.now();
  const extension = originalFilename.split('.').pop();
  const sanitizedName = originalFilename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
  
  return `${folder}/${eventId}/${timestamp}_${sanitizedName}`;
}

// Upload file to R2
export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      // Make files publicly readable
      ACL: 'public-read',
    });

    await r2Client.send(command);
    
    // Return public URL
    return `${R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file to R2');
  }
}

// Delete single file from R2
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error('Failed to delete file from R2');
  }
}

// Delete all files for an event (cleanup when event is deleted)
export async function deleteEventAssetsFromR2(eventId: string): Promise<void> {
  try {
    // List all objects with the event prefix
    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
    
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: `${R2_FOLDERS.EVENTS}/${eventId}/`,
    });

    const listResponse = await r2Client.send(listCommand);
    
    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      return; // No files to delete
    }

    // Delete all files for this event
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: listResponse.Contents.map(obj => ({ Key: obj.Key! })),
      },
    });

    await r2Client.send(deleteCommand);
    console.log(`Deleted ${listResponse.Contents.length} files for event ${eventId}`);
  } catch (error) {
    console.error('Error deleting event assets from R2:', error);
    throw new Error('Failed to delete event assets from R2');
  }
}

// Extract R2 key from full URL
export function extractR2KeyFromUrl(url: string): string | null {
  try {
    if (!url.startsWith(R2_PUBLIC_URL)) {
      return null;
    }
    return url.replace(`${R2_PUBLIC_URL}/`, '');
  } catch {
    return null;
  }
}

// Validate file type for uploads
export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

// Validate file size (in bytes)
export function validateFileSize(fileSize: number, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}

export const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
export const ALLOWED_VIDEO_TYPES = ['mp4', 'webm', 'mov'];
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 100;

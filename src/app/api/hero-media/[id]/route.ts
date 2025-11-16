import { NextRequest, NextResponse } from 'next/server';
import { HeroMedia } from '@/models/HeroMedia';
import dbConnect from '@/lib/mongodb';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { deleteFromR2, extractR2KeyFromUrl } from '@/lib/r2';

// Verify admin token
async function verifyAdminToken(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    
    const user = verifyToken(token);
    if (!user || user.role !== 'admin') return null;
    
    return user;
  } catch (error) {
    return null;
  }
}

// GET - Fetch single hero media
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const heroMedia = await HeroMedia.findById(params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!heroMedia) {
      return NextResponse.json({ error: 'Hero media not found' }, { status: 404 });
    }

    return NextResponse.json(heroMedia);

  } catch (error) {
    console.error('Error fetching hero media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero media' },
      { status: 500 }
    );
  }
}

// PUT - Update hero media
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const mediaData = await request.json();
    
    // Update admin info
    mediaData.lastModifiedBy = admin.userId;

    const heroMedia = await HeroMedia.findByIdAndUpdate(
      params.id,
      mediaData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('lastModifiedBy', 'name email');

    if (!heroMedia) {
      return NextResponse.json({ error: 'Hero media not found' }, { status: 404 });
    }

    return NextResponse.json(heroMedia);

  } catch (error) {
    console.error('Error updating hero media:', error);
    return NextResponse.json(
      { error: 'Failed to update hero media' },
      { status: 500 }
    );
  }
}

// DELETE - Delete hero media
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // First, get the hero media to access its assets
    const heroMedia = await HeroMedia.findById(params.id);

    if (!heroMedia) {
      return NextResponse.json({ error: 'Hero media not found' }, { status: 404 });
    }

    // Delete the media file from R2
    try {
      const r2Key = extractR2KeyFromUrl(heroMedia.mediaUrl);
      if (r2Key) {
        await deleteFromR2(r2Key);
        console.log(`Cleaned up R2 asset: ${r2Key}`);
      }
    } catch (r2Error) {
      console.error('Error cleaning up R2 asset:', r2Error);
      // Continue with deletion even if R2 cleanup fails
    }

    // Delete the hero media from MongoDB
    await HeroMedia.findByIdAndDelete(params.id);

    return NextResponse.json({ 
      message: 'Hero media and associated assets deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting hero media:', error);
    return NextResponse.json(
      { error: 'Failed to delete hero media' },
      { status: 500 }
    );
  }
}

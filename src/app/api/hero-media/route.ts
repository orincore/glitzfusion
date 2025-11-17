import { NextRequest, NextResponse } from 'next/server';
import { HeroMedia } from '@/models/HeroMedia';
import dbConnect from '@/lib/mongodb';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import User from '@/models/User';

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

// GET - Fetch all hero media
export async function GET(request: NextRequest) {
  try {
    // Ensure User model is registered before populate() calls
    void User;

    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const heroMedia = await HeroMedia.find({})
      .sort({ position: 1, createdAt: -1 })
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    return NextResponse.json(heroMedia);

  } catch (error) {
    console.error('Error fetching hero media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero media' },
      { status: 500 }
    );
  }
}

// POST - Create new hero media
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const mediaData = await request.json();

    // Add admin info
    mediaData.createdBy = admin.userId;
    mediaData.lastModifiedBy = admin.userId;

    // If no position specified, put it at the end
    if (!mediaData.position) {
      const lastMedia = await HeroMedia.findOne({}).sort({ position: -1 });
      mediaData.position = lastMedia ? lastMedia.position + 1 : 0;
    }

    const heroMedia = new HeroMedia(mediaData);
    await heroMedia.save();

    const populatedMedia = await HeroMedia.findById(heroMedia._id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    return NextResponse.json(populatedMedia, { status: 201 });

  } catch (error) {
    console.error('Error creating hero media:', error);
    return NextResponse.json(
      { error: 'Failed to create hero media' },
      { status: 500 }
    );
  }
}

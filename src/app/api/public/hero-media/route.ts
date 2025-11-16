import { NextRequest, NextResponse } from 'next/server';
import { HeroMedia } from '@/models/HeroMedia';
import dbConnect from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Fetch only active hero media, sorted by position
    const heroMedia = await HeroMedia.find({ isActive: true })
      .sort({ position: 1, createdAt: -1 })
      .select('title description mediaUrl mediaType position')
      .lean();

    // Transform data for FusionX frontend format
    const transformedMedia = heroMedia.map((media: any) => ({
      id: media._id.toString(),
      title: media.title,
      description: media.description || '',
      mediaUrl: media.mediaUrl,
      mediaType: media.mediaType,
      position: media.position
    }));

    return NextResponse.json(transformedMedia);

  } catch (error) {
    console.error('Error fetching public hero media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero media' },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

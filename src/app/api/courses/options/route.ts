import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Fetch only active courses with minimal data for dropdown
    const courses = await Course.find(
      { isActive: true },
      { title: 1, duration: 1, level: 1, investment: 1, nextStart: 1 }
    ).sort({ title: 1 })
    
    // Format for dropdown usage
    const courseOptions = courses.map(course => ({
      id: (course._id as any).toString(),
      title: course.title,
      duration: course.duration,
      level: course.level,
      investment: course.investment,
      nextStart: course.nextStart,
      displayText: `${course.title} - ${course.duration}`
    }))
    
    return NextResponse.json(courseOptions)
  } catch (error) {
    console.error('Get course options error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course options' },
      { status: 500 }
    )
  }
}

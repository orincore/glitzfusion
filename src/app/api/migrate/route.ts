import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import { courses } from '@/data/courses'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    // Check if courses already exist
    const existingCourses = await Course.countDocuments()
    if (existingCourses > 0) {
      return NextResponse.json(
        { message: 'Courses already migrated', count: existingCourses },
        { status: 200 }
      )
    }

    // Convert courses data to database format
    const coursesToInsert = courses.map(course => {
      // Map icon component to string name
      let iconName = 'Users'
      if (course.icon.name) {
        iconName = course.icon.name
      } else {
        // Fallback: try to determine icon from course content
        const title = course.title.toLowerCase()
        if (title.includes('acting')) iconName = 'Users'
        else if (title.includes('dance')) iconName = 'Star'
        else if (title.includes('photo')) iconName = 'Camera'
        else if (title.includes('film')) iconName = 'Film'
        else if (title.includes('model')) iconName = 'Palette'
      }

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        description: course.description,
        icon: iconName,
        duration: course.duration,
        level: course.level,
        format: course.format,
        investment: course.investment,
        nextStart: course.nextStart,
        color: course.color,
        highlights: course.highlights,
        curriculum: course.curriculum,
        outcomes: course.outcomes,
        isActive: true
      }
    })

    // Insert courses
    const insertedCourses = await Course.insertMany(coursesToInsert)

    return NextResponse.json({
      message: 'Courses migrated successfully',
      count: insertedCourses.length,
      courses: insertedCourses
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

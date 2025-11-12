import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    // Check if any admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      )
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@glitzfusion.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    const hashedPassword = await hashPassword(adminPassword)

    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin'
    })

    await adminUser.save()

    return NextResponse.json({
      message: 'Admin user created successfully',
      email: adminEmail
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

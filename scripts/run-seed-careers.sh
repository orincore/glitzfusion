#!/bin/bash

# GLITZFUSION Career Seeding Script Runner
# This script runs the career seeding with proper environment variables

echo "🚀 Starting GLITZFUSION Career Seeding..."
echo "📍 Location: Badlapur, Maharashtra, India"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your MongoDB connection string."
    exit 1
fi

# Run the seeding script with environment variables
node -r dotenv/config scripts/seed-careers.js dotenv_config_path=.env.local

# Check if the script was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Career seeding completed successfully!"
    echo "✅ 10 job positions have been added to the database"
    echo ""
    echo "📋 Positions Added:"
    echo "   • Professional Photographer"
    echo "   • Acting Instructor" 
    echo "   • Music Instructor & Composer"
    echo "   • Modeling Instructor & Image Consultant"
    echo "   • Content Strategist & Digital Marketing Specialist"
    echo "   • YouTube Content Creator & Video Producer"
    echo "   • Voice Over Artist & Audio Production Specialist"
    echo "   • Film Maker & Cinematography Instructor"
    echo "   • Script Writer & Creative Writing Instructor"
    echo "   • Choreography Instructor & Dance Director"
    echo ""
    echo "🌐 Visit http://localhost:3000/careers to see the jobs!"
    echo "👨‍💼 Visit http://localhost:3000/admin/careers to manage them!"
else
    echo ""
    echo "❌ Career seeding failed!"
    echo "Please check the error messages above."
    exit 1
fi

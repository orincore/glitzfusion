# Glitz Fusion - Creative Arts Academy with Admin Panel

A modern, dynamic website for Glitz Fusion creative arts academy with a comprehensive admin panel for content management.

## Features

### Frontend
- **Modern Design**: Beautiful, responsive design with animations and glass morphism effects
- **Course Management**: Dynamic course listings with detailed information
- **Media Gallery**: Optimized image and video galleries
- **Contact Forms**: Interactive contact and inquiry forms
- **SEO Optimized**: Built with Next.js for optimal performance

### Admin Panel
- **Content Management**: Edit all website content through an intuitive admin interface
- **Course Management**: Add, edit, and manage course offerings
- **Media Library**: Upload and organize images/videos with Cloudflare R2 storage
- **User Management**: Admin user accounts with role-based access
- **Real-time Updates**: Changes reflect immediately on the frontend

### Technical Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Storage**: Cloudflare R2 for media files (10GB free tier)
- **Authentication**: JWT-based admin authentication
- **Animations**: Framer Motion, GSAP
- **UI Components**: Custom components with Lucide React icons

## Quick Setup

### 1. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/glitzfusion
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/glitzfusion

# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=glitzfusion-media
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-account-id.r2.cloudflarestorage.com

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@glitzfusion.com
ADMIN_PASSWORD=your-admin-password

# JWT Secret
JWT_SECRET=your-jwt-secret-key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize the System

1. Start the development server:
```bash
npm run dev
```

2. Visit the setup page:
```
http://localhost:3000/setup
```

3. Click "Start Setup" to:
   - Create the admin user
   - Migrate existing course data to MongoDB

4. Access the admin panel:
```
http://localhost:3000/admin/login
```

Default credentials:
- Email: `admin@glitzfusion.com` (or your ADMIN_EMAIL)
- Password: `admin123` (or your ADMIN_PASSWORD)

## Cloudflare R2 Setup

1. **Create R2 Bucket**:
   - Go to Cloudflare Dashboard → R2 Object Storage
   - Create a new bucket (e.g., `glitzfusion-media`)
   - Note your Account ID

2. **Generate API Tokens**:
   - Go to "Manage R2 API Tokens"
   - Create token with "Object Read & Write" permissions
   - Copy Access Key ID and Secret Access Key

3. **Configure Public Access** (optional):
   - Set up custom domain or use R2.dev subdomain
   - Update CLOUDFLARE_R2_PUBLIC_URL in your environment

## MongoDB Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB locally
brew install mongodb/brew/mongodb-community
brew services start mongodb-community

# Use local connection string
MONGODB_URI=mongodb://localhost:27017/glitzfusion
```

### Option 2: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Get connection string and add to MONGODB_URI

## Admin Panel Features

### Dashboard
- Overview statistics
- Quick action buttons
- Recent activity feed

### Course Management
- Add/edit/delete courses
- Manage curriculum and outcomes
- Set pricing and schedules
- Preview courses on frontend

### Media Library
- Upload images and videos
- Automatic image optimization
- Tag and organize media
- Direct integration with Cloudflare R2

### Content Management
- Edit hero section content
- Manage testimonials
- Update contact information
- Modify gallery items

## Development

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── admin/          # Admin panel pages
│   ├── api/            # API routes
│   └── courses/        # Course pages
├── components/         # React components
│   ├── layout/         # Layout components
│   ├── sections/       # Page sections
│   └── ui/            # UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── models/            # MongoDB schemas
└── types/             # TypeScript types
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
# Visit /setup page to initialize database
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/setup` - Create initial admin user

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course (auth required)
- `GET /api/courses/[id]` - Get course by ID
- `PUT /api/courses/[id]` - Update course (auth required)
- `DELETE /api/courses/[id]` - Delete course (auth required)

### Media
- `GET /api/media` - Get media files with pagination
- `POST /api/media/upload` - Upload media file (auth required)

### Content
- `GET /api/content` - Get content items
- `POST /api/content` - Create content item (auth required)

### System
- `POST /api/migrate` - Migrate static data to database

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure Node.js 18+ support
- Add all environment variables
- Run `npm run build` and `npm run start`

## Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS protection
- Rate limiting (recommended for production)
- Secure file upload with type validation

## Performance Optimizations

- Image optimization with Sharp
- Automatic WebP conversion
- Database connection pooling
- Lazy loading for media
- CDN integration with Cloudflare R2

## Support

For issues or questions:
1. Check the setup page at `/setup` for system status
2. Verify all environment variables are set correctly
3. Check browser console and server logs for errors
4. Ensure MongoDB and Cloudflare R2 are properly configured

## License

Private project for Glitz Fusion Creative Arts Academy.

# Glitz Fusion - Premier Media Academy

A cinematic, luxurious Next.js website for Glitz Fusion, the premier media academy offering Acting, Dancing, Photography, Filmmaking, and Modeling courses.

## ✨ Features

- **Cinematic Design**: Premium black and gold aesthetic with glass morphism effects
- **Responsive Layout**: Fully responsive across all breakpoints with explicit spacing rules
- **Dark/Light Mode**: Polished theme toggle with localStorage persistence
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support
- **Performance Optimized**: Lazy loading, optimized images, and SSR ready
- **Multi-Page Architecture**: Separate routed pages for independent development

## 🎨 Design System

### Color Palette
- **Primary**: Deep black (#0a0a0a) and rich metallic gold (#d4af37)
- **Glass Effects**: Matte glass overlays with soft amber gradients
- **Light Mode**: Deep charcoal and off-white with warm gold accents

### Typography Scale
- **Display Font**: Playfair Display (headings)
- **Body Font**: Inter (body text)
- **Modular Scale**: 1rem base, 1.25rem H3, 1.5rem H2, 2.5rem+ H1

### Spacing System
- **Container**: Max-width 1200px with responsive gutters
- **Mobile**: 16px gutters, 16px card padding
- **Tablet**: 24px gutters, 20px card padding  
- **Desktop**: 48px gutters, 28-32px card padding

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Courses (individual course pages)
- About (detailed academy information)
- Gallery (full portfolio showcase)
- Admissions (application process)
- Blog (news and updates)
- Contact (detailed contact page)

## 🎨 Component Library

### Core Components
- **GlassPanel**: Reusable glass morphism container
- **Hero**: Cinematic hero section with animations
- **CourseCard**: Interactive course display cards
- **TestimonialCard**: Testimonial display with ratings
- **ContactForm**: Validated contact form
- **Navbar**: Responsive navigation with theme toggle
- **Footer**: Comprehensive site footer

### Animation Variants
- **fadeInUp**: Smooth entrance animation
- **staggerContainer**: Sequential child animations
- **scaleIn**: Scale-based entrance effect
- **slideIn**: Directional slide animations

## 🔧 Configuration

### Tailwind CSS
Custom design tokens configured in `tailwind.config.js`:
- Color palette with semantic naming
- Typography scale with line heights
- Spacing tokens for consistent layouts
- Animation keyframes for cinematic effects
- Glass morphism utilities

### Theme System
- Dark mode (primary): Near-black backgrounds with gold accents
- Light mode: Charcoal/off-white with warm gold highlights
- System preference detection with manual override
- Persistent user preference storage

## 📱 Responsive Breakpoints

- **Mobile**: ≤640px (single column, touch-optimized)
- **Tablet**: 641-1024px (flexible grid layouts)
- **Desktop**: ≥1025px (full multi-column layouts)

## ♿ Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Focus Management**: Visible focus indicators with proper contrast
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Reduced Motion**: Respects user motion preferences
- **Touch Targets**: Minimum 44x44px touch targets

## 🚀 Performance Optimizations

- **Image Optimization**: Next.js Image component with WebP/AVIF support
- **Lazy Loading**: Intersection Observer based lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Font Optimization**: Google Fonts with display swap
- **Bundle Analysis**: Optimized imports and tree shaking

## 🎬 Animation System

### Framer Motion Integration
- **Page Transitions**: Smooth route transitions
- **Scroll Animations**: Intersection-based triggers
- **Micro-interactions**: Hover and tap feedback
- **Parallax Effects**: Scroll-based transformations

### Performance Considerations
- **CSS Transforms**: Hardware accelerated animations
- **Reduced Motion**: Graceful degradation for accessibility
- **Animation Timing**: Optimized easing curves
- **Memory Management**: Proper cleanup and disposal

## 🛠 Development

### Code Style
- **TypeScript**: Full type safety throughout
- **ESLint**: Configured for Next.js and accessibility
- **Prettier**: Consistent code formatting
- **Component Patterns**: Reusable, composable architecture

### Testing Strategy
- **Unit Tests**: Component logic and utilities
- **Integration Tests**: User interaction flows
- **Accessibility Tests**: Automated a11y validation
- **Performance Tests**: Core Web Vitals monitoring

## 📦 Dependencies

### Core Framework
- **Next.js 14**: React framework with App Router
- **React 18**: Latest React with concurrent features
- **TypeScript**: Type safety and developer experience

### Styling & Animation
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Production-ready motion library
- **GSAP**: Advanced animation capabilities
- **Lucide React**: Beautiful icon library

### Utilities
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging

## 🚀 Deployment

### Build Process
```bash
npm run build
npm start
```

### Environment Variables
Create `.env.local` for environment-specific configuration:
```env
NEXT_PUBLIC_SITE_URL=https://glitzfusion.com
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Hosting Recommendations
- **Vercel**: Optimized for Next.js with automatic deployments
- **Netlify**: JAMstack hosting with form handling
- **AWS Amplify**: Full-stack deployment with backend integration

## 📄 License

This project is proprietary software for Glitz Fusion Academy.

## 🤝 Contributing

This is a private project for Glitz Fusion Academy. For internal development guidelines, please refer to the team documentation.

---

**Built with ❤️ for creative excellence at Glitz Fusion Academy**

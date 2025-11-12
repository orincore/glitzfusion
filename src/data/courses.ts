import type { LucideIcon } from 'lucide-react'
import { Camera, Film, Palette, Star, Users } from 'lucide-react'

export type CurriculumModule = {
  title: string
  description: string
  points: string[]
}

export interface CourseInfo {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  icon: LucideIcon
  duration: string
  level: string
  format: string
  investment: string
  nextStart: string
  color: string
  highlights: string[]
  curriculum: CurriculumModule[]
  outcomes: string[]
}

export const courses: CourseInfo[] = [
  {
    id: 'acting',
    slug: 'acting',
    title: 'Acting',
    summary:
      'Master the craft of performance with method acting, improvisation, and character development techniques.',
    description:
      'Step into the spotlight with a program that blends classical theatre tradition and contemporary screen acting. From voice and diction to emotional recall, you will be guided by working actors and directors who help you build believable characters and compelling performances across stage, film, and digital platforms.',
    icon: Users,
    duration: '6 Months',
    level: 'Beginner to Advanced',
    format: 'Hybrid · 5 days a week · Studio + Live Online',
    investment: '₹48,000 (EMI options available)',
    nextStart: '6 January 2026',
    color: 'from-amber-500 to-orange-600',
    highlights: [
      'Method acting foundations',
      'On-camera techniques',
      'Script and scene study',
      'Voice, diction & body work',
    ],
    curriculum: [
      {
        title: 'Core Performance Technique',
        description: 'Discover the vocabulary of acting and learn to trust your instincts on stage and on screen.',
        points: ['Stanislavski & Meisner exercises', 'Voice projection and breath work', 'Movement for actors'],
      },
      {
        title: 'Screen Acting Studio',
        description:
          'Translate performance craft to the camera with blocking, continuity, and multi-camera awareness.',
        points: ['Acting for single and multi-cam setups', 'Improvisation for commercials & OTT', 'Audition prep'],
      },
      {
        title: 'Character & Industry Lab',
        description:
          'Develop a professional portfolio and personal brand with guidance from casting directors and mentors.',
        points: ['Character creation workshops', 'Showreel production', 'Career strategy & networking'],
      },
    ],
    outcomes: [
      'Professional showreel & audition package',
      'Confidence to perform across stage, film, and digital media',
      'Industry showcases with casting partners',
    ],
  },
  {
    id: 'dance',
    slug: 'dance',
    title: 'Dance',
    summary: 'Express yourself through movement with contemporary, classical, and commercial dance styles.',
    description:
      'Build versatility and body intelligence with our performance-driven dance intensive. Daily studio sessions cover classical foundations, global commercial choreography, and contemporary storytelling. Learn to command the stage with precision, grace, and stamina.',
    icon: Star,
    duration: '4 Months',
    level: 'All Levels',
    format: 'In-Studio · 6 days a week',
    investment: '₹38,000 (Installments available)',
    nextStart: '20 January 2026',
    color: 'from-purple-500 to-pink-600',
    highlights: [
      'Classical & contemporary technique',
      'Commercial choreography labs',
      'Strength & conditioning for dancers',
      'Stagecraft and musicality',
    ],
    curriculum: [
      {
        title: 'Technique Immersion',
        description: 'Solidify the foundations of ballet, jazz, and contemporary movement vocabulary.',
        points: ['Alignment & flexibility training', 'Floor work & leaps', 'Partnering & lifts'],
      },
      {
        title: 'Performance Studio',
        description: 'Craft show-ready choreography with master instructors from India’s top crews and companies.',
        points: ['Commercial dance projects', 'Bollywood and hip-hop fusion', 'Stagecraft & costume styling'],
      },
      {
        title: 'Creative Lab',
        description: 'Develop your own voice as a dancer, choreographer, or instructor.',
        points: ['Choreography composition', 'Lighting & stage design basics', 'Teaching methodologies'],
      },
    ],
    outcomes: [
      'Performance reel filmed with multi-camera crew',
      'Showcase opportunities with partner venues',
      'Pathways to choreography and teaching careers',
    ],
  },
  {
    id: 'photography',
    slug: 'photography',
    title: 'Photography',
    summary: 'Capture stunning visuals with professional techniques in portrait, fashion, and commercial photography.',
    description:
      'Transform your visual storytelling through a concentrated experience that covers lighting, composition, and retouching. Learn to direct talent, shoot on location, and deliver publication-ready images that resonate with editors and brands alike.',
    icon: Camera,
    duration: '3 Months',
    level: 'Beginner to Pro',
    format: 'Hybrid · Weekend Intensives',
    investment: '₹32,500 (Gear bundles available)',
    nextStart: '10 February 2026',
    color: 'from-blue-500 to-cyan-600',
    highlights: [
      'Studio & location lighting',
      'Fashion and editorial direction',
      'Post-processing workflow',
      'Portfolio building sessions',
    ],
    curriculum: [
      {
        title: 'Camera & Light Mastery',
        description: 'Gain total confidence with professional cameras, lenses, and modifiers.',
        points: ['Manual exposure & colour theory', 'Speedlight & strobe lighting', 'Natural light storytelling'],
      },
      {
        title: 'Editorial Production',
        description:
          'Plan, shoot, and deliver multi-look stories for fashion, portrait, and commercial briefs.',
        points: ['Working with models & stylists', 'Mood-board development', 'On-set production workflows'],
      },
      {
        title: 'Post & Portfolio Lab',
        description: 'Craft magazine-ready imagery with industry-grade post-production tools.',
        points: ['Capture One & Lightroom pipelines', 'High-end retouching in Photoshop', 'Sequencing a cohesive portfolio'],
      },
    ],
    outcomes: [
      'Client-ready portfolio with three editorial spreads',
      'Professional workflow from pitch to delivery',
      'Brand and agency review sessions',
    ],
  },
  {
    id: 'filmmaking',
    slug: 'filmmaking',
    title: 'Filmmaking',
    summary: 'Create compelling stories through cinematography, directing, and post-production mastery.',
    description:
      'From concept to final cut, this immersive program walks you through the collaborative process of filmmaking. Build a director’s toolkit, operate cinema cameras, and edit with narrative precision under the guidance of industry mentors.',
    icon: Film,
    duration: '8 Months',
    level: 'Intermediate to Advanced',
    format: 'Full-Time · Studio + On-Location',
    investment: '₹68,000 (Scholarships available)',
    nextStart: '3 March 2026',
    color: 'from-green-500 to-emerald-600',
    highlights: [
      'Directing & visual storytelling',
      'Cinematography & colour pipelines',
      'Production design & scheduling',
      'Advanced post-production',
    ],
    curriculum: [
      {
        title: 'Story & Development',
        description: 'Learn to develop cinematic concepts with strong narrative and emotional arcs.',
        points: ['Screenwriting labs', 'Pitch decks & lookbooks', 'Storyboarding & shot listing'],
      },
      {
        title: 'Production Intensive',
        description: 'Hands-on experience across directing, cinematography, sound, and art direction.',
        points: ['Cinema camera operations', 'Lighting for drama & documentary', 'Production management'],
      },
      {
        title: 'Post Production Suite',
        description: 'Finish films with professional edit, sound design, and colour grading workflows.',
        points: ['Editing in DaVinci Resolve', 'Sound design & Foley', 'Colour grading and delivery'],
      },
    ],
    outcomes: [
      'Short film produced with full crew support',
      'Festival submission strategy and mentoring',
      'Access to Glitz Fusion gear library post graduation',
    ],
  },
  {
    id: 'modeling',
    slug: 'modeling',
    title: 'Modeling',
    summary:
      'Develop confidence and technique for runway, fashion, and commercial modeling careers.',
    description:
      'Polish your presence on the runway and in front of the camera. From posing and runway choreography to grooming and brand collaboration, you will graduate with a book that speaks to agencies and fashion houses alike.',
    icon: Palette,
    duration: '2 Months',
    level: 'All Levels',
    format: 'In-Studio · 4 days a week',
    investment: '₹28,000 (Flexible payment plans)',
    nextStart: '24 February 2026',
    color: 'from-rose-500 to-red-600',
    highlights: [
      'Runway & ramp choreography',
      'Editorial posing mastery',
      'Grooming & personal branding',
      'Industry networking bootcamps',
    ],
    curriculum: [
      {
        title: 'Presence & Technique',
        description: 'Own the runway with stage awareness, poise, and signature walk styling.',
        points: ['Posture & balance training', 'Signature walk development', 'Expression & emoting'],
      },
      {
        title: 'Camera & Editorial Lab',
        description: 'Learn to collaborate with photographers, stylists, and creative directors.',
        points: ['Posing for fashion & beauty', 'Movement for video & commercials', 'Brand collaboration etiquette'],
      },
      {
        title: 'Career Studio',
        description:
          'Build your portfolio with editorial shoots, comp cards, and one-on-one agency reviews.',
        points: ['Wardrobe styling & grooming', 'Portfolio and comp card design', 'Agency auditions & contracts'],
      },
    ],
    outcomes: [
      'Professional portfolio with agency feedback',
      'Confidence on runway, in studio, and on set',
      'Direct introductions to partner agencies',
    ],
  },
]

export const courseMap = new Map<string, CourseInfo>(courses.map((course) => [course.slug, course]))

export const courseSlugs = courses.map((course) => course.slug)

export function getCourseBySlug(slug: string) {
  return courseMap.get(slug)
}

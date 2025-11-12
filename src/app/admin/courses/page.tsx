'use client'

import { useEffect, useState, FormEvent, ChangeEvent, useRef } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Loader2,
  X,
  AlertCircle,
  CheckCircle,
  UploadCloud,
  Image as ImageIcon,
  Video as VideoIcon,
  RefreshCw,
} from 'lucide-react'

interface CurriculumModule {
  title: string
  description: string
  points: string[]
}

interface Course {
  _id: string
  id: string
  slug: string
  title: string
  summary: string
  description: string
  icon: string
  duration: string
  level: string
  format: string
  investment: string
  nextStart: string
  color: string
  highlights: string[]
  curriculum: CurriculumModule[]
  outcomes: string[]
  heroMedia?: {
    mediaId: string
    url: string
    mediaType: 'image' | 'video'
    alt?: string
  }
  videoUrl?: string
  isActive: boolean
}

type CourseFormValues = Omit<Course, '_id' | 'isActive'>

interface CourseFormModalProps {
  initialData?: Course | null
  onClose: () => void
  onSubmit: (values: CourseFormValues, courseId?: string) => void
  isSubmitting: boolean
  errorMessage?: string | null
}

const iconOptions = [
  { value: 'Users', label: 'Users (Acting / People)' },
  { value: 'Star', label: 'Star (Dance / Performance)' },
  { value: 'Camera', label: 'Camera (Photography)' },
  { value: 'Film', label: 'Film (Filmmaking)' },
  { value: 'Palette', label: 'Palette (Modeling / Creative)' },
]

const colorOptions = [
  'from-amber-500 to-orange-600',
  'from-purple-500 to-pink-600',
  'from-blue-500 to-cyan-600',
  'from-green-500 to-emerald-600',
  'from-rose-500 to-red-600',
  'from-slate-500 to-stone-600',
]

const emptyModule = (): CurriculumModule => ({
  title: '',
  description: '',
  points: [''],
})

const getDefaultCourseForm = (): CourseFormValues => ({
  id: '',
  slug: '',
  title: '',
  summary: '',
  description: '',
  icon: iconOptions[0].value,
  duration: '',
  level: '',
  format: '',
  investment: '',
  nextStart: '',
  color: colorOptions[0],
  highlights: [''],
  curriculum: [emptyModule()],
  outcomes: [''],
  heroMedia: undefined,
  videoUrl: '',
})

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const toDateInputValue = (value: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const formatReadableDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const courseToFormValues = (course: Course | null): CourseFormValues => {
  if (!course) {
    return getDefaultCourseForm()
  }

  const curriculum = (course.curriculum || []).map((module) => ({
    title: module.title || '',
    description: module.description || '',
    points: module.points && module.points.length > 0 ? [...module.points] : [''],
  }))

  return {
    id: course.id || '',
    slug: course.slug || '',
    title: course.title || '',
    summary: course.summary || '',
    description: course.description || '',
    icon: course.icon || iconOptions[0].value,
    duration: course.duration || '',
    level: course.level || '',
    format: course.format || '',
    investment: course.investment || '',
    nextStart: course.nextStart || '',
    color: course.color || colorOptions[0],
    highlights: course.highlights && course.highlights.length > 0 ? [...course.highlights] : [''],
    curriculum: curriculum.length > 0 ? curriculum : [emptyModule()],
    outcomes: course.outcomes && course.outcomes.length > 0 ? [...course.outcomes] : [''],
    heroMedia: course.heroMedia || undefined,
    videoUrl: course.videoUrl || '',
  }
}

function CourseFormModal({
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}: CourseFormModalProps) {
  const [formValues, setFormValues] = useState<CourseFormValues>(() => courseToFormValues(initialData || null))
  const [slugManuallyEdited, setSlugManuallyEdited] = useState<boolean>(Boolean(initialData))
  const [localError, setLocalError] = useState<string | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFormValues(courseToFormValues(initialData || null))
    setSlugManuallyEdited(Boolean(initialData))
    setLocalError(null)
  }, [initialData])

  const combinedError = localError || errorMessage || null

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormValues((prev) => {
      const next = { ...prev, title: value }
      if (!slugManuallyEdited) {
        const autoSlug = slugify(value)
        next.slug = autoSlug
        next.id = autoSlug
      }
      return next
    })
  }

  const handleSlugChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = slugify(event.target.value)
    setSlugManuallyEdited(true)
    setFormValues((prev) => ({ ...prev, slug: value }))
  }

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const formattedDate = value ? formatReadableDate(value) : ''
    setFormValues((prev) => ({ ...prev, nextStart: formattedDate }))
  }

  const handleMediaUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingMedia(true)
    setLocalError(null)

    try {
      const token = localStorage.getItem('admin_token')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', `${formValues.title} hero media`)
      formData.append('description', `Hero media for ${formValues.title} course`)
      formData.append('tags', 'course,hero,media')

      const response = await fetch('/api/courses/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setLocalError(data.error || 'Failed to upload media')
        return
      }

      setFormValues((prev) => ({
        ...prev,
        heroMedia: {
          mediaId: data.mediaId,
          url: data.url,
          mediaType: data.mediaType,
          alt: data.alt || ''
        }
      }))
    } catch (error) {
      console.error('Upload error:', error)
      setLocalError('Network error during upload')
    } finally {
      setIsUploadingMedia(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeHeroMedia = () => {
    setFormValues((prev) => ({ ...prev, heroMedia: undefined }))
  }

  const handleInputChange = (
    field: keyof Omit<CourseFormValues, 'highlights' | 'curriculum' | 'outcomes' | 'slug' | 'title' | 'id' | 'nextStart'>
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field: keyof Pick<CourseFormValues, 'icon' | 'color'>) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value
      setFormValues((prev) => ({ ...prev, [field]: value }))
    }

  const handleListChange = (field: 'highlights' | 'outcomes', index: number, value: string) => {
    setFormValues((prev) => {
      const nextList = [...prev[field]]
      nextList[index] = value
      return { ...prev, [field]: nextList }
    })
  }

  const addListItem = (field: 'highlights' | 'outcomes') => {
    setFormValues((prev) => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  const removeListItem = (field: 'highlights' | 'outcomes', index: number) => {
    setFormValues((prev) => {
      if (prev[field].length <= 1) {
        return prev
      }
      const nextList = prev[field].filter((_, idx) => idx !== index)
      return { ...prev, [field]: nextList }
    })
  }

  const handleModuleChange = (
    index: number,
    field: keyof Omit<CurriculumModule, 'points'>,
    value: string
  ) => {
    setFormValues((prev) => {
      const nextModules = prev.curriculum.map((module, idx) =>
        idx === index ? { ...module, [field]: value } : module
      )
      return { ...prev, curriculum: nextModules }
    })
  }

  const handleModulePointChange = (moduleIndex: number, pointIndex: number, value: string) => {
    setFormValues((prev) => {
      const curriculum = prev.curriculum.map((module, idx) => {
        if (idx !== moduleIndex) return module
        const points = module.points.map((point, pIdx) => (pIdx === pointIndex ? value : point))
        return { ...module, points }
      })
      return { ...prev, curriculum }
    })
  }

  const addModulePoint = (moduleIndex: number) => {
    setFormValues((prev) => {
      const curriculum = prev.curriculum.map((module, idx) =>
        idx === moduleIndex ? { ...module, points: [...module.points, ''] } : module
      )
      return { ...prev, curriculum }
    })
  }

  const removeModulePoint = (moduleIndex: number, pointIndex: number) => {
    setFormValues((prev) => {
      const curriculum = prev.curriculum.map((module, idx) => {
        if (idx !== moduleIndex) return module
        if (module.points.length <= 1) return module
        const points = module.points.filter((_, pIdx) => pIdx !== pointIndex)
        return { ...module, points }
      })
      return { ...prev, curriculum }
    })
  }

  const addModule = () => {
    setFormValues((prev) => ({ ...prev, curriculum: [...prev.curriculum, emptyModule()] }))
  }

  const removeModule = (index: number) => {
    setFormValues((prev) => {
      if (prev.curriculum.length <= 1) {
        return prev
      }
      const curriculum = prev.curriculum.filter((_, idx) => idx !== index)
      return { ...prev, curriculum }
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)

    const trimmedId = formValues.id.trim()
    const trimmedTitle = formValues.title.trim()
    const trimmedSummary = formValues.summary.trim()
    const trimmedDescription = formValues.description.trim()
    const trimmedSlug = slugify(formValues.slug)
    const trimmedDuration = formValues.duration.trim()
    const trimmedLevel = formValues.level.trim()
    const trimmedFormat = formValues.format.trim()
    const trimmedInvestment = formValues.investment.trim()
    const trimmedNextStart = formValues.nextStart.trim()

    const sanitizedHighlights = formValues.highlights.map((item) => item.trim()).filter(Boolean)
    const sanitizedOutcomes = formValues.outcomes.map((item) => item.trim()).filter(Boolean)
    const sanitizedCurriculum = formValues.curriculum
      .map((module) => ({
        title: module.title.trim(),
        description: module.description.trim(),
        points: module.points.map((point) => point.trim()).filter(Boolean),
      }))
      .filter((module) => module.title && module.description && module.points.length > 0)

    const missingFields: string[] = []
    if (!trimmedId) missingFields.push('Course ID')
    if (!trimmedSlug) missingFields.push('Slug')
    if (!trimmedTitle) missingFields.push('Title')
    if (!trimmedSummary) missingFields.push('Summary')
    if (!trimmedDescription) missingFields.push('Description')
    if (!trimmedDuration) missingFields.push('Duration')
    if (!trimmedLevel) missingFields.push('Level')
    if (!trimmedFormat) missingFields.push('Format')
    if (!trimmedInvestment) missingFields.push('Investment')
    if (!trimmedNextStart) missingFields.push('Next start date')

    if (sanitizedHighlights.length === 0) {
      missingFields.push('At least one highlight')
    }

    if (sanitizedOutcomes.length === 0) {
      missingFields.push('At least one outcome')
    }

    if (sanitizedCurriculum.length === 0) {
      missingFields.push('At least one curriculum module with bullet points')
    }

    if (missingFields.length > 0) {
      setLocalError(`Please fill out the following fields: ${missingFields.join(', ')}`)
      return
    }

    const sanitizedValues: CourseFormValues = {
      id: trimmedId,
      slug: trimmedSlug,
      title: trimmedTitle,
      summary: trimmedSummary,
      description: trimmedDescription,
      icon: formValues.icon,
      duration: trimmedDuration,
      level: trimmedLevel,
      format: trimmedFormat,
      investment: trimmedInvestment,
      nextStart: trimmedNextStart,
      color: formValues.color,
      highlights: sanitizedHighlights,
      curriculum: sanitizedCurriculum,
      outcomes: sanitizedOutcomes,
      heroMedia: formValues.heroMedia,
      videoUrl: formValues.videoUrl,
    }

    onSubmit(sanitizedValues, initialData?._id)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {initialData ? 'Edit Course' : 'Add New Course'}
            </h3>
            <p className="text-sm text-gray-400">
              Provide detailed information about the course curriculum and structure.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
            aria-label="Close course form"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 gap-6">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Course ID 
                  <span className="text-xs text-gray-500">(auto-generated)</span>
                </label>
                <input
                  type="text"
                  value={formValues.id}
                  readOnly
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                  placeholder="Will be generated from title"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Slug 
                  <span className="text-xs text-gray-500">(auto-generated, editable)</span>
                </label>
                <input
                  type="text"
                  value={formValues.slug}
                  onChange={handleSlugChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="e.g. acting"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Course Title</label>
                  <input
                    type="text"
                    value={formValues.title}
                    onChange={handleTitleChange}
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                    placeholder="Acting"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Tagline / Summary</label>
                  <input
                    type="text"
                    value={formValues.summary}
                    onChange={handleInputChange('summary')}
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                    placeholder="Master the craft of performance..."
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Full Description</label>
                <textarea
                  value={formValues.description}
                  onChange={handleInputChange('description')}
                  rows={5}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="Provide an in-depth overview of the course..."
                />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Duration</label>
                <input
                  type="text"
                  value={formValues.duration}
                  onChange={handleInputChange('duration')}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="6 Months"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Level</label>
                <input
                  type="text"
                  value={formValues.level}
                  onChange={handleInputChange('level')}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="Beginner to Advanced"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Format</label>
                <input
                  type="text"
                  value={formValues.format}
                  onChange={handleInputChange('format')}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="Hybrid · 5 days a week"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Investment</label>
                <input
                  type="text"
                  value={formValues.investment}
                  onChange={handleInputChange('investment')}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="₹48,000 (EMI options available)"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Next Start Date</label>
                <input
                  type="date"
                  value={toDateInputValue(formValues.nextStart)}
                  onChange={handleDateChange}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                />
                {formValues.nextStart && (
                  <p className="mt-1 text-xs text-gray-400">
                    Display: {formValues.nextStart}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Icon</label>
                <select
                  value={formValues.icon}
                  onChange={handleSelectChange('icon')}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                >
                  {iconOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Accent Gradient</label>
                <select
                  value={formValues.color}
                  onChange={handleSelectChange('color')}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                >
                  {colorOptions.map((option) => (
                    <option key={option} value={option} className="bg-gray-900 text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Hero Media</h4>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingMedia}
                  className="inline-flex items-center rounded-md border border-purple-500/40 px-3 py-1 text-xs font-medium text-purple-300 transition hover:bg-purple-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingMedia ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-1 h-3 w-3" />
                      Upload Media
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Upload an image or video that will be displayed as the hero media for this course.
                For best results, use media at least <span className="font-medium text-gray-200">1920 × 1080px</span>.
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />

              {formValues.heroMedia ? (
                <div className="relative rounded-lg border border-gray-700 bg-gray-900 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {formValues.heroMedia.mediaType === 'video' ? (
                        <VideoIcon className="h-5 w-5 text-purple-400" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-purple-400" />
                      )}
                      <span className="text-sm font-medium text-white">
                        {formValues.heroMedia.mediaType === 'video' ? 'Video' : 'Image'} Uploaded
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeHeroMedia}
                      className="rounded-md p-1 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                      aria-label="Remove hero media"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                    {formValues.heroMedia.mediaType === 'video' ? (
                      <video
                        src={formValues.heroMedia.url}
                        className="w-full h-full object-cover"
                        controls
                        muted
                      />
                    ) : (
                      <img
                        src={formValues.heroMedia.url}
                        alt={formValues.heroMedia.alt || 'Course hero media'}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-gray-300">Alt Text</label>
                    <input
                      type="text"
                      value={formValues.heroMedia.alt || ''}
                      onChange={(e) => setFormValues(prev => ({
                        ...prev,
                        heroMedia: prev.heroMedia ? { ...prev.heroMedia, alt: e.target.value } : undefined
                      }))}
                      className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                      placeholder="Describe the media for accessibility"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-700 bg-gray-900/50 p-8 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                  <p className="text-sm text-gray-400 mb-2">No hero media uploaded</p>
                  <p className="text-xs text-gray-500">Click "Upload Media" to add an image or video</p>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Video URL (Alternative)</label>
                <input
                  type="url"
                  value={formValues.videoUrl || ''}
                  onChange={handleInputChange('videoUrl')}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="https://example.com/video.mp4"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Provide a direct video URL as an alternative to uploading hero media. This will be used if no hero media is uploaded.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Highlights</h4>
                <button
                  type="button"
                  onClick={() => addListItem('highlights')}
                  className="inline-flex items-center rounded-md border border-yellow-500/40 px-3 py-1 text-xs font-medium text-yellow-300 transition hover:bg-yellow-500 hover:text-black"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add highlight
                </button>
              </div>
              <p className="text-xs text-gray-400">Key bullet points that will appear on the course cards (max 4 recommended).</p>
              <div className="space-y-2">
                {formValues.highlights.map((highlight, index) => (
                  <div key={`highlight-${index}`} className="flex items-start gap-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(event) => handleListChange('highlights', index, event.target.value)}
                      className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                      placeholder="On-camera techniques"
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem('highlights', index)}
                      className="mt-1 rounded-md p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                      disabled={formValues.highlights.length <= 1}
                      aria-label="Remove highlight"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Curriculum Modules</h4>
                <button
                  type="button"
                  onClick={addModule}
                  className="inline-flex items-center rounded-md border border-blue-500/40 px-3 py-1 text-xs font-medium text-blue-300 transition hover:bg-blue-500 hover:text-black"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add module
                </button>
              </div>
              <p className="text-xs text-gray-400">Break down the course structure into modules with detailed learning outcomes.</p>
              <div className="space-y-4">
                {formValues.curriculum.map((module, moduleIndex) => (
                  <div key={`module-${moduleIndex}`} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">Module {moduleIndex + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeModule(moduleIndex)}
                        className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                        disabled={formValues.curriculum.length <= 1}
                        aria-label="Remove module"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-300">Module Title</label>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(event) => handleModuleChange(moduleIndex, 'title', event.target.value)}
                          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                          placeholder="Core Performance Technique"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-300">Module Description</label>
                        <input
                          type="text"
                          value={module.description}
                          onChange={(event) => handleModuleChange(moduleIndex, 'description', event.target.value)}
                          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                          placeholder="Discover the vocabulary of acting..."
                        />
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-300">Module Bullet Points</span>
                        <button
                          type="button"
                          onClick={() => addModulePoint(moduleIndex)}
                          className="inline-flex items-center rounded-md border border-gray-600 px-2 py-1 text-[11px] font-medium text-gray-200 transition hover:bg-gray-700"
                        >
                          <Plus className="mr-1 h-3 w-3" /> Add point
                        </button>
                      </div>
                      {module.points.map((point, pointIndex) => (
                        <div key={`module-${moduleIndex}-point-${pointIndex}`} className="flex items-start gap-2">
                          <input
                            type="text"
                            value={point}
                            onChange={(event) => handleModulePointChange(moduleIndex, pointIndex, event.target.value)}
                            className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                            placeholder="Stanislavski & Meisner exercises"
                          />
                          <button
                            type="button"
                            onClick={() => removeModulePoint(moduleIndex, pointIndex)}
                            className="mt-1 rounded-md p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                            disabled={module.points.length <= 1}
                            aria-label="Remove curriculum point"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Outcomes</h4>
                <button
                  type="button"
                  onClick={() => addListItem('outcomes')}
                  className="inline-flex items-center rounded-md border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500 hover:text-black"
                >
                  <Plus className="mr-1 h-3 w-3" /> Add outcome
                </button>
              </div>
              <p className="text-xs text-gray-400">What students will achieve by the end of the course.</p>
              <div className="space-y-2">
                {formValues.outcomes.map((outcome, index) => (
                  <div key={`outcome-${index}`} className="flex items-start gap-2">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(event) => handleListChange('outcomes', index, event.target.value)}
                      className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                      placeholder="Professional showreel & audition package"
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem('outcomes', index)}
                      className="mt-1 rounded-md p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
                      disabled={formValues.outcomes.length <= 1}
                      aria-label="Remove outcome"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {combinedError && (
              <div className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-900/30 px-3 py-2 text-xs text-red-100">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>{combinedError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-gray-800 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save course'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (!successMessage) return

    const timeout = setTimeout(() => {
      setSuccessMessage(null)
    }, 4000)

    return () => clearTimeout(timeout)
  }, [successMessage])

  const fetchCourses = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCourse = () => {
    setEditingCourse(null)
    setFormError(null)
    setShowForm(true)
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchCourses(false)
        setSuccessMessage('Course archived successfully.')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormError(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCourse(null)
    setFormError(null)
  }

  const handleFormSubmit = async (values: CourseFormValues, courseId?: string) => {
    try {
      setIsSubmitting(true)
      setFormError(null)

      const token = localStorage.getItem('admin_token')
      const url = courseId ? `/api/courses/${courseId}` : '/api/courses'
      const method = courseId ? 'PUT' : 'POST'

      const payload = {
        ...values,
        highlights: values.highlights.filter((item) => item.trim().length > 0),
        outcomes: values.outcomes.filter((item) => item.trim().length > 0),
        curriculum: values.curriculum.map((module) => ({
          ...module,
          points: module.points.filter((point) => point.trim().length > 0),
        })),
      }


      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error || 'Unable to save course. Please try again.')
        return
      }

      setSuccessMessage(courseId ? 'Course updated successfully.' : 'Course created successfully.')
      handleCloseForm()
      await fetchCourses(false)
    } catch (error) {
      console.error('Error saving course:', error)
      setFormError('Network error. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="mt-2 text-gray-400">Manage your course offerings</p>
        </div>
        <button
          onClick={handleAddCourse}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </button>
      </div>

      {successMessage && (
        <div className="flex items-start justify-between rounded-md border border-green-500/60 bg-green-900/40 px-4 py-3 text-sm text-green-100 shadow">
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-200/80 hover:text-green-100"
            aria-label="Dismiss success message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Courses Table */}
      <div className="bg-gray-800 shadow rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-white">No courses</h3>
              <p className="mt-1 text-sm text-gray-400">Get started by creating a new course.</p>
              <div className="mt-6">
                <button
                  onClick={handleAddCourse}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Course
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Investment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Next Start
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{course.title}</div>
                          <div className="text-sm text-gray-400">{course.summary}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {course.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {course.level}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {course.investment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {course.nextStart}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`/courses/${course.slug}`, '_blank')}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(course)}
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <CourseFormModal
          initialData={editingCourse}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          errorMessage={formError}
        />
      )}
    </div>
  )
}

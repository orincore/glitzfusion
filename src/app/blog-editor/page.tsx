'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Eye, Globe, Loader2 } from 'lucide-react';
import WordPressEditor from '@/components/ui/WordPressEditor';
import { useBlog, BlogPost } from '@/hooks/useBlog';
import { useAuth } from '@/contexts/AuthContext';

export default function BlogEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams?.get('id') || null;
  const { createBlog, updateBlog, getBlogById } = useBlog();
  const { isAuthenticated, isLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<{ mediaId: string; url: string; alt?: string } | undefined>();
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploadingFeaturedImage, setIsUploadingFeaturedImage] = useState(false);
  const featuredImageInputRef = useRef<HTMLInputElement>(null);
  const hasLoadedBlog = useRef(false);

  // Reset loaded flag when blogId changes
  useEffect(() => {
    hasLoadedBlog.current = false;
  }, [blogId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load existing blog if editing
  useEffect(() => {
    if (blogId && isAuthenticated && !hasLoadedBlog.current) {
      hasLoadedBlog.current = true;
      setIsLoadingBlog(true);
      getBlogById(blogId)
        .then((blog: BlogPost | null) => {
          if (blog) {
            setTitle(blog.title || '');
            setContent(blog.content || '');
            setExcerpt(blog.excerpt || '');
            setCategory(blog.category || '');
            setTags(blog.tags || []);
            setStatus(blog.status || 'draft');
            setIsFeatured(blog.isFeatured || false);
            setFeaturedImage(blog.featuredImage);
          }
        })
        .catch((err: any) => {
          setError('Failed to load blog post');
          console.error('Error loading blog:', err);
        })
        .finally(() => {
          setIsLoadingBlog(false);
        });
    }
  }, [blogId, isAuthenticated]);

  // Auto-save functionality
  useEffect(() => {
    if (!title && !content) return;
    if (!isAuthenticated) return;
    if (isLoadingBlog) return; // Don't auto-save while loading

    const autoSaveTimer = setTimeout(() => {
      handleSaveDraft(true);
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [title, content, excerpt, category, tags, isFeatured, isAuthenticated, isLoadingBlog]);

  const handleSaveDraft = async (isAutoSave = false) => {
    if (!isAutoSave) setIsSaving(true);
    setError(null);

    try {
      const blogData = {
        title: title || 'Untitled Draft',
        content,
        excerpt,
        category,
        tags,
        status: 'draft' as const,
        isFeatured,
        featuredImage,
        slug: (title || 'untitled-draft').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        author: {
          name: 'GLITZFUSION Team',
          bio: 'Creative professionals at GLITZFUSION Academy',
          avatar: '',
          social: {
            twitter: '',
            linkedin: '',
            instagram: ''
          }
        },
        seo: {
          metaTitle: title,
          metaDescription: excerpt,
          keywords: tags,
          canonicalUrl: '',
          ogTitle: title,
          ogDescription: excerpt,
          ogImage: featuredImage?.url || '',
          twitterTitle: title,
          twitterDescription: excerpt,
          twitterImage: featuredImage?.url || ''
        }
      };

      let result;
      if (blogId) {
        result = await updateBlog(blogId, blogData);
      } else {
        result = await createBlog(blogData);
        if (result?.id) {
          // Update URL to include the new blog ID
          router.replace(`/blog-editor?id=${result.id}`);
        }
      }

      setLastSaved(new Date());
      
      if (!isAutoSave) {
        // Show success message for manual saves
        console.log('Draft saved successfully');
      }
    } catch (err) {
      setError('Failed to save draft');
      console.error('Error saving draft:', err);
    } finally {
      if (!isAutoSave) setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    // Validate required fields for publishing
    const errors = [];
    if (!title.trim()) errors.push('title');
    if (!content.trim()) errors.push('content');
    if (!excerpt.trim()) errors.push('excerpt');
    if (!category.trim()) errors.push('category');

    if (errors.length > 0) {
      setError(`Please fill in the following required fields before publishing: ${errors.join(', ')}`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const blogData = {
        title,
        content,
        excerpt,
        category,
        tags,
        status: 'published' as const,
        isFeatured,
        featuredImage,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        author: {
          name: 'GLITZFUSION Team',
          bio: 'Creative professionals at GLITZFUSION Academy',
          avatar: '',
          social: {
            twitter: '',
            linkedin: '',
            instagram: ''
          }
        },
        seo: {
          metaTitle: title,
          metaDescription: excerpt,
          keywords: tags,
          canonicalUrl: '',
          ogTitle: title,
          ogDescription: excerpt,
          ogImage: featuredImage?.url || '',
          twitterTitle: title,
          twitterDescription: excerpt,
          twitterImage: featuredImage?.url || ''
        }
      };

      if (blogId) {
        await updateBlog(blogId, blogData);
      } else {
        await createBlog(blogData);
      }

      // Redirect back to blog admin
      router.push('/admin/blog');
    } catch (err) {
      setError('Failed to publish blog post');
      console.error('Error publishing blog:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePreview = () => {
    setIsPreview(prev => !prev);
  };

  const handleBack = () => {
    if (title || content) {
      if (confirm('You have unsaved changes. Do you want to save as draft before leaving?')) {
        handleSaveDraft().then(() => {
          router.push('/admin/blog');
        });
        return;
      }
    }
    router.push('/admin/blog');
  };

  // Track uploaded images for cleanup
  const handleImageUpload = (imageUrl: string, mediaId: string) => {
    setUploadedImages(prev => [...prev, mediaId]);
  };

  const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploadingFeaturedImage(true);

    try {
      const token = localStorage.getItem('admin_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', `Featured image for ${title || 'blog post'}`);
      formData.append('description', 'Featured image for blog post');
      formData.append('tags', 'blog,featured,image');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setFeaturedImage({
        mediaId: data._id,
        url: data.url,
        alt: data.alt || '',
      });

      setUploadedImages(prev => (prev.includes(data._id) ? prev : [...prev, data._id]));
    } catch (uploadError) {
      console.error('Failed to upload featured image:', uploadError);
      alert('Failed to upload featured image. Please try again.');
    } finally {
      setIsUploadingFeaturedImage(false);
      if (featuredImageInputRef.current) {
        featuredImageInputRef.current.value = '';
      }
    }
  };

  // Clean up unused images when content changes
  useEffect(() => {
    if (uploadedImages.length > 0) {
      const usedImages = uploadedImages.filter(mediaId => {
        // Check if image is still in content or featured image
        const isInContent = content.includes(mediaId);
        const isFeaturedImage = featuredImage?.mediaId === mediaId;
        return isInContent || isFeaturedImage;
      });

      const unusedImages = uploadedImages.filter(mediaId => !usedImages.includes(mediaId));
      
      if (unusedImages.length > 0) {
        // Clean up unused images from R2
        unusedImages.forEach(async (mediaId) => {
          try {
            await fetch(`/api/media/${mediaId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
              },
            });
          } catch (error) {
            console.error('Failed to delete unused image:', error);
          }
        });

        setUploadedImages(usedImages);
      }
    }
  }, [content, featuredImage, uploadedImages]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="h-screen bg-primary-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-gold mx-auto mb-4" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (isLoadingBlog) {
    return (
      <div className="h-screen bg-primary-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-gold mx-auto mb-4" />
          <p className="text-gray-300">Loading blog post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-primary-black px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              disabled={isSaving}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gradient-gold">
                {blogId ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h1>
              {lastSaved && (
                <p className="text-sm text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleTogglePreview}
              className="flex items-center px-3 py-1.5 text-sm border border-white/20 rounded text-white hover:bg-white/10 transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              {isPreview ? 'Edit' : 'Preview'}
            </button>
            
            <button
              onClick={() => handleSaveDraft(false)}
              disabled={isSaving}
              className="px-4 py-2 text-sm text-gray-300 border border-white/20 rounded hover:bg-white/10 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2 inline" />
                  Save Draft
                </>
              )}
            </button>
            
            <button
              onClick={handlePublish}
              disabled={isSaving || !title.trim() || !content.trim() || !excerpt.trim() || !category.trim()}
              className="px-4 py-2 text-sm bg-gradient-to-r from-primary-gold to-primary-gold-light text-primary-black font-semibold rounded hover:shadow-gold-glow disabled:opacity-50 transition-all duration-300"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Publishing...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2 inline" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 flex-shrink-0">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-auto">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <WordPressEditor
            value={content}
            onChange={setContent}
            title={title}
            onTitleChange={setTitle}
            placeholder="Start writing your blog post..."
            showHeaderActions={false}
            isPreview={isPreview}
            onTogglePreview={handleTogglePreview}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-white/10 bg-white/5 overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <h3 className="font-semibold text-gradient-gold mb-4">Publish Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-white/20 rounded text-sm bg-white/5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-gold"
                >
                  <option value="draft" className="bg-primary-dark">Draft</option>
                  <option value="published" className="bg-primary-dark">Published</option>
                  <option value="archived" className="bg-primary-dark">Archived</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="mr-2 accent-primary-gold" 
                  />
                  <span className="text-sm text-gray-300">Featured Post</span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <h3 className="font-semibold text-gradient-gold mb-4">Category</h3>
            <input 
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Acting Tips, Photography"
              className="w-full px-3 py-2 border border-white/20 rounded text-sm bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-gold"
            />
          </div>

          <div className="border-t border-white/10 p-4">
            <h3 className="font-semibold text-gradient-gold mb-4">Tags</h3>
            <input 
              type="text" 
              placeholder="Add tags separated by commas"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
              className="w-full px-3 py-2 border border-white/20 rounded text-sm bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-gold"
            />
          </div>

          <div className="border-t border-white/10 p-4">
            <h3 className="font-semibold text-gradient-gold mb-4">Excerpt</h3>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a short excerpt..."
              rows={4}
              className="w-full px-3 py-2 border border-white/20 rounded text-sm resize-none bg-white/5 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-gold"
            />
            <p className="text-xs text-gray-500 mt-1">
              Excerpts are optional hand-crafted summaries of your content.
            </p>
          </div>

          <div className="border-t border-white/10 p-4">
            <h3 className="font-semibold text-gradient-gold mb-4">Featured Image</h3>
            {featuredImage ? (
              <div className="relative mb-4">
                <img
                  src={featuredImage.url}
                  alt={featuredImage.alt || 'Featured image'}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => setFeaturedImage(undefined)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ) : (
              <button
                onClick={() => featuredImageInputRef.current?.click()}
                disabled={isUploadingFeaturedImage}
                className="w-full px-4 py-2 border-2 border-dashed border-white/20 rounded text-sm text-gray-400 hover:border-primary-gold hover:text-primary-gold transition-colors disabled:opacity-50"
              >
                {isUploadingFeaturedImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Set featured image'
                )}
              </button>
            )}
            <input
              ref={featuredImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleFeaturedImageUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

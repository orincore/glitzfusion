'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2, Upload, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import AdvancedBlogEditor from '@/components/ui/AdvancedBlogEditor';
import { BlogPost } from '@/hooks/useBlog';

interface BlogFormModalProps {
  blog: BlogPost | null;
  onClose: () => void;
  onSubmit: (blogData: Partial<BlogPost>) => void;
  isSubmitting: boolean;
  error: string | null;
}

export default function BlogFormModal({ blog, onClose, onSubmit, isSubmitting, error }: BlogFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    isFeatured: false,
    featuredImage: undefined as { mediaId: string; url: string; alt?: string } | undefined,
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
      metaTitle: '',
      metaDescription: '',
      keywords: [] as string[],
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: ''
    }
  });
  
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [showSEO, setShowSEO] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const featuredImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        category: blog.category || '',
        tags: blog.tags || [],
        status: blog.status || 'draft',
        isFeatured: blog.isFeatured || false,
        featuredImage: blog.featuredImage || undefined,
        author: {
          name: blog.author?.name || 'GLITZFUSION Team',
          bio: blog.author?.bio || 'Creative professionals at GLITZFUSION Academy',
          avatar: blog.author?.avatar || '',
          social: {
            twitter: blog.author?.social?.twitter || '',
            linkedin: blog.author?.social?.linkedin || '',
            instagram: blog.author?.social?.instagram || ''
          }
        },
        seo: {
          metaTitle: blog.seo?.metaTitle || '',
          metaDescription: blog.seo?.metaDescription || '',
          keywords: blog.seo?.keywords || [],
          canonicalUrl: blog.seo?.canonicalUrl || '',
          ogTitle: blog.seo?.ogTitle || '',
          ogDescription: blog.seo?.ogDescription || '',
          ogImage: blog.seo?.ogImage || '',
          twitterTitle: blog.seo?.twitterTitle || '',
          twitterDescription: blog.seo?.twitterDescription || '',
          twitterImage: blog.seo?.twitterImage || ''
        }
      });
    }
  }, [blog]);

  const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploadingImage(true);

    try {
      const token = localStorage.getItem('admin_token');
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('alt', `Featured image for ${formData.title || 'blog post'}`);
      uploadFormData.append('description', 'Featured image for blog post');
      uploadFormData.append('tags', 'blog,featured,image');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Set featured image
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          mediaId: data._id,
          url: data.url,
          alt: data.alt || ''
        }
      }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload featured image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (featuredImageInputRef.current) {
        featuredImageInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const blogData = {
      ...formData,
      slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      seo: {
        ...formData.seo,
        metaTitle: formData.seo.metaTitle || formData.title,
        metaDescription: formData.seo.metaDescription || formData.excerpt
      }
    };
    
    onSubmit(blogData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seo.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, keywordInput.trim()]
        }
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(k => k !== keyword)
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="h-full flex flex-col"
      >
        <GlassPanel className="flex-1 overflow-y-auto bg-primary-black px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-gradient-gold">
                {blog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h2>
              <p className="text-gray-400 mt-1">
                {blog ? 'Update your blog post content and settings' : 'Create engaging content for your audience'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="Enter blog post title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="e.g., Acting Tips, Photography"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Excerpt *
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                placeholder="Brief description of the blog post"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content *
              </label>
              <AdvancedBlogEditor
                value={formData.content}
                onChange={(content: string) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Write your blog post content here..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-gold/20 text-primary-gold text-sm rounded-full flex items-center space-x-2"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-primary-gold hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary-gold/20 text-primary-gold rounded-lg hover:bg-primary-gold/30 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Featured Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Featured Image
              </label>
              <div className="space-y-4">
                {formData.featuredImage ? (
                  <div className="relative">
                    <img
                      src={formData.featuredImage.url}
                      alt={formData.featuredImage.alt || 'Featured image'}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: undefined }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No featured image selected</p>
                    <button
                      type="button"
                      onClick={() => featuredImageInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="inline-flex items-center px-4 py-2 bg-primary-gold/20 text-primary-gold rounded-lg hover:bg-primary-gold/30 transition-colors disabled:opacity-50"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Featured Image
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Status and Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                >
                  <option value="draft" className="bg-primary-dark">Draft</option>
                  <option value="published" className="bg-primary-dark">Published</option>
                  <option value="archived" className="bg-primary-dark">Archived</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4 text-primary-gold bg-white/5 border-white/10 rounded focus:ring-primary-gold focus:ring-2"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-300">
                  Featured Post
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSEO(!showSEO)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  {showSEO ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>SEO Settings</span>
                </button>
              </div>
            </div>

            {/* SEO Settings */}
            {showSEO && (
              <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white">SEO Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.seo.metaTitle}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo, metaTitle: e.target.value }
                      }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="SEO title (defaults to post title)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={formData.seo.canonicalUrl}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        seo: { ...prev.seo, canonicalUrl: e.target.value }
                      }))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="https://glitzfusion.in/blog/post-slug"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.seo.metaDescription}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      seo: { ...prev.seo, metaDescription: e.target.value }
                    }))}
                    rows={2}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                    placeholder="SEO description (defaults to excerpt)"
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SEO Keywords
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.seo.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full flex items-center space-x-2"
                      >
                        <span>{keyword}</span>
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="text-blue-400 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                      placeholder="Add SEO keyword"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-gold to-primary-gold-light text-primary-black font-semibold rounded-lg hover:shadow-gold-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{blog ? 'Update Post' : 'Create Post'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Hidden file input for featured image upload */}
          <input
            ref={featuredImageInputRef}
            type="file"
            accept="image/*"
            onChange={handleFeaturedImageUpload}
            className="hidden"
          />
        </GlassPanel>
      </motion.div>
    </div>
  );
}

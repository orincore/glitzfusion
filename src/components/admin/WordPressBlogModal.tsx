'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import WordPressEditor from '@/components/ui/WordPressEditor';
import { BlogPost } from '@/hooks/useBlog';

interface WordPressBlogModalProps {
  blog: BlogPost | null;
  onClose: () => void;
  onSubmit: (blogData: Partial<BlogPost>) => void;
  isSubmitting: boolean;
  error: string | null;
}

export default function WordPressBlogModal({ 
  blog, 
  onClose, 
  onSubmit, 
  isSubmitting, 
  error 
}: WordPressBlogModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (blog) {
      setTitle(blog.title || '');
      setContent(blog.content || '');
      setExcerpt(blog.excerpt || '');
      setCategory(blog.category || '');
      setTags(blog.tags || []);
      setStatus(blog.status || 'draft');
      setIsFeatured(blog.isFeatured || false);
    }
  }, [blog]);

  const handleSubmit = () => {
    const blogData = {
      title,
      content,
      excerpt,
      category,
      tags,
      status,
      isFeatured,
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
        ogImage: '',
        twitterTitle: title,
        twitterDescription: excerpt,
        twitterImage: ''
      }
    };
    
    onSubmit(blogData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-primary-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="h-screen flex flex-col overflow-hidden"
      >
        {/* GLITZFUSION-style Header */}
        <div className="border-b border-white/10 bg-primary-black px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gradient-gold">
                {blog ? 'Edit Post' : 'Add New Post'}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm text-gray-300 border border-white/20 rounded hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                Save Draft
              </button>
              <button 
                onClick={() => {
                  setStatus('published');
                  handleSubmit();
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-gradient-to-r from-primary-gold to-primary-gold-light text-primary-black font-semibold rounded hover:shadow-gold-glow disabled:opacity-50 transition-all duration-300"
              >
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="flex-1 flex min-h-0">
          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <WordPressEditor
              value={content}
              onChange={setContent}
              title={title}
              onTitleChange={setTitle}
              placeholder="Start writing your blog post..."
            />
          </div>

          {/* GLITZFUSION-style Sidebar */}
          <div className="w-80 border-l border-white/10 bg-white/5 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <h3 className="font-semibold text-gradient-gold mb-4">Publish</h3>
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
              <button className="w-full px-4 py-2 border-2 border-dashed border-white/20 rounded text-sm text-gray-400 hover:border-primary-gold hover:text-primary-gold transition-colors">
                Set featured image
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

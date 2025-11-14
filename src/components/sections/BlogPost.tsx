'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, ArrowLeft, Share2, Eye, Tag } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn, fadeInUp, staggerContainer } from '@/lib/utils';
import { BlogPost as BlogPostType } from '@/hooks/useBlog';

interface BlogPostProps {
  blog: BlogPostType;
  relatedPosts: BlogPostType[];
}

export default function BlogPost({ blog, relatedPosts }: BlogPostProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Increment view count once per session on client to ensure accurate counting
  useEffect(() => {
    try {
      if (!blog?._id) return;
      // Only count real public views
      if (blog.status !== 'published') return;
      const key = `viewed_${blog._id}`;
      if (typeof window === 'undefined') return;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      // Trigger server-side increment (GET increments when not preview)
      fetch(`/api/blog/${blog._id}`, { method: 'GET', cache: 'no-store' }).catch(() => {});
    } catch {}
  }, [blog?._id, blog?.status]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  return (
    <article className="pt-28">
      <div className="container-custom">
        {/* Back Button */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 text-primary-gold hover:text-primary-gold-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
        </motion.div>

        {/* Article Header + Content */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <GlassPanel className="p-8 md:p-12 rounded-2xl">
            {/* Category and Featured Badge */}
            <motion.div variants={fadeInUp} className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="px-4 py-2 bg-primary-gold text-primary-black text-sm font-semibold rounded-full">
                  {blog.category}
                </span>
                {blog.isFeatured && (
                  <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold rounded-full">
                    Featured
                  </span>
                )}
              </div>
              
              <button
                onClick={handleShare}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Share this post"
              >
                <Share2 className="w-5 h-5 text-primary-gold" />
              </button>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient-gold mb-6 leading-tight"
            >
              {blog.title}
            </motion.h1>

            {/* Excerpt */}
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-300 mb-8 leading-relaxed"
            >
              {blog.excerpt}
            </motion.p>

            {/* Meta Information */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{blog.readTime} min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{blog.views} views</span>
              </div>
            </motion.div>

            {/* Author */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center space-x-4 pb-8 border-b border-white/10"
            >
              {blog.author.avatar ? (
                <Image
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-gold/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-gold" />
                </div>
              )}
              <div>
                <p className="font-semibold text-white">{blog.author.name}</p>
                {blog.author.bio && (
                  <p className="text-sm text-gray-400">{blog.author.bio}</p>
                )}
              </div>
            </motion.div>

            {/* Featured Image (inside same panel) */}
            {blog.featuredImage && (
              <motion.div
                variants={fadeInUp}
                className="my-8"
              >
                <div className="relative h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden">
                  <Image
                    src={blog.featuredImage.url}
                    alt={blog.featuredImage.alt || blog.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-black/20 to-transparent" />
                </div>
              </motion.div>
            )}

            {/* Article Content (inside same panel) */}
            <motion.div variants={fadeInUp} className="mt-8">
              <div 
                className="prose prose-lg prose-invert max-w-none
                  prose-headings:text-gradient-gold prose-headings:font-display
                  prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-a:text-primary-gold prose-a:no-underline hover:prose-a:text-primary-gold-light
                  prose-strong:text-white prose-em:text-gray-200
                  prose-blockquote:border-l-primary-gold prose-blockquote:bg-white/5 prose-blockquote:rounded-r-lg prose-blockquote:p-4
                  prose-code:bg-white/10 prose-code:text-primary-gold prose-code:px-2 prose-code:py-1 prose-code:rounded
                  prose-pre:bg-primary-dark prose-pre:border prose-pre:border-white/10
                  prose-img:rounded-lg prose-img:shadow-lg
                  prose-ul:text-gray-300 prose-ol:text-gray-300
                  prose-li:text-gray-300"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </motion.div>
          </GlassPanel>
        </motion.div>

        {/* Tags */}
        {blog.tags.length > 0 && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mb-12"
          >
            <GlassPanel className="p-6 rounded-2xl">
              <div className="flex items-center space-x-4 mb-4">
                <Tag className="w-5 h-5 text-primary-gold" />
                <h3 className="text-lg font-semibold text-white">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-2 bg-white/10 hover:bg-primary-gold/20 text-gray-300 hover:text-primary-gold text-sm rounded-lg transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-display font-bold text-gradient-gold mb-8 text-center">
              Related Posts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <GlassPanel
                  key={post._id}
                  className="rounded-2xl overflow-hidden hover:shadow-gold-glow-lg transition-all duration-300 group"
                >
                  <Link href={`/blog/${post.slug}`} className="block">
                    {post.featuredImage ? (
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={post.featuredImage.url}
                          alt={post.featuredImage.alt || post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-black/60 to-transparent" />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-primary-gold/20 to-primary-gold/5 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary-gold" />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-gold transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                        <span>{post.readTime} min read</span>
                      </div>
                    </div>
                  </Link>
                </GlassPanel>
              ))}
            </div>
          </motion.div>
        )}

        {/* Author Bio */}
        {blog.author.bio && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mb-12"
          >
            <GlassPanel className="p-8 rounded-2xl">
              <h3 className="text-xl font-semibold text-gradient-gold mb-4">About the Author</h3>
              <div className="flex items-start space-x-4">
                {blog.author.avatar ? (
                  <Image
                    src={blog.author.avatar}
                    alt={blog.author.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary-gold/20 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-gold" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-white mb-2">{blog.author.name}</h4>
                  <p className="text-gray-300 leading-relaxed">{blog.author.bio}</p>
                  {blog.author.social && (
                    <div className="flex space-x-4 mt-3">
                      {blog.author.social.twitter && (
                        <a
                          href={blog.author.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-gold hover:text-primary-gold-light transition-colors"
                        >
                          Twitter
                        </a>
                      )}
                      {blog.author.social.linkedin && (
                        <a
                          href={blog.author.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-gold hover:text-primary-gold-light transition-colors"
                        >
                          LinkedIn
                        </a>
                      )}
                      {blog.author.social.instagram && (
                        <a
                          href={blog.author.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-gold hover:text-primary-gold-light transition-colors"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </div>
    </article>
  );
}

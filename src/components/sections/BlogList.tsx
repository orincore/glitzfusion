'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, ArrowRight, Loader2, Search, Filter, Tag } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn, fadeInUp, staggerContainer } from '@/lib/utils';
import { useBlog, BlogFilters } from '@/hooks/useBlog';

export default function BlogList() {
  const [filters, setFilters] = useState<BlogFilters>({
    page: 1,
    limit: 9,
    status: 'published'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const { blogs, pagination, filters: availableFilters, loading, error, refetch } = useBlog(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = {
      ...filters,
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      tag: selectedTag || undefined,
      page: 1
    };
    setFilters(newFilters);
    refetch(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    refetch(newFilters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
    const newFilters = {
      page: 1,
      limit: 9,
      status: 'published'
    };
    setFilters(newFilters);
    refetch(newFilters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && blogs.length === 0) {
    return (
      <section className="py-20 relative">
        <div className="container-custom">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-gold mx-auto mb-4" />
              <p className="text-gray-300">Loading blog posts...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && blogs.length === 0) {
    return (
      <section className="py-20 relative">
        <div className="container-custom">
          <div className="text-center text-red-400 mb-8">
            <p>Error loading blog posts: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative">
      <div className="container-custom">
        {/* Search and Filters */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-12"
        >
          <GlassPanel className="p-6 rounded-2xl">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent appearance-none"
                  >
                    <option value="">All Categories</option>
                    {availableFilters?.categories.map((category) => (
                      <option key={category} value={category} className="bg-primary-dark text-white">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag Filter */}
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent appearance-none"
                  >
                    <option value="">All Tags</option>
                    {availableFilters?.tags.map((tag) => (
                      <option key={tag} value={tag} className="bg-primary-dark text-white">
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-gold to-primary-gold-light text-primary-black font-semibold rounded-lg hover:shadow-gold-glow transition-all duration-300"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </form>
          </GlassPanel>
        </motion.div>

        {/* Blog Posts Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-300 text-lg">No blog posts found.</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            >
              {blogs.map((post) => (
                <motion.div
                  key={post._id}
                  variants={fadeInUp}
                  className="group"
                >
                  <GlassPanel
                    className={cn(
                      'h-full rounded-2xl overflow-hidden transition-all duration-500',
                      'hover:shadow-gold-glow-lg hover:-translate-y-2',
                      'cursor-pointer'
                    )}
                    whileHover={{ scale: 1.02 }}
                    glow
                  >
                    <Link href={`/blog/${post.slug}`} className="block">
                      {/* Featured Image */}
                      {post.featuredImage ? (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt || post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary-black/60 to-transparent" />
                          
                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-primary-gold text-primary-black text-xs font-semibold rounded-full">
                              {post.category}
                            </span>
                          </div>

                          {/* Featured Badge */}
                          {post.isFeatured && (
                            <div className="absolute top-4 right-4">
                              <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold rounded-full">
                                Featured
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-primary-gold/20 to-primary-gold/5 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-primary-gold/20 rounded-full flex items-center justify-center mx-auto mb-2">
                              <User className="w-8 h-8 text-primary-gold" />
                            </div>
                            <p className="text-gray-400 text-sm">No Image</p>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Meta Information */}
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{post.readTime} min read</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gradient-gold group-hover:scale-105 transition-transform duration-300 line-clamp-2">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Author */}
                        <div className="flex items-center space-x-3">
                          {post.author.avatar ? (
                            <Image
                              src={post.author.avatar}
                              alt={post.author.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-primary-gold/20 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary-gold" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">{post.author.name}</p>
                          </div>
                        </div>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-md">
                                +{post.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Read More */}
                        <div className="flex items-center justify-between pt-4">
                          <span className="text-primary-gold font-semibold text-sm group-hover:text-primary-gold-light transition-colors">
                            Read More
                          </span>
                          <ArrowRight className="w-4 h-4 text-primary-gold group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </GlassPanel>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <GlassPanel className="p-4 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            'px-3 py-2 rounded-lg transition-colors',
                            page === pagination.page
                              ? 'bg-primary-gold text-primary-black font-semibold'
                              : 'bg-white/10 text-white hover:bg-white/20'
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </GlassPanel>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

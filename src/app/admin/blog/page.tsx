'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Loader2,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Tag,
  Star,
  BarChart3
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn, fadeInUp, staggerContainer } from '@/lib/utils';
import { useBlog, BlogPost, BlogFilters } from '@/hooks/useBlog';

export default function BlogAdminPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<BlogFilters>({
    page: 1,
    limit: 10,
    status: undefined // Show all statuses in admin
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const { blogs, pagination, filters: availableFilters, loading, error: fetchError, refetch, createBlog, updateBlog, deleteBlog } = useBlog(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = {
      ...filters,
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
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
    setSelectedStatus('');
    const newFilters = {
      page: 1,
      limit: 10
    };
    setFilters(newFilters);
    refetch(newFilters);
  };

  const handleCreateBlog = () => {
    router.push('/blog-editor');
  };

  const handleEditBlog = (blog: BlogPost) => {
    router.push(`/blog-editor?id=${blog._id || blog.id}`);
  };

  const handleDeleteBlog = async (blog: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${blog.title}"?`)) {
      return;
    }

    const success = await deleteBlog(blog._id);
    if (success) {
      refetch();
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archived':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Calculate stats
  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.status === 'published').length,
    draft: blogs.filter(b => b.status === 'draft').length,
    archived: blogs.filter(b => b.status === 'archived').length,
    featured: blogs.filter(b => b.isFeatured).length,
    totalViews: blogs.reduce((sum, b) => sum + b.views, 0)
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient-gold">Blog Management</h1>
          <p className="text-gray-300 mt-2">Create, edit, and manage blog posts</p>
        </div>
        <button
          onClick={handleCreateBlog}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-gold to-primary-gold-light text-primary-black font-semibold rounded-lg hover:shadow-gold-glow transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Blog Post
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <GlassPanel className="p-4 text-center">
          <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-gray-400">Total Posts</p>
        </GlassPanel>
        <GlassPanel className="p-4 text-center">
          <Eye className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.published}</p>
          <p className="text-sm text-gray-400">Published</p>
        </GlassPanel>
        <GlassPanel className="p-4 text-center">
          <Edit className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.draft}</p>
          <p className="text-sm text-gray-400">Drafts</p>
        </GlassPanel>
        <GlassPanel className="p-4 text-center">
          <Trash2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.archived}</p>
          <p className="text-sm text-gray-400">Archived</p>
        </GlassPanel>
        <GlassPanel className="p-4 text-center">
          <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.featured}</p>
          <p className="text-sm text-gray-400">Featured</p>
        </GlassPanel>
        <GlassPanel className="p-4 text-center">
          <BarChart3 className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{stats.totalViews}</p>
          <p className="text-sm text-gray-400">Total Views</p>
        </GlassPanel>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <GlassPanel className="p-6 rounded-2xl">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="relative md:col-span-2">
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

              {/* Status Filter */}
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-gold focus:border-transparent appearance-none"
                >
                  <option value="">All Status</option>
                  <option value="published" className="bg-primary-dark text-white">Published</option>
                  <option value="draft" className="bg-primary-dark text-white">Draft</option>
                  <option value="archived" className="bg-primary-dark text-white">Archived</option>
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

      {/* Blog Posts Table */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <GlassPanel className="rounded-2xl overflow-hidden">
          {loading && blogs.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-gold mx-auto mb-4" />
                <p className="text-gray-300">Loading blog posts...</p>
              </div>
            </div>
          ) : fetchError && blogs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">Error loading blog posts: {fetchError}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-primary-gold text-primary-black rounded-lg hover:bg-primary-gold-light transition-colors"
              >
                Retry
              </button>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-2">No blog posts found</p>
              <p className="text-gray-400 mb-6">Create your first blog post to get started</p>
              <button
                onClick={handleCreateBlog}
                className="px-6 py-3 bg-gradient-to-r from-primary-gold to-primary-gold-light text-primary-black font-semibold rounded-lg hover:shadow-gold-glow transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2 inline" />
                Create Blog Post
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Author</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Views</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {blogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="text-white font-medium line-clamp-1">{blog.title}</p>
                              <p className="text-gray-400 text-sm line-clamp-1">{blog.excerpt}</p>
                            </div>
                            {blog.isFeatured && (
                              <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300 text-sm">{blog.author.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-primary-gold/20 text-primary-gold text-xs rounded-md">
                            {blog.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'px-2 py-1 text-xs rounded-md border',
                            getStatusColor(blog.status)
                          )}>
                            {blog.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1 text-gray-300 text-sm">
                            <Eye className="w-4 h-4" />
                            <span>{blog.views}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1 text-gray-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            {blog.status === 'published' && (
                              <a
                                href={`/blog/${blog.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-primary-gold transition-colors"
                                title="View post"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => handleEditBlog(blog)}
                              className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                              title="Edit post"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog)}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const page = i + 1;
                          return (
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
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </GlassPanel>
      </motion.div>

    </div>
  );
}

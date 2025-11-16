"use client";

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Download
} from 'lucide-react';

interface BookingAnalytics {
  bookings: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  analytics: {
    revenue: {
      totalRevenue: number;
      totalBookings: number;
      totalMembers: number;
    };
    statusBreakdown: Array<{
      _id: string;
      count: number;
      revenue: number;
    }>;
    monthlyRevenue: Array<{
      _id: { year: number; month: number };
      revenue: number;
      bookings: number;
    }>;
    eventRevenue: Array<{
      _id: string;
      eventTitle: string;
      eventType: string;
      revenue: number;
      bookings: number;
      members: number;
    }>;
  };
}

export default function BookingAnalyticsPage() {
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    eventId: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    page: 1
  });

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`/api/analytics/bookings?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Analytics</h1>
          <p className="text-gray-600">Track bookings, revenue, and transaction details</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value, page: 1 }))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            placeholder="From Date"
          />

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value, page: 1 }))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            placeholder="To Date"
          />

          <button
            onClick={() => setFilters({ eventId: '', status: '', dateFrom: '', dateTo: '', page: 1 })}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.analytics.revenue.totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.analytics.revenue.totalBookings}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.analytics.revenue.totalMembers}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.analytics.statusBreakdown.length > 0 
                    ? Math.round((analytics.analytics.statusBreakdown.find(s => s._id === 'paid')?.count || 0) / 
                        analytics.analytics.statusBreakdown.reduce((sum, s) => sum + s.count, 0) * 100)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      {analytics && analytics.analytics.statusBreakdown.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics.analytics.statusBreakdown.map((status) => (
              <div key={status._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status._id)}
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{status._id}</p>
                    <p className="text-sm text-gray-600">{status.count} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(status.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Table */}
      {analytics && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.bookingCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.eventId?.title || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{booking.eventId?.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.primaryContact?.name}</div>
                      <div className="text-sm text-gray-500">{booking.primaryContact?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-500">{booking.members?.length || 0} members</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.paymentStatus)}`}>
                        {getStatusIcon(booking.paymentStatus)}
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedBooking(booking._id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {analytics.pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((analytics.pagination.page - 1) * analytics.pagination.limit) + 1} to{' '}
                {Math.min(analytics.pagination.page * analytics.pagination.limit, analytics.pagination.total)} of{' '}
                {analytics.pagination.total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={analytics.pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={analytics.pagination.page === analytics.pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedBooking && (
        <TransactionDetailsModal
          bookingId={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}

// Transaction Details Modal Component
function TransactionDetailsModal({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionDetails();
  }, [bookingId]);

  const fetchTransactionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/transactions/${bookingId}`);
      const data = await response.json();
      
      if (data.success) {
        setDetails(data.data);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : details ? (
          <div className="p-6 space-y-6">
            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Booking Code</p>
                  <p className="font-medium">{details.booking.bookingCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Event</p>
                  <p className="font-medium">{details.booking.eventId?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{details.booking.primaryContact?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">{formatCurrency(details.summary.totalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total Attempts</p>
                <p className="text-2xl font-bold text-blue-900">{details.summary.totalAttempts}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Successful</p>
                <p className="text-2xl font-bold text-green-900">{details.summary.successfulPayments}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-900">{details.summary.failedPayments}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">Paid Amount</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(details.summary.paidAmount)}</p>
              </div>
            </div>

            {/* Transaction Logs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction History</h3>
              <div className="space-y-3">
                {details.transactionLogs.map((log: any) => (
                  <div key={log._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.status === 'success' ? 'bg-green-100 text-green-800' :
                          log.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.transactionType.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">{log.transactionId}</span>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(log.timestamp)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {log.razorpayOrderId && (
                        <div>
                          <p className="text-gray-600">Order ID</p>
                          <p className="font-mono">{log.razorpayOrderId}</p>
                        </div>
                      )}
                      {log.razorpayPaymentId && (
                        <div>
                          <p className="text-gray-600">Payment ID</p>
                          <p className="font-mono">{log.razorpayPaymentId}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600">Amount</p>
                        <p className="font-medium">{formatCurrency(log.amount)}</p>
                      </div>
                      {log.paymentMethod && (
                        <div>
                          <p className="text-gray-600">Method</p>
                          <p className="font-medium capitalize">{log.paymentMethod}</p>
                        </div>
                      )}
                    </div>

                    {log.failureReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                        <p className="text-sm text-red-700">
                          <strong>Failure Reason:</strong> {log.failureReason}
                        </p>
                        {log.errorMessage && (
                          <p className="text-sm text-red-600 mt-1">{log.errorMessage}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Failed to load transaction details
          </div>
        )}
      </div>
    </div>
  );
}

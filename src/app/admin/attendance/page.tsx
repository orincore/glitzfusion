'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  Shield, 
  Search, 
  Filter,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  bookingId: string;
  bookingCode: string;
  eventId: string;
  eventTitle: string;
  memberEmail: string;
  memberName: string;
  memberPhone: string;
  validatedAt: string;
  validatedBy: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceStats {
  totalAttendees: number;
  totalEvents: number;
  todayAttendees: number;
  thisWeekAttendees: number;
  topEvents: Array<{
    eventTitle: string;
    attendeeCount: number;
  }>;
  recentValidators: Array<{
    validatedBy: string;
    count: number;
  }>;
}

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedValidator, setSelectedValidator] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedEvent && { eventId: selectedEvent }),
        ...(selectedValidator && { validatedBy: selectedValidator }),
        ...(dateRange !== 'all' && { dateRange })
      });

      const [recordsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/attendance?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/attendance/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (recordsResponse.ok && statsResponse.ok) {
        const recordsData = await recordsResponse.json();
        const statsData = await statsResponse.json();
        
        setAttendanceRecords(recordsData.records);
        setTotalPages(recordsData.totalPages);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [currentPage, searchTerm, selectedEvent, selectedValidator, dateRange]);

  const exportAttendance = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(selectedEvent && { eventId: selectedEvent }),
        ...(selectedValidator && { validatedBy: selectedValidator }),
        ...(dateRange !== 'all' && { dateRange })
      });

      const response = await fetch(`/api/admin/attendance/export?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting attendance:', error);
    }
  };

  if (loading && !attendanceRecords.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance Management</h1>
          <p className="mt-1 text-sm text-gray-400">
            Track and manage event attendance records
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={exportAttendance}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Attendees</p>
                <p className="text-2xl font-bold text-white">{stats.totalAttendees}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Events with Attendance</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Today</p>
                <p className="text-2xl font-bold text-white">{stats.todayAttendees}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-white">{stats.thisWeekAttendees}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or booking code..."
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Event
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="">All Events</option>
              {stats?.topEvents.map((event, index) => (
                <option key={index} value={event.eventTitle}>
                  {event.eventTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Validator
            </label>
            <select
              value={selectedValidator}
              onChange={(e) => setSelectedValidator(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="">All Validators</option>
              {stats?.recentValidators.map((validator, index) => (
                <option key={index} value={validator.validatedBy}>
                  {validator.validatedBy} ({validator.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">Attendance Records</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Attendee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Booking Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Validated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Validator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {attendanceRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center">
                          <Users className="h-5 w-5 text-black" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {record.memberName}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {record.memberEmail}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {record.memberPhone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{record.eventTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-green-400 mr-2" />
                      <span className="text-sm font-mono text-white bg-gray-700 px-2 py-1 rounded">
                        {record.bookingCode}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <div>
                        <div className="text-sm text-white">
                          {new Date(record.validatedAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(record.validatedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{record.validatedBy}</div>
                    {record.ipAddress && (
                      <div className="text-xs text-gray-400">IP: {record.ipAddress}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-yellow-400 hover:text-yellow-300 mr-3">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-900 px-6 py-3 flex items-center justify-between border-t border-gray-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Events and Validators */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Top Events by Attendance</h3>
            <div className="space-y-3">
              {stats.topEvents.slice(0, 5).map((event, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm text-gray-300 truncate">{event.eventTitle}</div>
                  <div className="text-sm font-medium text-white ml-2">
                    {event.attendeeCount} attendees
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4">Top Validators</h3>
            <div className="space-y-3">
              {stats.recentValidators.slice(0, 5).map((validator, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm text-gray-300">{validator.validatedBy}</div>
                  <div className="text-sm font-medium text-white">
                    {validator.count} validations
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

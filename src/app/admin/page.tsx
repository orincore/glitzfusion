'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Image, FileText, Users, Activity, TrendingUp, UserCheck } from 'lucide-react'

interface DashboardStats {
  courses: number
  media: number
  content: number
  users: number
  fusionxEvents: number
  totalAttendees: number
  todayAttendees: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    courses: 0,
    media: 0,
    content: 0,
    users: 0,
    fusionxEvents: 0,
    totalAttendees: 0,
    todayAttendees: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const [coursesRes, mediaRes, contentRes, fusionxEventsRes, attendanceStatsRes] = await Promise.all([
        fetch('/api/courses', { headers }),
        fetch('/api/media', { headers }),
        fetch('/api/content', { headers }),
        fetch('/api/fusionx-events', { headers }),
        fetch('/api/admin/attendance/stats', { headers })
      ])

      const [coursesData, mediaData, contentData, fusionxEventsData, attendanceStatsData] = await Promise.all([
        coursesRes.json(),
        mediaRes.json(),
        contentRes.json(),
        fusionxEventsRes.json(),
        attendanceStatsRes.json()
      ])

      setStats({
        courses: coursesData.length || 0,
        media: mediaData.media?.length || 0,
        content: contentData.length || 0,
        users: 1, // Placeholder
        fusionxEvents: fusionxEventsData.length || 0,
        totalAttendees: attendanceStatsData.totalAttendees || 0,
        todayAttendees: attendanceStatsData.todayAttendees || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      name: 'FusionX Events',
      value: stats.fusionxEvents,
      icon: Activity,
      color: 'bg-blue-500',
      change: '+2.5%'
    },
    {
      name: 'Total Attendees',
      value: stats.totalAttendees,
      icon: UserCheck,
      color: 'bg-green-500',
      change: '+12.3%'
    },
    {
      name: 'Today Attendees',
      value: stats.todayAttendees,
      icon: Users,
      color: 'bg-purple-500',
      change: '+5.1%'
    },
    {
      name: 'Admin Users',
      value: stats.users,
      icon: Users,
      color: 'bg-yellow-500',
      change: '0%'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-gray-400">Welcome to the Glitz Fusion admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} p-3 rounded-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-white">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-400">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white">Quick Actions</h3>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/admin/fusionx-events"
              className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg border border-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-400" />
                <div className="ml-4">
                  <h4 className="text-white font-medium">FusionX Events</h4>
                  <p className="text-gray-400 text-sm">Manage events and bookings</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/attendance"
              className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg border border-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-400" />
                <div className="ml-4">
                  <h4 className="text-white font-medium">Attendance</h4>
                  <p className="text-gray-400 text-sm">View and manage event attendance</p>
                </div>
              </div>
            </a>
            <a
              href="/admin/booking-analytics"
              className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg border border-gray-600 transition-colors"
            >
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-400" />
                <div className="ml-4">
                  <h4 className="text-white font-medium">Analytics</h4>
                  <p className="text-gray-400 text-sm">View booking and revenue analytics</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Activity className="h-4 w-4 text-green-400 mr-3" />
              <span className="text-gray-300">System initialized successfully</span>
              <span className="ml-auto text-gray-500">Just now</span>
            </div>
            <div className="flex items-center text-sm">
              <Activity className="h-4 w-4 text-blue-400 mr-3" />
              <span className="text-gray-300">Admin panel ready for configuration</span>
              <span className="ml-auto text-gray-500">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

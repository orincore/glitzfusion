'use client'

import { useState, useEffect } from 'react'
import { TeamMember, Founder } from '@/hooks/useAbout'
import { TeamMemberModal } from './TeamMemberModal'
import { FounderModal } from './FounderModal'
import { JourneyAdmin } from './JourneyAdmin'
import { StoryAdmin } from './StoryAdmin'
import { Plus, Edit, Trash2, Users, Crown, MapPin, BookOpen } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export function AboutAdminTabs() {
  const [activeTab, setActiveTab] = useState('team')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [founders, setFounders] = useState<Founder[]>([])
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [founderModalOpen, setFounderModalOpen] = useState(false)
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null)
  const [editingFounder, setEditingFounder] = useState<Founder | null>(null)

  useEffect(() => {
    fetchTeamMembers()
    fetchFounders()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/about/team')
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }

  const fetchFounders = async () => {
    try {
      const response = await fetch('/api/about/founders')
      if (response.ok) {
        const data = await response.json()
        setFounders(data)
      }
    } catch (error) {
      console.error('Error fetching founders:', error)
    }
  }

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return

    try {
      const response = await fetch(`/api/about/team?id=${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast.success('Team member deleted successfully')
        fetchTeamMembers()
      }
    } catch (error) {
      toast.error('Failed to delete team member')
    }
  }

  const handleDeleteFounder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this founder?')) return

    try {
      const response = await fetch(`/api/about/founders?id=${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast.success('Founder deleted successfully')
        fetchFounders()
      }
    } catch (error) {
      toast.error('Failed to delete founder')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('team')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'team'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Team Members
          </button>
          <button
            onClick={() => setActiveTab('founders')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'founders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Crown className="w-4 h-4 inline mr-2" />
            Founders
          </button>
          <button
            onClick={() => setActiveTab('story')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'story'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Our Story
          </button>
          <button
            onClick={() => setActiveTab('journey')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'journey'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            Our Journey
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'team' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              <button
                onClick={() => {
                  setEditingTeamMember(null)
                  setTeamModalOpen(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Team Member</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                      {member.image && (
                        <Image src={member.image} alt={member.name} width={48} height={48} className="object-cover" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingTeamMember(member)
                        setTeamModalOpen(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeamMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'founders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Founders</h3>
              <button
                onClick={() => {
                  setEditingFounder(null)
                  setFounderModalOpen(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Founder</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {founders.map((founder) => (
                <div key={founder.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {founder.image && (
                        <Image src={founder.image} alt={founder.name} width={64} height={64} className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{founder.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{founder.role}</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{founder.bio}</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingFounder(founder)
                        setFounderModalOpen(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFounder(founder.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'story' && (
          <StoryAdmin />
        )}

        {activeTab === 'journey' && (
          <JourneyAdmin />
        )}
      </div>

      {/* Modals */}
      <TeamMemberModal
        isOpen={teamModalOpen}
        onClose={() => {
          setTeamModalOpen(false)
          setEditingTeamMember(null)
        }}
        member={editingTeamMember}
        onSave={() => {
          fetchTeamMembers()
          setTeamModalOpen(false)
          setEditingTeamMember(null)
        }}
      />

      <FounderModal
        isOpen={founderModalOpen}
        onClose={() => {
          setFounderModalOpen(false)
          setEditingFounder(null)
        }}
        founder={editingFounder}
        onSave={() => {
          fetchFounders()
          setFounderModalOpen(false)
          setEditingFounder(null)
        }}
      />
    </div>
  )
}

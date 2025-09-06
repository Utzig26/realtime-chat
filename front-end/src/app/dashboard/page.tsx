'use client'

import PageLayout from '@/components/PageLayout'
import PageLoader from '@/components/PageLoader'
import UserInfo from '@/components/UserInfo'
import UsersList from '@/components/UsersList'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { UserWithConversation } from '@/hooks/useUsersAndConversations'
import { useState } from 'react'

export default function DashboardPage() {
  const { logout } = useAuth()
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<UserWithConversation | null>(null)

  const handleLogout = async () => {
    try {      
      await logout()
      router.push('/login')
    } catch {
      console.error('Logout failed')
    }
  }

  const handleUserSelect = (user: UserWithConversation) => {
    setSelectedUser(user)
  }

  return (
    <PageLayout>
      <PageLoader requireAuth={true}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[600px] flex flex-col overflow-hidden">
            <UserInfo onLogout={handleLogout} />
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/3 border-r border-gray-200 flex flex-col"> 
                <UsersList onUserSelect={handleUserSelect} />
              </div>

              <div className="flex-1 flex flex-col">
                {selectedUser ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <p>Chat with {selectedUser.name}</p>
                      <p className="text-sm mt-1">Messages will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <p>No messages yet</p>
                      <p className="text-sm mt-1">Start the conversation!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageLoader>
    </PageLayout>
  )
}

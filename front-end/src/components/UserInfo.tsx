'use client'

import { useAuth } from '@/hooks/useAuth'
import { useSocket } from '@/hooks/useSocket'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserInfoProps {
  onLogout?: () => void
}

export default function UserInfo({ 
  onLogout, 
}: UserInfoProps) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const { isConnected } = useSocket()

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      try {
        await logout()
        router.push('/login')
      } catch {
        console.error('Logout failed')
      }
    }
  }

  if (!user) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <h2 className="text-xl font-bold text-black">Messages</h2>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Logout"
          >
            <LogOut className="w-3 h-3" />
            <span>Sair</span>
          </button>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2">
              <span className="text-s font-bold text-gray-900">
                { user.name }
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                { user.username }
              </span>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {getInitials(user.name)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

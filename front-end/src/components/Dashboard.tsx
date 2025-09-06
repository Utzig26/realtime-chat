'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSocket } from '@/hooks/useSocket'
import { InlineLoading, OverlayLoading } from './Loading'

export default function Dashboard() {
  const { logout, isLoading } = useAuth()
  const { isConnected } = useSocket()
  const router = useRouter()

  const handleLogout = async () => {
    try {      
      await logout()
      router.push('/login')
    } catch {
      console.error('Logout failed')
    }
  }

  if (isLoading) {
    return <OverlayLoading />
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-pink-600">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[600px] flex overflow-hidden">
          
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-black">Mensagens</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full py-2 px-4 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <InlineLoading />
                    <span>Logging out...</span>
                  </>
                ) : (
                  'Logout'
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p>No messages yet</p>
                <p className="text-sm mt-1">Start the conversation!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

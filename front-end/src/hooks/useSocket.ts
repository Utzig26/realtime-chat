import { useEffect, useState } from 'react'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { useAuthStore } from '@/stores/auth.store'

export function useSocket() {
  const { isAuthenticated, hasCheckedAuth } = useAuthStore()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (hasCheckedAuth && isAuthenticated) {
      console.log('User authenticated - connecting socket...')
      const socket = connectSocket()
      setIsConnected(true)

      const handleConnect = () => setIsConnected(true)
      const handleDisconnect = () => setIsConnected(false)

      const handleBroadcast = (data: {
        message: string
        timestamp: string
        connectedUsers: number
        serverTime: number
      }) => {
        console.log('📢 Broadcast received:', {
          message: data.message,
          timestamp: data.timestamp,
          connectedUsers: data.connectedUsers,
          serverTime: new Date(data.serverTime).toLocaleTimeString()
        })
      }

      socket.on('connect', handleConnect)
      socket.on('disconnect', handleDisconnect)
      socket.on('test:broadcast', handleBroadcast)

      return () => {
        socket.off('connect', handleConnect)
        socket.off('disconnect', handleDisconnect)
        socket.off('test:broadcast', handleBroadcast)
      }
    }
  }, [isAuthenticated, hasCheckedAuth])

  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated) {
      console.log('User logged out - disconnecting socket...')
      disconnectSocket()
      setIsConnected(false)
    }
  }, [isAuthenticated, hasCheckedAuth])

  return {
    socket: getSocket(),
    isConnected
  }
}

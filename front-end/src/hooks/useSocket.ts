import { useEffect, useState } from 'react'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { useAuthStore } from '@/stores/auth.store'

export function useSocket() {
  const { isAuthenticated, hasCheckedAuth } = useAuthStore()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (hasCheckedAuth && isAuthenticated) {
      const socket = connectSocket()
      setIsConnected(true)

      const handleConnect = () => setIsConnected(true)
      const handleDisconnect = () => setIsConnected(false)


      socket.on('connect', handleConnect)
      socket.on('disconnect', handleDisconnect)

      return () => {
        socket.off('connect', handleConnect)
        socket.off('disconnect', handleDisconnect)
      }
    }
  }, [isAuthenticated, hasCheckedAuth])

  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated) {

      disconnectSocket()
      setIsConnected(false)
    }
  }, [isAuthenticated, hasCheckedAuth])

  return {
    socket: getSocket(),
    isConnected
  }
}

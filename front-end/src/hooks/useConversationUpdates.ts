import { useEffect, useCallback } from 'react'
import { getSocket } from '@/lib/socket'
import { useConversationStore } from '@/stores/conversation.store'
import { useUserStore } from '@/stores/user.store'
import { api } from '@/lib/api'
import { Conversation, User } from '@/types'

export const useConversationUpdates = () => {
  const { 
    updateConversation,
    addConversation,
    markAsRead
  } = useConversationStore()
  
  const { addUser } = useUserStore()
  const socket = getSocket()

  const handleNewMessageNotification = useCallback(async (notification: {
    senderId: string
    senderName: string
    senderUsername: string
    conversationId: string
    messageId: string
    text: string
    timestamp: string
  }) => {
    try {
      const response = await api.get<{
        success: boolean
        data: Conversation
      }>(`/conversations/${notification.conversationId}`)
      
      if (response.success && response.data) {
        updateConversation(notification.conversationId, response.data)
      }
    } catch (error) {
      console.error('Failed to update conversation:', error)
    }
  }, [updateConversation])

  const handleNewConversationNotification = useCallback(async (notification: {
    conversationId: string
    timestamp: string
  }) => {
    try {
      const response = await api.get<{
        success: boolean
        data: Conversation
      }>(`/conversations/${notification.conversationId}`)
      
      if (response.success && response.data) {
        const newConversation = response.data
        
        newConversation.participants?.forEach((participant: User) => {
          addUser(participant)
        })
        
        addConversation(newConversation)
      }
    } catch (error) {
      console.error('Failed to fetch new conversation:', error)
    }
  }, [addConversation, addUser])

  const handleUnreadUpdate = useCallback((data: { conversationId: string; unreadCount: number }) => {
    if (data.unreadCount === 0) {
      markAsRead(data.conversationId)
    } else {
      updateConversation(data.conversationId, { unreadCount: data.unreadCount })
    }
  }, [markAsRead, updateConversation])

  useEffect(() => {
    if (!socket) return

    socket.on('notification:new_message', handleNewMessageNotification)
    socket.on('notification:new_conversation', handleNewConversationNotification)
    socket.on('conversation:unread_update', handleUnreadUpdate)

    return () => {
      socket.off('notification:new_message', handleNewMessageNotification)
      socket.off('notification:new_conversation', handleNewConversationNotification)
      socket.off('conversation:unread_update', handleUnreadUpdate)
    }
  }, [socket, handleNewMessageNotification, handleNewConversationNotification, handleUnreadUpdate])
}
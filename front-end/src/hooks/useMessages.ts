import { useState, useEffect, useCallback } from 'react'
import { Message } from '@/types'
import { getSocket } from '@/lib/socket'
import { api } from '@/lib/api'
import { useMessageStore } from '@/stores/message.store'

interface UseMessagesProps {
  conversationId: string | null
  currentUserId: string
}

export const useMessages = ({ conversationId }: UseMessagesProps) => {
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  
  const { 
    messages, 
    loading, 
    error, 
    setMessages, 
    addMessage, 
    prependMessages, 
    clearMessages, 
    setLoading, 
    setError 
  } = useMessageStore()

  const socket = getSocket()
  const currentMessages = conversationId ? messages.get(conversationId) || [] : []

  const loadMessages = useCallback(async (before?: string) => {
    if (!conversationId) return

    try {
      setLoading(true)
      setError(null)

      const response = await api.get<{
        success: boolean
        data: {
          messages: Message[]
          hasMore: boolean
          nextCursor?: string
        }
      }>(`/conversations/${conversationId}/messages?limit=20${before ? `&before=${before}` : ''}`)

      if (response.success && response.data) {
        const newMessages = response.data.messages.reverse()
        
        if (before) {
          prependMessages(conversationId, newMessages)
        } else {
          setMessages(conversationId, newMessages)
        }
        
        setHasMore(response.data.hasMore)
        setNextCursor(response.data.nextCursor)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [conversationId, setMessages, prependMessages, setLoading, setError])

  const sendMessage = useCallback((text: string) => {
    if (!socket || !conversationId) return

    socket.emit('message:send', {
      conversationId,
      text
    })
  }, [socket, conversationId])

  const markAsRead = useCallback(() => {
    if (!socket || !conversationId) return

    socket.emit('conversation:mark_as_read', {
      conversationId
    })
  }, [socket, conversationId])

  const loadMore = useCallback(() => {
    if (hasMore && nextCursor && !loading) {
      loadMessages(nextCursor)
    }
  }, [hasMore, nextCursor, loading, loadMessages])

  useEffect(() => {
    if (!socket || !conversationId) return

    const handleNewMessage = (message: Message) => {
      addMessage(conversationId, message)
    }

    const handleMessageError = (error: { error: string }) => {
      setError(error.error)
    }

    const handleReadReceipt = (data: { messageId: string; readBy: string; readAt: Date }) => {
      console.log('Message read receipt:', data)
    }

    socket.emit('join_conversation', conversationId)

    socket.on('message:new', handleNewMessage)
    socket.on('message:error', handleMessageError)
    socket.on('message:read_receipt', handleReadReceipt)

    return () => {
      socket.emit('leave_conversation', conversationId)
      
      socket.off('message:new', handleNewMessage)
      socket.off('message:error', handleMessageError)
      socket.off('message:read_receipt', handleReadReceipt)
    }
  }, [socket, conversationId, addMessage, setError])

  useEffect(() => {
    if (conversationId) {
      clearMessages(conversationId)
      setHasMore(false)
      setNextCursor(undefined)
      loadMessages()
    }
  }, [conversationId, loadMessages, clearMessages])

  useEffect(() => {
    if (conversationId && currentMessages.length > 0) {
      markAsRead()
    }
  }, [conversationId, currentMessages.length, markAsRead])

  return {
    messages: currentMessages,
    loading,
    error,
    hasMore,
    sendMessage,
    markAsRead,
    loadMore,
    refresh: () => loadMessages()
  }
}
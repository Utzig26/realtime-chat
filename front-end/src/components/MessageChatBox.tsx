'use client'

import { useRef, useEffect, useCallback } from 'react'
import { UserWithConversation } from '@/hooks/useUsersWithConversations'
import MessageComponent from './Message'
import MessageInput from './MessageInput'
import { Loading } from './Loading'
import { MessageCircle } from 'lucide-react'
import { useMessages } from '@/hooks/useMessages'

interface MessageChatBoxProps {
  selectedUser: UserWithConversation | null
  currentUserId: string
  onSendMessage?: (message: string, conversationId: string) => void
}

export default function MessageChatBox({ 
  selectedUser, 
  currentUserId, 
  onSendMessage 
}: MessageChatBoxProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isUserScrollingRef = useRef(false)
  const lastMessageCountRef = useRef(0)
  const hasInitiallyScrolledRef = useRef(false)
  
  const {
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    loadMore
  } = useMessages({
    conversationId: selectedUser?.conversation?.id || null,
    currentUserId
  })

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container || !hasMore || loading) return

    const scrollTop = container.scrollTop
    if (scrollTop <= 200) {
      loadMore()
    }

    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    
    isUserScrollingRef.current = !isAtBottom
  }, [hasMore, loading, loadMore])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const currentMessageCount = messages.length
    const messageCountIncreased = currentMessageCount > lastMessageCountRef.current
    lastMessageCountRef.current = currentMessageCount

    if (currentMessageCount === 0 || (!isUserScrollingRef.current && messageCountIncreased)) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        hasInitiallyScrolledRef.current = true
      }, 100)
    }
  }, [messages])

  useEffect(() => {
    if (selectedUser?.conversation?.id) {
      isUserScrollingRef.current = false
      lastMessageCountRef.current = 0
      hasInitiallyScrolledRef.current = false
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
        hasInitiallyScrolledRef.current = true
      }, 300)
    }
  }, [selectedUser?.conversation?.id])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (!hasInitiallyScrolledRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
        hasInitiallyScrolledRef.current = true
      }, 500)
    }
  }, [])

  const handleSendMessage = (messageText: string) => {
    if (!selectedUser || !selectedUser.conversation) return

    sendMessage(messageText)
    
    if (onSendMessage) {
      onSendMessage(messageText, selectedUser.conversation.id)
    }
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Selecione uma conversa</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {selectedUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
            <p className="text-sm text-gray-500">
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1"
      >
        {error && (
          <div className="text-center text-red-500 py-4">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loading size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-sm">Sem mensagens ainda</p>
              <p className="text-xs mt-1">Comece a Conversar!</p>
            </div>
          </div>
        ) : (
          <>
            {loading && hasMore && (
              <div className="text-center py-2">
                <Loading size="sm" />
                <p className="text-xs text-gray-500 mt-1">Carregando as mensagens</p>
              </div>
            )}
            
            {messages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUserId}
                showAvatar={false}
                showTime={true}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={!selectedUser.conversation}
        placeholder={`Message ${selectedUser.name}...`}
      />
    </div>
  )
}

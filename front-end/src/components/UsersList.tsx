'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useConversationStore } from '@/stores/conversation.store'
import { useAuthStore } from '@/stores/auth.store'
import { useChat } from '@/hooks/useChat'
import { UserWithConversation } from '@/hooks/useUsersWithConversations'
import UserListItem from './UserListItem'
import { Loading } from './Loading'
import Swal from 'sweetalert2'

interface UsersListProps {
  onUserSelect?: (user: UserWithConversation) => void
}

export default function UsersList({ onUserSelect }: UsersListProps) {
  const { createConversation } = useConversationStore()
  const { user: currentUser } = useAuthStore()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const usersListRef = useRef<HTMLDivElement>(null)
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  const { usersWithConversations, loading, error, loadMoreUsers, hasNextPage, loadingMore } = useChat({ 
    currentUserId: currentUser?.id || '' 
  })

  const handleScroll = useCallback(() => {
    const container = usersListRef.current
    if (!container || !hasNextPage || loadingMore) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    
    const isNearBottom = distanceFromBottom < 200

    if (isNearBottom) {
      loadMoreUsers()
    }
  }, [hasNextPage, loadingMore, loadMoreUsers])

  useEffect(() => {
    const container = usersListRef.current
    if (!container) return

    let timeoutId: NodeJS.Timeout
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 100)
    }

    container.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', throttledHandleScroll)
      clearTimeout(timeoutId)
    }
  }, [handleScroll])

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current
    if (!trigger || !hasNextPage || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          loadMoreUsers()
        }
      },
      {
        root: usersListRef.current,
        rootMargin: '100px',
        threshold: 0.1
      }
    )

    observer.observe(trigger)
    return () => observer.disconnect()
  }, [hasNextPage, loadingMore, loadMoreUsers])

  const handleUserClick = async (user: UserWithConversation) => {
    if (user.conversation) {
      setSelectedUserId(user.id)
      if (onUserSelect) {
        onUserSelect(user)
      }
      return
    }

    const result = await Swal.fire({
      title: `Começar uma conversa com ${user.name}?`,
      text: `Ele será notificado!`,
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    })

    if (result.isConfirmed) {
      try {
        const newConversation = await createConversation(user.id)
        if (newConversation) {
          setSelectedUserId(user.id)
          if (onUserSelect) {
            const userWithConversation: UserWithConversation = {
              ...user,
              conversation: newConversation,
              unreadCount: 0
            }
            onUserSelect(userWithConversation)
          }
        }
      } catch (error) {
        console.error('Failed to create conversation:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-500">
          <p className="text-sm">Error loading users</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (usersWithConversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-sm">No users found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div 
        ref={usersListRef}
        className="flex-1 overflow-y-auto min-h-0"
      >
        {usersWithConversations.map((user) => (
          <UserListItem
            key={user.id}
            user={user}
            currentUserId={currentUser?.id || ''}
            isSelected={selectedUserId === user.id}
            onClick={handleUserClick}
          />
        ))}
        
        {loadingMore && (
          <div className="flex items-center justify-center py-4">
            <Loading size="sm" />
            <span className="ml-2 text-sm text-gray-500">Loading more users...</span>
          </div>
        )}
        
        {hasNextPage && !loadingMore && (
          <div className="text-center py-4">
            <button
              onClick={loadMoreUsers}
              className="text-sm text-blue-500 hover:text-blue-600 px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              Carregar mais usuários
            </button>
          </div>
        )}
        
        {!hasNextPage && usersWithConversations.length > 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            Não há mais usuários para carregar
          </div>
        )}
        
        {hasNextPage && (
          <div ref={loadMoreTriggerRef} className="h-1" />
        )}
        
      </div>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { useUsersAndConversations, UserWithConversation } from '@/hooks/useUsersAndConversations'
import { useAuthStore } from '@/stores/auth.store'
import UserListItem from './UserListItem'
import { Loading } from './Loading'
import Swal from 'sweetalert2'

interface UsersListProps {
  onUserSelect?: (user: UserWithConversation) => void
}

export default function UsersList({ onUserSelect }: UsersListProps) {
  const { users, conversations, loading, error, createConversation } = useUsersAndConversations()
  const { user: currentUser } = useAuthStore()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const sortedUsersWithConversations = useMemo(() => {
    if (!currentUser) return []

    const conversationMap = new Map<string, UserWithConversation>()
    
    conversations.forEach(conversation => {
      const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id)
      if (otherParticipant) {
        conversationMap.set(otherParticipant.id, {
          ...otherParticipant,
          conversation,
          unreadCount: conversation.unreadCount || 0
        })
      }
    })

    const usersWithConversations: UserWithConversation[] = []
    const usersWithoutConversations: UserWithConversation[] = []

    users.forEach(user => {
      if (user.id === currentUser.id) return

      if (conversationMap.has(user.id)) {
        usersWithConversations.push(conversationMap.get(user.id)!)
      } else {
        usersWithoutConversations.push(user)
      }
    })

    usersWithConversations.sort((a, b) => {
      const aUpdatedAt = a.conversation?.updatedAt
      const bUpdatedAt = b.conversation?.updatedAt
      
      if (aUpdatedAt && bUpdatedAt) {
        return new Date(bUpdatedAt).getTime() - new Date(aUpdatedAt).getTime()
      }
      if (aUpdatedAt && !bUpdatedAt) return -1
      if (!aUpdatedAt && bUpdatedAt) return 1

      return a.name.localeCompare(b.name)
    })

    return [...usersWithConversations, ...usersWithoutConversations]
  }, [users, conversations, currentUser])

  const handleUserClick = async (user: UserWithConversation) => {
    // If user already has a conversation, just select them
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
            onUserSelect(user)
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

  if (sortedUsersWithConversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-sm">No users found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {sortedUsersWithConversations.map((user) => (
          <UserListItem
            key={user.id}
            user={user}
            currentUserId={currentUser?.id || ''}
            isSelected={selectedUserId === user.id}
            onClick={handleUserClick}
          />
        ))}
      </div>
    </div>
  )
}

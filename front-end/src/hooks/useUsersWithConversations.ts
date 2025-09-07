import { useMemo } from 'react'
import { useUserStore } from '@/stores/user.store'
import { useConversationStore } from '@/stores/conversation.store'
import { User, Conversation } from '@/types'

export interface UserWithConversation extends User {
  conversation?: Conversation
  unreadCount?: number
}

export const useUsersWithConversations = (currentUserId: string) => {
  const { users } = useUserStore()
  const { conversations } = useConversationStore()

  return useMemo(() => {
    if (!currentUserId) return []

    const usersArray = Array.from(users.values())
    const conversationsArray = Array.from(conversations.values())
    
    const conversationMap = new Map<string, Conversation>()
    
    conversationsArray.forEach(conversation => {
      const otherParticipant = conversation.participants?.find(p => p.id !== currentUserId)
      if (otherParticipant) {
        conversationMap.set(otherParticipant.id, conversation)
      }
    })

    const usersWithConversations: UserWithConversation[] = []
    const usersWithoutConversations: UserWithConversation[] = []

    usersArray.forEach(user => {
      if (user.id === currentUserId) return

      const conversation = conversationMap.get(user.id)
      if (conversation) {
        usersWithConversations.push({
          ...user,
          conversation,
          unreadCount: conversation.unreadCount || 0
        })
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
  }, [users, conversations, currentUserId])
}

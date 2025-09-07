import { useEffect } from 'react'
import { useUserStore } from '@/stores/user.store'
import { useConversationStore } from '@/stores/conversation.store'
import { useUsersWithConversations } from './useUsersWithConversations'
import { useConversationUpdates } from './useConversationUpdates'

interface UseChatProps {
  currentUserId: string
}

export const useChat = ({ currentUserId }: UseChatProps) => {
  const { 
    fetchUsers, 
    loadMoreUsers,
    loading: usersLoading, 
    loadingMore: usersLoadingMore,
    error: usersError,
    hasNextPage,
    resetPagination
  } = useUserStore()
  const { fetchConversations, loading: conversationsLoading, error: conversationsError } = useConversationStore()
  
  const usersWithConversations = useUsersWithConversations(currentUserId)
  
  useEffect(() => {
    if (currentUserId) {
      resetPagination()
      fetchUsers(1, true)
      fetchConversations()
    }
  }, [currentUserId, fetchUsers, fetchConversations, resetPagination])

  useConversationUpdates()

  return {
    usersWithConversations,
    loading: usersLoading || conversationsLoading,
    loadingMore: usersLoadingMore,
    error: usersError || conversationsError,
    loadMoreUsers,
    hasNextPage
  }
}

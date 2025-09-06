import { useState, useEffect } from 'react'
import { User, Conversation } from '@/types'
import { api } from '@/lib/api'

export interface UserWithConversation extends User {
  conversation?: Conversation
  unreadCount?: number
}

export const useUsersAndConversations = () => {
  const [users, setUsers] = useState<UserWithConversation[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [usersData, conversationsData] = await Promise.all([
        api.getUsers(),
        api.getConversations()
      ])

      setUsers(usersData)
      setConversations(conversationsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const createConversation = async (participantId: string): Promise<Conversation | null> => {
    try {
      const newConversation = await api.createConversation(participantId)
      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation')
      return null
    }
  }

  const refresh = () => {
    fetchData()
  }

  return {
    users,
    conversations,
    loading,
    error,
    createConversation,
    refresh
  }
}

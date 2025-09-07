import { create } from 'zustand'
import { Conversation } from '@/types'
import { api } from '@/lib/api'

interface ConversationState {
  conversations: Map<string, Conversation>
  loading: boolean
  error: string | null
  fetchConversations: () => Promise<void>
  getConversation: (id: string) => Conversation | undefined
  createConversation: (participantId: string) => Promise<Conversation | null>
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  markAsRead: (conversationId: string) => void
  clearError: () => void
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: new Map(),
  loading: false,
  error: null,

  fetchConversations: async () => {
    try {
      set({ loading: true, error: null })
      const conversations = await api.getConversations()
      
      const conversationMap = new Map<string, Conversation>()
      conversations.forEach(conv => conversationMap.set(conv.id, conv))
      
      set({ 
        conversations: conversationMap, 
        loading: false 
      })
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch conversations',
        loading: false 
      })
    }
  },

  getConversation: (id: string) => {
    return get().conversations.get(id)
  },

  createConversation: async (participantId: string) => {
    try {
      const newConversation = await api.createConversation(participantId)
      set(state => {
        const newConversations = new Map(state.conversations)
        newConversations.set(newConversation.id, newConversation)
        return { conversations: newConversations }
      })
      return newConversation
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to create conversation'
      })
      return null
    }
  },

  addConversation: (conversation: Conversation) => {
    set(state => {
      const newConversations = new Map(state.conversations)
      newConversations.set(conversation.id, conversation)
      return { conversations: newConversations }
    })
  },

  updateConversation: (id: string, updates: Partial<Conversation>) => {
    set(state => {
      const conversation = state.conversations.get(id)
      if (!conversation) return state

      const newConversations = new Map(state.conversations)
      newConversations.set(id, { ...conversation, ...updates })
      return { conversations: newConversations }
    })
  },

  markAsRead: (conversationId: string) => {
    get().updateConversation(conversationId, { unreadCount: 0 })
  },

  clearError: () => {
    set({ error: null })
  }
}))
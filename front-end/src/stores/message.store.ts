import { create } from 'zustand'
import { Message } from '@/types'

interface MessageState {
  messages: Map<string, Message[]>
  loading: boolean
  error: string | null

  // Actions
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (conversationId: string, message: Message) => void
  prependMessages: (conversationId: string, messages: Message[]) => void
  getMessages: (conversationId: string) => Message[]
  clearMessages: (conversationId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearAll: () => void
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: new Map(),
  loading: false,
  error: null,

  setMessages: (conversationId: string, messages: Message[]) => {
    set(state => {
      const newMessages = new Map(state.messages)
      newMessages.set(conversationId, messages)
      return { messages: newMessages }
    })
  },

  addMessage: (conversationId: string, message: Message) => {
    set(state => {
      const newMessages = new Map(state.messages)
      const existingMessages = newMessages.get(conversationId) || []
      
      // Evitar duplicatas
      const exists = existingMessages.some(m => m.id === message.id)
      if (exists) return state
      
      newMessages.set(conversationId, [...existingMessages, message])
      return { messages: newMessages }
    })
  },

  prependMessages: (conversationId: string, messages: Message[]) => {
    set(state => {
      const newMessages = new Map(state.messages)
      const existingMessages = newMessages.get(conversationId) || []
      newMessages.set(conversationId, [...messages, ...existingMessages])
      return { messages: newMessages }
    })
  },

  getMessages: (conversationId: string) => {
    return get().messages.get(conversationId) || []
  },

  clearMessages: (conversationId: string) => {
    set(state => {
      const newMessages = new Map(state.messages)
      newMessages.delete(conversationId)
      return { messages: newMessages }
    })
  },

  setLoading: (loading: boolean) => {
    set({ loading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearAll: () => {
    set({
      messages: new Map(),
      loading: false,
      error: null
    })
  }
}))

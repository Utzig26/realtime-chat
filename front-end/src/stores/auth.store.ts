import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'
import { destroySocket } from '@/lib/socket'
import { User, LoginRequest, RegisterRequest, ApiResponse } from '@/types'
import { useConversationStore } from './conversation.store'
import { useMessageStore } from './message.store'
import { useUserStore } from './user.store'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | { message: string; details?: Array<{field: string; message: string}> } | null
  hasCheckedAuth: boolean

  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasCheckedAuth: false,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null })

    try {
      const response = await api.post<ApiResponse<{ user: User }>>('/auth/login', credentials)
      
      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          hasCheckedAuth: true
        })
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      let errorData: string | { message: string; details?: Array<{field: string; message: string}> } = 'Login failed'
      
      if (error instanceof Error) {
        // Try to parse as JSON first (for validation errors)
        try {
          const parsed = JSON.parse(error.message)
          if (parsed.message && parsed.details) {
            errorData = parsed
          } else if (parsed.message) {
            // Simple error with just a message
            errorData = parsed.message
          } else {
            errorData = error.message
          }
        } catch {
          errorData = error.message
        }
      } else if (typeof error === 'string') {
        errorData = error
      } else if (error && typeof error === 'object') {
        // Handle ApiError or other error objects
        const errorObj = error as { message?: string; error?: string }
        errorData = errorObj.message || errorObj.error || 'Login failed'
      }
      
      set({
        isLoading: false,
        error: errorData,
        isAuthenticated: false,
        user: null
      })
      throw error
    }
  },

  register: async (userData: RegisterRequest) => {
    set({ isLoading: true, error: null })

    try {
      const response = await api.post<ApiResponse<{ user: User }>>('/auth/register', userData)
      
      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          hasCheckedAuth: true
        })
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (error) {
      let errorData: string | { message: string; details?: Array<{field: string; message: string}> } = 'Registration failed'
      
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message)
          if (parsed.message && parsed.details) {
            errorData = parsed
          } else if (parsed.message) {
            errorData = parsed.message
          } else {
            errorData = error.message
          }
        } catch {
          errorData = error.message
        }
      } else if (typeof error === 'string') {
        errorData = error
      } else if (error && typeof error === 'object') {
        const errorObj = error as { message?: string; error?: string }
        errorData = errorObj.message || errorObj.error || 'Registration failed'
      }
      
      set({
        isLoading: false,
        error: errorData,
        isAuthenticated: false,
        user: null
      })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true })

    try {
      await api.post('/auth/logout')
    } catch {
      console.warn('Logout API call failed')
    } finally {
      destroySocket()
      
      useConversationStore.getState().clearAll()
      useMessageStore.getState().clearAll()
      useUserStore.getState().clearAll()
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        hasCheckedAuth: false
      })
    }
  },

  checkAuth: async () => {
    const { hasCheckedAuth, isLoading } = get()
    
    if (hasCheckedAuth || isLoading) {
      return
    }

    set({ isLoading: true })

    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/users/me')
      
      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          hasCheckedAuth: true
        })
      } else {
        throw new Error('Not authenticated')
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        hasCheckedAuth: true
      })
    }
  },

  clearError: () => {
    set({ error: null })
  }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasCheckedAuth: state.hasCheckedAuth
      }),
    }
  )
)
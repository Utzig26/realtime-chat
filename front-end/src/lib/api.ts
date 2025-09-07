import { User, Conversation, ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  }

  const response = await fetch(url, { ...defaultOptions, ...options })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new ApiError(response.status, errorData.error || errorData.message || 'Request failed')
  }

  return response.json()
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'GET' })
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  async getUsers(page: number = 1, limit: number = 20): Promise<{
    users: User[]
    pagination: {
      page: number
      limit: number
      totalUsers: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }> {
    const response = await apiRequest<ApiResponse<{
      users: User[]
      pagination: {
        page: number
        limit: number
        totalUsers: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
      }
    }>>(`/users?page=${page}&limit=${limit}`)
    
    return {
      users: response.data?.users || [],
      pagination: response.data?.pagination || {
        page: 1,
        limit: 20,
        totalUsers: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  },

  async getConversations(): Promise<Conversation[]> {
    const response = await apiRequest<ApiResponse<Conversation[]>>('/conversations')
    return response.data || []
  },

  async createConversation(participantId: string): Promise<Conversation> {
    const response = await apiRequest<ApiResponse<Conversation>>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    })
    return response.data!
  },
}

export { ApiError }
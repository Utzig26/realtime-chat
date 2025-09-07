import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'
import { User, Conversation, ApiResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data as { error?: string; message?: string }
      const message = errorData?.error || errorData?.message || error.message || 'Request failed'
      throw new ApiError(status, message)
    } else if (error.request) {
      throw new ApiError(0, 'Network error - no response received')
    } else {
      throw new ApiError(0, error.message || 'Request failed')
    }
  }
)

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await axiosInstance.get<T>(endpoint)
    return response.data
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await axiosInstance.post<T>(endpoint, data)
    return response.data
  },

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await axiosInstance.put<T>(endpoint, data)
    return response.data
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await axiosInstance.delete<T>(endpoint)
    return response.data
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
    const response = await axiosInstance.get<ApiResponse<{
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
      users: response.data.data?.users || [],
      pagination: response.data.data?.pagination || {
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
    const response = await axiosInstance.get<ApiResponse<Conversation[]>>('/conversations')
    return response.data.data || []
  },

  async createConversation(participantId: string): Promise<Conversation> {
    const response = await axiosInstance.post<ApiResponse<Conversation>>('/conversations', { participantId })
    return response.data.data!
  },
}

export { ApiError }
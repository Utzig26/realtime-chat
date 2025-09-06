import { api } from './api'
import { User, ApiResponse, PaginatedResponse, PaginationMeta } from '../types'

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
}

export interface UpdateProfileRequest {
  username?: string
  email?: string
  name?: string
}

export const getUsers = async (params: GetUsersParams = {}): Promise<PaginatedResponse<User>> => {
  const { page = 1, limit = 10, search } = params
  const response = await api.get<ApiResponse<{ users: User[], pagination: PaginationMeta }>>('/users', {
    params: { page, limit, search }
  })
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch users')
  }

  return {
    items: response.data.data.users,
    pagination: response.data.data.pagination
  }
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>('/users/me')
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch current user')
  }
  return response.data.data
}

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get<ApiResponse<User>>(`/users/${id}`)
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch user')
  }
  return response.data.data
}

export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
  const response = await api.put<ApiResponse<User>>('/users/me', data)
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to update profile')
  }
  return response.data.data
}

import { api } from './api'
import { User, PaginatedResponse, PaginationMeta } from '../types'

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
}


export const getUsers = async (params: GetUsersParams = {}): Promise<PaginatedResponse<User>> => {
  const { page = 1, limit = 10, search } = params
  const queryParams = new URLSearchParams({ 
    page: page.toString(), 
    limit: limit.toString(),
    ...(search && { search })
  })
  const response = await api.get<{ users: User[], pagination: PaginationMeta }>(`/users?${queryParams}`)
  
  if (!response.users || !response.pagination) {
    throw new Error('Failed to fetch users')
  }

  return {
    items: response.users,
    pagination: response.pagination
  }
}


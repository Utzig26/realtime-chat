import { useState, useEffect, useCallback } from 'react'
import { User, PaginatedResponse } from '../types'
import { getUsers } from '../lib/users'

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const fetchUsers = useCallback(async (page = 1, limit = 20, search?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response: PaginatedResponse<User> = await getUsers({ page, limit, search })
      
      if (page === 1) {
        setUsers(response.items)
      } else {
        setUsers(prev => {
          const existingIds = new Set(prev.map(user => user.id))
          const newUsers = response.items.filter(user => !existingIds.has(user.id))
          return [...prev, ...newUsers]
        })
      }
      
      setPagination(response.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (pagination.page < pagination.pages && !loading) {
      const nextPage = pagination.page + 1
      await fetchUsers(nextPage, pagination.limit)
    }
  }, [pagination, loading, fetchUsers])

  const searchUsers = useCallback(async (searchTerm: string) => {
    await fetchUsers(1, pagination.limit, searchTerm)
  }, [fetchUsers, pagination.limit])

  const refreshUsers = useCallback(async () => {
    await fetchUsers(1, pagination.limit)
  }, [fetchUsers, pagination.limit])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    loadMore,
    searchUsers,
    refreshUsers,
    hasMore: pagination.page < pagination.pages
  }
}

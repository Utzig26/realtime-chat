import { create } from 'zustand'
import { User } from '@/types'
import { api } from '@/lib/api'

interface UserState {
  users: Map<string, User>
  loading: boolean
  error: string | null
  lastFetched: number | null
  
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  totalUsers: number
  totalPages: number
  loadingMore: boolean

  fetchUsers: (page?: number, reset?: boolean) => Promise<void>
  loadMoreUsers: () => Promise<void>
  getUser: (id: string) => User | undefined
  updateUser: (user: User) => void
  addUser: (user: User) => void
  clearError: () => void
  resetPagination: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  users: new Map(),
  loading: false,
  error: null,
  lastFetched: null,
  
  currentPage: 1,
  hasNextPage: false,
  hasPrevPage: false,
  totalUsers: 0,
  totalPages: 0,
  loadingMore: false,

  fetchUsers: async (page: number = 1, reset: boolean = true) => {
    const now = Date.now()
    try {
      set({ loading: true, error: null })
      const { users, pagination } = await api.getUsers(page, 20)
      
      let userMap = new Map<string, User>()
      
      if (reset || page === 1) {
        users.forEach(user => userMap.set(user.id, user))
      } else {
        const existingUsers = get().users
        users.forEach(user => existingUsers.set(user.id, user))
        userMap = existingUsers
      }
      
      set({ 
        users: userMap, 
        loading: false, 
        lastFetched: now,
        currentPage: pagination.page,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
        totalUsers: pagination.totalUsers,
        totalPages: pagination.totalPages
      })
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch users',
        loading: false 
      })
    }
  },

  loadMoreUsers: async () => {
    const { currentPage, hasNextPage, loadingMore } = get()
    
    if (!hasNextPage || loadingMore) return

    try {
      set({ loadingMore: true, error: null })
      const { users, pagination } = await api.getUsers(currentPage + 1, 20)
      
      set(state => {
        const newUsers = new Map(state.users)
        users.forEach(user => newUsers.set(user.id, user))
        
        return {
          users: newUsers,
          loadingMore: false,
          currentPage: pagination.page,
          hasNextPage: pagination.hasNextPage,
          hasPrevPage: pagination.hasPrevPage,
          totalUsers: pagination.totalUsers,
          totalPages: pagination.totalPages
        }
      })
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to load more users',
        loadingMore: false 
      })
    }
  },

  getUser: (id: string) => {
    return get().users.get(id)
  },

  updateUser: (user: User) => {
    set(state => {
      const newUsers = new Map(state.users)
      newUsers.set(user.id, user)
      return { users: newUsers }
    })
  },

  addUser: (user: User) => {
    set(state => {
      const newUsers = new Map(state.users)
      newUsers.set(user.id, user)
      return { users: newUsers }
    })
  },

  clearError: () => {
    set({ error: null })
  },

  resetPagination: () => {
    set({
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      totalUsers: 0,
      totalPages: 0,
      loadingMore: false,
      users: new Map(),
      lastFetched: null
    })
  }
}))

export interface User {
  id: string
  username: string
  name: string
  email: string
  lastSeen?: string
  createdAt: string
  isOnline?: boolean
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
  statusMap: Record<string, 'sent' | 'delivered' | 'read'>
}

export interface Conversation {
  id: string
  participants: User[]
  unreadCount?: number
  createdAt: string
  updatedAt: string
  lastMessageAt?: string
  lastMessage?: Message
}

export interface AuthResponse {
  user: User
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  name: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}


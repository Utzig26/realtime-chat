'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { OverlayLoading } from './Loading'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export default function AuthGuard({ 
  children, 
  redirectTo = '/login', 
  requireAuth = true 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo)
      } else if (!requireAuth && isAuthenticated) {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo, requireAuth])

  if (isLoading) {
    return <OverlayLoading />
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loading } from './Loading'

interface PageLoaderProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  children,
  requireAuth = false
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push('/login')
      } else if (!requireAuth && isAuthenticated) {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, router, requireAuth])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) return null
  if (!requireAuth && isAuthenticated) return null

  return <>{children}</>
}

export default PageLoader

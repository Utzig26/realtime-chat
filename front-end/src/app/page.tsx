'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { OverlayLoading } from '@/components/Loading'

export default function Home() {
  const { isAuthenticated, isLoading, hasCheckedAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (hasCheckedAuth && !isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, hasCheckedAuth, router])

  if (isLoading || !hasCheckedAuth) {
    return <OverlayLoading />
  }
  return null
}

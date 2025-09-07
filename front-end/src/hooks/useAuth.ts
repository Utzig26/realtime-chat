import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'

export const useAuth = () => {
  const authStore = useAuthStore()

  useEffect(() => {
    if (!authStore.hasCheckedAuth) {
      authStore.checkAuth()
    }
  }, [authStore.hasCheckedAuth, authStore.checkAuth, authStore])

  return authStore
}

'use client'

import PageLayout from '@/components/PageLayout'
import PageLoader from '@/components/PageLoader'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <PageLayout>
      <PageLoader requireAuth={false}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-black mb-2">
                Acesse sua conta
              </h2>
              <p className="text-gray-700">
                Insira suas credenciais para fazer login
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </PageLoader>
    </PageLayout>
  )
}

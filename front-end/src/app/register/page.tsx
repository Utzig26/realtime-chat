'use client'

import PageLayout from '@/components/PageLayout'
import PageLoader from '@/components/PageLoader'
import RegisterForm from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <PageLayout>
      <PageLoader requireAuth={false}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-black mb-2">
                Criar nova conta
              </h2>
              <p className="text-gray-700">
                Preencha os dados para se cadastrar
              </p>
            </div>
            <RegisterForm />
          </div>
        </div>
      </PageLoader>
    </PageLayout>
  )
}

'use client'

import PageLayout from '@/components/PageLayout'
import PageLoader from '@/components/PageLoader'

export default function Home() {
  return (
    <PageLayout>
      <PageLoader>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-12">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Welcome to Realtime Chat
              </h1>
              <p className="text-gray-600">
                Redirecting you to the appropriate page...
              </p>
            </div>
          </div>
        </div>
      </PageLoader>
    </PageLayout>
  )
}

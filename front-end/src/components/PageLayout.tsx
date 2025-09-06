import React from 'react'

interface PageLayoutProps {
  children: React.ReactNode
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 via-purple-900 to-pink-600">
      {children}
    </div>
  )
}

export default PageLayout

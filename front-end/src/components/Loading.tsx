import React from 'react'

interface LoadingProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  inline?: boolean
  fullScreen?: boolean
  overlay?: boolean
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  className = '',
  inline = false,
  overlay = false
}) => {
  const spinner = (
    <div className="relative">
      <div className={`${sizeClasses[size]} border-2 border-gray-200 rounded-full animate-spin`}>
        <div className={`w-full h-full border-2 border-transparent border-t-blue-500 rounded-full animate-spin`}></div>
      </div>
    </div>
  )

  const content = inline ? (
    spinner
  ) : (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {spinner}
    </div>
  )

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/30">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-blue-100 rounded-full animate-spin">
                <div className="w-full h-full border-3 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return content
}

export const Spinner = Loading
export const InlineLoading = (props: Omit<LoadingProps, 'inline'>) => 
  <Loading inline size="sm" {...props} />
export const OverlayLoading = (props: Omit<LoadingProps, 'overlay'>) => 
  <Loading overlay {...props} />

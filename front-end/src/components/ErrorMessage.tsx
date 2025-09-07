'use client'

interface ErrorMessageProps {
  error: string | { message: string; details?: Array<{field: string; message: string}> } | null
  className?: string
}

export default function ErrorMessage({ error, className = '' }: ErrorMessageProps) {
  if (!error) return null

  if (typeof error === 'object' && error.details && error.details.length > 0) {
    return (
      <div className={`p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg ${className}`}>
        <div className="font-medium mb-2">{error.message}</div>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {error.details.map((detail, index) => (
            <li key={index}>
              <span className="capitalize font-medium">{detail.field}:</span> {detail.message}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className={`p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg ${className}`}>
      {typeof error === 'string' ? error : error.message}
    </div>
  )
}

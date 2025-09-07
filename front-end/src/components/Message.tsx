'use client'

import { Message as MessageType } from '@/types'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MessageProps {
  message: MessageType
  isOwn: boolean
  showAvatar?: boolean
  showTime?: boolean
}

export default function Message({ 
  message, 
  isOwn, 
  showAvatar = false, 
  showTime = true 
}: MessageProps) {

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            ?
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "flex flex-col max-w-[70%] min-w-0",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "px-4 py-2 rounded-2xl break-words overflow-hidden",
          isOwn 
            ? "bg-blue-500 text-white rounded-br-md" 
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        )}>
          <p className="text-sm leading-relaxed break-all hyphens-auto">{message.text}</p>
        </div>

        {/* Time */}
        {showTime && (
          <div className={cn(
            "flex items-center gap-1 mt-1 text-xs text-gray-500",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}>
            <span>{formatTime(message.createdAt)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

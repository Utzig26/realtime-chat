'use client'

import { UserWithConversation } from '@/hooks/useUsersWithConversations'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'

interface UserListItemProps {
  user: UserWithConversation
  currentUserId: string
  isSelected?: boolean
  onClick: (user: UserWithConversation) => void
}

export default function UserListItem({ user, currentUserId, isSelected = false, onClick }: UserListItemProps) {
  const otherUser = user.conversation?.participants.find(p => p.id !== currentUserId)
  const displayUser = otherUser || user

  const getLastMessageText = () => {
    const lastMessage = user.conversation?.lastMessage 
    if (!lastMessage) return ''
    return lastMessage?.senderId === currentUserId? `Você: ${lastMessage.text}` : lastMessage.text
  }

  const hasUnreadMessages = (user.unreadCount || 0) > 0
  const hasConversation = !!user.conversation
  const getAvatarClasses = () => {
    if (hasConversation) {
      return "w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg"
    } else {
      return "w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-lg"
    }
  }

  return (
    <div
      className={cn(
        "flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors",
        hasUnreadMessages && "bg-blue-50",
        isSelected && "bg-blue-100 border-l-4 border-l-blue-500"
      )}
      onClick={() => onClick(user)}
    >
      <div className="relative flex-shrink-0">
        <div className={getAvatarClasses()}>
          {displayUser.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="flex-1 min-w-0 ml-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {displayUser.name}
            </h3>
            {user.conversation && (
              <div className="flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          {hasUnreadMessages && (
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                {user.unreadCount}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          {user.conversation?.lastMessageAt && (
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatTime(user.conversation.lastMessageAt)}
            </span>
          )}
        </div>

        <p className={"text-xs mt-1 truncate text-gray-500"}>
          {getLastMessageText()}
        </p>
      </div>
    </div>
  )
}

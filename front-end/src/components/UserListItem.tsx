'use client'

import { UserWithConversation } from '@/hooks/useUsersAndConversations'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface UserListItemProps {
  user: UserWithConversation
  currentUserId: string
  isSelected?: boolean
  onClick: (user: UserWithConversation) => void
}

export default function UserListItem({ user, currentUserId, isSelected = false, onClick }: UserListItemProps) {
  const isCurrentUser = user.id === currentUserId
  const otherUser = user.conversation?.participants.find(p => p.id !== currentUserId)
  const displayUser = otherUser || user

  const getStatusText = () => {
    if (isCurrentUser) return 'You'
    if (displayUser.isOnline) return 'Online'
    if (displayUser.lastSeen) {
      return `Last seen ${formatTime(displayUser.lastSeen)}`
    }
    return 'Offline'
  }

  const getStatusColor = () => {
    if (isCurrentUser) return 'text-gray-500'
    if (displayUser.isOnline) return 'text-green-500'
    return 'text-gray-400'
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
        {displayUser.isOnline && !isCurrentUser && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>

      <div className="flex-1 min-w-0 ml-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {displayUser.name}
            </h3>
            {user.conversation && (
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
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
          <p className="text-sm text-gray-500 truncate">
            @{displayUser.username}
          </p>
          {user.conversation?.lastMessageAt && (
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatTime(user.conversation.lastMessageAt)}
            </span>
          )}
        </div>

        <p className={cn("text-xs mt-1", getStatusColor())}>
          {getStatusText()}
        </p>
      </div>
    </div>
  )
}

import { UserResponse } from './user.types';
import { MessageResponse } from './message.types';

export interface Conversation {
  id: string;
  participants: [string, string];
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

export interface CreateConversationRequest {
  participantId: string;
}

export interface ConversationResponse {
  id: string;
  participants: UserResponse[];
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}

export interface ConversationWithLastMessage extends ConversationResponse {
  lastMessage?: {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    createdAt: Date;
  };
}

export interface GetConversationMessagesRequest {
  conversationId: string;
  limit?: number;
  before?: string;
}

export interface ConversationMessagesResponse {
  messages: MessageResponse[];
  hasMore: boolean;
  nextCursor?: string;
}


export interface CreateMessageRequest {
  conversationId: string;
  text: string;
}

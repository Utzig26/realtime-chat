export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
  statusMap?: Record<string, 'sent' | 'delivered' | 'read'> | undefined;
}

export interface CreateMessageRequest {
  conversationId: string;
  text: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  text: string;
  createdAt: Date;
  statusMap?: Record<string, 'sent' | 'delivered' | 'read'> | undefined;
}

export interface GetMessagesRequest {
  conversationId: string;
  limit?: number;
  before?: string;
}

export interface MessagesResponse {
  messages: MessageResponse[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface MessageWithSender extends Message {
  sender: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface MarkMessagesAsReadResponse {
  markedCount: number;
}

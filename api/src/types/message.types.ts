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


export interface MessagesResponse {
  messages: MessageResponse[];
  hasMore: boolean;
  nextCursor?: string;
}


export interface MessageNotification {
  senderId: string;
  senderName: string;
  senderUsername: string;
  conversationId: string;
  messageId: string;
  text: string;
  timestamp: string;
}

export interface UnreadCountUpdate {
  conversationId: string;
  unreadCount: number;
}


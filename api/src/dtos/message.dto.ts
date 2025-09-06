import { MessageResponse, MessagesResponse } from '../types/message.types';

export class MessageResponseDTO implements MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderUsername: string;
  text: string;
  createdAt: Date;
  statusMap?: Record<string, 'sent' | 'delivered' | 'read'> | undefined;

  constructor(message: any) {
    this.id = message._id?.toString() || message.id;
    this.conversationId = message.conversationId?.toString() || message.conversationId;
    
    this.senderId = message.senderId._id.toString();
    this.senderName = message.senderName || message.sender?.name;
    this.senderUsername = message.senderUsername || message.sender?.username;
    
    this.text = message.text;
    this.createdAt = message.createdAt;
    this.statusMap = message.statusMap ? Object.fromEntries(message.statusMap) as Record<string, 'sent' | 'delivered' | 'read'> : undefined;
  }

  toJSON(): MessageResponse {
    return {
      id: this.id,
      conversationId: this.conversationId,
      senderId: this.senderId,
      senderName: this.senderName,
      senderUsername: this.senderUsername,
      text: this.text,
      createdAt: this.createdAt,
      ...(this.statusMap && { statusMap: this.statusMap })
    };
  }
}

export class MessagesResponseDTO implements MessagesResponse {
  messages: MessageResponseDTO[];
  hasMore: boolean;
  nextCursor?: string;

  constructor(messages: any[], hasMore: boolean = false, nextCursor?: string) {
    this.messages = messages.map(message => new MessageResponseDTO(message));
    this.hasMore = hasMore;
    if (nextCursor !== undefined) {
      this.nextCursor = nextCursor;
    }
  }

  toJSON(): MessagesResponse {
    return {
      messages: this.messages.map(message => message.toJSON()),
      hasMore: this.hasMore,
      ...(this.nextCursor && { nextCursor: this.nextCursor })
    };
  }
}

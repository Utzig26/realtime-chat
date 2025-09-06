import { ConversationResponse, ConversationWithLastMessage } from '../types/conversation.types';
import { UserResponseDTO } from './user.dto';

export class ConversationResponseDTO implements ConversationResponse {
  id: string;
  participants: UserResponseDTO[];
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;

  constructor(conversation: any, userId?: string) {
    this.id = conversation._id?.toString() || conversation.id;
    this.participants = conversation.participants?.map((participant: any) => 
      new UserResponseDTO(participant)
    ) || [];
    this.createdAt = conversation.createdAt;
    this.updatedAt = conversation.updatedAt;
    this.lastMessageAt = conversation.lastMessageAt;
    
    if (userId && conversation.unreadMessages) {
      this.unreadCount = conversation.unreadMessages.get(userId) || 0;
    }
  }

  toJSON(): ConversationResponse {
    return {
      id: this.id,
      participants: this.participants.map(p => p.toJSON()),
      ...(this.unreadCount !== undefined && { unreadCount: this.unreadCount }),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...(this.lastMessageAt && { lastMessageAt: this.lastMessageAt })
    };
  }
}

export class ConversationWithLastMessageDTO extends ConversationResponseDTO implements ConversationWithLastMessage {
  lastMessage?: {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    createdAt: Date;
  };

  constructor(conversation: any, userId?: string) {
    super(conversation, userId);
    
    if (conversation.lastMessage) {
      this.lastMessage = {
        id: conversation.lastMessage._id?.toString() || conversation.lastMessage.id,
        text: conversation.lastMessage.text,
        senderId: conversation.lastMessage.senderId?.toString() || conversation.lastMessage.senderId,
        senderName: conversation.lastMessage.senderName || conversation.lastMessage.sender?.name,
        createdAt: conversation.lastMessage.createdAt
      };
    }
  }

  toJSON(): ConversationWithLastMessage {
    return {
      ...super.toJSON(),
      ...(this.lastMessage && { lastMessage: this.lastMessage })
    };
  }
}

export class ConversationListResponseDTO {
  conversations: ConversationWithLastMessageDTO[];

  constructor(conversations: any[], userId?: string) {
    this.conversations = conversations.map(conversation => 
      new ConversationWithLastMessageDTO(conversation, userId)
    );
  }

  toJSON() {
    return {
      conversations: this.conversations.map(conversation => conversation.toJSON())
    };
  }
}

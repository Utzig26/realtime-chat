import { MessageModel } from '../models';
import { ConversationModel } from '../models';
import { MessageResponseDTO, MessagesResponseDTO } from '../dtos/message.dto';
import { ConversationValidator } from './conversation-validator.service';
import mongoose from 'mongoose';

export class MessageService {
  static async sendMessage(
    conversationId: string, 
    senderId: string, 
    text: string
  ): Promise<MessageResponseDTO> {
    await ConversationValidator.validateConversationAccess(conversationId, senderId);

    const message = await MessageModel.create({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: new mongoose.Types.ObjectId(senderId),
      text: text.trim()
    });

    await message.populate('senderId', 'name username avatarUrl');

    const populatedMessage = message as any;
    await ConversationModel.updateLastMessage(conversationId, {
      _id: populatedMessage._id,
      text: populatedMessage.text,
      senderId: populatedMessage.senderId._id,
      senderName: populatedMessage.senderId.name,
      createdAt: populatedMessage.createdAt
    });

    return new MessageResponseDTO(message);
  }

  static async getMessages(
    conversationId: string, 
    userId: string, 
    limit: number = 20, 
    before?: string | undefined
  ): Promise<MessagesResponseDTO> {
    await ConversationValidator.validateConversationAccess(conversationId, userId);

    const messages = await MessageModel.findConversationMessages(conversationId, limit + 1, before);
    
    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop();
    }

    const nextCursor = hasMore && messages.length > 0 ? messages[messages.length - 1]?._id.toString() : undefined;

    return new MessagesResponseDTO(messages, hasMore, nextCursor);
  }

  static async markConversationMessagesAsRead(conversationId: string, userId: string): Promise<{ markedCount: number }> {
    await ConversationValidator.validateConversationAccess(conversationId, userId);

    const result = await MessageModel.updateMany(
      {
        conversationId: new mongoose.Types.ObjectId(conversationId),
        $or: [
          { [`statusMap.${userId}`]: { $exists: false } },
          { [`statusMap.${userId}`]: { $ne: 'read' } }
        ]
      },
      {
        $set: {
          [`statusMap.${userId}`]: 'read'
        }
      }
    );

    await ConversationModel.resetUnreadCount(conversationId, userId);

    return { markedCount: result.modifiedCount };
  }
}

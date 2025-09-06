import { MessageModel } from '../models';
import { ConversationModel } from '../models';
import { MessageResponseDTO, MessagesResponseDTO } from '../dtos/message.dto';
import { NotFoundError, ValidationError } from '../errors';
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

    const conversation = await ConversationModel.findById(conversationId);
    if (conversation) {
      const otherParticipants = conversation.participants.filter(
        (participantId: any) => participantId.toString() !== senderId
      );
      
      for (const participantId of otherParticipants) {
        await ConversationModel.incrementUnreadCount(conversationId, participantId.toString());
      }

      await ConversationModel.findByIdAndUpdate(conversationId, {
        lastMessageAt: new Date()
      });
    }

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

  static async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(messageId, {
      $set: {
        [`statusMap.${userId}`]: 'read'
      }
    });
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

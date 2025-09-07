import { ConversationModel } from '../models';
import { ConversationResponseDTO, ConversationWithLastMessageDTO } from '../dtos/conversation.dto';
import { ConflictError, NotFoundError, ValidationError } from '../errors';
import { ConversationValidator } from './conversation-validator.service';
import { getSocketInstance } from '../config/socket';
import mongoose from 'mongoose';

export class ConversationService {
  static async createConversation(userId: string, participantId: string): Promise<ConversationResponseDTO> {
    if (userId === participantId) {
      throw new ValidationError('Cannot create conversation with yourself');
    }

    const participant = await ConversationModel.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(participantId) });
    if (!participant) {
      throw new NotFoundError('Participant not found');
    }

    const existingConversation = await ConversationModel.findConversation(userId, participantId);
    if (existingConversation) {
      throw new ConflictError('Conversation already exists');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const participantObjectId = new mongoose.Types.ObjectId(participantId);
    
    const participants = [userObjectId, participantObjectId].sort((a, b) => 
      a.toString().localeCompare(b.toString())
    );

    const conversation = await ConversationModel.create({
      participants: participants
    });

    await conversation.populate('participants', 'name username');

    const io = getSocketInstance();
    if (io) {
      const notification = {
        conversationId: conversation._id.toString(),
        timestamp: new Date().toISOString()
      };

      io.to(`user_${participantId}`).emit('notification:new_conversation', notification);
    }

    return new ConversationResponseDTO(conversation, userId);
  }
  
  static async updateLastMessageAt(conversationId: string, recipientUserId: string): Promise<void> {
    const conversation = await ConversationModel.incrementUnreadCount(conversationId, recipientUserId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }
  }

  static async getUserConversations(userId: string): Promise<ConversationWithLastMessageDTO[]> {
    const conversations = await ConversationModel.find({
      participants: userId
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate('participants', 'name username');

    return conversations.map((conversation: any) => new ConversationWithLastMessageDTO(conversation, userId));
  }

  static async getConversationById(conversationId: string, userId: string): Promise<ConversationResponseDTO> {
    const conversation = await ConversationValidator.validateConversationAccess(conversationId, userId);
    
    await conversation.populate('participants', 'name username');

    return new ConversationResponseDTO(conversation, userId);
  }
}

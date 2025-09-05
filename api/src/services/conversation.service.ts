import { ConversationModel } from '../models';
import { ConversationResponseDTO } from '../dtos/conversation.dto';
import { ConflictError, NotFoundError, ValidationError } from '../errors';
import { ConversationValidator } from './conversation-validator.service';
import mongoose from 'mongoose';

export class ConversationService {
  static async createConversation(userId: string, participantId: string): Promise<ConversationResponseDTO> {
    const participant = await ConversationModel.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(participantId) });
    if (!participant) {
      throw new NotFoundError('Participant not found');
    }

    const existingConversation = await ConversationModel.findConversation(userId, participantId);
    if (existingConversation) {
      throw new ConflictError('Conversation already exists');
    }

    const conversation = await ConversationModel.create({
      participants: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(participantId)]
    });

    await conversation.populate('participants', 'name username');

    return new ConversationResponseDTO(conversation);
  }

  static async getUserConversations(userId: string): Promise<ConversationResponseDTO[]> {
    const conversations = await ConversationModel.find({
      participants: userId
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate('participants', 'name username');

    return conversations.map((conversation: any) => new ConversationResponseDTO(conversation));
  }

  static async getConversationById(conversationId: string, userId: string): Promise<ConversationResponseDTO> {
    const conversation = await ConversationValidator.validateConversationAccess(conversationId, userId);
    
    await conversation.populate('participants', 'name username');

    return new ConversationResponseDTO(conversation);
  }
}

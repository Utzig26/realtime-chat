import { ConversationModel } from '../models';
import { NotFoundError, ValidationError } from '../errors';
import mongoose from 'mongoose';

export class ConversationValidator {

  static async validateConversationAccess(
    conversationId: string, 
    userId: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new ValidationError('Invalid conversation ID');
    }

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      participant => participant.toString() === userId
    );

    if (!isParticipant) {
      throw new NotFoundError('Conversation not found');
    }

    return conversation;
  }

  static async validateConversationExists(conversationId: string) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new ValidationError('Invalid conversation ID');
    }

    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    return conversation;
  }

  static validateUserParticipation(conversation: any, userId: string): boolean {
    const isParticipant = conversation.participants.some(
      (participant: any) => participant.toString() === userId
    );

    if (!isParticipant) {
      throw new NotFoundError('Conversation not found');
    }

    return true;
  }
}

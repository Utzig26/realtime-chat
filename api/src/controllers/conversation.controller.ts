import { Request, Response } from 'express';
import { ConversationService } from '../services/conversation.service';
import { asyncHandler } from '../middleware';
import { createConversationSchema, getConversationByIdSchema } from '../schemas/conversation.schema';
import { User } from '../types/user.types';

export class ConversationController {
  static createConversation = asyncHandler(async (req: Request, res: Response) => {
    const { participantId } = createConversationSchema.parse(req.body);
    const userId = (req.user as User).id.toString();

    const conversation = await ConversationService.createConversation(userId, participantId);
    
    res.created(conversation.toJSON(), 'Conversation created successfully');
  });

  static getUserConversations = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as User).id.toString();

    const conversations = await ConversationService.getUserConversations(userId);
    
    res.success(conversations.map(conv => conv.toJSON()), 'Conversations retrieved successfully');
  });

  static getConversationById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = getConversationByIdSchema.parse(req.params);
    const userId = (req.user as User).id.toString();

    const conversation = await ConversationService.getConversationById(id, userId);
    
    res.success(conversation.toJSON(), 'Conversation retrieved successfully');
  });
}

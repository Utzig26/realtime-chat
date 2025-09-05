import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { asyncHandler } from '../middleware';
import { getConversationMessagesSchema } from '../schemas/conversation.schema';
import { markConversationMessagesAsReadSchema } from '../schemas/message.schema';
import { IUser } from '../models/User';
import { User } from '../types/user.types';


export class MessageController {
  static getMessages = asyncHandler(async (req: Request, res: Response) => {
    const { id: conversationId } = req.params;
    const userId = (req.user as User).id.toString();
    const { limit = 20, before } = getConversationMessagesSchema.parse(req.query);

    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    const messages = await MessageService.getMessages(conversationId, userId, limit, before ?? undefined);
    
    res.success(messages.toJSON(), 'Messages retrieved successfully');
  });

  static markConversationMessagesAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { conversationId } = markConversationMessagesAsReadSchema.parse(req.params);
    const userId = (req.user as User).id.toString();

    const result = await MessageService.markConversationMessagesAsRead(conversationId, userId);
    
    res.success(result, `${result.markedCount} messages marked as read`);
  });
}

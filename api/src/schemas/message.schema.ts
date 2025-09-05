import { z } from 'zod';
import { objectIdSchema, paginationLimitSchema, messageTextSchema } from './common.schema';

export const createMessageSchema = z.object({
  conversationId: objectIdSchema,
  text: messageTextSchema
});

export const markConversationMessagesAsReadSchema = z.object({
  conversationId: objectIdSchema
});

export const getMessagesSchema = z.object({
  conversationId: objectIdSchema,
  limit: paginationLimitSchema,
  before: objectIdSchema.optional()
});

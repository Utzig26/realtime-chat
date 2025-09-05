import { z } from 'zod';
import { objectIdSchema, paginationLimitSchema } from './common.schema';

export const createConversationSchema = z.object({
  participantId: objectIdSchema
});

export const getConversationByIdSchema = z.object({
  id: objectIdSchema
});

export const getConversationMessagesSchema = z.object({
  limit: paginationLimitSchema,
  before: objectIdSchema.optional()
});

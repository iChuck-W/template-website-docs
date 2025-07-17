import { z } from 'zod';

// Message type definition
const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});

export const postRequestBodySchema = z.object({
  // Current user message
  message: z.string().min(1).max(2000),
  // Complete conversation history (optional, used to maintain context)
  messages: z.array(messageSchema).optional().default([]),
  // Selected model
  selectedChatModel: z
    .enum(['deepseek-chat'])
    .optional()
    .default('deepseek-chat'),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;

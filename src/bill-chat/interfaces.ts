import { z } from 'zod';

// Chat message schemas
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string().optional(),
});

export const ChatSessionSchema = z.object({
  sessionId: z.string(),
  billId: z.string(),
  userId: z.string(),
  messages: z.array(ChatMessageSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ChatRequestSchema = z.object({
  billId: z.string(),
  message: z.string().min(1),
  sessionId: z.string().optional(),
});

export const ChatResponseSchema = z.object({
  sessionId: z.string(),
  message: ChatMessageSchema,
  billContext: z.object({
    title: z.string(),
    summary: z.string().optional(),
  }).optional(),
});

// Response types
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatSession = z.infer<typeof ChatSessionSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export interface BillContext {
  billId: string;
  title: string;
  fullText: string;
  metadata: Record<string, any>;
}

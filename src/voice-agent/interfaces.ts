import { z } from 'zod';

// ElevenLabs API schemas
export const VoiceQuerySchema = z.object({
  audioData: z.instanceof(ArrayBuffer).or(z.string()), // base64 or ArrayBuffer
  format: z.enum(['mp3', 'wav', 'webm']),
  language: z.string().default('en'),
});

export const VoiceResponseSchema = z.object({
  transcription: z.string(),
  response: z.string(),
  audioUrl: z.string().url().optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const ConversationContextSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  history: z.array(z.object({
    userQuery: z.string(),
    agentResponse: z.string(),
    timestamp: z.string(),
  })),
});

// Response types
export type VoiceQuery = z.infer<typeof VoiceQuerySchema>;
export type VoiceResponse = z.infer<typeof VoiceResponseSchema>;
export type ConversationContext = z.infer<typeof ConversationContextSchema>;

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
}

export interface NLPIntent {
  intent: 'bill_search' | 'representative_info' | 'general_question';
  entities: Record<string, string>;
  confidence: number;
}

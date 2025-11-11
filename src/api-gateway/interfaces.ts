import { z } from 'zod';

// Request schemas
export const HealthCheckResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.number(),
  details: z.record(z.any()).optional(),
});

export const BillSearchQuerySchema = z.object({
  query: z.string().min(1),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export const ChatMessageSchema = z.object({
  billId: z.string(),
  message: z.string().min(1),
  sessionId: z.string().optional(),
});

// Response types
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type BillSearchQuery = z.infer<typeof BillSearchQuerySchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

// Route configuration
export interface RouteConfig {
  path: string;
  method: string;
  requiresAuth: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

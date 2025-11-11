import { z } from 'zod';

// Brave Search API response
export const NewsArticleSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  source: z.string(),
  publishedAt: z.string(),
  imageUrl: z.string().url().optional(),
  relevanceScore: z.number().min(0).max(1).optional(),
});

export const NewsQuerySchema = z.object({
  topics: z.array(z.string()).min(1),
  limit: z.number().int().positive().max(50).optional(),
  freshness: z.enum(['day', 'week', 'month']).optional(),
});

export const UserNewsPreferencesSchema = z.object({
  userId: z.string(),
  policyAreas: z.array(z.string()),
  excludeSources: z.array(z.string()).optional(),
});

// Response types
export type NewsArticle = z.infer<typeof NewsArticleSchema>;
export type NewsQuery = z.infer<typeof NewsQuerySchema>;
export type UserNewsPreferences = z.infer<typeof UserNewsPreferencesSchema>;

export interface NewsAggregationResult {
  articles: NewsArticle[];
  totalResults: number;
  cacheHit: boolean;
}

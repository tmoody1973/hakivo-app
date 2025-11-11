import { z } from 'zod';

// News sync task schemas
export const NewsSyncJobSchema = z.object({
  jobId: z.string(),
  userId: z.string().optional(), // null for system-wide sync
  startedAt: z.string(),
  completedAt: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  usersProcessed: z.number().int().nonnegative().optional(),
  articlesCollected: z.number().int().nonnegative().optional(),
  errors: z.array(z.string()).optional(),
});

export const NewsSyncConfigSchema = z.object({
  intervalHours: z.number().min(1).max(24),
  batchSize: z.number().int().positive(),
  maxArticlesPerUser: z.number().int().positive(),
  onlyActiveUsers: z.boolean(),
  activityThresholdDays: z.number().int().positive().optional(),
});

// Response types
export type NewsSyncJob = z.infer<typeof NewsSyncJobSchema>;
export type NewsSyncConfig = z.infer<typeof NewsSyncConfigSchema>;

export interface NewsSyncExecutionResult {
  jobId: string;
  usersProcessed: number;
  totalArticles: number;
  cacheUpdates: number;
  errors: string[];
  duration: number;
}

import { z } from 'zod';

// Task scheduler schemas
export const ScheduleTypeSchema = z.enum(['daily', 'weekly']);

export const PodcastJobSchema = z.object({
  jobId: z.string(),
  scheduleType: ScheduleTypeSchema,
  userId: z.string().optional(), // optional for system-wide jobs
  scheduledAt: z.string(),
  executedAt: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  error: z.string().optional(),
});

export const ScheduleConfigSchema = z.object({
  daily: z.object({
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
    timezone: z.string(),
  }),
  weekly: z.object({
    dayOfWeek: z.number().min(0).max(6), // 0 = Sunday
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
    timezone: z.string(),
  }),
});

// Response types
export type ScheduleType = z.infer<typeof ScheduleTypeSchema>;
export type PodcastJob = z.infer<typeof PodcastJobSchema>;
export type ScheduleConfig = z.infer<typeof ScheduleConfigSchema>;

export interface JobExecutionResult {
  jobId: string;
  success: boolean;
  podcastsGenerated: number;
  errors: string[];
}

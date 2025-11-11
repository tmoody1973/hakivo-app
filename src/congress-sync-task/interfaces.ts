import { z } from 'zod';

// Sync task schemas
export const SyncJobSchema = z.object({
  jobId: z.string(),
  jobType: z.enum(['bills', 'members', 'full']),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  totalProcessed: z.number().int().nonnegative().optional(),
  successCount: z.number().int().nonnegative().optional(),
  errorCount: z.number().int().nonnegative().optional(),
  errors: z.array(z.string()).optional(),
});

export const SyncConfigSchema = z.object({
  intervalHours: z.number().min(1).max(24),
  congress: z.number().int().positive(),
  batchSize: z.number().int().positive(),
  enableBillSync: z.boolean(),
  enableMemberSync: z.boolean(),
});

// Response types
export type SyncJob = z.infer<typeof SyncJobSchema>;
export type SyncConfig = z.infer<typeof SyncConfigSchema>;

export interface SyncExecutionResult {
  jobId: string;
  billsProcessed: number;
  membersProcessed: number;
  totalErrors: number;
  duration: number;
}

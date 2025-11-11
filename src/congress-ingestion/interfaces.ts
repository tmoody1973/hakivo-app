import { z } from 'zod';

// Congress.gov API response schemas
export const CongressBillSchema = z.object({
  billId: z.string(),
  billNumber: z.string(),
  title: z.string(),
  congress: z.number(),
  introducedDate: z.string(),
  latestAction: z.object({
    actionDate: z.string(),
    text: z.string(),
  }),
  sponsor: z.object({
    bioguideId: z.string(),
    name: z.string(),
    party: z.string(),
    state: z.string(),
  }).optional(),
  subjects: z.array(z.string()).optional(),
  fullTextUrl: z.string().url().optional(),
});

export const CongressMemberSchema = z.object({
  bioguideId: z.string(),
  name: z.string(),
  party: z.string(),
  state: z.string(),
  district: z.string().optional(),
  chamber: z.enum(['House', 'Senate']),
  termStart: z.string(),
  termEnd: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export const SyncResultSchema = z.object({
  totalProcessed: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  errorCount: z.number().int().nonnegative(),
  errors: z.array(z.string()).optional(),
});

// Internal types
export type CongressBill = z.infer<typeof CongressBillSchema>;
export type CongressMember = z.infer<typeof CongressMemberSchema>;
export type SyncResult = z.infer<typeof SyncResultSchema>;

export interface BillDocument {
  billId: string;
  fullText: string;
  metadata: {
    title: string;
    congress: number;
    introducedDate: string;
  };
}

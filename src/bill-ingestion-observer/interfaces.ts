import { z } from 'zod';

// SmartBucket observer event schemas
export const BucketEventSchema = z.object({
  eventType: z.enum(['object_created', 'object_updated', 'object_deleted']),
  bucketName: z.string(),
  objectKey: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const BillDocumentMetadataSchema = z.object({
  billId: z.string(),
  title: z.string(),
  congress: z.number(),
  introducedDate: z.string(),
  uploadedAt: z.string(),
});

export const IndexingResultSchema = z.object({
  billId: z.string(),
  indexed: z.boolean(),
  chunks: z.number(),
  error: z.string().optional(),
});

// Response types
export type BucketEvent = z.infer<typeof BucketEventSchema>;
export type BillDocumentMetadata = z.infer<typeof BillDocumentMetadataSchema>;
export type IndexingResult = z.infer<typeof IndexingResultSchema>;

export interface ProcessedDocument {
  billId: string;
  content: string;
  chunks: string[];
  metadata: BillDocumentMetadata;
}

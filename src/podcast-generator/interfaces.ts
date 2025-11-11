import { z } from 'zod';

// Podcast generation schemas
export const PodcastTypeSchema = z.enum(['daily', 'weekly']);

export const PodcastScriptSchema = z.object({
  introduction: z.string(),
  segments: z.array(z.object({
    title: z.string(),
    content: z.string(),
    duration: z.number().optional(),
  })),
  conclusion: z.string(),
});

export const PodcastMetadataSchema = z.object({
  userId: z.string(),
  type: z.enum(['daily', 'weekly']),
  generatedAt: z.string(),
  topics: z.array(z.string()),
  duration: z.number().optional(),
  audioUrl: z.string().url().optional(),
});

export const UserInterestsSchema = z.object({
  userId: z.string(),
  policyAreas: z.array(z.string()),
  representatives: z.array(z.string()),
});

// Response types
export type PodcastType = z.infer<typeof PodcastTypeSchema>;
export type PodcastScript = z.infer<typeof PodcastScriptSchema>;
export type PodcastMetadata = z.infer<typeof PodcastMetadataSchema>;
export type UserInterests = z.infer<typeof UserInterestsSchema>;

export interface AudioGenerationResult {
  audioUrl: string;
  duration: number;
  format: string;
}

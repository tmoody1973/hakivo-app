import { z } from 'zod';

// Geocod.io API response
export const GeocodingResultSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  congressionalDistrict: z.string(),
  state: z.string(),
  zipCode: z.string(),
});

export const RepresentativeSchema = z.object({
  bioguideId: z.string(),
  name: z.string(),
  party: z.string(),
  state: z.string(),
  district: z.string().optional(),
  chamber: z.enum(['House', 'Senate']),
  imageUrl: z.string().url().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
});

export const ZipCodeQuerySchema = z.object({
  zipCode: z.string().regex(/^\d{5}$/),
});

// Response types
export type GeocodingResult = z.infer<typeof GeocodingResultSchema>;
export type Representative = z.infer<typeof RepresentativeSchema>;
export type ZipCodeQuery = z.infer<typeof ZipCodeQuerySchema>;

export interface RepresentativeLookupResult {
  representatives: Representative[];
  district: {
    state: string;
    district: string;
  };
}

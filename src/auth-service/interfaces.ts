import { z } from 'zod';

// WorkOS OAuth schemas
export const OAuthCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  provider: z.enum(['google', 'email']),
});

export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UserSessionSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const JWTTokenSchema = z.object({
  token: z.string(),
  expiresAt: z.string(),
  refreshToken: z.string().optional(),
});

// Response types
export type OAuthCallback = z.infer<typeof OAuthCallbackSchema>;
export type RegisterUser = z.infer<typeof RegisterUserSchema>;
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;
export type JWTToken = z.infer<typeof JWTTokenSchema>;

export interface AuthResult {
  user: {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  session: UserSession;
  token: JWTToken;
}

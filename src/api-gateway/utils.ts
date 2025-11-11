import { JWTPayload, RouteConfig } from './interfaces';

/**
 * Constants for JWT validation
 */
const JWT_PARTS_COUNT = 3;
const PAYLOAD_INDEX = 1;

/**
 * Validates a JWT token and returns the decoded payload if valid
 * @param token - The JWT token string to validate
 * @returns The decoded JWT payload or null if invalid
 */
export async function validateJWT(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');

    if (!isValidJWTStructure(parts)) {
      return null;
    }

    const payload = decodeJWTPayload(parts[PAYLOAD_INDEX]);

    if (!isValidPayload(payload)) {
      return null;
    }

    if (isTokenExpired(payload.exp)) {
      return null;
    }

    return payload as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Checks if JWT has correct structure (3 parts)
 */
function isValidJWTStructure(parts: string[]): boolean {
  return parts.length === JWT_PARTS_COUNT;
}

/**
 * Decodes the JWT payload from base64
 */
function decodeJWTPayload(encodedPayload: string | undefined): any {
  if (!encodedPayload) {
    throw new Error('Missing payload');
  }
  return JSON.parse(atob(encodedPayload));
}

/**
 * Validates that payload contains all required fields
 */
function isValidPayload(payload: any): boolean {
  return !!(
    payload.userId &&
    payload.email &&
    payload.exp &&
    payload.iat
  );
}

/**
 * Checks if token is expired (exp is in milliseconds)
 */
function isTokenExpired(expiration: number): boolean {
  return expiration < Date.now();
}

/**
 * Authorization header constants
 */
const AUTH_HEADER_PARTS = 2;
const BEARER_PREFIX = 'Bearer';
const TOKEN_INDEX = 1;

/**
 * Extracts Bearer token from Authorization header
 * @param request - The HTTP request containing Authorization header
 * @returns The extracted token or null if invalid/missing
 */
export async function extractBearerToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (!isValidBearerFormat(parts)) {
    return null;
  }

  return parts[TOKEN_INDEX] ?? null;
}

/**
 * Validates Bearer token format: "Bearer <token>"
 */
function isValidBearerFormat(parts: string[]): boolean {
  return parts.length === AUTH_HEADER_PARTS && parts[0] === BEARER_PREFIX;
}

/**
 * Checks if user has exceeded rate limit for a specific route
 * @param userId - The user identifier
 * @param route - Route configuration containing rate limit rules
 * @param env - Environment bindings containing RATE_LIMIT_STORE
 * @returns true if request is allowed, false if rate limit exceeded
 */
export async function checkRateLimit(
  userId: string,
  route: RouteConfig,
  env: any
): Promise<boolean> {
  if (!route.rateLimit) {
    return true;
  }

  const key = buildRateLimitKey(userId, route.path);
  const now = Date.now();
  const windowStart = now - route.rateLimit.windowMs;

  try {
    const requestTimes = await getRequestHistory(key, env);
    const validRequests = filterValidRequests(requestTimes, windowStart);

    if (isRateLimitExceeded(validRequests.length, route.rateLimit.maxRequests)) {
      return false;
    }

    await updateRequestHistory(key, [...validRequests, now], env);
    return true;
  } catch {
    // On error, allow request (fail open)
    return true;
  }
}

/**
 * Builds rate limit storage key
 */
function buildRateLimitKey(userId: string, path: string): string {
  return `ratelimit:${userId}:${path}`;
}

/**
 * Retrieves request history from storage
 */
async function getRequestHistory(key: string, env: any): Promise<number[]> {
  const stored = await env.RATE_LIMIT_STORE?.get(key);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Filters request times within the rate limit window
 */
function filterValidRequests(requestTimes: number[], windowStart: number): number[] {
  return requestTimes.filter((time: number) => time > windowStart);
}

/**
 * Checks if rate limit threshold is exceeded
 */
function isRateLimitExceeded(currentCount: number, maxRequests: number): boolean {
  return currentCount >= maxRequests;
}

/**
 * Updates request history in storage
 */
async function updateRequestHistory(key: string, requests: number[], env: any): Promise<void> {
  await env.RATE_LIMIT_STORE?.put(key, JSON.stringify(requests));
}

/**
 * Route mapping configuration
 */
const ROUTE_MAP = [
  { prefix: '/api/bills', service: 'CONGRESS_INGESTION' },
  { prefix: '/api/briefs', service: 'PODCAST_GENERATOR' },
  { prefix: '/api/news', service: 'NEWS_AGGREGATOR' },
  { prefix: '/api/representatives', service: 'REPRESENTATIVE_LOOKUP' },
  { prefix: '/api/chat', service: 'BILL_CHAT' },
  { prefix: '/api/voice', service: 'VOICE_AGENT' },
] as const;

/**
 * Routes incoming request to appropriate microservice
 * @param request - The incoming HTTP request
 * @param path - The request path
 * @param env - Environment bindings containing service references
 * @returns Response from the target service or error response
 */
export async function routeRequest(
  request: Request,
  path: string,
  env: any
): Promise<Response> {
  const route = findMatchingRoute(path);

  if (!route) {
    return createErrorResponse('Not found', 404);
  }

  return forwardToService(request, route.service, env);
}

/**
 * Finds matching route for given path
 */
function findMatchingRoute(path: string): typeof ROUTE_MAP[number] | null {
  return ROUTE_MAP.find(route => path.startsWith(route.prefix)) ?? null;
}

/**
 * Forwards request to target microservice
 */
async function forwardToService(
  request: Request,
  serviceName: string,
  env: any
): Promise<Response> {
  const service = env[serviceName];

  if (!service?.fetch) {
    return createErrorResponse('Service unavailable', 503);
  }

  return service.fetch(request);
}

/**
 * CORS headers configuration
 */
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

/**
 * Creates an error response with CORS headers
 * @param error - Error message
 * @param code - HTTP status code
 * @param details - Optional additional error details
 * @returns HTTP Response with error body and CORS headers
 */
export function createErrorResponse(
  error: string,
  code: number,
  details?: Record<string, any>
): Response {
  const body = buildErrorBody(error, code, details);

  return new Response(JSON.stringify(body), {
    status: code,
    headers: CORS_HEADERS,
  });
}

/**
 * Creates a success response with CORS headers
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns HTTP Response with data and CORS headers
 */
export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS,
  });
}

/**
 * Builds error response body
 */
function buildErrorBody(
  error: string,
  code: number,
  details?: Record<string, any>
): Record<string, any> {
  return {
    error,
    code,
    ...(details && { details }),
  };
}

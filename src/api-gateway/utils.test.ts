import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateJWT,
  extractBearerToken,
  checkRateLimit,
  routeRequest,
  createErrorResponse,
  createSuccessResponse,
} from './utils';

describe('API Gateway Utils', () => {
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = {
      logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      JWT_SECRET: 'test-secret-key-12345',
    };
  });

  describe('validateJWT', () => {
    it('should return null for invalid token format', async () => {
      const result = await validateJWT('invalid.token');
      expect(result).toBeNull();
    });

    it('should return null for malformed JWT', async () => {
      const result = await validateJWT('not-a-jwt');
      expect(result).toBeNull();
    });

    it('should return null for expired token', async () => {
      const expiredPayload = {
        userId: 'user123',
        email: 'test@example.com',
        exp: Date.now() - 10000,
        iat: Date.now() - 20000,
      };
      const token = `header.${btoa(JSON.stringify(expiredPayload))}.signature`;
      const result = await validateJWT(token);
      expect(result).toBeNull();
    });

    it('should return payload for valid token', async () => {
      const validPayload = {
        userId: 'user123',
        email: 'test@example.com',
        exp: Date.now() + 3600000,
        iat: Date.now(),
      };
      const token = `header.${btoa(JSON.stringify(validPayload))}.signature`;
      const result = await validateJWT(token);
      expect(result).toEqual(validPayload);
    });
  });

  describe('extractBearerToken', () => {
    it('should return null when Authorization header is missing', async () => {
      const request = new Request('https://api.example.com/test');
      const result = await extractBearerToken(request);
      expect(result).toBeNull();
    });

    it('should return null for invalid Authorization format', async () => {
      const request = new Request('https://api.example.com/test', {
        headers: { 'Authorization': 'InvalidFormat' },
      });
      const result = await extractBearerToken(request);
      expect(result).toBeNull();
    });

    it('should extract Bearer token from Authorization header', async () => {
      const token = 'abc123.def456.ghi789';
      const request = new Request('https://api.example.com/test', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await extractBearerToken(request);
      expect(result).toBe(token);
    });
  });

  describe('checkRateLimit', () => {
    it('should return true when no rate limit is configured', async () => {
      const route = {
        path: '/api/test',
        method: 'GET',
        requiresAuth: true,
      };
      const result = await checkRateLimit('user123', route, mockEnv);
      expect(result).toBe(true);
    });

    it('should return true when rate limit store is unavailable', async () => {
      const route = {
        path: '/api/test',
        method: 'GET',
        requiresAuth: true,
        rateLimit: { maxRequests: 100, windowMs: 60000 },
      };
      const result = await checkRateLimit('user123', route, mockEnv);
      expect(result).toBe(true);
    });

    it('should allow requests within limit', async () => {
      const route = {
        path: '/api/test',
        method: 'GET',
        requiresAuth: true,
        rateLimit: { maxRequests: 100, windowMs: 60000 },
      };
      mockEnv.RATE_LIMIT_STORE = {
        get: vi.fn().mockResolvedValue(JSON.stringify([])),
        put: vi.fn().mockResolvedValue(undefined),
      };
      const result = await checkRateLimit('user123', route, mockEnv);
      expect(result).toBe(true);
    });
  });

  describe('routeRequest', () => {
    it('should route to congress-ingestion for /api/bills', async () => {
      const request = new Request('https://api.example.com/api/bills/search');
      const mockResponse = new Response(JSON.stringify({ results: [] }));
      mockEnv.CONGRESS_INGESTION = {
        fetch: vi.fn().mockResolvedValue(mockResponse),
      };
      const result = await routeRequest(request, '/api/bills/search', mockEnv);
      expect(result).toBe(mockResponse);
    });

    it('should return 404 for unknown paths', async () => {
      const request = new Request('https://api.example.com/unknown/path');
      const result = await routeRequest(request, '/unknown/path', mockEnv);
      expect(result.status).toBe(404);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with correct status and body', async () => {
      const response = createErrorResponse('Test error', 400);
      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

      const body = await response.json();
      expect(body).toEqual({
        error: 'Test error',
        code: 400,
      });
    });

    it('should include details when provided', async () => {
      const response = createErrorResponse('Test error', 400, { field: 'email' });
      const body = await response.json();
      expect(body).toEqual({
        error: 'Test error',
        code: 400,
        details: { field: 'email' },
      });
    });
  });

  describe('createSuccessResponse', () => {
    it('should create success response with default 200 status', async () => {
      const response = createSuccessResponse({ data: 'test' });
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

      const body = await response.json();
      expect(body).toEqual({ data: 'test' });
    });

    it('should create success response with custom status', async () => {
      const response = createSuccessResponse({ data: 'created' }, 201);
      expect(response.status).toBe(201);

      const body = await response.json();
      expect(body).toEqual({ data: 'created' });
    });
  });
});

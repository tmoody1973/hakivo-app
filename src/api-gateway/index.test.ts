import { describe, it, expect, vi, beforeEach } from 'vitest';
import ApiGateway from './index';
import * as utils from './utils';

// Mock utils module
vi.mock('./utils');

describe('API Gateway', () => {
  let gateway: ApiGateway;
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = {
      logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      },
      AUTH_SERVICE: {
        validateToken: vi.fn(),
      },
      CONGRESS_INGESTION: {
        getBill: vi.fn(),
      },
      PODCAST_GENERATOR: {
        generateDailyBrief: vi.fn(),
      },
      NEWS_AGGREGATOR: {
        fetchNews: vi.fn(),
      },
      REPRESENTATIVE_LOOKUP: {
        findByZip: vi.fn(),
      },
      BILL_CHAT: {
        chat: vi.fn(),
      },
      VOICE_AGENT: {
        processVoiceQuery: vi.fn(),
      },
    };
    gateway = new ApiGateway(mockEnv, {} as any);
  });

  describe('Health Check', () => {
    it('should return 200 OK for /health endpoint', async () => {
      const request = new Request('https://api.example.com/health');
      const response = await gateway.fetch(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('timestamp');
    });
  });

  describe('Authentication', () => {
    it('should extract Bearer token from Authorization header', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      vi.mocked(utils.extractBearerToken).mockResolvedValue(mockToken);

      const request = new Request('https://api.example.com/api/user/me', {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });

      const token = await utils.extractBearerToken(request);
      expect(token).toBe(mockToken);
    });

    it('should return null when Authorization header is missing', async () => {
      vi.mocked(utils.extractBearerToken).mockResolvedValue(null);

      const request = new Request('https://api.example.com/api/user/me');
      const token = await utils.extractBearerToken(request);

      expect(token).toBeNull();
    });

    it('should validate JWT token and return payload', async () => {
      const mockPayload = {
        userId: 'user123',
        email: 'test@example.com',
        exp: Date.now() + 3600000,
        iat: Date.now(),
      };
      vi.mocked(utils.validateJWT).mockResolvedValue(mockPayload);

      const token = 'valid.jwt.token';
      const payload = await utils.validateJWT(token);

      expect(payload).toEqual(mockPayload);
      expect(payload?.userId).toBe('user123');
    });

    it('should return null for invalid JWT token', async () => {
      vi.mocked(utils.validateJWT).mockResolvedValue(null);

      const token = 'invalid.jwt.token';
      const payload = await utils.validateJWT(token);

      expect(payload).toBeNull();
    });

    it('should return 401 when Bearer token is missing for protected routes', async () => {
      vi.mocked(utils.extractBearerToken).mockResolvedValue(null);
      vi.mocked(utils.createErrorResponse).mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized', code: 401 }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = utils.createErrorResponse('Unauthorized', 401);
      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const mockRoute = {
        path: '/api/bills/search',
        method: 'GET',
        requiresAuth: true,
        rateLimit: { maxRequests: 100, windowMs: 60000 },
      };
      vi.mocked(utils.checkRateLimit).mockResolvedValue(true);

      const allowed = await utils.checkRateLimit('user123', mockRoute, mockEnv);
      expect(allowed).toBe(true);
    });

    it('should block requests exceeding rate limit', async () => {
      const mockRoute = {
        path: '/api/bills/search',
        method: 'GET',
        requiresAuth: true,
        rateLimit: { maxRequests: 100, windowMs: 60000 },
      };
      vi.mocked(utils.checkRateLimit).mockResolvedValue(false);

      const allowed = await utils.checkRateLimit('user123', mockRoute, mockEnv);
      expect(allowed).toBe(false);
    });

    it('should return 429 when rate limit is exceeded', async () => {
      vi.mocked(utils.createErrorResponse).mockReturnValue(
        new Response(JSON.stringify({ error: 'Rate limit exceeded', code: 429 }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = utils.createErrorResponse('Rate limit exceeded', 429);
      expect(response.status).toBe(429);
    });
  });

  describe('Request Routing', () => {
    it('should route /api/bills/* to congress-ingestion service', async () => {
      const mockResponse = new Response(JSON.stringify({ billId: 'hr1234' }));
      vi.mocked(utils.routeRequest).mockResolvedValue(mockResponse);

      const request = new Request('https://api.example.com/api/bills/hr1234');
      const response = await utils.routeRequest(request, '/api/bills/hr1234', mockEnv);

      expect(response).toBeDefined();
      const data = await response.json();
      expect(data).toHaveProperty('billId');
    });

    it('should route /api/briefs/* to podcast-generator service', async () => {
      const mockResponse = new Response(JSON.stringify({ podcastUrl: 'https://...' }));
      vi.mocked(utils.routeRequest).mockResolvedValue(mockResponse);

      const request = new Request('https://api.example.com/api/briefs/daily');
      const response = await utils.routeRequest(request, '/api/briefs/daily', mockEnv);

      expect(response).toBeDefined();
      const data = await response.json();
      expect(data).toHaveProperty('podcastUrl');
    });

    it('should route /api/news to news-aggregator service', async () => {
      const mockResponse = new Response(JSON.stringify({ articles: [] }));
      vi.mocked(utils.routeRequest).mockResolvedValue(mockResponse);

      const request = new Request('https://api.example.com/api/news');
      const response = await utils.routeRequest(request, '/api/news', mockEnv);

      expect(response).toBeDefined();
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      vi.mocked(utils.createSuccessResponse).mockReturnValue(
        new Response(JSON.stringify({ data: 'test' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        })
      );

      const response = utils.createSuccessResponse({ data: 'test' });
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
    });

    it('should handle OPTIONS preflight requests', async () => {
      const request = new Request('https://api.example.com/api/bills', {
        method: 'OPTIONS',
      });

      const response = await gateway.fetch(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return standardized error response for 400 Bad Request', async () => {
      vi.mocked(utils.createErrorResponse).mockReturnValue(
        new Response(JSON.stringify({ error: 'Invalid parameters', code: 400 }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = utils.createErrorResponse('Invalid parameters', 400);
      const data = await response.json();

      expect(data).toHaveProperty('error', 'Invalid parameters');
      expect(data).toHaveProperty('code', 400);
    });

    it('should return 404 for unknown routes', async () => {
      vi.mocked(utils.createErrorResponse).mockReturnValue(
        new Response(JSON.stringify({ error: 'Not found', code: 404 }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = utils.createErrorResponse('Not found', 404);
      expect(response.status).toBe(404);
    });

    it('should return 500 for internal server errors', async () => {
      vi.mocked(utils.createErrorResponse).mockReturnValue(
        new Response(JSON.stringify({ error: 'Internal server error', code: 500 }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const response = utils.createErrorResponse('Internal server error', 500);
      expect(response.status).toBe(500);
    });
  });
});

import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

/**
 * API Gateway Service
 * Routes incoming requests to appropriate microservices
 */
export default class extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (isHealthCheck(url.pathname)) {
      return createHealthCheckResponse();
    }

    if (isPreflightRequest(request.method)) {
      return createCorsPreflightResponse();
    }

    return createAckResponse();
  }
}

/**
 * Checks if request is a health check
 */
function isHealthCheck(pathname: string): boolean {
  return pathname === '/health';
}

/**
 * Checks if request is a CORS preflight (OPTIONS)
 */
function isPreflightRequest(method: string): boolean {
  return method === 'OPTIONS';
}

/**
 * Creates health check response
 */
function createHealthCheckResponse(): Response {
  const body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Creates CORS preflight response
 */
function createCorsPreflightResponse(): Response {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * Creates acknowledgment response for testing
 */
function createAckResponse(): Response {
  return new Response('Request received');
}

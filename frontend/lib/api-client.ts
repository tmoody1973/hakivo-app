/**
 * API Client for Hakivo Backend
 * Handles all HTTP requests to the Raindrop API Gateway
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  clearAuthToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Bills endpoints
  async getBills(params?: {
    page?: number;
    limit?: number;
    search?: string;
    congress?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.congress) searchParams.set('congress', params.congress.toString());

    return this.request(`/api/bills?${searchParams.toString()}`);
  }

  async getBill(billId: string) {
    return this.request(`/api/bills/${billId}`);
  }

  async searchBills(query: string) {
    return this.request('/api/bills/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Members endpoints
  async getMembers() {
    return this.request('/api/members');
  }

  async getMember(memberId: string) {
    return this.request(`/api/members/${memberId}`);
  }

  async getRepresentatives(zipCode: string) {
    return this.request(`/api/representatives/${zipCode}`);
  }

  // Podcast/Briefs endpoints
  async getBriefs(params?: { type?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return this.request(`/api/briefs?${searchParams.toString()}`);
  }

  async getBrief(briefId: string) {
    return this.request(`/api/briefs/${briefId}`);
  }

  // News endpoints
  async getNews(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    return this.request(`/api/news?${searchParams.toString()}`);
  }

  // Dashboard endpoints
  async getDashboard() {
    return this.request('/api/dashboard');
  }

  // User preferences endpoints
  async updatePreferences(preferences: {
    policy_interests?: string[];
    zip_code?: string;
  }) {
    return this.request('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async getPreferences() {
    return this.request('/api/user/preferences');
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

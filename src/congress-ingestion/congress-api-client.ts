/**
 * Congress.gov API Client
 * Handles all HTTP requests to the official Congress.gov API
 * API Documentation: https://api.congress.gov/
 */

import type {
  CongressApiResponse,
  CongressApiBill,
  CongressApiBillDetail,
  CongressApiMember,
  CongressApiMemberDetail,
  CongressApiCommittee,
  BillsSearchParams,
  MembersSearchParams,
} from './congress-api-types';

export class CongressApiClient {
  private baseUrl = 'https://api.congress.gov/v3';
  private apiKey: string;
  private defaultFormat = 'json';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Congress.gov API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Generic fetch method with error handling
   */
  private async fetch<T>(
    endpoint: string,
    params: Record<string, string | number | boolean> = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add API key and format to params
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('format', this.defaultFormat);

    // Add additional params
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await globalThis.fetch(url.toString());

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      throw new Error(`Congress.gov API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  // ==================== Bills ====================

  /**
   * Get a list of bills for a specific congress
   */
  async getBills(params: BillsSearchParams = {}): Promise<CongressApiResponse<CongressApiBill>> {
    const congress = params.congress || 119; // Default to current congress
    const endpoint = `/bill/${congress}`;

    return this.fetch<CongressApiResponse<CongressApiBill>>(endpoint, {
      limit: params.limit || 250,
      offset: params.offset || 0,
      ...(params.type && {}), // type is in URL path, not query
      ...(params.fromDateTime && { fromDateTime: params.fromDateTime }),
      ...(params.toDateTime && { toDateTime: params.toDateTime }),
      ...(params.sort && { sort: params.sort }),
    });
  }

  /**
   * Get bills by type (hr, s, hjres, etc.)
   */
  async getBillsByType(
    congress: number,
    type: string,
    params: BillsSearchParams = {}
  ): Promise<CongressApiResponse<CongressApiBill>> {
    const endpoint = `/bill/${congress}/${type}`;

    return this.fetch<CongressApiResponse<CongressApiBill>>(endpoint, {
      limit: params.limit || 250,
      offset: params.offset || 0,
      ...(params.fromDateTime && { fromDateTime: params.fromDateTime }),
      ...(params.toDateTime && { toDateTime: params.toDateTime }),
      ...(params.sort && { sort: params.sort }),
    });
  }

  /**
   * Get detailed information about a specific bill
   */
  async getBillDetail(
    congress: number,
    type: string,
    number: string
  ): Promise<CongressApiResponse<CongressApiBillDetail>> {
    const endpoint = `/bill/${congress}/${type}/${number}`;
    return this.fetch<CongressApiResponse<CongressApiBillDetail>>(endpoint);
  }

  /**
   * Get cosponsors for a specific bill
   */
  async getBillCosponsors(
    congress: number,
    type: string,
    number: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<CongressApiResponse<any>> {
    const endpoint = `/bill/${congress}/${type}/${number}/cosponsors`;
    return this.fetch(endpoint, {
      limit: params.limit || 250,
      offset: params.offset || 0,
    });
  }

  /**
   * Get actions for a specific bill
   */
  async getBillActions(
    congress: number,
    type: string,
    number: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<CongressApiResponse<any>> {
    const endpoint = `/bill/${congress}/${type}/${number}/actions`;
    return this.fetch(endpoint, {
      limit: params.limit || 250,
      offset: params.offset || 0,
    });
  }

  /**
   * Get committees for a specific bill
   */
  async getBillCommittees(
    congress: number,
    type: string,
    number: string
  ): Promise<CongressApiResponse<any>> {
    const endpoint = `/bill/${congress}/${type}/${number}/committees`;
    return this.fetch(endpoint);
  }

  /**
   * Get subjects for a specific bill
   */
  async getBillSubjects(
    congress: number,
    type: string,
    number: string
  ): Promise<CongressApiResponse<any>> {
    const endpoint = `/bill/${congress}/${type}/${number}/subjects`;
    return this.fetch(endpoint);
  }

  /**
   * Get amendments for a specific bill
   */
  async getBillAmendments(
    congress: number,
    type: string,
    number: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<CongressApiResponse<any>> {
    const endpoint = `/bill/${congress}/${type}/${number}/amendments`;
    return this.fetch(endpoint, {
      limit: params.limit || 250,
      offset: params.offset || 0,
    });
  }

  /**
   * Get related bills for a specific bill
   */
  async getBillRelatedBills(
    congress: number,
    type: string,
    number: string
  ): Promise<CongressApiResponse<any>> {
    const endpoint = `/bill/${congress}/${type}/${number}/relatedbills`;
    return this.fetch(endpoint);
  }

  /**
   * Get summaries for a specific bill
   */
  async getBillSummaries(
    congress: number,
    type: string,
    number: string
  ): Promise<CongressApiResponse<any>> {
    const endpoint = `/bill/${congress}/${type}/${number}/summaries`;
    return this.fetch(endpoint);
  }

  /**
   * Get text versions for a specific bill
   */
  async getBillText(
    congress: number,
    type: string,
    number: string
  ): Promise<CongressApiResponse<any>> {
    const endpoint = `/bill/${congress}/${type}/${number}/text`;
    return this.fetch(endpoint);
  }

  // ==================== Members ====================

  /**
   * Get a list of members
   */
  async getMembers(params: MembersSearchParams = {}): Promise<CongressApiResponse<CongressApiMember>> {
    const endpoint = '/member';

    return this.fetch<CongressApiResponse<CongressApiMember>>(endpoint, {
      limit: params.limit || 250,
      offset: params.offset || 0,
      ...(params.currentMember !== undefined && { currentMember: params.currentMember }),
      ...(params.fromDateTime && { fromDateTime: params.fromDateTime }),
      ...(params.toDateTime && { toDateTime: params.toDateTime }),
    });
  }

  /**
   * Get members by congress
   */
  async getMembersByCongress(
    congress: number,
    params: MembersSearchParams = {}
  ): Promise<CongressApiResponse<CongressApiMember>> {
    const endpoint = `/member/congress/${congress}`;

    return this.fetch<CongressApiResponse<CongressApiMember>>(endpoint, {
      limit: params.limit || 250,
      offset: params.offset || 0,
      ...(params.currentMember !== undefined && { currentMember: params.currentMember }),
    });
  }

  /**
   * Get detailed information about a specific member by bioguide ID
   */
  async getMemberDetail(bioguideId: string): Promise<CongressApiResponse<CongressApiMemberDetail>> {
    const endpoint = `/member/${bioguideId}`;
    return this.fetch<CongressApiResponse<CongressApiMemberDetail>>(endpoint);
  }

  /**
   * Get sponsored legislation for a member
   */
  async getMemberSponsoredLegislation(
    bioguideId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<CongressApiResponse<CongressApiBill>> {
    const endpoint = `/member/${bioguideId}/sponsored-legislation`;
    return this.fetch(endpoint, {
      limit: params.limit || 250,
      offset: params.offset || 0,
    });
  }

  /**
   * Get cosponsored legislation for a member
   */
  async getMemberCosponsoredLegislation(
    bioguideId: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<CongressApiResponse<CongressApiBill>> {
    const endpoint = `/member/${bioguideId}/cosponsored-legislation`;
    return this.fetch(endpoint, {
      limit: params.limit || 250,
      offset: params.offset || 0,
    });
  }

  // ==================== Committees ====================

  /**
   * Get a list of committees
   */
  async getCommittees(
    chamber?: 'house' | 'senate',
    params: { limit?: number; offset?: number } = {}
  ): Promise<CongressApiResponse<CongressApiCommittee>> {
    const endpoint = chamber ? `/committee/${chamber}` : '/committee';

    return this.fetch<CongressApiResponse<CongressApiCommittee>>(endpoint, {
      limit: params.limit || 250,
      offset: params.offset || 0,
    });
  }

  /**
   * Get committees for a specific congress
   */
  async getCommitteesByCongress(
    congress: number,
    chamber?: 'house' | 'senate',
    params: { limit?: number; offset?: number } = {}
  ): Promise<CongressApiResponse<CongressApiCommittee>> {
    const endpoint = chamber
      ? `/committee/${congress}/${chamber}`
      : `/committee/${congress}`;

    return this.fetch<CongressApiResponse<CongressApiCommittee>>(endpoint, {
      limit: params.limit || 250,
      offset: params.offset || 0,
    });
  }

  /**
   * Get detailed information about a specific committee
   */
  async getCommitteeDetail(
    chamber: 'house' | 'senate',
    committeeCode: string
  ): Promise<CongressApiResponse<CongressApiCommittee>> {
    const endpoint = `/committee/${chamber}/${committeeCode}`;
    return this.fetch<CongressApiResponse<CongressApiCommittee>>(endpoint);
  }

  // ==================== Helper Methods ====================

  /**
   * Get current congress number (119th Congress for 2025-2027)
   */
  getCurrentCongress(): number {
    const currentYear = new Date().getFullYear();
    // Congress number is calculated from the year
    // 119th Congress started in 2025
    return Math.floor((currentYear - 1789) / 2) + 1;
  }

  /**
   * Parse bill identifier (e.g., "hr1234-119" or "s456-118")
   */
  parseBillIdentifier(billId: string): { congress: number; type: string; number: string } | null {
    const match = billId.match(/^([a-z]+)(\d+)-(\d+)$/i);
    if (!match) return null;

    return {
      type: match[1]!.toLowerCase(),
      number: match[2]!,
      congress: parseInt(match[3]!, 10),
    };
  }
}

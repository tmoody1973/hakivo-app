/**
 * Congress.gov API Client
 * Simplified version based on docs/congress.ts pattern
 */

const API_KEY = process.env.CONGRESS_API_KEY || 'LujQ9kIn44Remaqi1i3Q8fcbeK9nA6aAZ0coUa3C';
const API_BASE = 'https://api.congress.gov/v3';

/**
 * Fetch recent bills from Congress API
 */
export async function fetchRecentBills(options: {
  congress: number;
  limit?: number;
  offset?: number;
  sort?: string;
}): Promise<any[]> {
  const url = new URL(`${API_BASE}/bill/${options.congress}`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('limit', (options.limit || 100).toString());
  if (options.offset) {
    url.searchParams.set('offset', options.offset.toString());
  }
  if (options.sort) {
    url.searchParams.set('sort', options.sort);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Congress API error: ${response.status}`);
  }

  const data = await response.json() as any;
  return data.bills || [];
}

/**
 * Fetch bill summary
 */
export async function fetchBillSummary(
  congress: number,
  billType: string,
  billNumber: number
): Promise<string | null> {
  const url = new URL(`${API_BASE}/bill/${congress}/${billType.toLowerCase()}/${billNumber}/summaries`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('api_key', API_KEY);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json() as any;
    if (!data.summaries || data.summaries.length === 0) return null;

    // Get most recent summary
    const summary = data.summaries[0];
    return summary.text || null;
  } catch (error) {
    console.warn(`Could not fetch summary for ${billType}${billNumber}:`, error);
    return null;
  }
}

/**
 * Fetch bill full text HTML (actual content, not just URL)
 */
export async function fetchBillText(
  congress: number,
  billType: string,
  billNumber: number
): Promise<string | null> {
  const url = new URL(`${API_BASE}/bill/${congress}/${billType.toLowerCase()}/${billNumber}/text`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('api_key', API_KEY);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json() as any;
    if (!data.textVersions || data.textVersions.length === 0) return null;

    // Find and fetch the actual HTML content from formatted text URL
    for (const version of data.textVersions) {
      if (version.formats) {
        const formattedText = version.formats.find((f: any) => f.type === 'Formatted Text');
        if (formattedText && formattedText.url) {
          const textResponse = await fetch(formattedText.url);
          if (textResponse.ok) {
            // Return the actual HTML content
            return await textResponse.text();
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.warn(`Could not fetch full text for ${billType}${billNumber}:`, error);
    return null;
  }
}

/**
 * Fetch bill cosponsors
 */
export async function fetchBillCosponsors(
  congress: number,
  billType: string,
  billNumber: number
): Promise<Array<{
  bioguideId: string;
  name: string;
  party: string;
  state: string;
  sponsorshipDate: string;
}> | null> {
  const url = new URL(`${API_BASE}/bill/${congress}/${billType.toLowerCase()}/${billNumber}/cosponsors`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('limit', '250');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json() as any;
    if (!data.cosponsors || data.cosponsors.length === 0) return [];

    return data.cosponsors.map((cosponsor: any) => ({
      bioguideId: cosponsor.bioguideId,
      name: cosponsor.fullName || `${cosponsor.firstName} ${cosponsor.lastName}`,
      party: cosponsor.party || 'Unknown',
      state: cosponsor.state,
      sponsorshipDate: cosponsor.sponsorshipDate
    }));
  } catch (error) {
    console.warn(`Could not fetch cosponsors for ${billType}${billNumber}:`, error);
    return null;
  }
}

/**
 * Fetch bill actions (legislative history)
 */
export async function fetchBillActions(
  congress: number,
  billType: string,
  billNumber: number
): Promise<Array<{
  actionDate: string;
  text: string;
  type: string;
  actionCode?: string;
  sourceSystem?: string;
}> | null> {
  const url = new URL(`${API_BASE}/bill/${congress}/${billType.toLowerCase()}/${billNumber}/actions`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('limit', '250');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json() as any;
    if (!data.actions || data.actions.length === 0) return [];

    return data.actions.map((action: any) => ({
      actionDate: action.actionDate,
      text: action.text,
      type: action.type || 'Unknown',
      actionCode: action.actionCode,
      sourceSystem: action.sourceSystem?.name
    }));
  } catch (error) {
    console.warn(`Could not fetch actions for ${billType}${billNumber}:`, error);
    return null;
  }
}

/**
 * Fetch bill subjects (issue categories)
 */
export async function fetchBillSubjects(
  congress: number,
  billType: string,
  billNumber: number
): Promise<{
  policyArea: string | null;
  legislativeSubjects: string[];
} | null> {
  const url = new URL(`${API_BASE}/bill/${congress}/${billType.toLowerCase()}/${billNumber}/subjects`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('api_key', API_KEY);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json() as any;
    if (!data.subjects) return { policyArea: null, legislativeSubjects: [] };

    const policyArea = data.subjects.policyArea?.name || null;
    const legislativeSubjects = data.subjects.legislativeSubjects?.map((subject: any) => subject.name) || [];

    return {
      policyArea,
      legislativeSubjects,
    };
  } catch (error) {
    console.warn(`Could not fetch subjects for ${billType}${billNumber}:`, error);
    return null;
  }
}

/**
 * Fetch bill details including sponsor information
 */
export async function fetchBillDetails(
  congress: number,
  billType: string,
  billNumber: number
): Promise<{
  sponsor: {
    bioguideId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    party: string;
    state: string;
    district?: number;
    isByRequest: string;
  } | null;
} | null> {
  const url = new URL(`${API_BASE}/bill/${congress}/${billType.toLowerCase()}/${billNumber}`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('api_key', API_KEY);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json() as any;
    if (!data.bill) return null;

    const bill = data.bill;

    // Extract sponsor information
    let sponsor = null;
    if (bill.sponsors && bill.sponsors.length > 0) {
      const s = bill.sponsors[0];
      sponsor = {
        bioguideId: s.bioguideId,
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        fullName: s.fullName || `${s.firstName} ${s.lastName}`,
        party: s.party || 'Unknown',
        state: s.state || 'Unknown',
        district: s.district,
        isByRequest: s.isByRequest || 'N',
      };
    }

    return {
      sponsor,
    };
  } catch (error) {
    console.warn(`Could not fetch bill details for ${billType}${billNumber}:`, error);
    return null;
  }
}

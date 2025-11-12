/**
 * Congress.gov API TypeScript types
 * Based on official API documentation at https://api.congress.gov/
 */

// API Response wrapper
export interface CongressApiResponse<T> {
  bills?: T[];
  bill?: T;
  members?: T[];
  member?: T;
  committees?: T[];
  committee?: T;
  textVersions?: BillTextVersion[];
  actions?: any[];
  cosponsors?: any[];
  subjects?: any;
  pagination?: {
    count: number;
    next?: string;
  };
}

// Bill text types
export interface BillTextFormat {
  type: 'Formatted Text' | 'PDF' | 'Formatted XML';
  url: string;
}

export interface BillTextVersion {
  date: string | null;
  formats?: BillTextFormat[];
}

// Bill types
export interface CongressApiBill {
  congress: number;
  type: string;
  number: string;
  originChamber: string;
  originChamberCode: string;
  title: string;
  introducedDate?: string;
  updateDate: string;
  updateDateIncludingText?: string;
  latestAction?: {
    actionDate: string;
    actionTime?: string;
    text: string;
  };
  sponsors?: Array<{
    bioguideId: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    party: string;
    state: string;
    district?: number;
    isByRequest?: string;
    url?: string;
  }>;
  cosponsors?: {
    count: number;
    countIncludingWithdrawnCosponsors: number;
    url: string;
  };
  committees?: {
    count: number;
    url: string;
  };
  subjects?: {
    count: number;
    url: string;
  };
  actions?: {
    count: number;
    url: string;
  };
  amendments?: {
    count: number;
    url: string;
  };
  relatedBills?: {
    count: number;
    url: string;
  };
  policyArea?: {
    name: string;
  };
  summaries?: {
    count: number;
    url: string;
  };
  textVersions?: {
    count: number;
    url: string;
  };
  constitutionalAuthorityStatementText?: string;
  laws?: Array<{
    number: string;
    type: string;
  }>;
}

// Bill details with expanded data
export interface CongressApiBillDetail extends Omit<CongressApiBill, 'cosponsors' | 'actions' | 'subjects' | 'committees' | 'amendments' | 'relatedBills' | 'summaries'> {
  cosponsors?: Array<{
    bioguideId: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    party: string;
    state: string;
    district?: number;
    sponsorshipDate: string;
    isOriginalCosponsor: boolean;
    sponsorshipWithdrawnDate?: string;
  }>;
  actions?: Array<{
    actionDate: string;
    actionTime?: string;
    text: string;
    type?: string;
    actionCode?: string;
    sourceSystem?: {
      code: number;
      name: string;
    };
    committees?: Array<{
      systemCode: string;
      name: string;
      chamber?: string;
      type?: string;
    }>;
  }>;
  subjects?: {
    legislativeSubjects: Array<{
      name: string;
      updateDate: string;
    }>;
    policyArea?: {
      name: string;
      updateDate: string;
    };
  };
  committees?: Array<{
    systemCode: string;
    name: string;
    chamber: string;
    type: string;
    activities: Array<{
      name: string;
      date: string;
    }>;
  }>;
  amendments?: Array<{
    number: string;
    description?: string;
    purpose?: string;
    updateDate: string;
    latestAction?: {
      actionDate: string;
      text: string;
    };
  }>;
  relatedBills?: Array<{
    congress: number;
    type: string;
    number: string;
    relationshipDetails: Array<{
      type: string;
      identifiedBy: string;
    }>;
    latestAction?: {
      actionDate: string;
      text: string;
    };
  }>;
  summaries?: Array<{
    actionDate: string;
    actionDesc: string;
    text: string;
    updateDate: string;
    versionCode: string;
  }>;
}

// Member types
export interface CongressApiMember {
  bioguideId: string;
  district?: number;
  partyName?: string;
  state: string;
  name: string;
  depiction?: {
    imageUrl: string;
    attribution?: string;
  };
  terms?: {
    item: Array<{
      chamber: string;
      startYear: number;
      endYear?: number;
      memberType?: string;
    }>;
  };
  updateDate: string;
  url?: string;
}

// Member details
export interface CongressApiMemberDetail extends CongressApiMember {
  addressInformation?: {
    city?: string;
    district?: string;
    officeAddress?: string;
    phoneNumber?: string;
    zipCode?: string;
  };
  birthYear?: string;
  currentMember?: boolean;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nickName?: string;
  suffix?: string;
  directOrderName?: string;
  invertedOrderName?: string;
  honorificName?: string;
  officialWebsiteUrl?: string;
  partyHistory?: Array<{
    partyName: string;
    partyCode: string;
    startYear: number;
    endYear?: number;
  }>;
  sponsoredLegislation?: {
    count: number;
    url: string;
  };
  cosponsoredLegislation?: {
    count: number;
    url: string;
  };
}

// Committee types
export interface CongressApiCommittee {
  url: string;
  systemCode: string;
  name: string;
  chamber: string;
  type: string;
  updateDate: string;
  committeeTypeCode?: string;
  isCurrent?: boolean;
  parent?: {
    systemCode: string;
    name: string;
    url: string;
  };
}

// Search/filter params
export interface BillsSearchParams {
  congress?: number;
  type?: 'hr' | 's' | 'hjres' | 'sjres' | 'hconres' | 'sconres' | 'hres' | 'sres';
  limit?: number;
  offset?: number;
  fromDateTime?: string;
  toDateTime?: string;
  sort?: 'updateDate+asc' | 'updateDate+desc';
}

export interface MembersSearchParams {
  limit?: number;
  offset?: number;
  currentMember?: boolean;
  fromDateTime?: string;
  toDateTime?: string;
}

/**
 * Data Transformers
 * Convert Congress.gov API responses to our database schema format
 */

import type {
  CongressApiBill,
  CongressApiBillDetail,
  CongressApiMember,
  CongressApiMemberDetail,
  CongressApiCommittee,
} from './congress-api-types';
import type { DB } from '../db/hakivoDb/types';
import type { Insertable } from 'kysely';

type BillInsert = Insertable<DB['bills']>;
type MemberInsert = Insertable<DB['members']>;
type BillCosponsorInsert = Insertable<DB['bill_cosponsors']>;
type BillActionInsert = Insertable<DB['bill_actions']>;
type CommitteeInsert = Insertable<DB['committees']>;
type BillCommitteeInsert = Insertable<DB['bill_committees']>;
type BillSubjectInsert = Insertable<DB['bill_subjects']>;
type AmendmentInsert = Insertable<DB['amendments']>;
type RelatedBillInsert = Insertable<DB['related_bills']>;
type MemberCommitteeInsert = Insertable<DB['member_committees']>;

/**
 * Generate a unique bill ID from congress, type, and number
 */
export function generateBillId(congress: number, type: string, number: string): string {
  return `${type}${number}-${congress}`;
}

/**
 * Generate a unique member ID from bioguide ID
 */
export function generateMemberId(bioguideId: string): string {
  return bioguideId;
}

/**
 * Generate a unique committee ID from chamber and system code
 */
export function generateCommitteeId(systemCode: string): string {
  return systemCode;
}

/**
 * Generate a unique amendment ID
 */
export function generateAmendmentId(congress: number, amendmentNumber: number): string {
  return `amdt-${congress}-${amendmentNumber}`;
}

/**
 * Parse ISO date string to ISO string, handling various formats
 * Returns null if invalid
 */
function parseDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Transform Congress API Bill to database bill format
 */
export function transformBillToDb(apiBill: CongressApiBill): BillInsert {
  const billId = generateBillId(apiBill.congress, apiBill.type, apiBill.number);
  const sponsor = apiBill.sponsors?.[0];

  return {
    id: billId,
    congress: apiBill.congress,
    bill_type: apiBill.type,
    bill_number: parseInt(apiBill.number, 10),
    title: apiBill.title,
    sponsor_id: sponsor ? generateMemberId(sponsor.bioguideId) : null,
    introduced_date: parseDate(apiBill.introducedDate),
    latest_action_date: parseDate(apiBill.latestAction?.actionDate),
    latest_action_text: apiBill.latestAction?.text || null,
    policy_area: apiBill.policyArea?.name || null,
    status: apiBill.latestAction?.text || null,
    full_text_url: null, // Will be populated separately
    summary: null, // Will be populated separately
    origin_chamber: apiBill.originChamber || null,
    update_date: parseDate(apiBill.updateDate),
    constitutional_authority_text: apiBill.constitutionalAuthorityStatementText || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Transform Congress API Member to database member format
 */
export function transformMemberToDb(apiMember: CongressApiMember | CongressApiMemberDetail): MemberInsert {
  const detail = apiMember as CongressApiMemberDetail;
  const latestTerm = apiMember.terms?.item?.[0];

  return {
    id: generateMemberId(apiMember.bioguideId),
    bioguide_id: apiMember.bioguideId,
    first_name: detail.firstName || apiMember.name.split(' ')[0] || '',
    last_name: detail.lastName || apiMember.name.split(' ').slice(-1)[0] || '',
    middle_name: detail.middleName || null,
    suffix: detail.suffix || null,
    nickname: detail.nickName || null,
    party: apiMember.partyName || null,
    state: apiMember.state,
    district: apiMember.district?.toString() || null,
    chamber: latestTerm?.chamber || 'Unknown',
    image_url: apiMember.depiction?.imageUrl || null,
    terms_served: apiMember.terms?.item?.length || 1,
    current_term_start: latestTerm ? new Date(latestTerm.startYear, 0, 1).toISOString() : null,
    current_term_end: latestTerm?.endYear ? new Date(latestTerm.endYear, 11, 31).toISOString() : null,
    office_address: detail.addressInformation?.officeAddress || null,
    office_phone: detail.addressInformation?.phoneNumber || null,
    website_url: detail.officialWebsiteUrl || apiMember.url || null,
    twitter_handle: null, // Not provided by API
    youtube_channel: null, // Not provided by API
    facebook_page: null, // Not provided by API
    birth_year: detail.birthYear ? parseInt(detail.birthYear, 10) : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Transform bill cosponsors to database format
 */
export function transformCosponsorsToDb(
  billId: string,
  cosponsors: any[]
): BillCosponsorInsert[] {
  return cosponsors.map((cosponsor) => ({
    bill_id: billId,
    member_id: generateMemberId(cosponsor.bioguideId),
    sponsored_date: parseDate(cosponsor.sponsorshipDate),
    is_original_cosponsor: cosponsor.isOriginalCosponsor || false,
    created_at: new Date().toISOString(),
  }));
}

/**
 * Transform bill actions to database format
 */
export function transformActionsToDb(
  billId: string,
  actions: any[]
): BillActionInsert[] {
  return actions.map((action) => ({
    bill_id: billId,
    action_date: parseDate(action.actionDate) || new Date().toISOString(),
    action_code: action.actionCode || null,
    action_text: action.text,
    action_type: action.type || null,
    created_at: new Date().toISOString(),
  }));
}

/**
 * Transform Congress API Committee to database format
 */
export function transformCommitteeToDb(apiCommittee: CongressApiCommittee): CommitteeInsert {
  return {
    id: generateCommitteeId(apiCommittee.systemCode),
    name: apiCommittee.name,
    chamber: apiCommittee.chamber,
    committee_type: apiCommittee.type || null,
    parent_id: apiCommittee.parent?.systemCode || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Transform bill committees to database format
 */
export function transformBillCommitteesToDb(
  billId: string,
  committees: any[]
): BillCommitteeInsert[] {
  return committees.map((committee) => ({
    bill_id: billId,
    committee_id: generateCommitteeId(committee.systemCode),
    activity_type: committee.activities?.[0]?.name || null,
    created_at: new Date().toISOString(),
  }));
}

/**
 * Transform bill subjects to database format
 */
export function transformSubjectsToDb(
  billId: string,
  subjects: any
): BillSubjectInsert[] {
  const subjectList: BillSubjectInsert[] = [];

  // Add legislative subjects
  if (subjects.legislativeSubjects) {
    for (const subject of subjects.legislativeSubjects) {
      subjectList.push({
        bill_id: billId,
        subject: subject.name,
        created_at: new Date().toISOString(),
      });
    }
  }

  // Add policy area as a subject
  if (subjects.policyArea?.name) {
    subjectList.push({
      bill_id: billId,
      subject: subjects.policyArea.name,
      created_at: new Date().toISOString(),
    });
  }

  return subjectList;
}

/**
 * Transform bill amendments to database format
 */
export function transformAmendmentsToDb(
  billId: string,
  congress: number,
  amendments: any[]
): AmendmentInsert[] {
  return amendments.map((amendment) => ({
    id: generateAmendmentId(congress, parseInt(amendment.number, 10)),
    bill_id: billId,
    amendment_number: parseInt(amendment.number, 10),
    amendment_type: amendment.type || null,
    purpose: amendment.purpose || amendment.description || null,
    sponsor_id: null, // Would need additional API call
    submitted_date: parseDate(amendment.updateDate),
    status: amendment.latestAction?.text || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

/**
 * Transform related bills to database format
 */
export function transformRelatedBillsToDb(
  billId: string,
  relatedBills: any[]
): RelatedBillInsert[] {
  return relatedBills.map((relatedBill) => {
    const relatedBillId = generateBillId(
      relatedBill.congress,
      relatedBill.type,
      relatedBill.number
    );

    return {
      bill_id: billId,
      related_bill_id: relatedBillId,
      relationship_type: relatedBill.relationshipDetails?.[0]?.type || null,
      created_at: new Date().toISOString(),
    };
  });
}

/**
 * Extract summary text from bill summaries
 */
export function extractBillSummary(summaries: any[]): string | null {
  if (!summaries || summaries.length === 0) return null;

  // Get the most recent summary
  const latestSummary = summaries.sort((a, b) => {
    const dateA = new Date(a.updateDate || a.actionDate);
    const dateB = new Date(b.updateDate || b.actionDate);
    return dateB.getTime() - dateA.getTime();
  })[0];

  return latestSummary?.text || null;
}

/**
 * Build full text URL for a bill
 */
export function buildBillTextUrl(congress: number, type: string, number: string): string {
  return `https://www.congress.gov/${congress}/bills/${type}${number}/BILLS-${congress}${type}${number}ih.pdf`;
}

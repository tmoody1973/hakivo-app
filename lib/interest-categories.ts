/**
 * Interest Categories Utility Library
 *
 * Provides functions for working with the 12 citizen-friendly interest categories
 * that map to Congress.gov policy areas. Used for personalization across:
 * - Bill recommendations
 * - News aggregation (Exa.ai search)
 * - Daily audio briefings
 *
 * Note: All functions accept a Kysely<DB> instance as the first parameter.
 * This follows the project pattern where each service creates its own db instance.
 */

import type { Kysely } from 'kysely';
import type { DB } from '../src/db/hakivoDb/types';

export interface InterestCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  policyAreas: string[];
  color: string;
  createdAt: Date;
}

export interface BillSummary {
  id: string;
  congress: number;
  billType: string;
  billNumber: number;
  title: string;
  summary: string | null;
  policyArea: string | null;
  introducedDate: string | null;
  latestActionDate: string | null;
  latestActionText: string | null;
  sponsorName: string | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string | null;
  publishedAt: string | null;
  summary: string | null;
  policyArea: string | null;
}

export interface AudioBriefingContent {
  date: Date;
  userInterests: InterestCategory[];
  topBills: BillSummary[];
  topNews: NewsArticle[];
  briefingSections: BriefingSection[];
}

export interface BriefingSection {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  bills: BillSummary[];
  news: NewsArticle[];
}

/**
 * Get all interest categories from the database
 * @param db - Kysely database instance
 * @returns Array of all interest categories with parsed JSON fields
 */
export async function getAllInterestCategories(db: Kysely<DB>): Promise<InterestCategory[]> {
  const categories = await db
    .selectFrom('interest_categories')
    .selectAll()
    .execute();

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    keywords: JSON.parse(cat.keywords),
    policyAreas: JSON.parse(cat.policy_areas),
    color: cat.color,
    createdAt: new Date(cat.created_at),
  }));
}

/**
 * Get specific interest categories by their IDs
 * @param db - Kysely database instance
 * @param interestIds - Array of interest category IDs
 * @returns Array of interest categories
 */
export async function getInterestCategoriesByIds(
  db: Kysely<DB>,
  interestIds: string[]
): Promise<InterestCategory[]> {
  if (interestIds.length === 0) {
    return [];
  }

  const categories = await db
    .selectFrom('interest_categories')
    .selectAll()
    .where('id', 'in', interestIds)
    .execute();

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    keywords: JSON.parse(cat.keywords),
    policyAreas: JSON.parse(cat.policy_areas),
    color: cat.color,
    createdAt: new Date(cat.created_at),
  }));
}

/**
 * Get a user's selected interest categories
 * @param db - Kysely database instance
 * @param userId - The user's ID
 * @returns Array of the user's interest categories
 */
export async function getUserInterests(db: Kysely<DB>, userId: string): Promise<InterestCategory[]> {
  const userInterests = await db
    .selectFrom('user_interests')
    .innerJoin('interest_categories', 'user_interests.interest_category_id', 'interest_categories.id')
    .selectAll('interest_categories')
    .where('user_interests.user_id', '=', userId)
    .execute();

  return userInterests.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    keywords: JSON.parse(cat.keywords),
    policyAreas: JSON.parse(cat.policy_areas),
    color: cat.color,
    createdAt: new Date(cat.created_at),
  }));
}

/**
 * Get all keywords for a list of interest category IDs
 * @param db - Kysely database instance
 * @param interestIds - Array of interest category IDs
 * @returns Flattened array of all keywords (deduplicated)
 */
export async function getKeywordsForInterests(
  db: Kysely<DB>,
  interestIds: string[]
): Promise<string[]> {
  const categories = await getInterestCategoriesByIds(db, interestIds);

  // Flatten all keywords from all categories and deduplicate
  const allKeywords = categories.flatMap(cat => cat.keywords);
  return [...new Set(allKeywords)];
}

/**
 * Build an Exa.ai search query from interest category IDs
 * Combines keywords with OR operator for broad matching
 * @param db - Kysely database instance
 * @param interestIds - Array of interest category IDs
 * @param maxKeywords - Maximum number of keywords to include (default: 30)
 * @returns Search query string optimized for Exa.ai
 */
export async function buildNewsSearchQuery(
  db: Kysely<DB>,
  interestIds: string[],
  maxKeywords: number = 30
): Promise<string> {
  const keywords = await getKeywordsForInterests(db, interestIds);

  // Limit keywords to avoid overly long queries
  const limitedKeywords = keywords.slice(0, maxKeywords);

  // Build OR query
  return limitedKeywords.join(' OR ');
}

/**
 * Find the interest category that matches a given policy area
 * @param db - Kysely database instance
 * @param policyArea - A Congress.gov policy area name
 * @returns The matching interest category, or null if no match found
 */
export async function getInterestForPolicyArea(
  db: Kysely<DB>,
  policyArea: string
): Promise<InterestCategory | null> {
  const allCategories = await getAllInterestCategories(db);

  // Find category that includes this policy area
  const matchingCategory = allCategories.find(cat =>
    cat.policyAreas.some(pa =>
      pa.toLowerCase() === policyArea.toLowerCase() ||
      pa.toLowerCase().includes(policyArea.toLowerCase()) ||
      policyArea.toLowerCase().includes(pa.toLowerCase())
    )
  );

  return matchingCategory || null;
}

/**
 * Map multiple policy areas to their interest categories
 * @param db - Kysely database instance
 * @param policyAreas - Array of Congress.gov policy area names
 * @returns Array of unique interest categories (deduplicated)
 */
export async function mapPolicyAreasToInterests(
  db: Kysely<DB>,
  policyAreas: string[]
): Promise<InterestCategory[]> {
  const allCategories = await getAllInterestCategories(db);
  const matchedCategories = new Set<InterestCategory>();

  for (const policyArea of policyAreas) {
    const category = allCategories.find(cat =>
      cat.policyAreas.some(pa =>
        pa.toLowerCase() === policyArea.toLowerCase() ||
        pa.toLowerCase().includes(policyArea.toLowerCase()) ||
        policyArea.toLowerCase().includes(pa.toLowerCase())
      )
    );

    if (category) {
      matchedCategories.add(category);
    }
  }

  return Array.from(matchedCategories);
}

/**
 * Set a user's interest categories (replaces existing selections)
 * @param db - Kysely database instance
 * @param userId - The user's ID
 * @param interestIds - Array of interest category IDs to set
 */
export async function setUserInterests(
  db: Kysely<DB>,
  userId: string,
  interestIds: string[]
): Promise<void> {
  await db.transaction().execute(async (trx) => {
    // Remove existing interests
    await trx
      .deleteFrom('user_interests')
      .where('user_id', '=', userId)
      .execute();

    // Add new interests
    if (interestIds.length > 0) {
      await trx
        .insertInto('user_interests')
        .values(
          interestIds.map(interestId => ({
            user_id: userId,
            interest_category_id: interestId,
          }))
        )
        .execute();
    }
  });
}

/**
 * Add interest categories to a user's existing selections
 * @param db - Kysely database instance
 * @param userId - The user's ID
 * @param interestIds - Array of interest category IDs to add
 */
export async function addUserInterests(
  db: Kysely<DB>,
  userId: string,
  interestIds: string[]
): Promise<void> {
  if (interestIds.length === 0) {
    return;
  }

  // Get existing interests to avoid duplicates
  const existing = await db
    .selectFrom('user_interests')
    .select('interest_category_id')
    .where('user_id', '=', userId)
    .execute();

  const existingIds = new Set(existing.map(i => i.interest_category_id));
  const newIds = interestIds.filter(id => !existingIds.has(id));

  if (newIds.length > 0) {
    await db
      .insertInto('user_interests')
      .values(
        newIds.map(interestId => ({
          user_id: userId,
          interest_category_id: interestId,
        }))
      )
      .execute();
  }
}

/**
 * Remove interest categories from a user's selections
 * @param db - Kysely database instance
 * @param userId - The user's ID
 * @param interestIds - Array of interest category IDs to remove
 */
export async function removeUserInterests(
  db: Kysely<DB>,
  userId: string,
  interestIds: string[]
): Promise<void> {
  if (interestIds.length === 0) {
    return;
  }

  await db
    .deleteFrom('user_interests')
    .where('user_id', '=', userId)
    .where('interest_category_id', 'in', interestIds)
    .execute();
}

/**
 * Build a comprehensive news search query for a user based on their interests
 * Includes high-priority keywords from each selected category
 * @param db - Kysely database instance
 * @param userId - The user's ID
 * @param maxKeywords - Maximum keywords per category (default: 5)
 * @returns Search query string optimized for Exa.ai
 */
export async function buildUserNewsQuery(
  db: Kysely<DB>,
  userId: string,
  maxKeywords: number = 5
): Promise<string> {
  const userInterests = await getUserInterests(db, userId);

  if (userInterests.length === 0) {
    return '';
  }

  // Get top keywords from each category
  const queryParts = userInterests.map(interest => {
    const topKeywords = interest.keywords.slice(0, maxKeywords);
    return `(${topKeywords.join(' OR ')})`;
  });

  // Combine all category queries with OR
  return queryParts.join(' OR ');
}

/**
 * Get recommended bills for a user based on their interest categories
 * Returns bill IDs that match the user's selected policy areas
 * @param db - Kysely database instance
 * @param userId - The user's ID
 * @param limit - Maximum number of bills to return (default: 50)
 * @returns Array of bill IDs ordered by latest action date
 */
export async function getRecommendedBillsForUser(
  db: Kysely<DB>,
  userId: string,
  limit: number = 50
): Promise<string[]> {
  const userInterests = await getUserInterests(db, userId);

  if (userInterests.length === 0) {
    return [];
  }

  // Get all policy areas from user's interests
  const policyAreas = userInterests.flatMap(cat => cat.policyAreas);

  // Query bills that match these policy areas
  const bills = await db
    .selectFrom('bills')
    .select('id')
    .where('policy_area', 'in', policyAreas)
    .orderBy('latest_action_date', 'desc')
    .limit(limit)
    .execute();

  return bills.map(bill => bill.id);
}

// ============================================================================
// AUDIO BRIEFING HELPERS
// ============================================================================

/**
 * Get recent bills matching user's interests for audio briefing
 * @param db - Kysely database instance
 * @param userId - The user's ID
 * @param daysBack - How many days back to look (default: 7)
 * @param limit - Maximum number of bills to return (default: 10)
 * @returns Array of bill summaries
 */
export async function getBriefingBills(
  db: Kysely<DB>,
  userId: string,
  daysBack: number = 7,
  limit: number = 10
): Promise<BillSummary[]> {
  const userInterests = await getUserInterests(db, userId);

  if (userInterests.length === 0) {
    return [];
  }

  // Get all policy areas from user's interests
  const policyAreas = userInterests.flatMap(cat => cat.policyAreas);

  // Calculate date threshold
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysBack);
  const dateStr = dateThreshold.toISOString().split('T')[0];

  // Query recent bills that match these policy areas
  let query = db
    .selectFrom('bills')
    .select([
      'id',
      'congress',
      'bill_type',
      'bill_number',
      'title',
      'summary',
      'policy_area',
      'introduced_date',
      'latest_action_date',
      'latest_action_text',
      'sponsor_id',
    ])
    .where('policy_area', 'in', policyAreas)
    .where('latest_action_date', 'is not', null);

  // Type assertion needed because Kysely doesn't narrow null after 'is not null'
  const bills = await query
    .where('latest_action_date' as any, '>=', dateStr)
    .orderBy('latest_action_date', 'desc')
    .limit(limit)
    .execute();

  // Get sponsor names
  const sponsorIds = bills
    .map(b => b.sponsor_id)
    .filter((id): id is string => id !== null);

  let sponsorMap = new Map<string, string>();
  if (sponsorIds.length > 0) {
    const sponsors = await db
      .selectFrom('members')
      .select(['id', 'first_name', 'last_name'])
      .where('id', 'in', sponsorIds)
      .execute();

    sponsorMap = new Map(
      sponsors.map(s => [s.id, `${s.first_name} ${s.last_name}`])
    );
  }

  return bills.map(bill => ({
    id: bill.id,
    congress: bill.congress,
    billType: bill.bill_type,
    billNumber: bill.bill_number,
    title: bill.title,
    summary: bill.summary,
    policyArea: bill.policy_area,
    introducedDate: bill.introduced_date,
    latestActionDate: bill.latest_action_date,
    latestActionText: bill.latest_action_text,
    sponsorName: bill.sponsor_id ? sponsorMap.get(bill.sponsor_id) || null : null,
  }));
}

/**
 * Get recent news articles matching user's interests for audio briefing
 * @param db - Kysely database instance
 * @param userId - The user's ID
 * @param daysBack - How many days back to look (default: 2)
 * @param limit - Maximum number of articles to return (default: 15)
 * @returns Array of news articles
 */
export async function getBriefingNews(
  db: Kysely<DB>,
  userId: string,
  daysBack: number = 2,
  limit: number = 15
): Promise<NewsArticle[]> {
  const userInterests = await getUserInterests(db, userId);

  if (userInterests.length === 0) {
    return [];
  }

  // Get all policy areas from user's interests
  const policyAreas = userInterests.flatMap(cat => cat.policyAreas);

  // Calculate date threshold
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysBack);
  const dateStr = dateThreshold.toISOString();

  // Query recent news that matches these policy areas
  let newsQuery = db
    .selectFrom('news_articles')
    .selectAll()
    .where('policy_area', 'in', policyAreas)
    .where('published_at', 'is not', null);

  // Type assertion needed because Kysely doesn't narrow null after 'is not null'
  const news = await newsQuery
    .where('published_at' as any, '>=', dateStr)
    .orderBy('published_at', 'desc')
    .limit(limit)
    .execute();

  return news.map(article => ({
    id: article.id,
    title: article.title,
    url: article.url,
    source: article.source,
    publishedAt: article.published_at,
    summary: article.summary,
    policyArea: article.policy_area,
  }));
}

/**
 * Build structured audio briefing content organized by interest category
 * @param db - Kysely database instance
 * @param userId - The user's ID
 * @param options - Configuration options
 * @returns Complete audio briefing content structure
 */
export async function buildAudioBriefing(
  db: Kysely<DB>,
  userId: string,
  options: {
    billsDaysBack?: number;
    newsDaysBack?: number;
    maxBillsPerCategory?: number;
    maxNewsPerCategory?: number;
  } = {}
): Promise<AudioBriefingContent> {
  const {
    billsDaysBack = 7,
    newsDaysBack = 2,
    maxBillsPerCategory = 3,
    maxNewsPerCategory = 5,
  } = options;

  // Get user's interests
  const userInterests = await getUserInterests(db, userId);

  if (userInterests.length === 0) {
    return {
      date: new Date(),
      userInterests: [],
      topBills: [],
      topNews: [],
      briefingSections: [],
    };
  }

  // Fetch bills and news
  const [bills, news] = await Promise.all([
    getBriefingBills(db, userId, billsDaysBack, 50),
    getBriefingNews(db, userId, newsDaysBack, 50),
  ]);

  // Organize content by interest category
  const briefingSections: BriefingSection[] = [];

  for (const interest of userInterests) {
    // Filter bills that match this category's policy areas
    const categoryBills = bills
      .filter(bill =>
        bill.policyArea &&
        interest.policyAreas.some(pa =>
          pa.toLowerCase() === bill.policyArea?.toLowerCase() ||
          pa.toLowerCase().includes(bill.policyArea?.toLowerCase() || '') ||
          (bill.policyArea?.toLowerCase() || '').includes(pa.toLowerCase())
        )
      )
      .slice(0, maxBillsPerCategory);

    // Filter news that match this category's policy areas
    const categoryNews = news
      .filter(article =>
        article.policyArea &&
        interest.policyAreas.some(pa =>
          pa.toLowerCase() === article.policyArea?.toLowerCase() ||
          pa.toLowerCase().includes(article.policyArea?.toLowerCase() || '') ||
          (article.policyArea?.toLowerCase() || '').includes(pa.toLowerCase())
        )
      )
      .slice(0, maxNewsPerCategory);

    // Only include categories that have content
    if (categoryBills.length > 0 || categoryNews.length > 0) {
      briefingSections.push({
        categoryId: interest.id,
        categoryName: interest.name,
        categoryIcon: interest.icon,
        bills: categoryBills,
        news: categoryNews,
      });
    }
  }

  return {
    date: new Date(),
    userInterests,
    topBills: bills.slice(0, 10),
    topNews: news.slice(0, 15),
    briefingSections,
  };
}

/**
 * Generate a text outline for an audio briefing
 * This can be used as input to a text-to-speech system
 * @param briefing - Audio briefing content structure
 * @returns Formatted text outline ready for TTS
 */
export function generateBriefingScript(briefing: AudioBriefingContent): string {
  const lines: string[] = [];

  // Opening
  lines.push(`Good morning! Here's your personalized civic briefing for ${briefing.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })}.`);
  lines.push('');

  // Summary of interests
  if (briefing.userInterests.length > 0) {
    const interestNames = briefing.userInterests.map(i => i.name).join(', ');
    lines.push(`You're following: ${interestNames}.`);
    lines.push('');
  }

  // Overview of content
  lines.push(`Today we have ${briefing.topBills.length} bills and ${briefing.topNews.length} news articles that match your interests.`);
  lines.push('');

  // Sections by category
  for (const section of briefing.briefingSections) {
    lines.push(`--- ${section.categoryName} ---`);
    lines.push('');

    // Bills in this category
    if (section.bills.length > 0) {
      lines.push('Legislative Activity:');
      for (const bill of section.bills) {
        lines.push(`- ${bill.billType} ${bill.billNumber}: ${bill.title}`);
        if (bill.latestActionText) {
          lines.push(`  Latest: ${bill.latestActionText}`);
        }
      }
      lines.push('');
    }

    // News in this category
    if (section.news.length > 0) {
      lines.push('In the News:');
      for (const article of section.news) {
        lines.push(`- ${article.title}`);
        if (article.summary) {
          lines.push(`  ${article.summary.substring(0, 150)}...`);
        }
      }
      lines.push('');
    }
  }

  // Closing
  lines.push('That\'s your briefing for today. Stay informed and engaged!');

  return lines.join('\n');
}

/**
 * Get briefing statistics for a user
 * Useful for dashboard display
 * @param db - Kysely database instance
 * @param userId - The user's ID
 * @returns Statistics about available briefing content
 */
export async function getBriefingStats(
  db: Kysely<DB>,
  userId: string
): Promise<{
  interestCount: number;
  availableBills: number;
  availableNews: number;
  lastBillDate: string | null;
  lastNewsDate: string | null;
}> {
  const userInterests = await getUserInterests(db, userId);

  if (userInterests.length === 0) {
    return {
      interestCount: 0,
      availableBills: 0,
      availableNews: 0,
      lastBillDate: null,
      lastNewsDate: null,
    };
  }

  const policyAreas = userInterests.flatMap(cat => cat.policyAreas);

  // Get bill count
  const billCount = await db
    .selectFrom('bills')
    .select(db.fn.count('id').as('count'))
    .where('policy_area', 'in', policyAreas)
    .executeTakeFirst();

  // Get news count
  const newsCount = await db
    .selectFrom('news_articles')
    .select(db.fn.count('id').as('count'))
    .where('policy_area', 'in', policyAreas)
    .executeTakeFirst();

  // Get most recent bill date
  const recentBill = await db
    .selectFrom('bills')
    .select('latest_action_date')
    .where('policy_area', 'in', policyAreas)
    .orderBy('latest_action_date', 'desc')
    .limit(1)
    .executeTakeFirst();

  // Get most recent news date
  const recentNews = await db
    .selectFrom('news_articles')
    .select('published_at')
    .where('policy_area', 'in', policyAreas)
    .orderBy('published_at', 'desc')
    .limit(1)
    .executeTakeFirst();

  return {
    interestCount: userInterests.length,
    availableBills: Number(billCount?.count || 0),
    availableNews: Number(newsCount?.count || 0),
    lastBillDate: recentBill?.latest_action_date || null,
    lastNewsDate: recentNews?.published_at || null,
  };
}

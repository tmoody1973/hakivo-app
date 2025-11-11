import {
  NewsArticle,
  NewsQuery,
  UserNewsPreferences,
  NewsAggregationResult
} from './interfaces';

export async function fetchNewsFromBrave(_query: NewsQuery, _env: any): Promise<NewsArticle[]> {
  throw new Error('Not implemented');
}

export async function rankArticles(
  _articles: NewsArticle[],
  _preferences: UserNewsPreferences
): Promise<NewsArticle[]> {
  throw new Error('Not implemented');
}

export async function cacheNewsResults(
  _userId: string,
  _articles: NewsArticle[],
  _env: any
): Promise<void> {
  throw new Error('Not implemented');
}

export async function getCachedNews(
  _userId: string,
  _env: any
): Promise<NewsArticle[] | null> {
  throw new Error('Not implemented');
}

export async function fetchNews(
  _userId: string,
  _preferences: UserNewsPreferences,
  _env: any
): Promise<NewsAggregationResult> {
  throw new Error('Not implemented');
}

export async function refreshUserNews(_userId: string, _env: any): Promise<void> {
  throw new Error('Not implemented');
}


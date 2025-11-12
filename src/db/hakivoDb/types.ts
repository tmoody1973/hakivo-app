import type { ColumnType, GeneratedAlways } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type amendments = {
    id: string;
    bill_id: string;
    amendment_number: number;
    amendment_type: string | null;
    purpose: string | null;
    sponsor_id: string | null;
    submitted_date: string | null;
    status: string | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
};
export type bill_actions = {
    id: GeneratedAlways<number>;
    bill_id: string;
    action_date: string;
    action_code: string | null;
    action_text: string;
    action_type: string | null;
    created_at: Generated<string>;
};
export type bill_committees = {
    id: GeneratedAlways<number>;
    bill_id: string;
    committee_id: string;
    activity_type: string | null;
    created_at: Generated<string>;
};
export type bill_cosponsors = {
    id: GeneratedAlways<number>;
    bill_id: string;
    member_id: string;
    sponsored_date: string | null;
    is_original_cosponsor: Generated<number>;
    created_at: Generated<string>;
};
export type bill_subjects = {
    id: GeneratedAlways<number>;
    bill_id: string;
    subject: string;
    created_at: Generated<string>;
};
export type bill_text_chunks = {
    id: GeneratedAlways<number>;
    bill_id: string;
    chunk_index: number;
    chunk_text: string;
    chunk_size: number;
    created_at: Generated<string>;
};
export type bills = {
    id: string;
    congress: number;
    bill_type: string;
    bill_number: number;
    title: string;
    sponsor_id: string | null;
    introduced_date: string | null;
    latest_action_date: string | null;
    latest_action_text: string | null;
    policy_area: string | null;
    status: string | null;
    full_text_url: string | null;
    full_text: string | null;
    summary: string | null;
    origin_chamber: string | null;
    update_date: string | null;
    constitutional_authority_text: string | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
};
export type committees = {
    id: string;
    name: string;
    chamber: string;
    committee_type: string | null;
    parent_id: string | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
};
export type engagement_metrics = {
    id: GeneratedAlways<number>;
    user_id: string;
    event_type: string;
    event_data: string | null;
    created_at: Generated<string>;
};
export type member_committees = {
    id: GeneratedAlways<number>;
    member_id: string;
    committee_id: string;
    rank: number | null;
    role: string | null;
    start_date: string | null;
    end_date: string | null;
    created_at: Generated<string>;
};
export type members = {
    id: string;
    bioguide_id: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    nickname: string | null;
    party: string | null;
    state: string;
    district: string | null;
    chamber: string;
    image_url: string | null;
    terms_served: Generated<number>;
    current_term_start: string | null;
    current_term_end: string | null;
    office_address: string | null;
    office_phone: string | null;
    website_url: string | null;
    twitter_handle: string | null;
    youtube_channel: string | null;
    facebook_page: string | null;
    birth_year: number | null;
    created_at: Generated<string>;
    updated_at: Generated<string>;
};
export type news_articles = {
    id: string;
    title: string;
    url: string;
    source: string | null;
    published_at: string | null;
    summary: string | null;
    policy_area: string | null;
    fetched_at: Generated<string>;
};
export type podcasts = {
    id: string;
    user_id: string | null;
    podcast_type: string;
    title: string;
    description: string | null;
    duration_seconds: number | null;
    audio_url: string;
    transcript: string | null;
    generated_at: Generated<string>;
};
export type related_bills = {
    id: GeneratedAlways<number>;
    bill_id: string;
    related_bill_id: string;
    relationship_type: string | null;
    created_at: Generated<string>;
};
export type user_news = {
    id: GeneratedAlways<number>;
    user_id: string;
    article_id: string;
    relevance_score: number | null;
    created_at: Generated<string>;
};
export type user_policy_interests = {
    id: GeneratedAlways<number>;
    user_id: string;
    policy_area: string;
    created_at: Generated<string>;
};
export type user_representatives = {
    id: GeneratedAlways<number>;
    user_id: string;
    member_id: string;
    created_at: Generated<string>;
};
export type user_sessions = {
    id: string;
    user_id: string;
    token: string;
    expires_at: string;
    created_at: Generated<string>;
};
export type users = {
    id: string;
    email: string;
    name: string;
    zip_code: string | null;
    onboarding_completed: Generated<number>;
    created_at: Generated<string>;
    updated_at: Generated<string>;
};
export type widget_preferences = {
    id: GeneratedAlways<number>;
    user_id: string;
    widget_type: string;
    enabled: Generated<number>;
    position: number | null;
    config: string | null;
    updated_at: Generated<string>;
};
export type interest_categories = {
    id: string;
    name: string;
    description: string;
    icon: string;
    keywords: string;  // JSON array
    policy_areas: string;  // JSON array
    color: string;
    created_at: Generated<string>;
};
export type user_interests = {
    user_id: string;
    interest_category_id: string;
    created_at: Generated<string>;
};
export type DB = {
    amendments: amendments;
    bill_actions: bill_actions;
    bill_committees: bill_committees;
    bill_cosponsors: bill_cosponsors;
    bill_subjects: bill_subjects;
    bill_text_chunks: bill_text_chunks;
    bills: bills;
    committees: committees;
    engagement_metrics: engagement_metrics;
    interest_categories: interest_categories;
    member_committees: member_committees;
    members: members;
    news_articles: news_articles;
    podcasts: podcasts;
    related_bills: related_bills;
    user_interests: user_interests;
    user_news: user_news;
    user_policy_interests: user_policy_interests;
    user_representatives: user_representatives;
    user_sessions: user_sessions;
    users: users;
    widget_preferences: widget_preferences;
};

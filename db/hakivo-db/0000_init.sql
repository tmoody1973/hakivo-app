-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zip_code" TEXT,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_policy_interests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "policy_area" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_policy_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "congress" INTEGER NOT NULL,
    "bill_type" TEXT NOT NULL,
    "bill_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "sponsor_id" TEXT,
    "introduced_date" DATETIME,
    "latest_action_date" DATETIME,
    "latest_action_text" TEXT,
    "policy_area" TEXT,
    "status" TEXT,
    "full_text_url" TEXT,
    "full_text" TEXT,
    "summary" TEXT,
    "origin_chamber" TEXT,
    "update_date" DATETIME,
    "constitutional_authority_text" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bills_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "members" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bioguide_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "suffix" TEXT,
    "nickname" TEXT,
    "party" TEXT,
    "state" TEXT NOT NULL,
    "district" TEXT,
    "chamber" TEXT NOT NULL,
    "image_url" TEXT,
    "terms_served" INTEGER NOT NULL DEFAULT 1,
    "current_term_start" DATETIME,
    "current_term_end" DATETIME,
    "office_address" TEXT,
    "office_phone" TEXT,
    "website_url" TEXT,
    "twitter_handle" TEXT,
    "youtube_channel" TEXT,
    "facebook_page" TEXT,
    "birth_year" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_representatives" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_representatives_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_representatives_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "podcasts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "podcast_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration_seconds" INTEGER,
    "audio_url" TEXT NOT NULL,
    "transcript" TEXT,
    "generated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "podcasts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT,
    "published_at" DATETIME,
    "summary" TEXT,
    "policy_area" TEXT,
    "fetched_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_news" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "relevance_score" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_news_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_news_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "news_articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "widget_preferences" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "widget_type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER,
    "config" TEXT,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "widget_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "engagement_metrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "engagement_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bill_cosponsors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bill_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "sponsored_date" DATETIME,
    "is_original_cosponsor" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bill_cosponsors_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bill_cosponsors_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bill_actions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bill_id" TEXT NOT NULL,
    "action_date" DATETIME NOT NULL,
    "action_code" TEXT,
    "action_text" TEXT NOT NULL,
    "action_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bill_actions_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "committees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "chamber" TEXT NOT NULL,
    "committee_type" TEXT,
    "parent_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "bill_committees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bill_id" TEXT NOT NULL,
    "committee_id" TEXT NOT NULL,
    "activity_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bill_committees_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bill_committees_committee_id_fkey" FOREIGN KEY ("committee_id") REFERENCES "committees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "member_committees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "member_id" TEXT NOT NULL,
    "committee_id" TEXT NOT NULL,
    "rank" INTEGER,
    "role" TEXT,
    "start_date" DATETIME,
    "end_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "member_committees_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "member_committees_committee_id_fkey" FOREIGN KEY ("committee_id") REFERENCES "committees" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bill_subjects" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bill_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bill_subjects_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "amendments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bill_id" TEXT NOT NULL,
    "amendment_number" INTEGER NOT NULL,
    "amendment_type" TEXT,
    "purpose" TEXT,
    "sponsor_id" TEXT,
    "submitted_date" DATETIME,
    "status" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "amendments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "related_bills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bill_id" TEXT NOT NULL,
    "related_bill_id" TEXT NOT NULL,
    "relationship_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "related_bills_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_zip_code_idx" ON "users"("zip_code");

-- CreateIndex
CREATE INDEX "user_policy_interests_user_id_idx" ON "user_policy_interests"("user_id");

-- CreateIndex
CREATE INDEX "user_policy_interests_policy_area_idx" ON "user_policy_interests"("policy_area");

-- CreateIndex
CREATE INDEX "bills_congress_idx" ON "bills"("congress");

-- CreateIndex
CREATE INDEX "bills_policy_area_idx" ON "bills"("policy_area");

-- CreateIndex
CREATE INDEX "bills_status_idx" ON "bills"("status");

-- CreateIndex
CREATE INDEX "bills_sponsor_id_idx" ON "bills"("sponsor_id");

-- CreateIndex
CREATE INDEX "bills_latest_action_date_idx" ON "bills"("latest_action_date");

-- CreateIndex
CREATE INDEX "bills_bill_type_idx" ON "bills"("bill_type");

-- CreateIndex
CREATE UNIQUE INDEX "members_bioguide_id_key" ON "members"("bioguide_id");

-- CreateIndex
CREATE INDEX "members_bioguide_id_idx" ON "members"("bioguide_id");

-- CreateIndex
CREATE INDEX "members_state_idx" ON "members"("state");

-- CreateIndex
CREATE INDEX "members_chamber_idx" ON "members"("chamber");

-- CreateIndex
CREATE INDEX "members_party_idx" ON "members"("party");

-- CreateIndex
CREATE INDEX "user_representatives_user_id_idx" ON "user_representatives"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_representatives_user_id_member_id_key" ON "user_representatives"("user_id", "member_id");

-- CreateIndex
CREATE INDEX "podcasts_user_id_idx" ON "podcasts"("user_id");

-- CreateIndex
CREATE INDEX "podcasts_podcast_type_idx" ON "podcasts"("podcast_type");

-- CreateIndex
CREATE INDEX "podcasts_generated_at_idx" ON "podcasts"("generated_at");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_url_key" ON "news_articles"("url");

-- CreateIndex
CREATE INDEX "news_articles_policy_area_idx" ON "news_articles"("policy_area");

-- CreateIndex
CREATE INDEX "news_articles_published_at_idx" ON "news_articles"("published_at");

-- CreateIndex
CREATE INDEX "user_news_user_id_idx" ON "user_news"("user_id");

-- CreateIndex
CREATE INDEX "user_news_relevance_score_idx" ON "user_news"("relevance_score");

-- CreateIndex
CREATE UNIQUE INDEX "user_news_user_id_article_id_key" ON "user_news"("user_id", "article_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_token_idx" ON "user_sessions"("token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "widget_preferences_user_id_idx" ON "widget_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "widget_preferences_user_id_widget_type_key" ON "widget_preferences"("user_id", "widget_type");

-- CreateIndex
CREATE INDEX "engagement_metrics_user_id_idx" ON "engagement_metrics"("user_id");

-- CreateIndex
CREATE INDEX "engagement_metrics_event_type_idx" ON "engagement_metrics"("event_type");

-- CreateIndex
CREATE INDEX "engagement_metrics_created_at_idx" ON "engagement_metrics"("created_at");

-- CreateIndex
CREATE INDEX "bill_cosponsors_bill_id_idx" ON "bill_cosponsors"("bill_id");

-- CreateIndex
CREATE INDEX "bill_cosponsors_member_id_idx" ON "bill_cosponsors"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "bill_cosponsors_bill_id_member_id_key" ON "bill_cosponsors"("bill_id", "member_id");

-- CreateIndex
CREATE INDEX "bill_actions_bill_id_idx" ON "bill_actions"("bill_id");

-- CreateIndex
CREATE INDEX "bill_actions_action_date_idx" ON "bill_actions"("action_date");

-- CreateIndex
CREATE INDEX "committees_chamber_idx" ON "committees"("chamber");

-- CreateIndex
CREATE INDEX "bill_committees_bill_id_idx" ON "bill_committees"("bill_id");

-- CreateIndex
CREATE INDEX "bill_committees_committee_id_idx" ON "bill_committees"("committee_id");

-- CreateIndex
CREATE UNIQUE INDEX "bill_committees_bill_id_committee_id_key" ON "bill_committees"("bill_id", "committee_id");

-- CreateIndex
CREATE INDEX "member_committees_member_id_idx" ON "member_committees"("member_id");

-- CreateIndex
CREATE INDEX "member_committees_committee_id_idx" ON "member_committees"("committee_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_committees_member_id_committee_id_key" ON "member_committees"("member_id", "committee_id");

-- CreateIndex
CREATE INDEX "bill_subjects_bill_id_idx" ON "bill_subjects"("bill_id");

-- CreateIndex
CREATE INDEX "bill_subjects_subject_idx" ON "bill_subjects"("subject");

-- CreateIndex
CREATE INDEX "amendments_bill_id_idx" ON "amendments"("bill_id");

-- CreateIndex
CREATE INDEX "related_bills_bill_id_idx" ON "related_bills"("bill_id");

-- CreateIndex
CREATE INDEX "related_bills_related_bill_id_idx" ON "related_bills"("related_bill_id");

-- CreateIndex
CREATE UNIQUE INDEX "related_bills_bill_id_related_bill_id_key" ON "related_bills"("bill_id", "related_bill_id");

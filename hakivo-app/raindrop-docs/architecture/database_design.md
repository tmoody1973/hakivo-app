# Database Design

## Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    zip_code TEXT,
    onboarding_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_zip_code ON users(zip_code);
```

## User Policy Interests Table

```sql
CREATE TABLE IF NOT EXISTS user_policy_interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    policy_area TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_policy_interests_user_id ON user_policy_interests(user_id);
CREATE INDEX idx_user_policy_interests_policy_area ON user_policy_interests(policy_area);
```

## Bills Table

```sql
CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    congress INTEGER NOT NULL,
    bill_type TEXT NOT NULL,
    bill_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    sponsor_id TEXT,
    introduced_date DATE,
    latest_action_date DATE,
    latest_action_text TEXT,
    policy_area TEXT,
    status TEXT,
    full_text_url TEXT,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sponsor_id) REFERENCES members(id)
);

CREATE INDEX idx_bills_congress ON bills(congress);
CREATE INDEX idx_bills_policy_area ON bills(policy_area);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_sponsor_id ON bills(sponsor_id);
CREATE INDEX idx_bills_latest_action_date ON bills(latest_action_date);
```

## Members Table

```sql
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    bioguide_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    party TEXT,
    state TEXT NOT NULL,
    district TEXT,
    chamber TEXT NOT NULL,
    image_url TEXT,
    terms_served INTEGER DEFAULT 1,
    current_term_start DATE,
    current_term_end DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_members_bioguide_id ON members(bioguide_id);
CREATE INDEX idx_members_state ON members(state);
CREATE INDEX idx_members_chamber ON members(chamber);
CREATE INDEX idx_members_party ON members(party);
```

## User Representatives Table

```sql
CREATE TABLE IF NOT EXISTS user_representatives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_user_representatives_user_member ON user_representatives(user_id, member_id);
CREATE INDEX idx_user_representatives_user_id ON user_representatives(user_id);
```

## Podcasts Table

```sql
CREATE TABLE IF NOT EXISTS podcasts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    podcast_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration_seconds INTEGER,
    audio_url TEXT NOT NULL,
    transcript TEXT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_podcasts_user_id ON podcasts(user_id);
CREATE INDEX idx_podcasts_type ON podcasts(podcast_type);
CREATE INDEX idx_podcasts_generated_at ON podcasts(generated_at);
```

## News Articles Table

```sql
CREATE TABLE IF NOT EXISTS news_articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    source TEXT,
    published_at DATETIME,
    summary TEXT,
    policy_area TEXT,
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_articles_policy_area ON news_articles(policy_area);
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at);
```

## User News Table

```sql
CREATE TABLE IF NOT EXISTS user_news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    article_id TEXT NOT NULL,
    relevance_score REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_user_news_user_article ON user_news(user_id, article_id);
CREATE INDEX idx_user_news_user_id ON user_news(user_id);
CREATE INDEX idx_user_news_relevance_score ON user_news(relevance_score);
```

## User Sessions Table

```sql
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

## Widget Preferences Table

```sql
CREATE TABLE IF NOT EXISTS widget_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    widget_type TEXT NOT NULL,
    enabled BOOLEAN DEFAULT 1,
    position INTEGER,
    config JSON,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_widget_preferences_user_widget ON widget_preferences(user_id, widget_type);
CREATE INDEX idx_widget_preferences_user_id ON widget_preferences(user_id);
```

## Engagement Metrics Table

```sql
CREATE TABLE IF NOT EXISTS engagement_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_engagement_metrics_user_id ON engagement_metrics(user_id);
CREATE INDEX idx_engagement_metrics_event_type ON engagement_metrics(event_type);
CREATE INDEX idx_engagement_metrics_created_at ON engagement_metrics(created_at);
```

## Foreign Key Relationships

```
users → user_policy_interests (one-to-many)
users → user_representatives (one-to-many)
users → podcasts (one-to-many)
users → user_news (one-to-many)
users → user_sessions (one-to-many)
users → widget_preferences (one-to-many)
users → engagement_metrics (one-to-many)

members → bills (one-to-many as sponsor)
members → user_representatives (one-to-many)

bills (no outgoing foreign keys)

news_articles → user_news (one-to-many)
```

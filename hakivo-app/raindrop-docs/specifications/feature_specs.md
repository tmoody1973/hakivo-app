# Feature Specifications

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| User Authentication | WorkOS OAuth with Google and email/password support | High |
| User Onboarding | Multi-step flow capturing policy interests and zip code | High |
| Congressional Data Ingestion | Automated fetching of bills and members from Congress.gov API for 118th and 119th Congress | High |
| Legislative Search | Semantic search across bills using SmartBuckets | High |
| Representative Lookup | Zip code to representative matching via Geocod.io | High |
| Personalized Daily Podcasts | AI-generated 5-9 minute daily briefings based on user interests | High |
| Personalized Weekly Podcasts | AI-generated 15-20 minute weekly deep dives | High |
| Weekly Legislation Podcasts | Two non-personalized weekly podcasts on impactful legislation | Medium |
| NPR-Quality Audio | Dual-host (Sarah and James) audio via ElevenLabs text-to-dialogue | High |
| Personalized News | Brave Search API integration for policy-relevant news | High |
| Dashboard Widgets | Modular widgets for representatives, bills, briefs, and news | High |
| Widget Customization | Enable/disable and reorder dashboard widgets | Medium |
| Bill Detail Pages | Comprehensive bill information and action history | High |
| Member Detail Pages | Complete representative profiles and legislative activity | High |
| Bill AI Chat | Cerebras-powered Q&A for individual bills | Medium |
| Voice Agent | ElevenLabs voice interaction for querying data | Low |
| Brief Archive | Historical podcast playback and filtering | Medium |
| Engagement Metrics | User interaction tracking for analytics | Low |
| Audio CDN Delivery | Vultr Object Storage with CDN for podcast distribution | High |

## Acceptance Criteria

### User Authentication
- Users can register with email/password or Google OAuth
- WorkOS handles authentication flows
- JWT tokens issued on successful login
- Token validation on protected endpoints
- Session management with expiration

### User Onboarding
- First-time users see onboarding flow
- Policy interest selection from Congressional subject areas
- Zip code capture for representative lookup
- Skip option with ability to complete later
- Preferences saved to database

### Congressional Data Ingestion
- Automated sync every 6 hours via scheduled task
- Bills from 118th and 119th Congress stored in SQL database
- Full bill text uploaded to SmartBucket for semantic search
- Member biographical data stored with current term information
- Incremental updates to avoid duplicate processing

### Legislative Search
- Natural language search queries against bill database
- SmartBucket semantic search returns relevant results
- Search results include bill title, sponsor, status, and relevance score
- Pagination support for large result sets
- Filter by congress, status, policy area

### Representative Lookup
- Accept zip code input
- Call Geocod.io API for district mapping
- Match to House and Senate members
- Display representative cards with contact information
- Cache results for performance

### Personalized Daily Podcasts
- Generated at 6 AM daily via scheduled task
- Content curated based on user policy interests
- Include relevant bills and news from past 24 hours
- 5-9 minute duration target
- Conversational script via Claude Sonnet 4
- Audio synthesis with Sarah and James voices
- Upload to Vultr Object Storage
- Link saved to user's podcast table

### Personalized Weekly Podcasts
- Generated Sunday mornings via scheduled task
- Deep dive into week's legislative activity
- 15-20 minute duration target
- Match user policy interests
- Include news context and analysis
- Same audio generation pipeline as daily

### Weekly Legislation Podcasts
- Two separate podcasts: enacted legislation and presidential focus
- Generated weekly for all users (non-personalized)
- Analyze top 100 most impactful bills that became law
- Examine president's most significant legislative actions
- Available in brief archive

### NPR-Quality Audio
- Use ElevenLabs text-to-dialogue API
- Sarah and James voice IDs configured
- Conversational dialogue format with host banter
- High-quality audio output suitable for podcast distribution
- Consistent voice characteristics across episodes

### Personalized News
- Fetch news via Brave Search API based on user interests
- Run every 2 hours via scheduled task
- Filter and rank by relevance to user's policy areas
- Store articles with metadata
- Link to users for dashboard display
- Cache results for performance

### Dashboard Widgets
- Representatives widget showing user's senators and representative
- Latest bill actions widget for tracked bills
- Daily brief player widget
- Personalized news feed widget
- Customizable layout via drag-and-drop
- Widget preferences stored per user

### Widget Customization
- Enable/disable individual widgets
- Drag-and-drop reordering
- Position saved to database
- Real-time preview of changes
- Reset to defaults option

### Bill Detail Pages
- Display complete bill metadata
- Show sponsor and cosponsors
- Action history timeline
- Full text link to Congress.gov
- Related bills section
- Share functionality
- Add to tracking

### Member Detail Pages
- Display member biography and photo
- Show current committee assignments
- List sponsored bills
- Contact information
- Voting record highlights
- Social media links

### Bill AI Chat
- Chat interface on bill detail page
- Cerebras API for Q&A
- Bill context provided to AI
- Conversation history maintained
- Markdown formatting for responses
- Copy to clipboard functionality

### Voice Agent
- Real-time voice input via ElevenLabs
- Natural language processing for queries
- Voice response generation
- Support questions about bills, members, and news
- Conversation state management

### Brief Archive
- List all generated podcasts for user
- Filter by type (daily, weekly, legislation)
- Sort by date
- Audio player with playback controls
- Download option
- Share functionality

### Engagement Metrics
- Track page views, search queries, podcast plays
- Record widget interactions
- Measure time on page
- Store events in database for analytics
- Privacy-compliant tracking

### Audio CDN Delivery
- Upload audio files to Vultr Object Storage
- Configure CDN for global distribution
- Generate signed URLs for secure access
- Automatic cleanup of old files
- Monitor storage usage

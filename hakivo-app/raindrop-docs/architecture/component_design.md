# Component Design

## Component Inventory

| Name | Type | Visibility | Purpose |
|------|------|-----------|---------|
| api-gateway | service | public | Main API entry point, request routing, authentication |
| congress-ingestion | service | private | Congressional data fetching and processing |
| podcast-generator | service | private | Podcast script generation and audio synthesis |
| news-aggregator | service | private | News fetching and curation |
| auth-service | service | private | WorkOS OAuth integration and session management |
| representative-lookup | service | private | Geocoding and representative matching |
| bill-chat | service | private | Bill analysis using Cerebras API |
| voice-agent | service | private | ElevenLabs voice interaction |
| bill-ingestion-observer | observer | - | Processes new bill documents for SmartBucket indexing |
| podcast-scheduler | task | - | Daily and weekly podcast generation scheduler |
| congress-sync-task | task | - | Periodic Congressional data synchronization |
| news-sync-task | task | - | Periodic news fetching for users |

## Component Responsibilities

**api-gateway**: Routes client requests to appropriate backend services, validates JWT tokens, enforces rate limits, returns aggregated responses

**congress-ingestion**: Fetches bills and members from Congress.gov API, processes metadata, stores in SQL database, uploads full text to SmartBucket for semantic search

**podcast-generator**: Curates personalized content based on user interests, generates conversational scripts using Claude Sonnet 4, synthesizes audio with ElevenLabs text-to-dialogue, uploads to Vultr Object Storage

**news-aggregator**: Queries Brave Search API based on user policy interests, filters and ranks articles, caches results for dashboard widgets

**auth-service**: Handles WorkOS OAuth flows, manages JWT token generation and validation, stores user sessions

**representative-lookup**: Accepts zip codes, calls Geocod.io API for district mapping, matches to representatives in database

**bill-chat**: Provides Q&A interface for individual bills using Cerebras API with bill context

**voice-agent**: Handles real-time voice queries via ElevenLabs API, processes natural language questions about bills and members

**bill-ingestion-observer**: Monitors SmartBucket for new bill uploads, triggers indexing and metadata extraction

**podcast-scheduler**: Runs daily at 6 AM for daily briefs, weekly on Sunday for weekly podcasts, triggers podcast-generator service

**congress-sync-task**: Runs every 6 hours to fetch latest bill updates and new members from Congress.gov API

**news-sync-task**: Runs every 2 hours to refresh news articles for active users based on their interests

## Inter-Component Communication

```
api-gateway → auth-service.validateToken()
api-gateway → congress-ingestion.getBill()
api-gateway → podcast-generator.generateDailyBrief()
api-gateway → news-aggregator.fetchNews()
api-gateway → representative-lookup.findByZip()
api-gateway → bill-chat.chat()
api-gateway → voice-agent.processVoiceQuery()

podcast-scheduler → podcast-generator.generateDailyPodcast()
podcast-scheduler → podcast-generator.generateWeeklyPodcast()

congress-sync-task → congress-ingestion.syncBills()
congress-sync-task → congress-ingestion.syncMembers()

news-sync-task → news-aggregator.refreshUserNews()

bill-ingestion-observer → congress-ingestion.processBillDocument()
```

## File Structure Per Component

### Services (api-gateway, congress-ingestion, podcast-generator, news-aggregator, auth-service, representative-lookup, bill-chat, voice-agent)
```
src/components/<component-name>/
├── index.ts          # Service entry point, fetch handler, route definitions
├── interfaces.ts     # Type definitions, Zod schemas, request/response types
└── utils.ts          # Business logic, API integrations, helper functions
```

### Observers (bill-ingestion-observer)
```
src/components/bill-ingestion-observer/
├── index.ts          # Observer entry point, process method implementation
├── interfaces.ts     # Event types, notification schemas
└── utils.ts          # Processing logic, SmartBucket operations
```

### Tasks (podcast-scheduler, congress-sync-task, news-sync-task)
```
src/components/<task-name>/
├── index.ts          # Task entry point, handle method implementation
├── interfaces.ts     # Schedule types, job parameters
└── utils.ts          # Task execution logic, service coordination
```

## Shared Code

```
src/shared/
├── interfaces.ts     # Common types used across components
└── utils.ts          # Common utilities (logging, error handling, validation)
```

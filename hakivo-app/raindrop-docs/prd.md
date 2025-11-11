# Product Requirements Document: Hakivo

## Executive Summary

Hakivo addresses a fundamental challenge in civic engagement: citizens who care about democratic participation lack the time and tools to effectively track Congressional legislation that affects their communities. While engaged citizens, students, journalists, and policy advocates recognize the importance of staying informed about legislative developments, the volume and complexity of Congressional bills creates an insurmountable barrier to meaningful participation. Current solutions require hours of manual research through dense legislative text on Congress.gov, fragmented news coverage, and scattered representative communications—an unrealistic burden for citizens managing work, education, and other responsibilities.

Hakivo transforms this relationship by converting impenetrable Congressional legislation into accessible, personalized audio briefings and interactive dashboards. The platform leverages Claude Sonnet 4 for intelligent bill analysis and content curation, ElevenLabs text-to-dialogue for NPR-quality audio generation, and the Raindrop Platform's SmartBuckets for semantic legislative search. By integrating Congressional data from Congress.gov, geolocation services for representative matching, news APIs for contextual information, and AI-powered content generation, Hakivo delivers daily 5-minute briefings and weekly 15-minute deep dives tailored to individual policy interests. This approach makes democratic participation practical for busy citizens while maintaining the depth and accuracy required for informed civic engagement.

The application serves citizens who want to participate meaningfully in democracy but face time constraints that prevent traditional legislative monitoring. By automating the research, analysis, and summarization process while delivering content through convenient audio formats and visual dashboards, Hakivo removes the barriers that prevent civic engagement without compromising the quality or comprehensiveness of legislative information.

## Requirements

### Functional Requirements

- Ingest Congressional bills and member data from Congress.gov API for 118th and 119th Congress
- Provide semantic search across legislation using SmartBucket RAG capabilities
- Generate personalized daily 5-9 minute audio briefings based on user policy interests
- Generate personalized weekly 15-20 minute audio deep dives
- Generate two weekly non-personalized podcasts on enacted legislation and presidential actions
- Authenticate users via WorkOS OAuth with Google and email/password support
- Capture user policy interests and zip code during onboarding
- Match users to their Congressional representatives using Geocod.io API
- Fetch personalized news articles via Brave Search API based on policy interests
- Provide AI chat interface for individual bills using Cerebras API
- Offer voice interaction via ElevenLabs API for querying legislative data
- Display modular dashboard with customizable widgets
- Store and deliver audio files via Vultr Object Storage with CDN
- Track user engagement metrics for analytics
- Provide bill and member detail pages with comprehensive information
- Maintain brief archive for historical podcast playback

### Non-Functional Requirements

- Audio quality comparable to NPR podcasts with natural dialogue flow
- Search results returned within 2 seconds for typical queries
- Daily podcasts generated and available by 6 AM user local time
- Support concurrent users without degradation
- Secure storage of user credentials and personal information
- WCAG 2.1 AA accessibility compliance for web interface
- Mobile-responsive design for dashboard and playback interfaces
- API rate limiting to prevent abuse
- Graceful degradation when external services unavailable
- 99.9% uptime for podcast delivery and dashboard access

## Architecture Approach

The application follows a microservices architecture pattern built on the Raindrop Platform, leveraging service-to-service communication for clean separation of concerns and independent scaling. The architecture centers on an API gateway that orchestrates multiple specialized backend services, each handling a distinct domain of functionality. This approach enables focused component responsibilities while maintaining system cohesion through type-safe environment bindings.

### Component-to-Requirement Mapping

| Component | Type | Addresses Requirements | Solution Approach |
|-----------|------|----------------------|-------------------|
| api-gateway | Service | API access, authentication validation, request routing, rate limiting | Public-facing service implementing Hono router for HTTP endpoints, JWT validation middleware, and orchestration of backend service calls for aggregated responses |
| congress-ingestion | Service | Congressional data ingestion, bill/member synchronization | Private service integrating Congress.gov API v3 with incremental sync logic, storing structured data in SQL database and uploading full bill text to SmartBucket for semantic indexing |
| podcast-generator | Service | Personalized daily/weekly podcasts, legislation podcasts, NPR-quality audio | Private service using Claude Sonnet 4 for conversational script generation, ElevenLabs text-to-dialogue API for dual-host audio synthesis, and Vultr Object Storage for CDN-backed distribution |
| news-aggregator | Service | Personalized news fetching, content curation | Private service querying Brave Search API with user policy interests, ranking articles by relevance, and caching results for dashboard presentation |
| auth-service | Service | User authentication, OAuth integration, session management | Private service implementing WorkOS OAuth flows for Google and email/password authentication, generating JWT tokens, and maintaining session state in KV Cache |
| representative-lookup | Service | Representative matching, zip code processing | Private service calling Geocod.io API for congressional district mapping and querying SQL database for representative details with result caching |
| bill-chat | Service | Bill AI chat, Q&A interface | Private service providing Cerebras API integration with bill-specific context for fast inference and conversational responses |
| voice-agent | Service | Voice interaction, natural language queries | Private service leveraging ElevenLabs API for real-time voice input processing and response generation |
| bill-ingestion-observer | Observer | Bill document indexing, SmartBucket processing | Bucket observer monitoring bills-bucket for new uploads, triggering automatic indexing and metadata extraction for semantic search |
| podcast-scheduler | Task | Daily and weekly podcast generation timing | Cron-scheduled task running daily at 6 AM UTC, invoking podcast-generator service for personalized and legislation podcasts |
| congress-sync-task | Task | Periodic Congressional data updates | Cron-scheduled task running every 6 hours, triggering congress-ingestion service for incremental bill and member synchronization |
| news-sync-task | Task | Periodic news refresh | Cron-scheduled task running every 2 hours, invoking news-aggregator service to fetch latest articles for active users |

The integration pattern follows a hub-and-spoke model where api-gateway serves as the central hub for client requests, delegating to specialized services through type-safe environment bindings. Background tasks operate independently on cron schedules, triggering service workflows for data synchronization and content generation without blocking user-facing operations. Observers provide event-driven processing for SmartBucket uploads, enabling automatic indexing as new legislative content becomes available.

Data persistence leverages SQL database for structured relational data (users, bills, members, sessions) requiring complex queries and transactional integrity. SmartBucket provides RAG-in-a-box functionality for semantic search across bill full text without manual embedding management. KV Cache stores session tokens and API response caches for high-performance access patterns. This multi-tier storage approach matches data characteristics to appropriate persistence mechanisms.

External service integration occurs exclusively within private services, isolating API dependencies from the gateway layer. This separation enables independent credential management, retry logic customization, and graceful degradation when external services experience issues. The architecture positions Hakivo for horizontal scaling as user base grows while maintaining clear boundaries between components.

## Detailed Artifact References

### Architecture Documentation

- **interface_design.md**: Complete API endpoint catalog with authentication requirements and error codes
- **component_design.md**: Component inventory, responsibilities, inter-component communication patterns, and file structure
- **database_design.md**: SQL schema definitions with foreign key relationships and indexes
- **deployment_config.md**: Environment variables, secrets configuration, and resource requirements
- **tentative_manifest.txt**: Working Raindrop manifest file with all components and resources configured

### Specification Documentation

- **feature_specs.md**: User-facing feature descriptions with detailed acceptance criteria
- **api_definitions.md**: Request/response examples, validation rules, and JSON schemas for all endpoints
- **dependencies.md**: External services, NPM packages, and required credentials

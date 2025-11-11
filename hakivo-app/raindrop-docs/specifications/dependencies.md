# Dependencies

## External Services

| Service | Version/Plan | Purpose |
|---------|--------------|---------|
| WorkOS | Latest | OAuth authentication for Google and email/password |
| Congress.gov API | v3 | Congressional bills and member data fetching |
| Geocod.io API | Latest | Zip code to congressional district mapping |
| Brave Search API | Latest | News article search and retrieval |
| Cerebras API | Latest | Fast inference for bill chat functionality |
| ElevenLabs API | Latest | Text-to-dialogue audio generation for podcasts |
| Claude Sonnet 4 (Anthropic) | claude-sonnet-4-20250514 | Podcast script generation and content analysis |
| Vultr Object Storage | Latest | Audio file storage and CDN delivery |

## NPM Packages

| Package | Version | Purpose |
|---------|---------|---------|
| @liquidmetal-ai/raindrop-framework | Latest | Raindrop service, observer, task base classes |
| hono | ^4.x | HTTP routing and middleware for services |
| zod | ^3.x | Request/response validation schemas |
| @anthropic-ai/sdk | Latest | Claude API client for podcast generation |
| jose | ^5.x | JWT token generation and validation |

## Credentials Required

```
WorkOS Credentials:
- API Key
- Client ID
- Redirect URI configuration

Congress.gov API:
- API Key

Geocod.io:
- API Key

Brave Search:
- API Key

Cerebras:
- API Key

ElevenLabs:
- API Key
- Voice ID for Sarah
- Voice ID for James

Anthropic (Claude):
- API Key

Vultr Object Storage:
- Access Key
- Secret Key
- Endpoint URL
- Bucket Name

Application:
- JWT Secret for token signing
```

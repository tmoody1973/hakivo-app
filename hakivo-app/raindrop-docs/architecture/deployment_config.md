# Deployment Configuration

## Environment Variables

```
WORKOS_API_KEY: WorkOS API key for OAuth authentication
WORKOS_CLIENT_ID: WorkOS client ID for OAuth
WORKOS_REDIRECT_URI: OAuth callback URL
CONGRESS_API_KEY: Congress.gov API authentication key
GEOCODIO_API_KEY: Geocod.io API key for address lookup
BRAVE_SEARCH_API_KEY: Brave Search API key for news fetching
CEREBRAS_API_KEY: Cerebras API key for bill chat
ELEVENLABS_API_KEY: ElevenLabs API key for audio generation
ELEVENLABS_VOICE_SARAH: Voice ID for Sarah host
ELEVENLABS_VOICE_JAMES: Voice ID for James host
CLAUDE_API_KEY: Anthropic API key for Claude Sonnet 4
VULTR_ACCESS_KEY: Vultr Object Storage access key
VULTR_SECRET_KEY: Vultr Object Storage secret key
VULTR_ENDPOINT: Vultr Object Storage endpoint URL
VULTR_BUCKET_NAME: Bucket name for audio file storage
JWT_SECRET: Secret key for JWT token signing
APP_URL: Base URL for the application
```

## Secrets Required

```
workos-credentials: WorkOS API credentials (API_KEY, CLIENT_ID)
congress-api-key: Congress.gov API authentication
geocodio-api-key: Geocoding service credentials
brave-search-key: News search API credentials
cerebras-api-key: AI chat service credentials
elevenlabs-credentials: Audio generation API credentials (API_KEY, VOICE_IDS)
claude-api-key: Claude Sonnet 4 API credentials
vultr-storage-credentials: Object storage credentials (ACCESS_KEY, SECRET_KEY, ENDPOINT)
jwt-secret: Token signing secret
```

## Resource Requirements

Default Raindrop resource allocations are sufficient for this application.

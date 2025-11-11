# Hakivo Frontend

Next.js 16 frontend application for the Hakivo civic engagement platform.

## Overview

This is the web interface for Hakivo, connecting to the Raindrop backend services to provide:
- Personalized dashboard with policy interests
- Congressional bill search and exploration
- Audio briefings archive with daily and weekly podcasts
- Representative tracking and information
- AI-powered bill analysis chat

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Backend API**: Raindrop Platform (deployed at LiquidMetal)

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The app is currently running at **http://localhost:3002**

### Environment Variables

Configure `.env.local` with your API settings:

```bash
NEXT_PUBLIC_API_URL=https://svc-01k9smc74jhhs5gy3rfp72mzma.01k66gywmx8x4r0w31fdjjfekf.lmapp.run
NEXT_PUBLIC_WORKOS_CLIENT_ID=your-workos-client-id
WORKOS_API_KEY=your-workos-api-key
```

## Available Pages

- **/** - Landing page with hero and features
- **/dashboard** - User dashboard with briefings, bills, and news
- **/bills** - Congressional bill search and listing
- **/briefs** - Audio briefings archive (daily & weekly)
- **/members** - Congressional members directory

## Backend Connection

The frontend connects to your deployed Raindrop backend:

**API Gateway**: `https://svc-01k9smc74jhhs5gy3rfp72mzma.01k66gywmx8x4r0w31fdjjfekf.lmapp.run`

All backend services are running and ready for integration:
- congress-ingestion
- podcast-generator
- news-aggregator
- auth-service
- representative-lookup
- bill-chat
- voice-agent

## Development

```bash
pnpm run dev      # Start dev server
pnpm run build    # Build for production
pnpm run lint     # Run linter
pnpm run format   # Format code
```

## Next Steps

1. Configure WorkOS OAuth for authentication
2. Implement API calls in components using `lib/api-client.ts`
3. Build audio player for briefings
4. Add user onboarding flow
5. Implement bill detail and chat pages

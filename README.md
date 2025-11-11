# Hakivo

> Transform Congressional legislation into accessible, personalized audio briefings and interactive dashboards

Hakivo addresses a fundamental challenge in civic engagement: citizens who care about democratic participation lack the time and tools to effectively track Congressional legislation that affects their communities. By leveraging AI-powered analysis and audio generation, Hakivo makes democratic participation practical for busy citizens.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Raindrop](https://img.shields.io/badge/Raindrop-Platform-purple)](https://liquidmetal.run/)

## Overview

Hakivo transforms impenetrable Congressional legislation into:
- **Daily Audio Briefings** (5-9 minutes): Personalized updates on bills matching your policy interests
- **Weekly Deep Dives** (15-20 minutes): Comprehensive analysis of enacted laws and presidential actions
- **Smart Search**: Semantic search across all Congressional bills from the 118th and 119th Congress
- **Representative Tracking**: Stay connected with your Congressional representatives
- **AI-Powered Analysis**: Chat with AI about any bill using Cerebras API

Built for engaged citizens, students, journalists, and policy advocates who need to stay informed without spending hours parsing complex legislation.

## Architecture

Hakivo follows a microservices architecture built on the Raindrop Platform, with a Next.js 16 frontend and multiple specialized backend services.

### Backend Services (Raindrop Platform)

| Service | Purpose | Technology |
|---------|---------|------------|
| **api-gateway** | Public API orchestration | Hono, TypeScript |
| **congress-ingestion** | Congressional data sync | Congress.gov API v3 |
| **podcast-generator** | Audio briefing generation | Claude Sonnet 4, ElevenLabs |
| **news-aggregator** | Personalized news fetching | Brave Search API |
| **auth-service** | User authentication | WorkOS OAuth |
| **representative-lookup** | District mapping | Geocod.io API |
| **bill-chat** | Bill Q&A interface | Cerebras API |
| **voice-agent** | Voice interaction | ElevenLabs API |

### Infrastructure

- **SQL Database**: Structured data (users, bills, members, sessions)
- **SmartBucket**: RAG-powered semantic search across bill full text
- **KV Cache**: Session tokens and API response caching
- **Object Storage**: Audio file storage with CDN delivery (Vultr)

### Background Jobs

- **congress-sync-task**: Syncs Congressional data every 6 hours
- **news-sync-task**: Fetches news every 2 hours
- **podcast-scheduler**: Generates daily briefings at 6 AM UTC
- **bill-ingestion-observer**: Event-driven bill indexing

### Frontend (Next.js 16)

- **Framework**: Next.js 16 with App Router and Turbopack
- **UI**: shadcn/ui + Tailwind CSS v4
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark mode support

## Tech Stack

### Frontend
- Next.js 16 (App Router, Turbopack)
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui components
- React 19

### Backend
- Raindrop Platform (LiquidMetal)
- Hono (API routing)
- TypeScript
- Kysely (SQL query builder)
- Prisma (database schema)

### External APIs
- Congress.gov API v3 (legislative data)
- Claude Sonnet 4 (content analysis & generation)
- ElevenLabs (text-to-dialogue audio)
- Brave Search (news aggregation)
- WorkOS (authentication)
- Geocod.io (congressional district lookup)
- Cerebras (fast LLM inference)

### Infrastructure
- Raindrop Platform (compute & orchestration)
- SQL Database (Cloudflare D1)
- SmartBucket (vector search)
- KV Cache (Cloudflare KV)
- Vultr Object Storage (audio files)

## Prerequisites

- Node.js 18+ and pnpm
- Raindrop CLI (`npm install -g @liquidmetal-ai/raindrop`)
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hakivo-app.git
cd hakivo-app
```

### 2. Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install frontend dependencies
cd frontend
pnpm install
cd ..
```

### 3. Configure Environment Variables

#### Backend (Raindrop Secrets)

Set up your API keys in Raindrop:

```bash
raindrop build env set CONGRESS_API_KEY="your-congress-api-key"
raindrop build env set ANTHROPIC_API_KEY="your-claude-api-key"
raindrop build env set ELEVENLABS_API_KEY="your-elevenlabs-api-key"
raindrop build env set BRAVE_SEARCH_API_KEY="your-brave-api-key"
raindrop build env set WORKOS_CLIENT_ID="your-workos-client-id"
raindrop build env set WORKOS_API_KEY="your-workos-api-key"
raindrop build env set GEOCODIO_API_KEY="your-geocodio-api-key"
raindrop build env set CEREBRAS_API_KEY="your-cerebras-api-key"
raindrop build env set VULTR_ACCESS_KEY="your-vultr-key"
raindrop build env set VULTR_SECRET_KEY="your-vultr-secret"
```

#### Frontend (.env.local)

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=your-api-gateway-url
NEXT_PUBLIC_WORKOS_CLIENT_ID=your-workos-client-id
WORKOS_API_KEY=your-workos-api-key
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 4. Deploy Backend to Raindrop

```bash
# Authenticate with Raindrop
raindrop auth login

# Build and deploy
raindrop build deploy -r . --start

# Check status
raindrop build status
```

Your API Gateway URL will be displayed after deployment.

### 5. Start Frontend

```bash
cd frontend
pnpm run dev
```

Open http://localhost:3000 in your browser.

## Project Structure

```
hakivo-app/
├── frontend/                    # Next.js 16 application
│   ├── app/                    # App router pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── bills/            # Bill search & listing
│   │   ├── briefs/           # Audio briefings archive
│   │   ├── members/          # Congressional members
│   │   └── auth/             # Authentication pages
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   └── navigation.tsx    # Main navigation
│   ├── lib/                   # Utilities
│   │   ├── api-client.ts     # Backend API client
│   │   └── utils.ts          # Helper functions
│   └── package.json
├── src/                        # Raindrop backend services
│   ├── api-gateway/          # Public API gateway
│   ├── congress-ingestion/   # Congressional data sync
│   ├── podcast-generator/    # Audio generation
│   ├── news-aggregator/      # News fetching
│   ├── auth-service/         # Authentication
│   ├── representative-lookup/ # District mapping
│   ├── bill-chat/            # Bill Q&A
│   ├── voice-agent/          # Voice interaction
│   ├── bill-ingestion-observer/ # Event processing
│   ├── congress-sync-task/   # Background sync
│   ├── news-sync-task/       # News refresh
│   └── podcast-scheduler/    # Podcast generation
├── db/                         # Database migrations & seeds
├── prisma/                     # Prisma schema
├── raindrop.manifest          # Raindrop deployment config
├── package.json
└── README.md
```

## Development Workflow

### Backend Development

```bash
# Build TypeScript
pnpm run build

# Validate manifest
raindrop build validate

# Deploy changes
raindrop build deploy -r . --start

# View logs
raindrop logs tail
```

### Frontend Development

```bash
cd frontend

# Start dev server
pnpm run dev

# Build for production
pnpm run build

# Lint code
pnpm run lint
```

### Database Migrations

```bash
# Create new migration
pnpm run create-migration

# Render database schema
pnpm run render-db
```

## Features

### Current Features
✅ Backend microservices deployed and running
✅ SQL database with complete schema
✅ SmartBucket for semantic bill search
✅ Frontend UI with all main pages
✅ Navigation and routing
✅ API client configured

### In Progress
🚧 WorkOS authentication integration
🚧 Congressional data ingestion
🚧 Audio briefing generation
🚧 News aggregation

### Planned Features
📋 Real-time bill tracking
📋 User onboarding flow
📋 Audio player component
📋 Bill detail pages with AI chat
📋 Voice agent interface
📋 Dashboard widget customization
📋 Mobile responsive design
📋 Push notifications
📋 Email briefings

## API Documentation

The API Gateway provides RESTful endpoints for all services:

**Base URL**: `https://your-api-gateway-url`

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Bills
- `GET /api/bills` - List bills
- `GET /api/bills/:id` - Get bill details
- `POST /api/bills/search` - Semantic search

### Briefings
- `GET /api/briefs` - List audio briefings
- `GET /api/briefs/:id` - Get briefing details

### Members
- `GET /api/members` - List Congressional members
- `GET /api/members/:id` - Get member details
- `GET /api/representatives/:zipCode` - Get user's representatives

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/news` - Get personalized news

See `frontend/lib/api-client.ts` for TypeScript client implementation.

## Deployment

### Backend (Raindrop Platform)

The backend is deployed to Raindrop Platform with automatic scaling and monitoring:

```bash
# Deploy production version
raindrop build deploy -r . --start

# Check deployment status
raindrop build status

# View application logs
raindrop logs tail

# Stop application
raindrop build stop
```

### Frontend (Vercel/Netlify)

Deploy the Next.js frontend to your preferred platform:

```bash
cd frontend

# Build for production
pnpm run build

# Deploy to Vercel
vercel deploy --prod
```

## Configuration

### Backend Environment Variables

Configure via Raindrop CLI:

```bash
raindrop build env set VARIABLE_NAME="value"
raindrop build env get VARIABLE_NAME
```

Required variables:
- `CONGRESS_API_KEY` - Congress.gov API access
- `ANTHROPIC_API_KEY` - Claude API key
- `ELEVENLABS_API_KEY` - Audio generation
- `BRAVE_SEARCH_API_KEY` - News search
- `WORKOS_CLIENT_ID` & `WORKOS_API_KEY` - Authentication
- `GEOCODIO_API_KEY` - District lookup
- `CEREBRAS_API_KEY` - Fast inference
- `VULTR_ACCESS_KEY` & `VULTR_SECRET_KEY` - Object storage

### Frontend Environment Variables

Configure in `frontend/.env.local`:
- `NEXT_PUBLIC_API_URL` - API Gateway URL
- `NEXT_PUBLIC_WORKOS_CLIENT_ID` - WorkOS client ID
- `WORKOS_API_KEY` - WorkOS API key (server-side)

## Contributing

This is a private project. Contributions are welcome from team members.

### Development Process

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and test locally
3. Deploy to a test environment: `raindrop build deploy -r .`
4. Submit a pull request with description and screenshots
5. After review, merge to main

### Code Style

- TypeScript strict mode enabled
- ESLint configuration enforced
- Prettier for code formatting
- Conventional commits preferred

## License

Proprietary - All rights reserved

## Support

For questions or issues:
- Open an issue on GitHub
- Contact the development team
- Check documentation in `~/.raindrop/session-id/`

## Acknowledgments

Built with:
- [Raindrop Platform](https://liquidmetal.run/) - Backend infrastructure
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Congress.gov API](https://api.congress.gov/) - Legislative data
- [Anthropic Claude](https://anthropic.com/) - AI analysis
- [ElevenLabs](https://elevenlabs.io/) - Audio generation

---

**Made with ❤️ for civic engagement**

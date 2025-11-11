# API Definitions

## POST /api/auth/register

### Request
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

### Response
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "onboarding_completed": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Validation
- Email: valid email format, unique
- Password: minimum 8 characters, alphanumeric with special characters
- Name: non-empty string, max 255 characters

## POST /api/auth/login

### Request
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Response
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "onboarding_completed": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Validation
- Email: valid email format
- Password: non-empty string

## GET /api/auth/callback?code={code}&state={state}

### Response
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "onboarding_completed": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirect_url": "/onboarding"
}
```

### Validation
- Code: WorkOS authorization code
- State: CSRF protection token

## PUT /api/user/preferences

### Request
```json
{
  "policy_interests": [
    "Healthcare",
    "Education",
    "Climate Change"
  ],
  "zip_code": "10001"
}
```

### Response
```json
{
  "message": "Preferences updated successfully",
  "user": {
    "id": "usr_abc123",
    "policy_interests": ["Healthcare", "Education", "Climate Change"],
    "zip_code": "10001",
    "onboarding_completed": true
  }
}
```

### Validation
- policy_interests: array of strings from Congressional subject areas
- zip_code: valid 5-digit US zip code

## GET /api/user/representatives

### Response
```json
{
  "representatives": [
    {
      "id": "mem_senate_001",
      "name": "Jane Smith",
      "party": "D",
      "chamber": "Senate",
      "state": "NY",
      "image_url": "https://...",
      "contact": {
        "phone": "202-555-0123",
        "website": "https://..."
      }
    },
    {
      "id": "mem_house_045",
      "name": "John Johnson",
      "party": "R",
      "chamber": "House",
      "state": "NY",
      "district": "12",
      "image_url": "https://...",
      "contact": {
        "phone": "202-555-0456",
        "website": "https://..."
      }
    }
  ]
}
```

## GET /api/bills/search?q={query}&page={page}&limit={limit}

### Request Parameters
- q: search query string
- page: page number (default: 1)
- limit: results per page (default: 20, max: 100)
- congress: filter by congress number (optional)
- status: filter by bill status (optional)
- policy_area: filter by policy area (optional)

### Response
```json
{
  "results": [
    {
      "id": "bill_119_hr_1234",
      "title": "Clean Energy Innovation Act",
      "bill_type": "HR",
      "bill_number": 1234,
      "congress": 119,
      "sponsor": {
        "id": "mem_house_789",
        "name": "Rep. Sarah Green"
      },
      "status": "Introduced",
      "policy_area": "Energy",
      "latest_action_date": "2025-01-15",
      "latest_action": "Referred to Committee on Energy and Commerce",
      "relevance_score": 0.92
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

### Validation
- q: non-empty string
- page: positive integer
- limit: integer between 1 and 100

## GET /api/bills/:id

### Response
```json
{
  "bill": {
    "id": "bill_119_hr_1234",
    "title": "Clean Energy Innovation Act",
    "bill_type": "HR",
    "bill_number": 1234,
    "congress": 119,
    "sponsor": {
      "id": "mem_house_789",
      "name": "Rep. Sarah Green",
      "party": "D",
      "state": "CA"
    },
    "cosponsors": [
      {
        "id": "mem_house_790",
        "name": "Rep. Mike Blue"
      }
    ],
    "introduced_date": "2025-01-10",
    "latest_action_date": "2025-01-15",
    "latest_action": "Referred to Committee on Energy and Commerce",
    "policy_area": "Energy",
    "status": "Introduced",
    "summary": "This bill establishes new incentives for clean energy research...",
    "full_text_url": "https://www.congress.gov/bill/119th-congress/house-bill/1234/text",
    "actions": [
      {
        "date": "2025-01-15",
        "action": "Referred to Committee on Energy and Commerce"
      },
      {
        "date": "2025-01-10",
        "action": "Introduced in House"
      }
    ]
  }
}
```

## POST /api/bills/:id/chat

### Request
```json
{
  "message": "What are the main provisions of this bill?"
}
```

### Response
```json
{
  "response": "The Clean Energy Innovation Act includes three main provisions:\n\n1. **Research Funding**: Allocates $500M annually for clean energy R&D\n2. **Tax Incentives**: Provides tax credits for renewable energy companies\n3. **Regulatory Streamlining**: Simplifies permitting for clean energy projects\n\nThe bill aims to accelerate America's transition to clean energy while creating jobs.",
  "conversation_id": "conv_xyz789"
}
```

### Validation
- message: non-empty string, max 1000 characters

## GET /api/members?chamber={chamber}&state={state}&party={party}

### Request Parameters
- chamber: "House" or "Senate" (optional)
- state: two-letter state code (optional)
- party: "D", "R", or "I" (optional)

### Response
```json
{
  "members": [
    {
      "id": "mem_senate_001",
      "name": "Jane Smith",
      "party": "D",
      "chamber": "Senate",
      "state": "NY",
      "image_url": "https://...",
      "current_term_start": "2023-01-03",
      "current_term_end": "2029-01-03"
    }
  ],
  "total": 542
}
```

## GET /api/members/:id

### Response
```json
{
  "member": {
    "id": "mem_senate_001",
    "bioguide_id": "S000001",
    "first_name": "Jane",
    "last_name": "Smith",
    "party": "D",
    "chamber": "Senate",
    "state": "NY",
    "image_url": "https://...",
    "terms_served": 2,
    "current_term_start": "2023-01-03",
    "current_term_end": "2029-01-03",
    "contact": {
      "phone": "202-555-0123",
      "website": "https://...",
      "twitter": "@SenJaneSmith"
    },
    "sponsored_bills": [
      {
        "id": "bill_119_s_456",
        "title": "Education Reform Act",
        "status": "Passed Senate"
      }
    ]
  }
}
```

## GET /api/briefs/daily

### Response
```json
{
  "brief": {
    "id": "podcast_daily_20250115",
    "title": "Daily Brief - January 15, 2025",
    "description": "Your personalized update on healthcare, education, and climate legislation",
    "duration_seconds": 427,
    "audio_url": "https://cdn.vultr.com/hakivo/podcasts/daily_20250115.mp3",
    "generated_at": "2025-01-15T06:00:00Z",
    "transcript": "Good morning! I'm Sarah, and I'm James..."
  }
}
```

## GET /api/briefs/weekly

### Response
```json
{
  "brief": {
    "id": "podcast_weekly_20250112",
    "title": "Weekly Deep Dive - Week of January 12, 2025",
    "description": "In-depth analysis of this week's legislative developments",
    "duration_seconds": 1143,
    "audio_url": "https://cdn.vultr.com/hakivo/podcasts/weekly_20250112.mp3",
    "generated_at": "2025-01-12T06:00:00Z",
    "transcript": "Welcome to this week's deep dive..."
  }
}
```

## GET /api/briefs?type={type}&page={page}&limit={limit}

### Request Parameters
- type: "daily", "weekly", or "legislation" (optional)
- page: page number (default: 1)
- limit: results per page (default: 20)

### Response
```json
{
  "briefs": [
    {
      "id": "podcast_daily_20250115",
      "type": "daily",
      "title": "Daily Brief - January 15, 2025",
      "duration_seconds": 427,
      "audio_url": "https://cdn.vultr.com/hakivo/podcasts/daily_20250115.mp3",
      "generated_at": "2025-01-15T06:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

## GET /api/news?limit={limit}

### Request Parameters
- limit: number of articles (default: 10, max: 50)

### Response
```json
{
  "articles": [
    {
      "id": "news_abc123",
      "title": "Senate Passes Major Healthcare Reform",
      "url": "https://example.com/article",
      "source": "Example News",
      "published_at": "2025-01-15T14:30:00Z",
      "summary": "The Senate voted 68-32 to pass comprehensive healthcare legislation...",
      "policy_area": "Healthcare",
      "relevance_score": 0.89
    }
  ]
}
```

## GET /api/dashboard

### Response
```json
{
  "widgets": [
    {
      "type": "representatives",
      "enabled": true,
      "position": 1,
      "data": {
        "representatives": [...]
      }
    },
    {
      "type": "latest_bills",
      "enabled": true,
      "position": 2,
      "data": {
        "bills": [...]
      }
    },
    {
      "type": "daily_brief",
      "enabled": true,
      "position": 3,
      "data": {
        "brief": {...}
      }
    },
    {
      "type": "news_feed",
      "enabled": true,
      "position": 4,
      "data": {
        "articles": [...]
      }
    }
  ]
}
```

## PUT /api/dashboard/widgets

### Request
```json
{
  "widgets": [
    {
      "type": "representatives",
      "enabled": true,
      "position": 1
    },
    {
      "type": "news_feed",
      "enabled": true,
      "position": 2
    },
    {
      "type": "daily_brief",
      "enabled": false,
      "position": 3
    }
  ]
}
```

### Response
```json
{
  "message": "Widget preferences updated successfully"
}
```

### Validation
- widgets: array of widget configurations
- type: valid widget type string
- enabled: boolean
- position: positive integer

## POST /api/voice/agent

### Request
```json
{
  "audio": "base64_encoded_audio_data"
}
```

### Response
```json
{
  "response_text": "Based on recent legislation, there are three healthcare bills currently in committee...",
  "response_audio": "base64_encoded_audio_data",
  "session_id": "voice_session_xyz"
}
```

### Validation
- audio: base64-encoded audio data

## POST /api/analytics/event

### Request
```json
{
  "event_type": "podcast_play",
  "event_data": {
    "podcast_id": "podcast_daily_20250115",
    "duration_played": 180
  }
}
```

### Response
```json
{
  "message": "Event recorded successfully"
}
```

### Validation
- event_type: valid event type string
- event_data: JSON object with event-specific data

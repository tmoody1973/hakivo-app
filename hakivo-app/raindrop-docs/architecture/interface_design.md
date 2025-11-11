# Interface Design

## Public Endpoints

| Name | Method | Path | Auth |
|------|--------|------|------|
| Health Check | GET | /health | None |
| User Registration | POST | /api/auth/register | None |
| User Login | POST | /api/auth/login | None |
| OAuth Callback | GET | /api/auth/callback | None |
| Get Current User | GET | /api/auth/me | Bearer Token |
| Update User Preferences | PUT | /api/user/preferences | Bearer Token |
| Get User Representatives | GET | /api/user/representatives | Bearer Token |
| Search Bills | GET | /api/bills/search | Bearer Token |
| Get Bill Details | GET | /api/bills/:id | Bearer Token |
| Chat with Bill | POST | /api/bills/:id/chat | Bearer Token |
| List Members | GET | /api/members | Bearer Token |
| Get Member Details | GET | /api/members/:id | Bearer Token |
| Get Daily Brief | GET | /api/briefs/daily | Bearer Token |
| Get Weekly Brief | GET | /api/briefs/weekly | Bearer Token |
| List All Briefs | GET | /api/briefs | Bearer Token |
| Get News Feed | GET | /api/news | Bearer Token |
| Get Dashboard Widgets | GET | /api/dashboard | Bearer Token |
| Update Widget Preferences | PUT | /api/dashboard/widgets | Bearer Token |
| Get Voice Agent | POST | /api/voice/agent | Bearer Token |
| Track Event | POST | /api/analytics/event | Bearer Token |

## Authentication

| Type | Scope |
|------|-------|
| WorkOS OAuth | Google, Email/Password |
| JWT Bearer Token | All protected endpoints |

## Error Response Codes

| Code | Meaning |
|------|---------|
| 400 | Invalid request parameters |
| 401 | Missing or invalid authentication |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource) |
| 422 | Validation error |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 502 | External service failure |
| 503 | Service unavailable |

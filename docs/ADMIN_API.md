# Admin API Documentation

The Admin API provides endpoints to monitor data ingestion, view database contents, and trigger manual data synchronization.

## Base URL

```
https://[your-domain]/admin
```

## Authentication

Currently public access. TODO: Add authentication.

## Endpoints

### Dashboard & Statistics

#### GET `/admin/stats`

Get comprehensive statistics about the database.

**Response:**
```json
{
  "totals": {
    "bills": 1234,
    "members": 535,
    "committees": 25,
    "actions": 5678,
    "cosponsors": 3456,
    "subjects": 2345
  },
  "latestBills": [
    {
      "id": "hr1234-119",
      "title": "Example Bill Title",
      "congress": 119,
      "bill_type": "hr",
      "updated_at": "2025-01-11T10:30:00Z"
    }
  ],
  "congressBreakdown": [
    { "congress": 119, "count": 500 },
    { "congress": 118, "count": 734 }
  ],
  "topPolicyAreas": [
    { "policy_area": "Healthcare", "count": 123 },
    { "policy_area": "Education", "count": 89 }
  ],
  "lastUpdated": "2025-01-11T12:00:00Z"
}
```

### Bills

#### GET `/admin/bills`

Query bills with optional filters.

**Query Parameters:**
- `limit` (number, default: 50) - Number of results
- `offset` (number, default: 0) - Pagination offset
- `congress` (number) - Filter by congress number
- `policy_area` (string) - Filter by policy area
- `search` (string) - Search in bill titles

**Response:**
```json
{
  "bills": [
    {
      "id": "hr1234-119",
      "congress": 119,
      "bill_type": "hr",
      "bill_number": 1234,
      "title": "Example Bill Title",
      "sponsor_id": "B000001",
      "introduced_date": "2025-01-15T00:00:00Z",
      "latest_action_date": "2025-01-20T00:00:00Z",
      "latest_action_text": "Referred to Committee",
      "policy_area": "Healthcare",
      "status": "Introduced",
      "summary": "This bill addresses...",
      "created_at": "2025-01-11T10:00:00Z",
      "updated_at": "2025-01-11T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1234,
    "limit": 50,
    "offset": 0
  }
}
```

#### GET `/admin/bills/{billId}`

Get detailed information about a specific bill.

**Response:**
```json
{
  "bill": { /* bill object */ },
  "sponsor": {
    "id": "B000001",
    "bioguide_id": "B000001",
    "first_name": "John",
    "last_name": "Doe",
    "party": "Democrat",
    "state": "CA",
    "chamber": "House"
  },
  "cosponsors": [
    {
      "id": "S000002",
      "first_name": "Jane",
      "last_name": "Smith",
      "party": "Republican",
      "state": "TX",
      "sponsored_date": "2025-01-16T00:00:00Z",
      "is_original_cosponsor": true
    }
  ],
  "actions": [
    {
      "action_date": "2025-01-20T00:00:00Z",
      "action_text": "Referred to Committee on Healthcare",
      "action_type": "IntroReferral"
    }
  ],
  "subjects": ["Healthcare", "Medicare", "Public Health"]
}
```

### Members

#### GET `/admin/members`

Query members with optional filters.

**Query Parameters:**
- `limit` (number, default: 50)
- `offset` (number, default: 0)
- `chamber` (string) - Filter by "House" or "Senate"
- `state` (string) - Filter by state code (e.g., "CA")
- `party` (string) - Filter by party name

#### GET `/admin/members/{memberId}`

Get detailed information about a specific member.

**Response:**
```json
{
  "member": { /* member object */ },
  "sponsoredBills": [ /* array of bills */ ],
  "cosponsoredBills": [ /* array of bills */ ],
  "stats": {
    "sponsoredCount": 25,
    "cosponsoredCount": 150
  }
}
```

### Committees

#### GET `/admin/committees`

Get list of all committees.

**Response:**
```json
{
  "committees": [
    {
      "id": "HSAG00",
      "name": "Committee on Agriculture",
      "chamber": "House",
      "committee_type": "Standing"
    }
  ]
}
```

### Ingestion

#### POST `/admin/ingest/trigger`

Manually trigger data ingestion from Congress.gov API.

**Request Body:**
```json
{
  "type": "bills",
  "congress": 119,
  "limit": 100
}
```

**Options:**
- `type`: "bills" | "members" | "committees"
- `congress` (optional, for bills): Congress number
- `limit` (optional): Number of items to fetch per batch

**Response:**
```json
{
  "success": true,
  "message": "Ingested 100 bills for Congress 119",
  "stats": {
    "billsProcessed": 100,
    "errors": 0
  }
}
```

#### GET `/admin/ingest/status`

Get current ingestion status and database statistics.

## Usage Examples

### Trigger Full Ingestion for Congress 118 and 119

```bash
# Ingest all bills from Congress 119
curl -X POST https://[your-domain]/admin/ingest/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "bills", "congress": 119, "limit": 250}'

# Ingest all bills from Congress 118
curl -X POST https://[your-domain]/admin/ingest/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "bills", "congress": 118, "limit": 250}'

# Ingest all current members
curl -X POST https://[your-domain]/admin/ingest/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "members", "limit": 250}'

# Ingest all committees
curl -X POST https://[your-domain]/admin/ingest/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "committees"}'
```

### Query Database

```bash
# Get overall statistics
curl https://[your-domain]/admin/stats

# Get bills from Congress 119
curl "https://[your-domain]/admin/bills?congress=119&limit=50"

# Search for healthcare bills
curl "https://[your-domain]/admin/bills?policy_area=Healthcare"

# Get specific bill details
curl https://[your-domain]/admin/bills/hr1234-119

# Get all current members
curl "https://[your-domain]/admin/members?limit=100"

# Get members from California
curl "https://[your-domain]/admin/members?state=CA"

# Get all committees
curl https://[your-domain]/admin/committees
```

## Notes

- The Congress.gov API has rate limits. The ingestion service handles batching automatically.
- Large ingestions (all bills from a congress) may take several minutes.
- The API key is configured in the environment: `LujQ9kIn44Remaqi1i3Q8fcbeK9nA6aAZ0coUa3C`
- Scheduled sync runs every 6 hours automatically via `congress-sync-task`

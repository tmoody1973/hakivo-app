#!/bin/bash

# Trigger Congress.gov API ingestion for Congress 118 and 119
# Uses the admin service trigger endpoint

BUILD_ID="01k9smc4"
ADMIN_URL="https://admin-${BUILD_ID}.liquidmetal.run"

echo "=== Triggering Ingestion for Congress 119 ==="
curl -X POST "${ADMIN_URL}/admin/ingest/trigger" \
  -H "Content-Type: application/json" \
  -d '{"type":"bills","congress":119}'

echo -e "\n\n=== Triggering Ingestion for Congress 118 ==="
curl -X POST "${ADMIN_URL}/admin/ingest/trigger" \
  -H "Content-Type: application/json" \
  -d '{"type":"bills","congress":118}'

echo -e "\n\n=== Triggering Members Ingestion ==="
curl -X POST "${ADMIN_URL}/admin/ingest/trigger" \
  -H "Content-Type: application/json" \
  -d '{"type":"members","limit":250}'

echo -e "\n\n=== Triggering Committees Ingestion ==="
curl -X POST "${ADMIN_URL}/admin/ingest/trigger" \
  -H "Content-Type: application/json" \
  -d '{"type":"committees"}'

echo -e "\n\n=== Checking Admin Stats ==="
curl "${ADMIN_URL}/admin/stats"

echo -e "\n\nIngestion triggered successfully!"

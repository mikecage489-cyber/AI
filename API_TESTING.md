# API Testing Guide

This guide shows how to test the Government Bid Scraper API using curl commands.

## Prerequisites

- The application must be running (`npm run dev` or via Docker)
- PostgreSQL and Redis must be accessible
- Database migrations must be run
- (Optional) Seed data loaded for test user

## 1. Authentication

### Login
Get a JWT token:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Save the token for subsequent requests:
```bash
export TOKEN="your-token-here"
```

### Check Session
```bash
curl http://localhost:3000/api/auth/session \
  -H "Authorization: Bearer $TOKEN"
```

## 2. Portal Management

### List All Portals
```bash
curl http://localhost:3000/api/portals \
  -H "Authorization: Bearer $TOKEN"
```

### Create a Portal
```bash
curl -X POST http://localhost:3000/api/portals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Government Portal",
    "listingUrl": "https://example.gov/bids",
    "portalType": "PUBLIC",
    "fieldMapping": {
      "requisitionNumber": "bid_id",
      "title": "bid_title",
      "openDate": "issue_date",
      "closeDate": "due_date"
    }
  }'
```

### Create Portal with Login
```bash
curl -X POST http://localhost:3000/api/portals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Secure Portal",
    "loginUrl": "https://example.gov/login",
    "listingUrl": "https://example.gov/bids",
    "portalType": "LOGIN_REQUIRED",
    "username": "portal_user",
    "password": "portal_pass",
    "fieldMapping": {
      "requisitionNumber": "bid_id",
      "title": "bid_title"
    }
  }'
```

### Get Portal Details
```bash
curl http://localhost:3000/api/portals/PORTAL_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Update Portal
```bash
curl -X PUT http://localhost:3000/api/portals/PORTAL_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Portal Name",
    "isActive": true
  }'
```

### Delete Portal
```bash
curl -X DELETE http://localhost:3000/api/portals/PORTAL_ID \
  -H "Authorization: Bearer $TOKEN"
```

## 3. Scraping

### Start Scraping a Portal
```bash
curl -X POST http://localhost:3000/api/portals/PORTAL_ID/scrape \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "job": {
    "id": "...",
    "portalId": "...",
    "status": "PENDING",
    "jobType": "MANUAL",
    "createdAt": "2025-12-27T..."
  }
}
```

### Check Scraper Status
```bash
# Get specific job
curl "http://localhost:3000/api/scraper/status?jobId=JOB_ID" \
  -H "Authorization: Bearer $TOKEN"

# Get recent jobs
curl http://localhost:3000/api/scraper/status \
  -H "Authorization: Bearer $TOKEN"
```

## 4. Bids

### List All Bids
```bash
curl http://localhost:3000/api/bids \
  -H "Authorization: Bearer $TOKEN"
```

### List Bids with Filters
```bash
# Filter by portal
curl "http://localhost:3000/api/bids?portalId=PORTAL_ID" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl "http://localhost:3000/api/bids?status=ACTIVE" \
  -H "Authorization: Bearer $TOKEN"

# Search
curl "http://localhost:3000/api/bids?search=construction" \
  -H "Authorization: Bearer $TOKEN"

# Pagination
curl "http://localhost:3000/api/bids?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Bid Details
```bash
curl http://localhost:3000/api/bids/BID_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Export Bids to Excel
```bash
curl -X POST http://localhost:3000/api/bids/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "EXCEL",
    "filters": {
      "status": "ACTIVE"
    }
  }' \
  --output bids-export.xlsx
```

### Export Bids to CSV
```bash
curl -X POST http://localhost:3000/api/bids/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "CSV",
    "filters": {
      "portalId": "PORTAL_ID"
    }
  }' \
  --output bids-export.csv
```

## 5. Logs

### Get Recent Logs
```bash
curl http://localhost:3000/api/logs \
  -H "Authorization: Bearer $TOKEN"
```

### Get Logs for Specific Job
```bash
curl "http://localhost:3000/api/logs?jobId=JOB_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter Logs by Level
```bash
curl "http://localhost:3000/api/logs?level=ERROR" \
  -H "Authorization: Bearer $TOKEN"
```

## Common Issues

### 401 Unauthorized
- Check that your token is valid and not expired
- Make sure you're including the `Authorization: Bearer TOKEN` header

### 403 Forbidden
- Some endpoints require ADMIN role
- Check your user's role

### 500 Internal Server Error
- Check database connection
- Check Redis connection
- Review server logs

## Testing Workflow

1. **Login** to get a token
2. **Create a portal** with test configuration
3. **Start scraping** the portal
4. **Check status** of the scrape job
5. **View logs** to see progress
6. **List bids** once scraping completes
7. **Export bids** to CSV/Excel

## Using Postman

You can import these curl commands into Postman or create a collection with:

1. A global variable for `TOKEN`
2. Pre-request script to set Authorization header:
   ```javascript
   pm.request.headers.add({
     key: 'Authorization',
     value: 'Bearer ' + pm.globals.get('TOKEN')
   });
   ```

## Security Notes

- Never commit your JWT token
- Use strong passwords in production
- Rotate encryption keys regularly
- Enable HTTPS in production
- Use environment variables for secrets

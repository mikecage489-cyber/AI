# Government Bid Scraper Platform

A high-performance, secure, and scalable web platform for extracting procurement bids from multiple US state and local government portals.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- 🏢 **Multi-Portal Management**: Add, edit, and manage multiple government portals
- 🔒 **Encrypted Credentials**: AES-256-GCM encryption for portal credentials
- 🤖 **Intelligent Scraping**: Automated bid extraction using Playwright
- 📊 **Data Normalization**: Normalize bid data across different portal formats
- 📅 **Today's Bids Only**: Automatically filters for bids opened today
- 📈 **Job Queue**: BullMQ-powered job processing with Redis
- 📁 **Export Functionality**: Export bids to CSV or Excel
- 📝 **Comprehensive Logging**: Detailed logs for every scrape operation
- 🐳 **Docker Ready**: Complete Docker setup for easy deployment

## Technology Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI components
- React Query for data fetching
- React Hook Form + Zod for validation

### Backend
- Next.js API Routes
- Prisma ORM with PostgreSQL
- BullMQ for job queue management
- Redis for caching and queue
- Playwright for web scraping

### Security
- JWT authentication
- bcrypt password hashing
- AES-256-GCM credential encryption
- Rate limiting and retry logic

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (for containerized deployment)

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/govbid_scraper?schema=public"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your-secure-jwt-secret"
   ENCRYPTION_KEY="<64-character-hex-string>"
   ```

4. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

6. **Seed the database** (optional)
   ```bash
   npm run prisma:seed
   ```
   
   This creates:
   - Admin user: `admin@example.com` / `admin123`
   - Sample portal for testing

7. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

8. **Start the scraper worker** (in a separate terminal)
   ```bash
   npm run worker
   ```

### Docker Deployment

1. **Build and start all services**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

3. **Seed the database** (optional)
   ```bash
   docker-compose exec app npm run prisma:seed
   ```

4. **Access the application**
   - Web UI: `http://localhost:3000`
   - PostgreSQL: `localhost:5432`
   - Redis: `localhost:6379`

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration | No | `7d` |
| `ENCRYPTION_KEY` | 64-char hex string for AES-256-GCM | Yes | - |
| `SCRAPER_RATE_LIMIT_MS` | Delay between requests (ms) | No | `2000` |
| `SCRAPER_MAX_RETRIES` | Max retry attempts | No | `3` |
| `SCRAPER_TIMEOUT_MS` | Request timeout (ms) | No | `30000` |

### Generate Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Documentation

### Authentication

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
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

#### GET `/api/auth/session`
Get current user session.

**Headers:**
```
Authorization: Bearer <token>
```

### Portals

#### GET `/api/portals`
List all portals.

#### POST `/api/portals`
Create a new portal.

**Request:**
```json
{
  "name": "Portal Name",
  "listingUrl": "https://example.gov/bids",
  "loginUrl": "https://example.gov/login",
  "portalType": "LOGIN_REQUIRED",
  "username": "portal_username",
  "password": "portal_password",
  "fieldMapping": {
    "requisitionNumber": "bid_id",
    "title": "bid_title",
    "openDate": "issue_date",
    "closeDate": "due_date"
  }
}
```

#### GET `/api/portals/[id]`
Get portal details.

#### PUT `/api/portals/[id]`
Update portal.

#### DELETE `/api/portals/[id]`
Delete portal.

#### POST `/api/portals/[id]/scrape`
Start scraping a portal.

### Bids

#### GET `/api/bids`
List bids with filters.

**Query Parameters:**
- `portalId`: Filter by portal
- `status`: Filter by status (ACTIVE, CLOSED, ARCHIVED)
- `search`: Search in title, description, numbers
- `page`: Page number
- `limit`: Items per page

#### GET `/api/bids/[id]`
Get bid details.

#### POST `/api/bids/export`
Export bids to CSV or Excel.

**Request:**
```json
{
  "format": "EXCEL",
  "filters": {
    "portalId": "...",
    "status": "ACTIVE"
  }
}
```

### Scraper

#### GET `/api/scraper/status`
Get scraper job status.

**Query Parameters:**
- `jobId`: Specific job ID (optional)

#### GET `/api/logs`
Get scrape logs.

**Query Parameters:**
- `jobId`: Filter by job
- `level`: Filter by level (INFO, WARN, ERROR, DEBUG)
- `page`: Page number
- `limit`: Items per page

## Database Schema

### Users
User authentication and authorization.

### Portals
Portal configurations with encrypted credentials.

### PortalCredentials
Encrypted username/password storage for login-required portals.

### Bids
Normalized bid data from all portals.

### ScrapeJobs
Job queue and status tracking.

### ScrapeLogs
Detailed logging per scrape operation.

### Exports
Export job tracking.

## Adding a New Portal

1. **Login to the platform** as an admin user

2. **Navigate to Portals** section

3. **Click "Add Portal"**

4. **Fill in the details:**
   - **Name**: Portal name
   - **Listing URL**: URL where bids are listed
   - **Login URL**: Login page (if authentication required)
   - **Portal Type**: PUBLIC or LOGIN_REQUIRED
   - **Username/Password**: Credentials (if required)
   - **Field Mapping**: Map portal fields to standard schema

5. **Configure field mapping** (JSON format):
   ```json
   {
     "requisitionNumber": "bid_id",
     "title": "bid_title",
     "openDate": "issue_date",
     "closeDate": "due_date",
     "description": "bid_description"
   }
   ```

6. **Test the scraper** by clicking "Run Scraper"

## Scraping Rules

- Scrapes **ONLY bids opened/issued TODAY**
- Automatically handles pagination
- Clicks into detail pages for full data extraction
- Respects rate limiting (configurable)
- Automatic retries with exponential backoff
- Comprehensive error logging

## Security Best Practices

1. **Change default credentials** in production
2. **Generate strong encryption keys**
3. **Use environment variables** for secrets
4. **Enable HTTPS** in production
5. **Regularly update dependencies**
6. **Monitor logs** for suspicious activity
7. **Implement rate limiting** on API endpoints
8. **Use strong passwords** for database and Redis

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres
```

### Redis Connection Issues
```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli ping
```

### Scraper Not Working
```bash
# Check worker logs
docker-compose logs worker

# Check job queue
docker-compose exec app npx bull-board
```

### Playwright Issues
```bash
# Install Playwright browsers
npx playwright install chromium
```

## Development

### Project Structure
```
govbid-scraper/
├── prisma/              # Database schema and migrations
├── src/
│   ├── app/            # Next.js app (pages and API routes)
│   ├── components/     # React components
│   ├── lib/            # Core libraries (auth, prisma, redis, etc.)
│   ├── scraper/        # Scraper engine
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   └── hooks/          # React hooks
├── workers/            # Background workers
├── docker-compose.yml  # Docker configuration
└── Dockerfile          # Docker image definition
```

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Database Management
```bash
# Open Prisma Studio
npm run prisma:studio

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset
```

## Production Deployment

1. **Set production environment variables**
2. **Build Docker images**
   ```bash
   docker-compose build
   ```
3. **Start services**
   ```bash
   docker-compose up -d
   ```
4. **Run migrations**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```
5. **Monitor logs**
   ```bash
   docker-compose logs -f
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.

## Roadmap

- [ ] Advanced scraper customization per portal
- [ ] Scheduled scraping (cron jobs)
- [ ] Email notifications for new bids
- [ ] Advanced filtering and search
- [ ] Bid alerts and watchlists
- [ ] Multi-user support with roles
- [ ] API rate limiting
- [ ] Webhook integrations
- [ ] Mobile app
- [ ] Analytics dashboard

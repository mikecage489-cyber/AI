# Contributing to Government Bid Scraper

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Git

### Quick Start

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/mikecage489-cyber/AI.git
   cd AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

4. **Generate encryption key**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Add this to .env as ENCRYPTION_KEY
   ```

5. **Set up database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Start worker (in another terminal)**
   ```bash
   npm run worker
   ```

## Project Structure

```
govbid-scraper/
├── prisma/              # Database schema and migrations
│   ├── schema.prisma    # Prisma schema definition
│   ├── seed.ts          # Database seed script
│   └── migrations/      # Database migrations
├── src/
│   ├── app/            # Next.js app directory
│   │   ├── api/        # API route handlers
│   │   │   ├── auth/   # Authentication endpoints
│   │   │   ├── portals/# Portal management
│   │   │   ├── bids/   # Bid management
│   │   │   ├── scraper/# Scraper control
│   │   │   └── logs/   # Logging endpoints
│   │   ├── dashboard/  # Dashboard page
│   │   └── page.tsx    # Landing page
│   ├── components/     # React components
│   │   └── ui/         # Reusable UI components
│   ├── lib/            # Core libraries
│   │   ├── prisma.ts   # Database client
│   │   ├── redis.ts    # Redis client
│   │   ├── auth.ts     # Authentication
│   │   ├── encryption.ts# Encryption utilities
│   │   ├── queue.ts    # Job queue
│   │   └── utils.ts    # Utility functions
│   ├── scraper/        # Scraping engine
│   │   ├── BaseScraper.ts      # Base scraper class
│   │   ├── GenericScraper.ts   # Generic implementation
│   │   ├── ScraperFactory.ts   # Factory pattern
│   │   └── BidNormalizer.ts    # Data normalization
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript type definitions
│   └── hooks/          # React hooks
├── workers/            # Background workers
│   └── scraper-worker.ts# Scraper job processor
└── docker-compose.yml  # Docker configuration
```

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use async/await for asynchronous operations

### Code Style
- Use ESLint configuration provided
- Run `npm run lint` before committing
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Naming Conventions
- Files: `camelCase.ts` or `PascalCase.tsx`
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase` with `I` prefix or descriptive name

### Git Commit Messages
Follow conventional commits format:
```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(scraper): add support for infinite scroll pagination
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
```

## Making Changes

### Adding a New Portal Scraper

1. Create a new scraper class extending `BaseScraper`:
   ```typescript
   import { BaseScraper, BidData } from './BaseScraper';
   
   export class CustomPortalScraper extends BaseScraper {
     protected async performLogin(username: string, password: string): Promise<void> {
       // Implement portal-specific login
     }
     
     protected async extractBidsFromListing(): Promise<BidData[]> {
       // Implement bid extraction
     }
     
     protected async extractDetailPageData(bid: BidData): Promise<BidData> {
       // Implement detail page extraction
     }
     
     protected async hasNextPage(): Promise<boolean> {
       // Check for next page
     }
     
     protected async goToNextPage(): Promise<void> {
       // Navigate to next page
     }
   }
   ```

2. Register in `ScraperFactory`:
   ```typescript
   if (portal.name.includes('CustomPortal')) {
     return new CustomPortalScraper(portal, jobId);
   }
   ```

### Adding a New API Endpoint

1. Create route handler in `src/app/api/[endpoint]/route.ts`
2. Implement proper authentication checks
3. Add input validation
4. Handle errors gracefully
5. Document in README

### Adding a New UI Component

1. Create component in `src/components/`
2. Use TypeScript for props
3. Follow existing component patterns
4. Make it reusable when possible

## Testing

### Manual Testing
1. Test all affected endpoints with curl or Postman
2. Verify database changes
3. Check logs for errors
4. Test error scenarios

### Testing Checklist
- [ ] Login/authentication works
- [ ] Portal CRUD operations work
- [ ] Scraper can be triggered
- [ ] Bids are saved correctly
- [ ] Export functionality works
- [ ] Logs are recorded
- [ ] Error handling works

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow coding standards
   - Test thoroughly

3. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Provide clear description
   - Reference any related issues
   - Add screenshots for UI changes
   - Ensure CI passes

6. **Address review comments**
   - Make requested changes
   - Push updates
   - Re-request review

## Common Development Tasks

### Database Changes

1. **Modify schema**
   ```bash
   # Edit prisma/schema.prisma
   ```

2. **Create migration**
   ```bash
   npm run prisma:migrate
   ```

3. **Apply migration**
   ```bash
   npx prisma migrate dev
   ```

### Adding Dependencies

1. **Install package**
   ```bash
   npm install package-name
   ```

2. **Update security**
   ```bash
   npm audit fix
   ```

### Debugging

1. **Check logs**
   ```bash
   # Application logs
   docker-compose logs -f app
   
   # Worker logs
   docker-compose logs -f worker
   ```

2. **Database inspection**
   ```bash
   npm run prisma:studio
   ```

3. **Redis inspection**
   ```bash
   redis-cli
   ```

## Security Considerations

- Never commit secrets or credentials
- Use environment variables for configuration
- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries (Prisma handles this)
- Keep dependencies updated
- Follow principle of least privilege

## Getting Help

- Check existing issues
- Review documentation
- Ask in discussions
- Contact maintainers

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

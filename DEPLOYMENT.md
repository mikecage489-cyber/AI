# Deployment Checklist

Use this checklist when deploying the Government Bid Scraper to production.

## Pre-Deployment

### Environment Setup
- [ ] Generate strong `JWT_SECRET` (min 32 characters)
- [ ] Generate `ENCRYPTION_KEY` using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Set up PostgreSQL database (v16+ recommended)
- [ ] Set up Redis instance (v7+ recommended)
- [ ] Update all environment variables in `.env`
- [ ] Remove or update default admin credentials

### Security
- [ ] Change default admin password
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Configure CORS if needed
- [ ] Set `NODE_ENV=production`
- [ ] Review and secure all API endpoints
- [ ] Set up rate limiting (if not already configured)
- [ ] Enable database connection pooling
- [ ] Restrict database access by IP
- [ ] Use strong Redis password

### Database
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Verify schema is correct
- [ ] Set up database backups
- [ ] Configure connection limits
- [ ] Test database connectivity

### Dependencies
- [ ] Update all dependencies to latest stable versions
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Install Playwright browsers: `npx playwright install chromium`
- [ ] Verify all required npm packages are installed

## Docker Deployment

### Build and Test
- [ ] Build Docker images: `docker-compose build`
- [ ] Test locally: `docker-compose up`
- [ ] Verify all services start correctly
- [ ] Test database connectivity
- [ ] Test Redis connectivity
- [ ] Test scraper worker

### Production Configuration
- [ ] Update `docker-compose.yml` with production values
- [ ] Set resource limits (CPU, memory)
- [ ] Configure restart policies
- [ ] Set up volume mounts for persistence
- [ ] Configure logging drivers
- [ ] Set up health checks

### Deploy
- [ ] Deploy to production server
- [ ] Run migrations: `docker-compose exec app npx prisma migrate deploy`
- [ ] Create initial admin user
- [ ] Verify all services are running: `docker-compose ps`
- [ ] Check logs: `docker-compose logs -f`

## Manual Deployment (Non-Docker)

### Server Setup
- [ ] Install Node.js 20+
- [ ] Install PostgreSQL 16+
- [ ] Install Redis 7+
- [ ] Install PM2 or similar process manager
- [ ] Configure system firewall

### Application Setup
- [ ] Clone repository
- [ ] Install dependencies: `npm install`
- [ ] Generate Prisma client: `npm run prisma:generate`
- [ ] Build application: `npm run build`
- [ ] Run migrations: `npm run prisma:migrate`

### Process Management
- [ ] Set up PM2 ecosystem file
- [ ] Configure PM2 to start on boot
- [ ] Start main app: `pm2 start npm --name "govbid-app" -- start`
- [ ] Start worker: `pm2 start npm --name "govbid-worker" -- run worker`
- [ ] Save PM2 configuration: `pm2 save`

## Post-Deployment

### Testing
- [ ] Test login endpoint
- [ ] Create a test portal
- [ ] Run a test scrape
- [ ] Verify bids are saved
- [ ] Test export functionality
- [ ] Check all logs are recording
- [ ] Test API endpoints
- [ ] Verify worker is processing jobs

### Monitoring Setup
- [ ] Set up application monitoring (e.g., PM2, New Relic)
- [ ] Configure log aggregation
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up database monitoring
- [ ] Monitor Redis performance
- [ ] Set up alerts for failures

### Performance
- [ ] Test under load
- [ ] Optimize database queries if needed
- [ ] Configure Redis caching
- [ ] Set up CDN if serving static assets
- [ ] Enable gzip compression
- [ ] Optimize scraper rate limits

### Backup and Recovery
- [ ] Set up automated database backups
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Set up backup monitoring
- [ ] Configure backup retention policy

### Documentation
- [ ] Document production environment
- [ ] Update deployment procedures
- [ ] Document monitoring and alerts
- [ ] Document backup/recovery procedures
- [ ] Create runbook for common issues

## Maintenance

### Regular Tasks
- [ ] Weekly: Review logs for errors
- [ ] Weekly: Check disk space
- [ ] Weekly: Monitor scraper success rates
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security advisories
- [ ] Monthly: Test backup restoration
- [ ] Quarterly: Security audit
- [ ] Quarterly: Performance review

### Security Updates
- [ ] Subscribe to security advisories
- [ ] Update dependencies regularly
- [ ] Rotate encryption keys periodically
- [ ] Review and update access controls
- [ ] Monitor for suspicious activity

## Rollback Plan

If issues occur after deployment:

1. [ ] Stop the application
2. [ ] Revert to previous Docker image or code version
3. [ ] Restore database from backup if needed
4. [ ] Restart services
5. [ ] Verify functionality
6. [ ] Document the issue

## Emergency Contacts

List key personnel and their contact information:

- DevOps Lead: _____________
- Database Admin: _____________
- Security Contact: _____________
- On-call Engineer: _____________

## Production URLs

- Application: https://_______________
- Database: _______________
- Redis: _______________
- Monitoring Dashboard: https://_______________
- Log Aggregation: https://_______________

## Notes

Add any environment-specific notes or considerations here:

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Version:** _______________
**Deployment Type:** [ ] Initial [ ] Update [ ] Hotfix
**Status:** [ ] Success [ ] Partial [ ] Failed

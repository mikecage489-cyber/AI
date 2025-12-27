import { Worker } from 'bullmq';
import { prisma } from '../src/lib/prisma';
import { ScraperFactory } from '../src/scraper/ScraperFactory';
import { ScrapeJobData } from '../src/lib/queue';

const connection = {
  host: process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
  port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
};

const worker = new Worker<ScrapeJobData>(
  'scraper',
  async (job) => {
    const { portalId, jobId } = job.data;
    
    console.log(`Starting scrape job ${jobId} for portal ${portalId}`);
    
    try {
      // Update job status to running
      await prisma.scrapeJob.update({
        where: { id: jobId },
        data: {
          status: 'RUNNING',
          startedAt: new Date(),
        },
      });

      // Get portal configuration
      const portal = await prisma.portal.findUnique({
        where: { id: portalId },
        include: {
          credentials: true,
        },
      });

      if (!portal) {
        throw new Error(`Portal ${portalId} not found`);
      }

      // Create scraper instance
      const portalConfig = {
        id: portal.id,
        name: portal.name,
        loginUrl: portal.loginUrl || undefined,
        listingUrl: portal.listingUrl,
        portalType: portal.portalType,
        fieldMapping: portal.fieldMapping as any,
        scraperConfig: portal.scraperConfig as any,
        credentials: portal.credentials[0]
          ? {
              encryptedUsername: portal.credentials[0].encryptedUsername,
              encryptedPassword: portal.credentials[0].encryptedPassword,
              iv: portal.credentials[0].iv,
              authTag: portal.credentials[0].authTag,
            }
          : undefined,
      };

      const scraper = ScraperFactory.createScraper(portalConfig, jobId);

      // Run scraper
      const result = await scraper.scrape();

      // Save bids to database
      let bidsAdded = 0;
      for (const bidData of result.bids) {
        try {
          await prisma.bid.create({
            data: {
              portalId,
              requisitionNumber: bidData.requisitionNumber,
              bidNumber: bidData.bidNumber,
              solicitationNumber: bidData.solicitationNumber,
              title: bidData.title,
              description: bidData.description,
              summary: bidData.summary,
              openDate: bidData.openDate,
              closeDate: bidData.closeDate,
              quantity: bidData.quantity,
              unitOfMeasure: bidData.unitOfMeasure,
              detailPageUrl: bidData.detailPageUrl,
              rawData: bidData.rawData as any,
              status: 'ACTIVE',
            },
          });
          bidsAdded++;
        } catch (error) {
          console.error('Failed to save bid:', error);
        }
      }

      // Update job status
      await prisma.scrapeJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          bidsFound: result.bids.length,
          bidsAdded,
          errors: result.errors,
        },
      });

      console.log(`Completed scrape job ${jobId}: ${bidsAdded} bids added`);

      return {
        bidsFound: result.bids.length,
        bidsAdded,
        errors: result.errors,
      };
    } catch (error) {
      console.error(`Scrape job ${jobId} failed:`, error);

      // Update job status to failed
      await prisma.scrapeJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: 2, // Process 2 jobs at a time
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

console.log('Scraper worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  await worker.close();
  process.exit(0);
});

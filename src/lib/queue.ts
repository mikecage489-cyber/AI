import { Queue, Worker, Job } from 'bullmq';
import redis from './redis';

const connection = {
  host: process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
  port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
};

// Create scraper queue
export const scraperQueue = new Queue('scraper', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      count: 100,
    },
    removeOnFail: {
      count: 50,
    },
  },
});

export interface ScrapeJobData {
  portalId: string;
  jobId: string;
  jobType: 'manual' | 'scheduled';
}

/**
 * Add a scrape job to the queue
 */
export async function addScrapeJob(data: ScrapeJobData) {
  return scraperQueue.add('scrape-portal', data, {
    jobId: data.jobId,
  });
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string) {
  const job = await scraperQueue.getJob(jobId);
  if (!job) return null;
  
  const state = await job.getState();
  return {
    id: job.id,
    state,
    progress: job.progress,
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
  };
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string) {
  const job = await scraperQueue.getJob(jobId);
  if (job) {
    await job.remove();
    return true;
  }
  return false;
}

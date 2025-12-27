import { chromium, Browser, Page } from 'playwright';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';

export interface BidData {
  requisitionNumber?: string;
  bidNumber?: string;
  solicitationNumber?: string;
  title: string;
  description?: string;
  summary?: string;
  openDate?: Date;
  closeDate?: Date;
  quantity?: string;
  unitOfMeasure?: string;
  detailPageUrl?: string;
  rawData?: any;
}

export interface ScraperConfig {
  rateLimit?: number;
  timeout?: number;
  maxRetries?: number;
  userAgent?: string;
}

export interface PortalConfig {
  id: string;
  name: string;
  loginUrl?: string;
  listingUrl: string;
  portalType: string;
  fieldMapping?: any;
  scraperConfig?: any;
  credentials?: {
    encryptedUsername: string;
    encryptedPassword: string;
    iv: string;
    authTag: string;
  };
}

export abstract class BaseScraper {
  protected browser: Browser | null = null;
  protected page: Page | null = null;
  protected portal: PortalConfig;
  protected config: ScraperConfig;
  protected jobId: string;

  constructor(portal: PortalConfig, jobId: string, config?: ScraperConfig) {
    this.portal = portal;
    this.jobId = jobId;
    this.config = {
      rateLimit: config?.rateLimit || parseInt(process.env.SCRAPER_RATE_LIMIT_MS || '2000'),
      timeout: config?.timeout || parseInt(process.env.SCRAPER_TIMEOUT_MS || '30000'),
      maxRetries: config?.maxRetries || parseInt(process.env.SCRAPER_MAX_RETRIES || '3'),
      userAgent: config?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };
  }

  /**
   * Initialize browser and page
   */
  protected async initBrowser(): Promise<void> {
    await this.log('INFO', 'Initializing browser');
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.page = await this.browser.newPage({
      userAgent: this.config.userAgent,
    });

    await this.page.setDefaultTimeout(this.config.timeout!);
  }

  /**
   * Close browser
   */
  protected async closeBrowser(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    await this.log('INFO', 'Browser closed');
  }

  /**
   * Handle authentication if required
   */
  protected async authenticate(): Promise<boolean> {
    if (this.portal.portalType !== 'LOGIN_REQUIRED' || !this.portal.credentials) {
      return true;
    }

    try {
      await this.log('INFO', 'Starting authentication');
      
      const { encryptedUsername, encryptedPassword, iv, authTag } = this.portal.credentials;
      const username = decrypt(encryptedUsername, iv, authTag);
      const password = decrypt(encryptedPassword, iv, authTag);

      if (!this.page || !this.portal.loginUrl) {
        throw new Error('Page or login URL not initialized');
      }

      await this.page.goto(this.portal.loginUrl, { waitUntil: 'networkidle' });
      
      // This is a generic login handler - override in specific scrapers
      await this.performLogin(username, password);
      
      await this.log('INFO', 'Authentication successful');
      return true;
    } catch (error) {
      await this.log('ERROR', `Authentication failed: ${error}`);
      return false;
    }
  }

  /**
   * Abstract method to perform login - must be implemented by specific scrapers
   */
  protected abstract performLogin(username: string, password: string): Promise<void>;

  /**
   * Navigate to listing page
   */
  protected async navigateToListing(): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    await this.log('INFO', `Navigating to listing: ${this.portal.listingUrl}`);
    await this.page.goto(this.portal.listingUrl, { waitUntil: 'networkidle' });
    await this.delay(this.config.rateLimit!);
  }

  /**
   * Extract bids from listing page
   */
  protected abstract extractBidsFromListing(): Promise<BidData[]>;

  /**
   * Click into detail page and extract full data
   */
  protected abstract extractDetailPageData(bid: BidData): Promise<BidData>;

  /**
   * Handle pagination
   */
  protected abstract hasNextPage(): Promise<boolean>;
  protected abstract goToNextPage(): Promise<void>;

  /**
   * Main scraping method
   */
  async scrape(): Promise<{ bids: BidData[]; errors: number }> {
    const allBids: BidData[] = [];
    let errors = 0;

    try {
      await this.initBrowser();
      
      // Authenticate if needed
      const authenticated = await this.authenticate();
      if (!authenticated && this.portal.portalType === 'LOGIN_REQUIRED') {
        throw new Error('Authentication failed');
      }

      // Navigate to listing
      await this.navigateToListing();

      // Scrape all pages
      let pageNumber = 1;
      do {
        await this.log('INFO', `Scraping page ${pageNumber}`);
        
        try {
          const pageBids = await this.extractBidsFromListing();
          
          // Filter for today's bids only
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todaysBids = pageBids.filter(bid => {
            if (!bid.openDate) return false;
            const openDate = new Date(bid.openDate);
            openDate.setHours(0, 0, 0, 0);
            return openDate.getTime() === today.getTime();
          });

          await this.log('INFO', `Found ${todaysBids.length} bids from today on page ${pageNumber}`);
          
          // Extract detail data for each bid
          for (const bid of todaysBids) {
            try {
              const fullBid = await this.extractDetailPageData(bid);
              allBids.push(fullBid);
              await this.delay(this.config.rateLimit!);
            } catch (error) {
              await this.log('ERROR', `Failed to extract detail for bid: ${error}`);
              errors++;
            }
          }

          pageNumber++;
        } catch (error) {
          await this.log('ERROR', `Failed to scrape page ${pageNumber}: ${error}`);
          errors++;
          break;
        }

        // Check for next page
        const hasNext = await this.hasNextPage();
        if (hasNext) {
          await this.goToNextPage();
          await this.delay(this.config.rateLimit!);
        } else {
          break;
        }
      } while (true);

    } catch (error) {
      await this.log('ERROR', `Scraping failed: ${error}`);
      errors++;
    } finally {
      await this.closeBrowser();
    }

    return { bids: allBids, errors };
  }

  /**
   * Log message
   */
  protected async log(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, metadata?: any): Promise<void> {
    console.log(`[${level}] ${message}`, metadata || '');
    
    try {
      await prisma.scrapeLog.create({
        data: {
          jobId: this.jobId,
          level,
          message,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        },
      });
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  }

  /**
   * Delay helper
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry with exponential backoff
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    retries: number = this.config.maxRetries!
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < retries - 1) {
          const delay = Math.pow(2, i) * 1000;
          await this.log('WARN', `Retry ${i + 1}/${retries} after ${delay}ms`);
          await this.delay(delay);
        }
      }
    }
    
    throw lastError;
  }
}

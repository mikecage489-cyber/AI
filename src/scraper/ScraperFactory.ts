import { BaseScraper, PortalConfig } from './BaseScraper';
import { GenericScraper } from './GenericScraper';

export class ScraperFactory {
  /**
   * Create appropriate scraper instance based on portal config
   */
  static createScraper(portal: PortalConfig, jobId: string): BaseScraper {
    // For now, use generic scraper for all portals
    // In the future, we can add portal-specific scrapers here
    // Example:
    // if (portal.name.includes('SAM.gov')) {
    //   return new SAMGovScraper(portal, jobId);
    // }
    
    return new GenericScraper(portal, jobId);
  }
}

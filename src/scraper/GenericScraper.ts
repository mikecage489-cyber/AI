import { BaseScraper, BidData } from './BaseScraper';
import { BidNormalizer } from './BidNormalizer';

/**
 * Generic scraper implementation that attempts to scrape any portal
 * using common patterns and configurable selectors
 */
export class GenericScraper extends BaseScraper {
  private normalizer: BidNormalizer;

  constructor(portal: any, jobId: string, config?: any) {
    super(portal, jobId, config);
    this.normalizer = new BidNormalizer(portal.fieldMapping);
  }

  /**
   * Perform login - override for specific portals
   */
  protected async performLogin(username: string, password: string): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    // Generic login approach - look for common input fields
    const usernameSelectors = [
      'input[name="username"]',
      'input[name="email"]',
      'input[name="user"]',
      'input[type="email"]',
      '#username',
      '#email',
    ];

    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      '#password',
    ];

    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
    ];

    // Try to find and fill username
    for (const selector of usernameSelectors) {
      try {
        await this.page.fill(selector, username, { timeout: 5000 });
        break;
      } catch (e) {
        // Try next selector
      }
    }

    // Try to find and fill password
    for (const selector of passwordSelectors) {
      try {
        await this.page.fill(selector, password, { timeout: 5000 });
        break;
      } catch (e) {
        // Try next selector
      }
    }

    // Try to submit
    for (const selector of submitSelectors) {
      try {
        await this.page.click(selector, { timeout: 5000 });
        break;
      } catch (e) {
        // Try next selector
      }
    }

    // Wait for navigation
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Extract bids from listing page
   */
  protected async extractBidsFromListing(): Promise<BidData[]> {
    if (!this.page) throw new Error('Page not initialized');

    const bids: BidData[] = [];

    // Look for table rows or list items
    const rowSelectors = [
      'table tbody tr',
      'table tr',
      'div[role="row"]',
      'ul li',
      '.bid-item',
      '.listing-item',
    ];

    let rows: any[] = [];
    for (const selector of rowSelectors) {
      try {
        const elements = await this.page.$$(selector);
        if (elements.length > 0) {
          rows = elements;
          await this.log('INFO', `Found ${rows.length} rows using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (rows.length === 0) {
      await this.log('WARN', 'No bid rows found on page');
      return bids;
    }

    // Extract data from each row
    for (const row of rows) {
      try {
        const text = await row.textContent();
        const html = await row.innerHTML();
        
        // Try to find links
        const links = await row.$$('a');
        let detailUrl = '';
        if (links.length > 0) {
          detailUrl = await links[0].getAttribute('href') || '';
          if (detailUrl && !detailUrl.startsWith('http')) {
            const baseUrl = new URL(this.portal.listingUrl).origin;
            detailUrl = baseUrl + (detailUrl.startsWith('/') ? '' : '/') + detailUrl;
          }
        }

        // Basic extraction - this should be customized per portal
        const bid: BidData = {
          title: text?.split('\n')[0]?.trim() || 'Untitled',
          detailPageUrl: detailUrl,
          rawData: {
            text,
            html,
          },
        };

        bids.push(bid);
      } catch (error) {
        await this.log('ERROR', `Failed to extract bid from row: ${error}`);
      }
    }

    return bids;
  }

  /**
   * Extract detail page data
   */
  protected async extractDetailPageData(bid: BidData): Promise<BidData> {
    if (!this.page || !bid.detailPageUrl) {
      return bid;
    }

    try {
      await this.page.goto(bid.detailPageUrl, { waitUntil: 'networkidle' });
      
      // Extract all text content
      const content = await this.page.textContent('body') || '';
      
      // Update bid with detail page content
      bid.description = content.substring(0, 5000); // Limit to 5000 chars
      
      // Try to extract structured data
      // This should be customized per portal
      
      await this.page.goBack({ waitUntil: 'networkidle' });
    } catch (error) {
      await this.log('WARN', `Failed to load detail page: ${error}`);
    }

    return bid;
  }

  /**
   * Check if there's a next page
   */
  protected async hasNextPage(): Promise<boolean> {
    if (!this.page) return false;

    const nextSelectors = [
      'a:has-text("Next")',
      'button:has-text("Next")',
      'a[aria-label="Next"]',
      'button[aria-label="Next"]',
      '.pagination .next',
      '.pager .next',
    ];

    for (const selector of nextSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          const isDisabled = await element.getAttribute('disabled');
          const ariaDisabled = await element.getAttribute('aria-disabled');
          if (!isDisabled && ariaDisabled !== 'true') {
            return true;
          }
        }
      } catch (e) {
        // Try next selector
      }
    }

    return false;
  }

  /**
   * Go to next page
   */
  protected async goToNextPage(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    const nextSelectors = [
      'a:has-text("Next")',
      'button:has-text("Next")',
      'a[aria-label="Next"]',
      'button[aria-label="Next"]',
      '.pagination .next',
      '.pager .next',
    ];

    for (const selector of nextSelectors) {
      try {
        await this.page.click(selector, { timeout: 5000 });
        await this.page.waitForLoadState('networkidle');
        await this.log('INFO', 'Navigated to next page');
        return;
      } catch (e) {
        // Try next selector
      }
    }

    throw new Error('Could not find next page button');
  }
}

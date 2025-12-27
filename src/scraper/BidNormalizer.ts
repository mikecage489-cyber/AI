import { BidData } from './BaseScraper';
import { parse, parseISO, isValid } from 'date-fns';

export interface FieldMapping {
  requisitionNumber?: string;
  bidNumber?: string;
  solicitationNumber?: string;
  title?: string;
  description?: string;
  summary?: string;
  openDate?: string;
  closeDate?: string;
  quantity?: string;
  unitOfMeasure?: string;
  detailPageUrl?: string;
}

export class BidNormalizer {
  private fieldMapping: FieldMapping;

  constructor(fieldMapping?: FieldMapping) {
    this.fieldMapping = fieldMapping || {};
  }

  /**
   * Normalize raw bid data to standard schema
   */
  normalize(rawData: any): BidData {
    return {
      requisitionNumber: this.extractField(rawData, this.fieldMapping.requisitionNumber || 'requisitionNumber'),
      bidNumber: this.extractField(rawData, this.fieldMapping.bidNumber || 'bidNumber'),
      solicitationNumber: this.extractField(rawData, this.fieldMapping.solicitationNumber || 'solicitationNumber'),
      title: this.extractField(rawData, this.fieldMapping.title || 'title') || 'Untitled',
      description: this.extractField(rawData, this.fieldMapping.description || 'description'),
      summary: this.extractField(rawData, this.fieldMapping.summary || 'summary'),
      openDate: this.parseDate(this.extractField(rawData, this.fieldMapping.openDate || 'openDate')),
      closeDate: this.parseDate(this.extractField(rawData, this.fieldMapping.closeDate || 'closeDate')),
      quantity: this.extractField(rawData, this.fieldMapping.quantity || 'quantity'),
      unitOfMeasure: this.extractField(rawData, this.fieldMapping.unitOfMeasure || 'unitOfMeasure'),
      detailPageUrl: this.extractField(rawData, this.fieldMapping.detailPageUrl || 'detailPageUrl'),
      rawData,
    };
  }

  /**
   * Extract field from raw data using dot notation
   */
  private extractField(data: any, path: string): string | undefined {
    if (!path || !data) return undefined;
    
    const keys = path.split('.');
    let value = data;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value?.toString()?.trim() || undefined;
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateStr: string | undefined): Date | undefined {
    if (!dateStr) return undefined;
    
    const cleaned = dateStr.trim();
    
    // Try ISO format first
    try {
      const isoDate = parseISO(cleaned);
      if (isValid(isoDate)) return isoDate;
    } catch (e) {
      // Continue to other formats
    }
    
    // Common date formats
    const formats = [
      'MM/dd/yyyy',
      'MM-dd-yyyy',
      'yyyy-MM-dd',
      'dd/MM/yyyy',
      'dd-MM-yyyy',
      'MMM dd, yyyy',
      'MMMM dd, yyyy',
      'yyyy/MM/dd',
    ];
    
    for (const format of formats) {
      try {
        const parsed = parse(cleaned, format, new Date());
        if (isValid(parsed)) return parsed;
      } catch (e) {
        // Try next format
      }
    }
    
    // Try native Date constructor as last resort
    try {
      const date = new Date(cleaned);
      if (isValid(date)) return date;
    } catch (e) {
      // Give up
    }
    
    return undefined;
  }

  /**
   * Clean and validate normalized data
   */
  validate(bid: BidData): boolean {
    // At minimum, must have a title
    if (!bid.title || bid.title.trim() === '') {
      return false;
    }
    
    // At least one identifier should be present
    if (!bid.requisitionNumber && !bid.bidNumber && !bid.solicitationNumber) {
      return false;
    }
    
    return true;
  }
}

export interface Book {
  id: string;
  title: string;
  authors: string[];
  isbn?: string;
  description?: string;
  thumbnail?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  publisher?: string;
  language?: string;
  releaseStatus: 'released' | 'upcoming' | 'pre-order';
}

export interface BookEdition {
  id: string;
  format: string;
  price: number;
  currency: string;
  isbn?: string;
}

export interface RetailerListing {
  retailer: RetailerInfo;
  price: number;
  currency: string;
  convertedPrice?: number;
  convertedCurrency?: string;
  stockStatus: 'in-stock' | 'out-of-stock' | 'pre-order';
  url: string;
}

export interface RetailerInfo {
  id: string;
  name: string;
  logo?: string;
  verified: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export type ReprintStatus = 'reprint-confirmed' | 'awaiting-reprint' | 'ongoing-series' | 'in-print';

export const CURRENCIES: Currency[] = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const RETAILERS: RetailerInfo[] = [
  { id: 'waterstones', name: 'Waterstones', verified: true },
  { id: 'forbidden-planet', name: 'Forbidden Planet', verified: true },
  { id: 'amazon', name: 'Amazon', verified: true },
  { id: 'foyles', name: 'Foyles', verified: true },
  { id: 'travelling-man', name: 'Travelling Man', verified: true },
];

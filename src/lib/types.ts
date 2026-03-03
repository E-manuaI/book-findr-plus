export type MediaType = 'manga' | 'manhwa' | 'book' | 'graphic-novel';

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
  mediaType: MediaType;
  genres: string[];
}

export interface BookEdition {
  id: string;
  format: string;
  price: number;
  currency: string;
  isbn?: string;
  available: boolean;
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
  searchUrlTemplate: string; // e.g. "https://www.amazon.co.uk/s?k={query}"
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export type ReprintStatus = 'reprint-confirmed' | 'awaiting-reprint' | 'ongoing-series' | 'in-print';

export type SortOption = 'relevance' | 'popularity' | 'newest' | 'az';

export const CURRENCIES: Currency[] = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const RETAILERS: RetailerInfo[] = [
  { id: 'amazon', name: 'Amazon', verified: true, searchUrlTemplate: 'https://www.amazon.co.uk/s?k={query}' },
  { id: 'waterstones', name: 'Waterstones', verified: true, searchUrlTemplate: 'https://www.waterstones.com/category/book/term/{query}' },
  { id: 'forbidden-planet', name: 'Forbidden Planet', verified: true, searchUrlTemplate: 'https://forbiddenplanet.com/search/?q={query}' },
  { id: 'foyles', name: 'Foyles', verified: true, searchUrlTemplate: 'https://www.foyles.co.uk/search?term={query}' },
  { id: 'travelling-man', name: 'Travelling Man', verified: true, searchUrlTemplate: 'https://www.travellingman.com/search?q={query}' },
];

export const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'book', label: 'Book' },
  { value: 'graphic-novel', label: 'Graphic Novel' },
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'newest', label: 'Newest First' },
  { value: 'az', label: 'A — Z' },
];

export const EDITION_FORMATS = ['Paperback', 'Hardcover', 'Deluxe Edition', 'Omnibus', 'Box Set'] as const;

export type MediaType = 'manga' | 'manhwa' | 'manhua' | 'light-novel' | 'book' | 'graphic-novel';

export interface Book {
  id: string;
  title: string;
  authors: string[];
  isbn13?: string;
  isbn10?: string;
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

export interface RetailerListing {
  retailer: RetailerInfo;
  url: string;
  buttonLabel: string;
}

export interface RetailerInfo {
  id: string;
  name: string;
  logo?: string;
  verified: boolean;
  urlType: 'isbn13' | 'isbn10' | 'search';
  urlTemplate: string;
  searchFallbackTemplate: string;
}

export interface UserStockReport {
  id: string;
  retailerId: string;
  bookId: string;
  status: 'in-stock' | 'out-of-stock' | 'limited';
  reportedAt: string;
  reportedBy: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export type SortOption = 'relevance' | 'newest';

export const CURRENCIES: Currency[] = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const RETAILERS: RetailerInfo[] = [
  {
    id: 'amazon-uk',
    name: 'Amazon UK',
    verified: true,
    urlType: 'isbn10',
    urlTemplate: 'https://www.amazon.co.uk/dp/{ISBN10}',
    searchFallbackTemplate: 'https://www.amazon.co.uk/s?k={QUERY}',
  },
  {
    id: 'waterstones',
    name: 'Waterstones',
    verified: true,
    urlType: 'isbn13',
    urlTemplate: 'https://www.waterstones.com/book/{ISBN13}',
    searchFallbackTemplate: 'https://www.waterstones.com/category/book/term/{QUERY}',
  },
  {
    id: 'blackwells',
    name: "Blackwell's",
    verified: true,
    urlType: 'isbn13',
    urlTemplate: 'https://blackwells.co.uk/bookshop/product/{ISBN13}',
    searchFallbackTemplate: 'https://blackwells.co.uk/bookshop/search?term={QUERY}',
  },
  {
    id: 'foyles',
    name: 'Foyles',
    verified: true,
    urlType: 'isbn13',
    urlTemplate: 'https://www.foyles.co.uk/book/{ISBN13}',
    searchFallbackTemplate: 'https://www.foyles.co.uk/search?term={QUERY}',
  },
  {
    id: 'forbidden-planet',
    name: 'Forbidden Planet',
    verified: true,
    urlType: 'isbn13',
    urlTemplate: 'https://forbiddenplanet.com/catalog/?q={ISBN13}',
    searchFallbackTemplate: 'https://forbiddenplanet.com/catalog/?q={QUERY}',
  },
  {
    id: 'travelling-man',
    name: 'Travelling Man',
    verified: true,
    urlType: 'search',
    urlTemplate: 'https://travellingman.com/search?q={QUERY}',
    searchFallbackTemplate: 'https://travellingman.com/search?q={QUERY}',
  },
];

export const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
  { value: 'light-novel', label: 'Light Novel' },
  { value: 'graphic-novel', label: 'Graphic Novel' },
  { value: 'book', label: 'Book' },
];

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
];

export const MEDIA_TAG_OPTIONS = [
  { value: 'manga', label: 'Manga' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
  { value: 'light-novel', label: 'Light Novel' },
  { value: 'graphic-novel', label: 'Graphic Novel' },
  { value: 'book', label: 'Book' },
];

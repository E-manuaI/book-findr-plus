import type { Book, RetailerListing, ReprintStatus } from './types';
import { RETAILERS } from './types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) return [];

  const res = await fetch(
    `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=20&orderBy=relevance&key=${API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch books');

  const data = await res.json();
  if (!data.items) return [];

  return data.items.map((item: any) => {
    const info = item.volumeInfo;
    const pubDate = info.publishedDate;
    const now = new Date();
    const releaseDate = pubDate ? new Date(pubDate) : null;
    let releaseStatus: Book['releaseStatus'] = 'released';
    if (releaseDate && releaseDate > now) {
      releaseStatus = 'upcoming';
    }

    return {
      id: item.id,
      title: info.title || 'Untitled',
      authors: info.authors || ['Unknown'],
      isbn: info.industryIdentifiers?.[0]?.identifier,
      description: info.description,
      thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
      publishedDate: pubDate,
      pageCount: info.pageCount,
      categories: info.categories,
      publisher: info.publisher,
      language: info.language,
      releaseStatus,
    } as Book;
  });
}

export async function getBookById(id: string): Promise<Book | null> {
  const res = await fetch(`${GOOGLE_BOOKS_API}/${id}?key=${API_KEY}`);
  if (!res.ok) return null;

  const item = await res.json();
  const info = item.volumeInfo;
  const pubDate = info.publishedDate;
  const now = new Date();
  const releaseDate = pubDate ? new Date(pubDate) : null;
  let releaseStatus: Book['releaseStatus'] = 'released';
  if (releaseDate && releaseDate > now) releaseStatus = 'upcoming';

  return {
    id: item.id,
    title: info.title || 'Untitled',
    authors: info.authors || ['Unknown'],
    isbn: info.industryIdentifiers?.[0]?.identifier,
    description: info.description,
    thumbnail: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
    publishedDate: pubDate,
    pageCount: info.pageCount,
    categories: info.categories,
    publisher: info.publisher,
    language: info.language,
    releaseStatus,
  };
}

// Mock retailer data (would be real API in production)
export function getMockRetailerListings(book: Book): RetailerListing[] {
  const basePrice = 8 + Math.random() * 25;
  const stockOptions: RetailerListing['stockStatus'][] = ['in-stock', 'out-of-stock', 'pre-order'];

  return RETAILERS.map((retailer) => {
    const variance = (Math.random() - 0.5) * 6;
    const status = book.releaseStatus === 'upcoming'
      ? 'pre-order'
      : stockOptions[Math.floor(Math.random() * 2)]; // mostly in-stock

    return {
      retailer,
      price: Math.round((basePrice + variance) * 100) / 100,
      currency: 'GBP',
      stockStatus: status,
      url: `https://${retailer.id}.com/search?q=${encodeURIComponent(book.title)}`,
    };
  });
}

export function getMockReprintStatus(): ReprintStatus {
  const statuses: ReprintStatus[] = ['in-print', 'reprint-confirmed', 'awaiting-reprint', 'ongoing-series'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

// Mock currency conversion
const MOCK_RATES: Record<string, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
  JPY: 190.5,
  CAD: 1.73,
  AUD: 1.95,
};

export function convertPrice(amount: number, from: string, to: string): number {
  const inGBP = amount / (MOCK_RATES[from] || 1);
  const converted = inGBP * (MOCK_RATES[to] || 1);
  return Math.round(converted * 100) / 100;
}

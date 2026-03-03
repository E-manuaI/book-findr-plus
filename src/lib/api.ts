import type { Book, RetailerListing, ReprintStatus, BookEdition, MediaType, SortOption } from './types';
import { RETAILERS, EDITION_FORMATS } from './types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

function buildRetailerUrl(template: string, title: string, authors: string[]): string {
  const searchTerm = `${title} ${authors[0] || ''}`.trim();
  return template.replace('{query}', encodeURIComponent(searchTerm));
}

function detectMediaType(categories: string[] | undefined, title: string, publisher?: string): MediaType {
  const cats = (categories || []).join(' ').toLowerCase();
  const t = title.toLowerCase();
  const p = (publisher || '').toLowerCase();

  const mangaPublishers = ['viz media', 'kodansha', 'shogakukan', 'shueisha', 'yen press', 'square enix', 'seven seas', 'tokyopop'];
  const manhwaPublishers = ['webtoon', 'tapas', 'tappytoon', 'ize press'];

  if (manhwaPublishers.some(mp => p.includes(mp)) || cats.includes('manhwa') || t.includes('manhwa')) return 'manhwa';
  if (mangaPublishers.some(mp => p.includes(mp)) || cats.includes('manga') || t.includes('manga') || cats.includes('comics & graphic novels') && (cats.includes('japanese') || t.match(/vol\.|volume/i))) return 'manga';
  if (cats.includes('graphic novel') || cats.includes('comic')) return 'graphic-novel';
  return 'book';
}

function extractGenres(categories: string[] | undefined): string[] {
  if (!categories) return [];
  const genres = new Set<string>();
  for (const cat of categories) {
    cat.split('/').forEach(part => {
      const trimmed = part.trim();
      if (trimmed && !['General', 'Fiction', 'Nonfiction'].includes(trimmed)) {
        genres.add(trimmed);
      }
    });
  }
  return Array.from(genres).slice(0, 5);
}

function mapBookItem(item: any): Book {
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
    mediaType: detectMediaType(info.categories, info.title || '', info.publisher),
    genres: extractGenres(info.categories),
  };
}

export async function searchBooks(query: string, sort?: SortOption): Promise<Book[]> {
  if (!query.trim()) return [];

  let orderBy = 'relevance';
  if (sort === 'newest') orderBy = 'newest';

  const res = await fetch(
    `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=40&orderBy=${orderBy}&key=${API_KEY}`
  );
  if (!res.ok) throw new Error('Failed to fetch books');

  const data = await res.json();
  if (!data.items) return [];

  let books = data.items.map(mapBookItem);

  if (sort === 'az') books.sort((a: Book, b: Book) => a.title.localeCompare(b.title));

  return books;
}

export async function searchUpcoming(category: string = 'manga'): Promise<Book[]> {
  const res = await fetch(
    `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(category)}&maxResults=20&orderBy=newest&key=${API_KEY}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.items) return [];
  return data.items.map(mapBookItem);
}

export async function getBookById(id: string): Promise<Book | null> {
  const res = await fetch(`${GOOGLE_BOOKS_API}/${id}?key=${API_KEY}`);
  if (!res.ok) return null;
  const item = await res.json();
  return mapBookItem(item);
}

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
      url: buildRetailerUrl(retailer.searchUrlTemplate, book.title, book.authors),
    };
  });
}

export function getMockEditions(book: Book): BookEdition[] {
  const count = 2 + Math.floor(Math.random() * 3);
  const formats = [...EDITION_FORMATS].sort(() => Math.random() - 0.5).slice(0, count);
  return formats.map((format, i) => ({
    id: `${book.id}-edition-${i}`,
    format,
    price: Math.round((7 + Math.random() * 30) * 100) / 100,
    currency: 'GBP',
    isbn: book.isbn ? `${book.isbn}-${i}` : undefined,
    available: Math.random() > 0.3,
  }));
}

export function getMockReprintStatus(): ReprintStatus {
  const statuses: ReprintStatus[] = ['in-print', 'reprint-confirmed', 'awaiting-reprint', 'ongoing-series'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

export function getMockReprintDate(): string | null {
  if (Math.random() > 0.5) return null;
  const future = new Date();
  future.setMonth(future.getMonth() + 1 + Math.floor(Math.random() * 6));
  return future.toISOString();
}

// Mock currency conversion
const MOCK_RATES: Record<string, number> = {
  GBP: 1, USD: 1.27, EUR: 1.17, JPY: 190.5, CAD: 1.73, AUD: 1.95,
};

export function convertPrice(amount: number, from: string, to: string): number {
  const inGBP = amount / (MOCK_RATES[from] || 1);
  const converted = inGBP * (MOCK_RATES[to] || 1);
  return Math.round(converted * 100) / 100;
}

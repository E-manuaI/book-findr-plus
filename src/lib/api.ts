import type { Book, RetailerListing, MediaType, SortOption } from './types';
import { RETAILERS } from './types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;


const MANGA_MEDIA_TYPES = new Set(['manga', 'manhwa', 'manhua', 'light-novel']);

function isMangaRelated(book: Book): boolean {
  // Must be a known manga media type
  if (!MANGA_MEDIA_TYPES.has(book.mediaType)) return false;
  // Extra guard: reject if title looks like academic/non-fiction junk
  const t = book.title.toLowerCase();
  const junkPatterns = [
    'proceedings', 'conference', 'journal', 'volume 1', 'symposium',
    'dissertation', 'thesis', 'handbook', 'encyclopedia', 'textbook',
  ];
  if (junkPatterns.some(p => t.includes(p))) return false;
  return true;
}

export function isbn13to10(isbn13: string): string | null {
  if (!isbn13 || isbn13.length !== 13 || !isbn13.startsWith('978')) return null;
  const core = isbn13.slice(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(core[i]) * (10 - i);
  }
  const check = (11 - (sum % 11)) % 11;
  return core + (check === 10 ? 'X' : String(check));
}

function cleanTitleQuery(title: string): string {
  return title.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanSearchQuery(title: string, authors: string[]): string {
  return `${title} ${authors[0] || ''}`.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildRetailerUrl(retailer: typeof RETAILERS[0], book: Book): { url: string; buttonLabel: string } {
  const isbn13 = book.isbn13;
  const isbn10 = book.isbn10 || (isbn13 ? isbn13to10(isbn13) : null);
  const query = cleanSearchQuery(book.title, book.authors);
  const titleOnly = cleanTitleQuery(book.title);

  if (retailer.id === 'travelling-man') {
    return { url: retailer.urlTemplate.replace('{QUERY}', encodeURIComponent(titleOnly)), buttonLabel: `Check availability at ${retailer.name}` };
  }
  if (retailer.id === 'forbidden-planet') {
    const searchTerm = isbn13 || titleOnly;
    return { url: retailer.urlTemplate.replace('{ISBN13}', encodeURIComponent(searchTerm)), buttonLabel: `Check availability at ${retailer.name}` };
  }
  if (retailer.urlType === 'isbn10' && isbn10) {
    return { url: retailer.urlTemplate.replace('{ISBN10}', isbn10), buttonLabel: `View at ${retailer.name}` };
  }
  if (retailer.urlType === 'isbn13' && isbn13) {
    return { url: retailer.urlTemplate.replace('{ISBN13}', isbn13), buttonLabel: `View at ${retailer.name}` };
  }
  return { url: retailer.searchFallbackTemplate.replace('{QUERY}', encodeURIComponent(query)), buttonLabel: `Search at ${retailer.name}` };
}

function detectMediaType(categories: string[] | undefined, title: string, publisher?: string): MediaType {
  const cats = (categories || []).join(' ').toLowerCase();
  const t = title.toLowerCase();
  const p = (publisher || '').toLowerCase();

  const mangaPublishers = ['viz media', 'kodansha', 'shogakukan', 'shueisha', 'yen press', 'square enix', 'seven seas', 'tokyopop'];
  const manhwaPublishers = ['webtoon', 'tapas', 'tappytoon', 'ize press'];
  const manhuaPublishers = ['bilibili', 'kuaikan'];
  const lnPublishers = ['yen on', 'j-novel club', 'one peace books'];

  if (lnPublishers.some(lp => p.includes(lp)) || cats.includes('light novel') || t.includes('light novel')) return 'light-novel';
  if (manhuaPublishers.some(mp => p.includes(mp)) || cats.includes('manhua') || t.includes('manhua')) return 'manhua';
  if (manhwaPublishers.some(mp => p.includes(mp)) || cats.includes('manhwa') || t.includes('manhwa')) return 'manhwa';
  if (mangaPublishers.some(mp => p.includes(mp)) || cats.includes('manga') || t.includes('manga') || (cats.includes('comics & graphic novels') && (cats.includes('japanese') || t.match(/vol\.|volume/i)))) return 'manga';
  if (cats.includes('graphic novel') || cats.includes('comic')) return 'graphic-novel';
  return 'book';
}

function extractGenres(categories: string[] | undefined): string[] {
  if (!categories) return [];
  const genres = new Set<string>();
  for (const cat of categories) {
    cat.split('/').forEach(part => {
      const trimmed = part.trim();
      if (trimmed && !['General', 'Fiction', 'Nonfiction'].includes(trimmed)) genres.add(trimmed);
    });
  }
  return Array.from(genres).slice(0, 5);
}

function extractISBNs(identifiers: any[] | undefined): { isbn13?: string; isbn10?: string } {
  if (!identifiers) return {};
  let isbn13: string | undefined;
  let isbn10: string | undefined;
  for (const id of identifiers) {
    if (id.type === 'ISBN_13') isbn13 = id.identifier;
    if (id.type === 'ISBN_10') isbn10 = id.identifier;
  }
  if (isbn13 && !isbn10) isbn10 = isbn13to10(isbn13) || undefined;
  return { isbn13, isbn10 };
}

function mapBookItem(item: any): Book {
  const info = item.volumeInfo;
  const pubDate = info.publishedDate;
  const now = new Date();
  const releaseDate = pubDate ? new Date(pubDate) : null;
  let releaseStatus: Book['releaseStatus'] = 'released';
  if (releaseDate && releaseDate > now) releaseStatus = 'upcoming';
  const { isbn13, isbn10 } = extractISBNs(info.industryIdentifiers);
  return {
    id: item.id,
    title: info.title || 'Untitled',
    authors: info.authors || ['Unknown'],
    isbn13, isbn10,
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

export interface SearchResult {
  books: Book[];
  totalItems: number;
  hasMore: boolean;
}

export async function searchBooks(query: string, sort?: SortOption, startIndex: number = 0): Promise<SearchResult> {
  if (!query.trim()) return { books: [], totalItems: 0, hasMore: false };
  const orderBy = sort === 'newest' ? 'newest' : 'relevance';
  const res = await fetch(`${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=20&startIndex=${startIndex}&orderBy=${orderBy}&showPreorders=true&key=${API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch books');
  const data = await res.json();
  if (!data.items) return { books: [], totalItems: data.totalItems || 0, hasMore: false };
  const books = data.items.map(mapBookItem);
  return { books, totalItems: data.totalItems || 0, hasMore: startIndex + books.length < (data.totalItems || 0) };
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function fetchWithRetry(url: string, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 503 || res.status === 429) {
        if (i < retries) { await delay(600 * (i + 1)); continue; }
        return { items: [] };
      }
      if (!res.ok) return { items: [] };
      return await res.json();
    } catch {
      if (i < retries) await delay(600);
    }
  }
  return { items: [] };
}

export async function searchRecentReleases(monthsBack: number = 3, startIndex: number = 0): Promise<SearchResult> {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - monthsBack);
  const currentYear = now.getFullYear();
  const lastYear = currentYear - 1;
  const seen = new Set<string>();
  const books: Book[] = [];

  for (const q of [`manga ${currentYear}`, `manga ${lastYear}`]) {
    const data = await fetchWithRetry(`${GOOGLE_BOOKS_API}?q=${encodeURIComponent(q)}&maxResults=40&startIndex=${startIndex}&orderBy=newest&showPreorders=true&key=${API_KEY}`);
    for (const item of data.items || []) {
      const book = mapBookItem(item);
      if (seen.has(book.id)) continue;
      seen.add(book.id);
      if (!isMangaRelated(book)) continue;
      if (!book.publishedDate) continue;
      const pubDate = new Date(book.publishedDate);
      if (pubDate >= cutoff && pubDate <= now) books.push(book);
    }
    await delay(200);
  }
  // Keep Load More available as long as we got any results this page
  // (user can keep pressing; button only disappears when a page returns nothing)
  return { books, totalItems: books.length, hasMore: books.length > 0 || startIndex === 0 };
}

const UPCOMING_QUERIES = [
  'yen press manga',
  'viz media manga',
  'seven seas manga',
  'kodansha manga',
  'square enix manga',
  'tokyopop manga',
];

export async function searchUpcoming(startIndex: number = 0): Promise<SearchResult> {
  const now = new Date();
  // Only show books from the start of the current year onwards
  // Set cutoff to start of today — books from today or future only
  const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // Rotate through publisher queries 2 at a time per button press
  const pageSize = 2;
  const queryPage = Math.floor(startIndex / 40) % Math.ceil(UPCOMING_QUERIES.length / pageSize);
  const activeQueries = UPCOMING_QUERIES.slice(queryPage * pageSize, queryPage * pageSize + pageSize);

  const seen = new Set<string>();
  const books: Book[] = [];

  for (const q of activeQueries) {
    const data = await fetchWithRetry(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(q)}&maxResults=40&startIndex=${startIndex % 40}&orderBy=newest&showPreorders=true&key=${API_KEY}`
    );
    for (const item of data.items || []) {
      const book = mapBookItem(item);
      if (seen.has(book.id)) continue;
      seen.add(book.id);
      // Must have a publishedDate — no undated books
      if (!book.publishedDate) continue;
      // Must be from Jan 1 of this year or later
      if (new Date(book.publishedDate) < cutoff) continue; // cutoff = midnight today
      books.push(book);
    }
    await delay(300);
  }

  // Sort: upcoming/undated first, then most recent
  books.sort((a, b) => {
    const da = a.publishedDate ? new Date(a.publishedDate).getTime() : Infinity;
    const db = b.publishedDate ? new Date(b.publishedDate).getTime() : Infinity;
    return db - da;
  });

  return { books, totalItems: books.length, hasMore: books.length > 0 };
}

export async function getBookById(id: string): Promise<Book | null> {
  const res = await fetch(`${GOOGLE_BOOKS_API}/${id}?key=${API_KEY}`);
  if (!res.ok) return null;
  const item = await res.json();
  return mapBookItem(item);
}

export function getRetailerListings(book: Book): RetailerListing[] {
  return RETAILERS.map((retailer) => {
    const { url, buttonLabel } = buildRetailerUrl(retailer, book);
    return { retailer, url, buttonLabel };
  });
}

const MOCK_RATES: Record<string, number> = {
  GBP: 1, USD: 1.27, EUR: 1.17, JPY: 190.5, CAD: 1.73, AUD: 1.95,
};

export function convertPrice(amount: number, from: string, to: string): number {
  const inGBP = amount / (MOCK_RATES[from] || 1);
  const converted = inGBP * (MOCK_RATES[to] || 1);
  return Math.round(converted * 100) / 100;
}

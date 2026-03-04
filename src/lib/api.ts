import type { Book, RetailerListing, BookEdition, MediaType, SortOption } from './types';
import { RETAILERS, EDITION_FORMATS } from './types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

// ISBN-13 to ISBN-10 conversion
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

function cleanSearchQuery(title: string, authors: string[]): string {
  // Strip special chars, keep alphanumeric and spaces
  const cleaned = `${title} ${authors[0] || ''}`.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned;
}

function buildRetailerUrl(retailer: typeof RETAILERS[0], book: Book): { url: string; buttonLabel: string } {
  const isbn13 = book.isbn13;
  const isbn10 = book.isbn10 || (isbn13 ? isbn13to10(isbn13) : null);
  const query = cleanSearchQuery(book.title, book.authors);

  // Special case: Travelling Man always uses search
  if (retailer.id === 'travelling-man') {
    return {
      url: retailer.urlTemplate.replace('{QUERY}', encodeURIComponent(query)),
      buttonLabel: `Check availability at ${retailer.name}`,
    };
  }

  // Special case: Forbidden Planet uses catalog search with ISBN
  if (retailer.id === 'forbidden-planet') {
    const searchTerm = isbn13 || query;
    return {
      url: retailer.urlTemplate.replace('{ISBN13}', encodeURIComponent(searchTerm)),
      buttonLabel: `Check availability at ${retailer.name}`,
    };
  }

  // ISBN-10 retailers (Amazon)
  if (retailer.urlType === 'isbn10' && isbn10) {
    return {
      url: retailer.urlTemplate.replace('{ISBN10}', isbn10),
      buttonLabel: `View at ${retailer.name}`,
    };
  }

  // ISBN-13 retailers (Waterstones, Blackwell's, Foyles)
  if (retailer.urlType === 'isbn13' && isbn13) {
    return {
      url: retailer.urlTemplate.replace('{ISBN13}', isbn13),
      buttonLabel: `View at ${retailer.name}`,
    };
  }

  // Fallback: search page
  return {
    url: retailer.searchFallbackTemplate.replace('{QUERY}', encodeURIComponent(query)),
    buttonLabel: `Search at ${retailer.name}`,
  };
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
      if (trimmed && !['General', 'Fiction', 'Nonfiction'].includes(trimmed)) {
        genres.add(trimmed);
      }
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
  // Derive isbn10 from isbn13 if missing
  if (isbn13 && !isbn10) {
    isbn10 = isbn13to10(isbn13) || undefined;
  }
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
    isbn13,
    isbn10,
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

export function getRetailerListings(book: Book): RetailerListing[] {
  return RETAILERS.map((retailer) => {
    const { url, buttonLabel } = buildRetailerUrl(retailer, book);
    return { retailer, url, buttonLabel };
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
    isbn13: book.isbn13,
    isbn10: book.isbn10,
    available: Math.random() > 0.3,
  }));
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

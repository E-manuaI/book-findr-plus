import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { searchBooks } from '@/lib/api';
import type { Book, MediaType, SortOption } from '@/lib/types';
import { BookCard } from '@/components/BookCard';
import { SearchBar } from '@/components/SearchBar';
import { CurrencySelector } from '@/components/CurrencySelector';
import { SearchFilters } from '@/components/SearchFilters';
import { Link } from 'react-router-dom';

const MAX_RESULTS = 100;

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currency, setCurrency] = useState('GBP');
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [mediaType, setMediaType] = useState<MediaType | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('relevance');
  const [language, setLanguage] = useState('all');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initial search
  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setBooks([]);
    setHasMore(true);
    searchBooks(query, sort, 0)
      .then(result => {
        setBooks(result.books);
        setTotalItems(result.totalItems);
        setHasMore(result.books.length >= 20 && result.books.length < MAX_RESULTS);
      })
      .catch(() => { setBooks([]); setTotalItems(0); })
      .finally(() => setLoading(false));
  }, [query, sort]);

  // Load more
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || books.length >= MAX_RESULTS) return;
    setLoadingMore(true);
    searchBooks(query, sort, books.length)
      .then(result => {
        if (result.books.length === 0) {
          setHasMore(false);
        } else {
          setBooks(prev => {
            const combined = [...prev, ...result.books];
            if (combined.length >= MAX_RESULTS) {
              setHasMore(false);
              return combined.slice(0, MAX_RESULTS);
            }
            return combined;
          });
        }
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore, books.length, query, sort]);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const availableGenres = useMemo(() => {
    const all = new Set<string>();
    books.forEach(b => b.genres.forEach(g => all.add(g)));
    return Array.from(all).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      if (mediaType !== 'all' && b.mediaType !== mediaType) return false;
      if (language !== 'all' && b.language !== language) return false;
      if (selectedGenres.length > 0 && !selectedGenres.some(g => b.genres.includes(g))) return false;
      return true;
    });
  }, [books, mediaType, language, selectedGenres]);

  const toggleGenre = (g: string) => {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center gap-4 h-16 px-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/images/manganext-logo.png" alt="MangaNext" className="h-7 w-7" />
            <span className="font-display font-bold text-lg text-foreground hidden sm:inline">MangaNext</span>
          </Link>
          <SearchBar className="flex-1 max-w-xl" />
          <CurrencySelector value={currency} onChange={setCurrency} className="w-28 flex-shrink-0" />
        </div>
      </header>

      <main className="container px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Results for "{query}"
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          {loading ? 'Searching...' : `${filteredBooks.length} of ${totalItems} titles shown`}
        </p>

        <SearchFilters
          mediaType={mediaType} onMediaTypeChange={setMediaType}
          sort={sort} onSortChange={setSort}
          language={language} onLanguageChange={setLanguage}
          selectedGenres={selectedGenres}
          availableGenres={availableGenres}
          onToggleGenre={toggleGenre}
        />

        {!loading && filteredBooks.length === 0 && query && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-4">📭</p>
            <p className="font-display text-lg">No titles found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {filteredBooks.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="py-8 text-center">
          {loadingMore && (
            <p className="text-sm text-muted-foreground">Loading more titles...</p>
          )}
          {!hasMore && books.length > 0 && (
            <p className="text-sm text-muted-foreground">All results loaded</p>
          )}
        </div>
      </main>
    </div>
  );
}

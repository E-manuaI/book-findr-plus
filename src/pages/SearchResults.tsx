import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { searchBooks } from '@/lib/api';
import type { Book } from '@/lib/types';
import { BookCard } from '@/components/BookCard';
import { SearchBar } from '@/components/SearchBar';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Link } from 'react-router-dom';

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('GBP');

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    searchBooks(query).then(setBooks).catch(() => setBooks([])).finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center gap-4 h-16 px-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl">📚</span>
            <span className="font-display font-bold text-lg text-foreground hidden sm:inline">BookReleaseTracker</span>
          </Link>
          <SearchBar className="flex-1 max-w-xl" />
          <CurrencySelector value={currency} onChange={setCurrency} className="w-28 flex-shrink-0" />
        </div>
      </header>

      <main className="container px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          Results for "{query}"
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {loading ? 'Searching...' : `${books.length} books found`}
        </p>

        {!loading && books.length === 0 && query && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-4">📭</p>
            <p className="font-display text-lg">No books found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      </main>
    </div>
  );
}

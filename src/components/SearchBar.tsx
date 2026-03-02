import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchBooks } from '@/lib/api';
import type { Book } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  className?: string;
  size?: 'default' | 'large';
}

export function SearchBar({ className, size = 'default' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setIsOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const books = await searchBooks(query);
        setResults(books.slice(0, 6));
        setIsOpen(true);
      } catch { setResults([]); }
      setLoading(false);
    }, 350);
  }, [query]);

  const handleSelect = (book: Book) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/book/${book.id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isLarge = size === 'large';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground ${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, ISBN, or series..."
            className={`pl-12 pr-10 bg-card border-border shadow-card font-body ${isLarge ? 'h-14 text-base rounded-2xl' : 'h-10 text-sm'}`}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden"
          >
            {results.map((book) => (
              <button
                key={book.id}
                onClick={() => handleSelect(book)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
              >
                {book.thumbnail ? (
                  <img src={book.thumbnail} alt="" className="w-10 h-14 object-cover rounded" />
                ) : (
                  <div className="w-10 h-14 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">?</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-foreground">{book.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{book.authors.join(', ')}</p>
                </div>
              </button>
            ))}
            <button
              onClick={handleSubmit as any}
              className="w-full px-4 py-3 text-sm font-medium text-primary hover:bg-muted transition-colors border-t border-border"
            >
              View all results for "{query}"
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated z-50 px-4 py-6 text-center text-sm text-muted-foreground">
          Searching...
        </div>
      )}
    </div>
  );
}

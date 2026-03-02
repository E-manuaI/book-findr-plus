import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getBookById, getMockRetailerListings, getMockReprintStatus } from '@/lib/api';
import type { Book, RetailerListing, ReprintStatus } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { RetailerList } from '@/components/RetailerList';
import { CurrencySelector } from '@/components/CurrencySelector';
import { SearchBar } from '@/components/SearchBar';
import { ArrowLeft, Calendar, BookOpen, Hash, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [listings, setListings] = useState<RetailerListing[]>([]);
  const [reprintStatus, setReprintStatus] = useState<ReprintStatus>('in-print');
  const [currency, setCurrency] = useState('GBP');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBookById(id).then((b) => {
      setBook(b);
      if (b) {
        setListings(getMockRetailerListings(b));
        setReprintStatus(getMockReprintStatus());
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-4xl">📭</p>
        <p className="font-display text-xl text-foreground">Book not found</p>
        <Link to="/" className="text-primary hover:underline text-sm">← Back to search</Link>
      </div>
    );
  }

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
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Book info */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-6">
              {book.thumbnail ? (
                <img src={book.thumbnail} alt={book.title} className="w-36 h-52 object-cover rounded-xl shadow-elevated flex-shrink-0" />
              ) : (
                <div className="w-36 h-52 bg-muted rounded-xl flex items-center justify-center text-4xl flex-shrink-0">📖</div>
              )}
              <div className="flex-1">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{book.title}</h1>
                <p className="text-muted-foreground mt-1 font-body">{book.authors.join(', ')}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <StatusBadge variant={book.releaseStatus} />
                  <StatusBadge variant={reprintStatus} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
                  {book.publishedDate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(book.publishedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                  {book.pageCount && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{book.pageCount} pages</span>
                    </div>
                  )}
                  {book.isbn && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      <span>{book.isbn}</span>
                    </div>
                  )}
                  {book.publisher && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>{book.publisher}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {book.description && (
              <div className="mt-8">
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-body line-clamp-6" dangerouslySetInnerHTML={{ __html: book.description }} />
              </div>
            )}
          </div>

          {/* Retailers */}
          <div>
            <RetailerList listings={listings} targetCurrency={currency} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

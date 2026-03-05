import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { getBookById, getRetailerListings } from '@/lib/api';
import type { Book, RetailerListing, UserStockReport } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { RetailerList } from '@/components/RetailerList';
import { CurrencySelector } from '@/components/CurrencySelector';
import { CountdownTimer } from '@/components/CountdownTimer';
import { SearchBar } from '@/components/SearchBar';
import { ArrowLeft, Calendar, BookOpen, Hash, Building, Tag, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const MEDIA_LABELS: Record<string, string> = {
  manga: '📕 Manga',
  manhwa: '📗 Manhwa',
  manhua: '📙 Manhua',
  'light-novel': '📓 Light Novel',
  'graphic-novel': '📘 Graphic Novel',
  book: '📖 Book',
};

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [listings, setListings] = useState<RetailerListing[]>([]);
  const [currency, setCurrency] = useState('GBP');
  const [loading, setLoading] = useState(true);
  const [stockReports, setStockReports] = useState<UserStockReport[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBookById(id).then((b) => {
      setBook(b);
      if (b) {
        setListings(getRetailerListings(b));
      }
      setLoading(false);
    });
  }, [id]);

  const handleReportStock = useCallback((retailerId: string, status: UserStockReport['status']) => {
    if (!book) return;
    const report: UserStockReport = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      retailerId,
      bookId: book.id,
      status,
      reportedAt: new Date().toISOString(),
      reportedBy: 'anonymous',
    };
    setStockReports(prev => [report, ...prev]);
    toast.success('Stock report submitted. Thank you!');
  }, [book]);

  const copyISBN = (isbn: string) => {
    navigator.clipboard.writeText(isbn);
    toast.success(`Copied ${isbn}`);
  };

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
            <img src="/images/manganext-logo.png" alt="MangaNext" className="h-7 w-7" />
            <span className="font-display font-bold text-lg text-foreground hidden sm:inline">MangaNext</span>
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
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-muted text-muted-foreground">
                    {MEDIA_LABELS[book.mediaType]}
                  </span>
                  {book.releaseStatus === 'upcoming' && book.publishedDate && (
                    <CountdownTimer targetDate={book.publishedDate} />
                  )}
                </div>

                {book.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {book.genres.map(g => (
                      <span key={g} className="inline-flex items-center gap-1 text-xs border border-border rounded-full px-2.5 py-0.5 text-muted-foreground">
                        <Tag className="h-3 w-3" /> {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* ISBN display */}
                <div className="mt-4 space-y-1">
                  {book.isbn13 && (
                    <button onClick={() => copyISBN(book.isbn13!)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                      <Hash className="h-4 w-4" />
                      <span>ISBN-13: {book.isbn13}</span>
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                  {book.isbn10 && (
                    <button onClick={() => copyISBN(book.isbn10!)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                      <Hash className="h-4 w-4" />
                      <span>ISBN-10: {book.isbn10}</span>
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
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
            <RetailerList
              listings={listings}
              bookId={book.id}
              stockReports={stockReports}
              onReportStock={handleReportStock}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

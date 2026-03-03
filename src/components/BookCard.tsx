import type { Book } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BookCardProps {
  book: Book;
  index?: number;
}

const MEDIA_LABELS: Record<string, string> = {
  manga: '📕 Manga',
  manhwa: '📗 Manhwa',
  'graphic-novel': '📘 Graphic Novel',
  book: '📖 Book',
};

export function BookCard({ book, index = 0 }: BookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link
        to={`/book/${book.id}`}
        className="group block bg-card rounded-xl border border-border shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden"
      >
        <div className="flex gap-4 p-4">
          <div className="flex-shrink-0">
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title}
                className="w-20 h-28 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-20 h-28 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-2xl text-muted-foreground font-display">📖</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {book.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {book.authors.join(', ')}
              </p>
              {book.publisher && (
                <p className="text-xs text-muted-foreground mt-1">{book.publisher}</p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge variant={book.releaseStatus} />
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {MEDIA_LABELS[book.mediaType] || book.mediaType}
              </span>
              {book.publishedDate && (
                <span className="text-xs text-muted-foreground">
                  {new Date(book.publishedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
            {book.genres.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {book.genres.slice(0, 3).map(g => (
                  <span key={g} className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">{g}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

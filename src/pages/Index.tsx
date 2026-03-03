import { SearchBar } from '@/components/SearchBar';
import { CurrencySelector } from '@/components/CurrencySelector';
import { BookCard } from '@/components/BookCard';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Bell, Globe } from 'lucide-react';
import { searchUpcoming } from '@/lib/api';
import type { Book } from '@/lib/types';

const FEATURES = [
  { icon: BookOpen, title: 'Every Edition', desc: 'Hardcover, paperback, deluxe, omnibus & box sets' },
  { icon: TrendingUp, title: 'Price Comparison', desc: 'Compare prices across verified retailers' },
  { icon: Bell, title: 'Restock Alerts', desc: 'Get notified when titles are reprinted' },
  { icon: Globe, title: 'Multi-Currency', desc: 'Prices in your local currency, live rates' },
];

const Index = () => {
  const [currency, setCurrency] = useState('GBP');
  const [upcoming, setUpcoming] = useState<Book[]>([]);
  const [recent, setRecent] = useState<Book[]>([]);

  useEffect(() => {
    searchUpcoming('manga new releases 2025 2026').then(books => {
      const now = new Date();
      const up: Book[] = [];
      const rec: Book[] = [];
      books.forEach(b => {
        if (b.releaseStatus === 'upcoming') up.push(b);
        else rec.push(b);
      });
      setUpcoming(up.slice(0, 6));
      setRecent(rec.slice(0, 6));
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <span className="font-display font-bold text-lg text-foreground">BookReleaseTracker</span>
          </div>
          <CurrencySelector value={currency} onChange={setCurrency} className="w-32" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.07]" />
        <div className="container px-4 py-20 md:py-28 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Track Every <span className="text-primary">Manga & Book</span> Release
            </h1>
            <p className="mt-4 text-lg text-muted-foreground font-body max-w-lg mx-auto">
              Search manga, manhwa & books. Compare prices across retailers. Never miss a release or restock.
            </p>
            <div className="mt-8 max-w-xl mx-auto">
              <SearchBar size="large" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              className="bg-card border border-border rounded-xl p-6 shadow-card text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 font-body">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upcoming Releases */}
      {upcoming.length > 0 && (
        <section className="container px-4 py-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">🔜 Upcoming Releases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Released */}
      {recent.length > 0 && (
        <section className="container px-4 py-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">📖 Recently Released</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-border py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground font-body">
          © 2026 BookReleaseTracker — Track, compare, and never miss a release.
        </div>
      </footer>
    </div>
  );
};

export default Index;

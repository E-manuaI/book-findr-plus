import { SearchBar } from '@/components/SearchBar';
import { CurrencySelector } from '@/components/CurrencySelector';
import { BookCard } from '@/components/BookCard';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingBag, Users, Globe } from 'lucide-react';
import { searchUpcoming } from '@/lib/api';
import type { Book, MediaType } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FEATURES = [
  { icon: BookOpen, title: 'ISBN-Based Links', desc: 'Direct product pages via ISBN — no guesswork' },
  { icon: ShoppingBag, title: 'Verified Retailers', desc: 'Amazon, Waterstones, Blackwell\'s, Foyles & more' },
  { icon: Users, title: 'Community Reports', desc: 'User-reported stock availability in real time' },
  { icon: Globe, title: 'Multi-Currency', desc: 'Prices converted to your preferred currency' },
];

type CategoryTab = 'manga' | 'manhwa-manhua' | 'books-ln';

const CATEGORY_QUERIES: Record<CategoryTab, string> = {
  'manga': 'manga new releases 2025',
  'manhwa-manhua': 'manhwa manhua webtoon 2025',
  'books-ln': 'light novel book new releases 2025',
};

const CATEGORY_FILTERS: Record<CategoryTab, (b: Book) => boolean> = {
  'manga': (b) => b.mediaType === 'manga',
  'manhwa-manhua': (b) => b.mediaType === 'manhwa' || b.mediaType === 'manhua',
  'books-ln': (b) => b.mediaType === 'book' || b.mediaType === 'light-novel' || b.mediaType === 'graphic-novel',
};

const Index = () => {
  const [currency, setCurrency] = useState('GBP');
  const [activeTab, setActiveTab] = useState<CategoryTab>('manga');
  const [books, setBooks] = useState<Record<CategoryTab, Book[]>>({
    'manga': [],
    'manhwa-manhua': [],
    'books-ln': [],
  });
  const [loadedTabs, setLoadedTabs] = useState<Set<CategoryTab>>(new Set());

  useEffect(() => {
    if (loadedTabs.has(activeTab)) return;

    searchUpcoming(CATEGORY_QUERIES[activeTab]).then(results => {
      const filtered = results.filter(CATEGORY_FILTERS[activeTab]);
      // If filter yields few results, show all
      const finalBooks = filtered.length >= 3 ? filtered : results;

      setBooks(prev => ({ ...prev, [activeTab]: finalBooks.slice(0, 12) }));
      setLoadedTabs(prev => new Set(prev).add(activeTab));
    });
  }, [activeTab, loadedTabs]);

  const currentBooks = books[activeTab];
  const upcoming = currentBooks.filter(b => b.releaseStatus === 'upcoming');
  const recent = currentBooks.filter(b => b.releaseStatus === 'released');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <span className="font-display font-bold text-lg text-foreground">MangaTrack</span>
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
              Track Every <span className="text-primary">Manga</span> Release
            </h1>
            <p className="mt-4 text-lg text-muted-foreground font-body max-w-lg mx-auto">
              Accurate ISBN-based retailer links. Community stock reports. No guesswork.
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

      {/* Category Tabs */}
      <section className="container px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryTab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="manga">📕 Manga</TabsTrigger>
            <TabsTrigger value="manhwa-manhua">📗 Manhwa & Manhua</TabsTrigger>
            <TabsTrigger value="books-ln">📖 Books & Light Novels</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {upcoming.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">🔜 Upcoming Releases</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming.map((book, i) => (
                    <BookCard key={book.id} book={book} index={i} />
                  ))}
                </div>
              </div>
            )}

            {recent.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">📖 Recently Released</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recent.map((book, i) => (
                    <BookCard key={book.id} book={book} index={i} />
                  ))}
                </div>
              </div>
            )}

            {currentBooks.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-4xl mb-4">📚</p>
                <p className="font-body">Loading titles...</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground font-body">
          © 2026 MangaTrack — Accurate tracking, verified links, community-powered.
        </div>
      </footer>
    </div>
  );
};

export default Index;

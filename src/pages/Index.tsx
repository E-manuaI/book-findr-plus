import { SearchBar } from '@/components/SearchBar';
import { CurrencySelector } from '@/components/CurrencySelector';
import { BookCard } from '@/components/BookCard';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingBag, Users, Globe } from 'lucide-react';
import { searchRecentReleases, searchUpcoming } from '@/lib/api';
import type { Book, MediaType } from '@/lib/types';
import { MEDIA_TAG_OPTIONS } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FEATURES = [
  { icon: BookOpen, title: 'ISBN-Based Links', desc: 'Direct product pages via ISBN — no guesswork' },
  { icon: ShoppingBag, title: 'Verified Retailers', desc: 'Amazon, Waterstones, Blackwell\'s, Foyles & more' },
  { icon: Users, title: 'Community Reports', desc: 'User-reported stock availability in real time' },
  { icon: Globe, title: 'Multi-Currency', desc: 'Prices converted to your preferred currency' },
];

const MONTH_OPTIONS = [
  { value: '1', label: 'Last 1 month' },
  { value: '2', label: 'Last 2 months' },
  { value: '3', label: 'Last 3 months' },
];

const Index = () => {
  const [currency, setCurrency] = useState('GBP');
  const [activeTab, setActiveTab] = useState('recent');
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [upcomingBooks, setUpcomingBooks] = useState<Book[]>([]);
  const [recentMonths, setRecentMonths] = useState('3');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loadedRecent, setLoadedRecent] = useState(false);
  const [loadedUpcoming, setLoadedUpcoming] = useState(false);

  useEffect(() => {
    if (activeTab === 'recent' && !loadedRecent) {
      searchRecentReleases(parseInt(recentMonths)).then(books => {
        setRecentBooks(books);
        setLoadedRecent(true);
      });
    }
  }, [activeTab, loadedRecent, recentMonths]);

  useEffect(() => {
    if (activeTab === 'upcoming' && !loadedUpcoming) {
      searchUpcoming().then(books => {
        setUpcomingBooks(books);
        setLoadedUpcoming(true);
      });
    }
  }, [activeTab, loadedUpcoming]);

  // Re-fetch when months change
  useEffect(() => {
    if (activeTab === 'recent') {
      setLoadedRecent(false);
    }
  }, [recentMonths]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const filterByTags = (books: Book[]) => {
    if (selectedTags.length === 0) return books;
    return books.filter(b => selectedTags.includes(b.mediaType));
  };

  const filteredRecent = filterByTags(recentBooks);
  const filteredUpcoming = filterByTags(upcomingBooks);

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

      {/* Tabs: Recently Released / Upcoming */}
      <section className="container px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="recent">📖 Recently Released</TabsTrigger>
              <TabsTrigger value="upcoming">🔜 Upcoming</TabsTrigger>
            </TabsList>

            {activeTab === 'recent' && (
              <Select value={recentMonths} onValueChange={setRecentMonths}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {MEDIA_TAG_OPTIONS.map(tag => {
              const active = selectedTags.includes(tag.value);
              return (
                <button
                  key={tag.value}
                  onClick={() => toggleTag(tag.value)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <TabsContent value="recent">
            {filteredRecent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecent.map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-4xl mb-4">📚</p>
                <p className="font-body">{loadedRecent ? 'No recently released titles found' : 'Loading titles...'}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {filteredUpcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUpcoming.map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-4xl mb-4">📚</p>
                <p className="font-body">{loadedUpcoming ? 'No upcoming titles found' : 'Loading titles...'}</p>
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

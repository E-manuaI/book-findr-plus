import { SearchBar } from '@/components/SearchBar';
import { CurrencySelector } from '@/components/CurrencySelector';
import { BookCard } from '@/components/BookCard';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShoppingBag, Users, Globe } from 'lucide-react';
import { searchRecentReleases, searchUpcoming } from '@/lib/api';
import type { Book } from '@/lib/types';
import { MEDIA_TAG_OPTIONS } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FEATURES = [
  { icon: BookOpen, title: 'ISBN-Based Links', desc: 'Direct product pages via ISBN — no guesswork' },
  { icon: ShoppingBag, title: 'Verified Retailers', desc: "Amazon, Waterstones, Blackwell's, Foyles & more" },
  { icon: Users, title: 'Community Reports', desc: 'User-reported stock availability in real time' },
  { icon: Globe, title: 'Multi-Currency', desc: 'Prices converted to your preferred currency' },
];

const MONTH_OPTIONS = [
  { value: '3', label: 'Last 3 months' },
  { value: '6', label: 'Last 6 months' },
  { value: '12', label: 'Last 12 months' },
];

const Index = () => {
  const [currency, setCurrency] = useState('GBP');
  const [activeTab, setActiveTab] = useState('recent');
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [upcomingBooks, setUpcomingBooks] = useState<Book[]>([]);
  const [recentMonths, setRecentMonths] = useState('3');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Recent state
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentStartIndex, setRecentStartIndex] = useState(0);
  const [recentHasMore, setRecentHasMore] = useState(true);
  const [recentDoneInitial, setRecentDoneInitial] = useState(false);

  // Upcoming state — "Load More" button instead of infinite scroll
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [upcomingStartIndex, setUpcomingStartIndex] = useState(0);
  const [upcomingHasMore, setUpcomingHasMore] = useState(true);
  const [upcomingDoneInitial, setUpcomingDoneInitial] = useState(false);
  const upcomingLoadingRef = useRef(false);

  // ─── Recent releases ───────────────────────────────────────────────────────

  const loadRecentBatch = useCallback(async (startIdx: number, reset: boolean = false) => {
    setRecentLoading(true);
    try {
      const result = await searchRecentReleases(parseInt(recentMonths), startIdx);
      if (result.books.length === 0 && startIdx > 0) {
        // Only hide the button if a Load More press returned nothing
        setRecentHasMore(false);
      } else {
        setRecentBooks(prev => {
          const ids = new Set(prev.map(b => b.id));
          const fresh = result.books.filter(b => !ids.has(b.id));
          return reset ? result.books : [...prev, ...fresh];
        });
        setRecentStartIndex(startIdx + 40);
      }
    } catch {
      setRecentHasMore(false);
    } finally {
      setRecentLoading(false);
    }
  }, [recentMonths]);

  useEffect(() => {
    if (activeTab === 'recent' && !recentDoneInitial) {
      setRecentBooks([]);
      setRecentStartIndex(0);
      setRecentHasMore(true);
      loadRecentBatch(0, true);
      setRecentDoneInitial(true);
    }
  }, [activeTab, recentDoneInitial, loadRecentBatch]);

  useEffect(() => {
    if (activeTab === 'recent') setRecentDoneInitial(false);
  }, [recentMonths]);

  // ─── Upcoming (Load More button) ───────────────────────────────────────────

  const loadUpcomingBatch = useCallback(async (startIdx: number) => {
    if (upcomingLoadingRef.current) return;
    upcomingLoadingRef.current = true;
    setUpcomingLoading(true);

    try {
      const result = await searchUpcoming(startIdx);
      if (result.books.length === 0) {
        setUpcomingHasMore(false);
      } else {
        setUpcomingBooks(prev => {
          const ids = new Set(prev.map(b => b.id));
          const fresh = result.books.filter(b => !ids.has(b.id));
          return [...prev, ...fresh];
        });
        setUpcomingStartIndex(startIdx + 40);
      }
    } catch {
      setUpcomingHasMore(false);
    } finally {
      upcomingLoadingRef.current = false;
      setUpcomingLoading(false);
    }
  }, []);

  // Initial load when tab is first opened
  useEffect(() => {
    if (activeTab === 'upcoming' && !upcomingDoneInitial) {
      setUpcomingBooks([]);
      setUpcomingStartIndex(0);
      setUpcomingHasMore(true);
      upcomingLoadingRef.current = false;
      loadUpcomingBatch(0);
      setUpcomingDoneInitial(true);
    }
  }, [activeTab, upcomingDoneInitial, loadUpcomingBatch]);

  // ─── Filters ───────────────────────────────────────────────────────────────

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const filterByTags = (books: Book[]) =>
    selectedTags.length === 0 ? books : books.filter(b => selectedTags.includes(b.mediaType));

  const filteredRecent = filterByTags(recentBooks);
  const filteredUpcoming = filterByTags(upcomingBooks);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <img src="/images/manganext-logo.png" alt="MangaNext" className="h-8 w-8" />
            <span className="font-display font-bold text-lg text-foreground">MangaNext</span>
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
            <img src="/images/manganext-logo.png" alt="MangaNext" className="h-16 w-16 mx-auto mb-4" />
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

      {/* Tabs */}
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
              <button onClick={() => setSelectedTags([])} className="text-xs text-muted-foreground hover:text-foreground underline">
                Clear filters
              </button>
            )}
          </div>

          {/* Recent tab */}
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
                <p className="font-body">{recentLoading ? 'Loading titles...' : 'No recently released titles found'}</p>
              </div>
            )}
            <div className="py-8 text-center">
              {recentLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : recentHasMore ? (
                <button
                  onClick={() => loadRecentBatch(recentStartIndex)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Load More
                </button>
              ) : recentBooks.length > 0 ? (
                <p className="text-sm text-muted-foreground">All results loaded</p>
              ) : null}
            </div>
          </TabsContent>

          {/* Upcoming tab */}
          <TabsContent value="upcoming">
            {filteredUpcoming.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUpcoming.map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-4xl mb-4">📅</p>
                <p className="font-body">
                  {upcomingLoading ? 'Searching for upcoming titles...' : 'No upcoming titles found'}
                </p>
              </div>
            )}

            {/* Load More button */}
            <div className="py-8 text-center">
              {upcomingLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : upcomingHasMore ? (
                <button
                  onClick={() => loadUpcomingBatch(upcomingStartIndex)}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Load More Upcoming
                </button>
              ) : upcomingBooks.length > 0 ? (
                <p className="text-sm text-muted-foreground">All upcoming results loaded</p>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container px-4 text-center text-sm text-muted-foreground font-body">
          © 2026 MangaNext — Accurate tracking, verified links, community-powered.
        </div>
      </footer>
    </div>
  );
};

export default Index;

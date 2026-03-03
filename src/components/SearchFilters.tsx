import { MEDIA_TYPES, SORT_OPTIONS, type MediaType, type SortOption } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface SearchFiltersProps {
  mediaType: MediaType | 'all';
  onMediaTypeChange: (v: MediaType | 'all') => void;
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
  language: string;
  onLanguageChange: (v: string) => void;
  selectedGenres: string[];
  availableGenres: string[];
  onToggleGenre: (g: string) => void;
}

const LANGUAGES = [
  { value: 'all', label: 'All Languages' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'fr', label: 'French' },
];

export function SearchFilters({
  mediaType, onMediaTypeChange,
  sort, onSortChange,
  language, onLanguageChange,
  selectedGenres, availableGenres, onToggleGenre,
}: SearchFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={mediaType} onValueChange={(v) => onMediaTypeChange(v as MediaType | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Media Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {MEDIA_TYPES.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(l => (
              <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {availableGenres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableGenres.map(g => {
            const active = selectedGenres.includes(g);
            return (
              <button
                key={g}
                onClick={() => onToggleGenre(g)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                {g}
                {active && <X className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

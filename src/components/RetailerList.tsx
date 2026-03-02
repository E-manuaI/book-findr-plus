import type { RetailerListing } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { convertPrice } from '@/lib/api';
import { CURRENCIES } from '@/lib/types';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RetailerListProps {
  listings: RetailerListing[];
  targetCurrency: string;
}

export function RetailerList({ listings, targetCurrency }: RetailerListProps) {
  const currencyInfo = CURRENCIES.find(c => c.code === targetCurrency);
  const symbol = currencyInfo?.symbol || targetCurrency;

  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-semibold text-foreground">Where to Buy</h3>
      <div className="space-y-2">
        {listings.map((listing) => {
          const converted = listing.currency !== targetCurrency
            ? convertPrice(listing.price, listing.currency, targetCurrency)
            : listing.price;
          const origSymbol = CURRENCIES.find(c => c.code === listing.currency)?.symbol || listing.currency;

          return (
            <div
              key={listing.retailer.id}
              className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{listing.retailer.name}</span>
                  {listing.retailer.verified && (
                    <span className="text-xs text-primary" title="Verified Retailer">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <StatusBadge variant={listing.stockStatus} />
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-foreground">
                  {symbol}{converted.toFixed(2)}
                </p>
                {listing.currency !== targetCurrency && (
                  <p className="text-xs text-muted-foreground">
                    {origSymbol}{listing.price.toFixed(2)} {listing.currency}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0"
                asChild
              >
                <a href={listing.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Buy
                </a>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

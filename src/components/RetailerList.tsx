import type { RetailerListing, UserStockReport } from '@/lib/types';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserStockReports } from './UserStockReports';

interface RetailerListProps {
  listings: RetailerListing[];
  bookId: string;
  stockReports: UserStockReport[];
  onReportStock: (retailerId: string, status: UserStockReport['status']) => void;
}

export function RetailerList({ listings, bookId, stockReports, onReportStock }: RetailerListProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground">Where to Buy</h3>
      <div className="space-y-2">
        {listings.map((listing) => {
          const retailerReports = stockReports.filter(r => r.retailerId === listing.retailer.id);

          return (
            <div
              key={listing.retailer.id}
              className="bg-card border border-border rounded-xl p-4 shadow-card"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{listing.retailer.name}</span>
                    {listing.retailer.verified && (
                      <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5" title="Verified Retailer">✓ Verified</span>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                  asChild
                >
                  <a href={listing.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    {listing.buttonLabel}
                  </a>
                </Button>
              </div>

              {/* User stock reports for this retailer */}
              <UserStockReports
                reports={retailerReports}
                retailerId={listing.retailer.id}
                retailerName={listing.retailer.name}
                onReport={onReportStock}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

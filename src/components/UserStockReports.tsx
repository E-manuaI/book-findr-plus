import { useState } from 'react';
import type { UserStockReport } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock } from 'lucide-react';

interface UserStockReportsProps {
  reports: UserStockReport[];
  retailerId: string;
  retailerName: string;
  onReport: (retailerId: string, status: UserStockReport['status']) => void;
}

const STATUS_OPTIONS: { value: UserStockReport['status']; label: string; emoji: string }[] = [
  { value: 'in-stock', label: 'In Stock', emoji: '🟢' },
  { value: 'out-of-stock', label: 'Out of Stock', emoji: '🔴' },
  { value: 'limited', label: 'Limited Stock', emoji: '🟡' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function UserStockReports({ reports, retailerId, retailerName, onReport }: UserStockReportsProps) {
  const [showForm, setShowForm] = useState(false);

  const latestReports = reports.slice(0, 3);

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          Community Reports ({reports.length})
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          onClick={() => setShowForm(!showForm)}
        >
          Report Stock
        </Button>
      </div>

      {latestReports.length > 0 && (
        <div className="space-y-1">
          {latestReports.map((report) => (
            <div key={report.id} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{report.status === 'in-stock' ? '🟢' : report.status === 'out-of-stock' ? '🔴' : '🟡'}</span>
              <span className="capitalize">{report.status.replace('-', ' ')}</span>
              <span className="flex items-center gap-0.5 ml-auto">
                <Clock className="h-3 w-3" />
                {timeAgo(report.reportedAt)}
              </span>
            </div>
          ))}
        </div>
      )}

      {latestReports.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No community reports yet</p>
      )}

      {showForm && (
        <div className="mt-2 flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                onReport(retailerId, opt.value);
                setShowForm(false);
              }}
            >
              {opt.emoji} {opt.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

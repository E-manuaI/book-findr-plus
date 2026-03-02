import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold font-body transition-colors",
  {
    variants: {
      variant: {
        "in-stock": "bg-success/15 text-success",
        "out-of-stock": "bg-destructive/15 text-destructive",
        "pre-order": "bg-info/15 text-info",
        "upcoming": "bg-warning/15 text-warning",
        "released": "bg-success/15 text-success",
        "reprint-confirmed": "bg-info/15 text-info",
        "awaiting-reprint": "bg-warning/15 text-warning",
        "ongoing-series": "bg-primary/15 text-primary",
        "in-print": "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "released",
    },
  }
);

const LABELS: Record<string, string> = {
  'in-stock': '● In Stock',
  'out-of-stock': '○ Out of Stock',
  'pre-order': '◐ Pre-Order',
  'upcoming': '◐ Coming Soon',
  'released': '● Released',
  'reprint-confirmed': '↻ Reprint Confirmed',
  'awaiting-reprint': '⏳ Awaiting Reprint',
  'ongoing-series': '→ Ongoing Series',
  'in-print': '● In Print',
};

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  className?: string;
}

export function StatusBadge({ variant, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {LABELS[variant || 'released']}
    </span>
  );
}

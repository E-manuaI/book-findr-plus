import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold font-body transition-colors",
  {
    variants: {
      variant: {
        "upcoming": "bg-warning/15 text-warning",
        "released": "bg-success/15 text-success",
        "pre-order": "bg-info/15 text-info",
        "user-in-stock": "bg-success/15 text-success",
        "user-out-of-stock": "bg-destructive/15 text-destructive",
        "user-limited": "bg-warning/15 text-warning",
      },
    },
    defaultVariants: {
      variant: "released",
    },
  }
);

const LABELS: Record<string, string> = {
  'upcoming': '◐ Coming Soon',
  'released': '● Released',
  'pre-order': '◐ Pre-Order',
  'user-in-stock': '● In Stock (user reported)',
  'user-out-of-stock': '○ Out of Stock (user reported)',
  'user-limited': '◑ Limited Stock (user reported)',
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

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OpportunityStatus } from '@/lib/constants';

interface StatusBadgeProps {
  status: OpportunityStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium',
        status === 'New' && 'border-accent text-accent',
        status === 'Contacted' && 'border-secondary text-secondary',
        status === 'Closed' && 'border-muted-foreground text-muted-foreground',
        className
      )}
    >
      {status}
    </Badge>
  );
}

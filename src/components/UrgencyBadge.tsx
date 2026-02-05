import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UrgencyLabel } from '@/lib/constants';

interface UrgencyBadgeProps {
  urgency: UrgencyLabel;
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  return (
    <Badge
      className={cn(
        'font-semibold',
        urgency === 'High' && 'bg-urgency-high text-destructive-foreground',
        urgency === 'Medium' && 'bg-urgency-medium text-warning-foreground',
        urgency === 'Low' && 'bg-urgency-low text-success-foreground',
        className
      )}
    >
      {urgency}
    </Badge>
  );
}

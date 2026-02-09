import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UrgencyLabel } from '@/lib/constants';

interface UrgencyBadgeProps {
  urgency: UrgencyLabel;
  className?: string;
}

const UrgencyBadge = React.forwardRef<HTMLSpanElement, UrgencyBadgeProps>(
  ({ urgency, className }, ref) => {
    return (
      <span ref={ref}>
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
      </span>
    );
  }
);

UrgencyBadge.displayName = 'UrgencyBadge';

export { UrgencyBadge };

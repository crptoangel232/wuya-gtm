import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreDisplay({ score, size = 'md', className }: ScoreDisplayProps) {
  const getScoreColor = (s: number) => {
    if (s >= 70) return 'text-urgency-high';
    if (s >= 40) return 'text-urgency-medium';
    return 'text-urgency-low';
  };

  const sizeClasses = {
    sm: 'text-lg font-bold',
    md: 'text-2xl font-bold',
    lg: 'text-4xl font-bold',
  };

  return (
    <span className={cn(getScoreColor(score), sizeClasses[size], className)}>
      {score}
    </span>
  );
}

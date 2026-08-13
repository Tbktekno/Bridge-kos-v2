import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}

export function RatingStars({ value = 0, size = 16, className, showValue = false }: RatingStarsProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const rounded = clamped - Math.floor(clamped) >= 0.75 ? Math.floor(clamped) + 1 : clamped;

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="inline-flex items-center text-amber-400" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < Math.floor(rounded)) return <Star key={i} style={{ width: size, height: size }} fill="currentColor" />;
          if (i === Math.floor(rounded) && rounded - Math.floor(rounded) >= 0.5) {
            return (
              <span key={i} className="relative inline-flex" style={{ width: size, height: size }}>
                <Star className="absolute inset-0 text-muted-foreground/30" style={{ width: size, height: size }} />
                <StarHalf className="absolute inset-0" style={{ width: size, height: size }} fill="currentColor" />
              </span>
            );
          }
          return <Star key={i} className="text-muted-foreground/30" style={{ width: size, height: size }} />;
        })}
      </span>
      {showValue && <span className="text-sm font-medium">{clamped.toFixed(1)}</span>}
    </span>
  );
}
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
        K
      </span>
      {showText && <span className="text-lg font-bold tracking-tight">BridgeKos</span>}
    </span>
  );
}
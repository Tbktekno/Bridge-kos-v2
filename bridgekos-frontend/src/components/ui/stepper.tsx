import { forwardRef } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepItem {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  current: number;
  className?: string;
}

const Stepper = forwardRef<HTMLOListElement, StepperProps>(
  ({ steps, current, className }, ref) => (
    <ol ref={ref} className={cn('flex items-center gap-2', className)}>
      {steps.map((step, i) => {
        const index = i + 1;
        const state = index < current ? 'done' : index === current ? 'active' : 'todo';
        return (
          <li key={step.title} className="flex flex-1 flex-col gap-1.5 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  state === 'done' && 'border-primary bg-primary text-primary-foreground',
                  state === 'active' && 'border-primary bg-primary/10 text-primary',
                  state === 'todo' && 'border-muted-foreground/30 text-muted-foreground',
                )}
              >
                {state === 'done' ? <Check className="h-4 w-4" /> : index}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'h-px flex-1',
                    state === 'done' ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </div>
            <div className="hidden flex-col sm:flex">
              <span
                className={cn(
                  'text-xs font-medium',
                  state === 'active' ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.title}
              </span>
              {step.description && (
                <span className="text-[0.7rem] text-muted-foreground">{step.description}</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  ),
);
Stepper.displayName = 'Stepper';

const StepLoader = ({ label = 'Memproses...' }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export { Stepper, StepLoader };
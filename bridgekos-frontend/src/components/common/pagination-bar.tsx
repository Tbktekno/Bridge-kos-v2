import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/types/auth';

interface PaginationBarProps {
  meta: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
  totalPages?: number;
  className?: string;
}

function getPageItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: Array<number | 'ellipsis'> = [1];
  if (current > 3) items.push('ellipsis');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) items.push(p);
  if (current < total - 2) items.push('ellipsis');
  items.push(total);
  return items;
}

export function PaginationBar({ meta, onPageChange, className }: PaginationBarProps) {
  if (!meta || meta.totalPages <= 1) return null;

  const items = getPageItems(meta.page, meta.totalPages);

  return (
    <Pagination className={cn('mt-6 w-auto', className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={!meta.hasPrevPage}
            onClick={() => meta.hasPrevPage && onPageChange(meta.page - 1)}
          />
        </PaginationItem>
        {items.map((item, i) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`e-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink isActive={item === meta.page} onClick={() => onPageChange(item)}>
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            disabled={!meta.hasNextPage}
            onClick={() => meta.hasNextPage && onPageChange(meta.page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
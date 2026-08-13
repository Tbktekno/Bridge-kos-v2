import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaginationBar } from '@/components/common/pagination-bar';
import type { PaginationMeta } from '@/types/auth';

const TABLE_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

interface DataTablePaginationProps {
  meta: PaginationMeta | undefined;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  meta,
  pageSize,
  onPageSizeChange,
  onPageChange,
}: DataTablePaginationProps) {
  if (!meta || meta.totalItems === 0) return null;

  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.totalItems);

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Menampilkan{' '}
        <span className="font-medium text-foreground tabular-nums">{from}</span>–
        <span className="font-medium text-foreground tabular-nums">{to}</span> dari{' '}
        <span className="font-medium text-foreground tabular-nums">{meta.totalItems}</span> data
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tampilkan</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-9 w-[4.25rem]" aria-label="Jumlah baris per halaman">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABLE_PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">baris</span>
        </div>
        <PaginationBar meta={meta} onPageChange={onPageChange} className="mt-0" />
      </div>
    </div>
  );
}
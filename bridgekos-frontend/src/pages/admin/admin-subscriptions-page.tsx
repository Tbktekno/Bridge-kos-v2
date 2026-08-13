import { useState } from 'react';
import { CreditCard, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/common/states';
import { DataTablePagination } from '@/components/common/data-table-pagination';
import { adminApi } from '@/services/domain.api';
import { useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency, formatDate } from '@/utils/format';
import type { PaginationMeta } from '@/types/auth';

interface AdminSubscription {
  id: string;
  planName?: string;
  status?: string;
  price?: number;
  startsAt?: string;
  expiresAt?: string;
  owner?: { fullName?: string; email?: string; user?: { email?: string } };
}

export function AdminSubscriptionsPage() {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin/subscriptions', keyword, page, pageSize],
    queryFn: () =>
      adminApi.listSubscriptions({ page, limit: pageSize, keyword: keyword || undefined }),
  });

  const subscriptions = (data?.items ?? []) as AdminSubscription[];
  const pagination = data?.pagination as PaginationMeta | undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Langganan"
        description="Pantau status langganan owner."
        actions={
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              placeholder="Cari owner..."
              className="w-56"
            />
          </div>
        }
      />

      {isLoading ? (
        <LoadingState label="Memuat langganan..." />
      ) : isError ? (
        <ErrorState
          title="Gagal memuat data langganan"
          description={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : subscriptions.length === 0 ? (
        <EmptyState title="Belum ada langganan" description="Owner belum ada yang berlangganan." />
      ) : (
        <>
          <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Owner</th>
                    <th className="px-4 py-3 font-semibold">Paket</th>
                    <th className="px-4 py-3 font-semibold">Tagihan</th>
                    <th className="px-4 py-3 font-semibold">Mulai</th>
                    <th className="px-4 py-3 font-semibold">Berakhir</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">
                        {sub.owner?.fullName ?? sub.owner?.user?.email ?? sub.owner?.email ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          {sub.planName ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sub.price != null ? formatCurrency(sub.price) : '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(sub.startsAt)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(sub.expiresAt)}</td>
                      <td className="px-4 py-3">
                        {sub.status === 'ACTIVE' ? (
                          <Badge variant="success">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">{sub.status}</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <DataTablePagination
          meta={pagination}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          onPageChange={setPage}
        />
        </>
      )}
    </div>
  );
}
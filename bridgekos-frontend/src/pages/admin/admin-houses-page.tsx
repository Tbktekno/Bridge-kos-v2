import { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/common/states';
import { DataTablePagination } from '@/components/common/data-table-pagination';
import { adminApi } from '@/services/domain.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency, formatDate } from '@/utils/format';
import { toast } from 'sonner';
import type { PaginationMeta } from '@/types/auth';

interface AdminHouse {
  id: string;
  name: string;
  status?: string;
  city?: string;
  province?: string;
  minPrice?: number;
  createdAt?: string;
  owner?: { fullName?: string; email?: string };
}

export function AdminHousesPage() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pendingMod, setPendingMod] = useState<{
    houseId: string;
    name: string;
    status: 'APPROVED' | 'REJECTED';
  } | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin/houses', keyword, page, pageSize],
    queryFn: () =>
      adminApi.listBoardingHouses({ page, limit: pageSize, keyword: keyword || undefined }),
  });

  const houses = (data?.items ?? []) as AdminHouse[];
  const pagination = data?.pagination as PaginationMeta | undefined;

  const moderationMutation = useMutation({
    mutationFn: () =>
      adminApi.moderateBoarding(pendingMod!.houseId, { status: pendingMod!.status }),
    onSuccess: () => {
      toast.success(pendingMod?.status === 'APPROVED' ? 'Kos disetujui.' : 'Kos ditolak.');
      setPendingMod(null);
      queryClient.invalidateQueries({ queryKey: ['admin/houses'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderasi Kos"
        description="Tinjau dan moderasi kos yang terdaftar."
        actions={
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama kos..."
              className="w-56"
            />
          </div>
        }
      />

      {isLoading ? (
        <LoadingState label="Memuat kos..." />
      ) : isError ? (
        <ErrorState
          title="Gagal memuat data kos"
          description={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : houses.length === 0 ? (
        <EmptyState title="Tidak ada kos" description="Tidak ditemukan kos dengan filter tersebut." />
      ) : (
        <>
          <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Nama Kos</th>
                    <th className="px-4 py-3 font-semibold">Owner</th>
                    <th className="px-4 py-3 font-semibold">Lokasi</th>
                    <th className="px-4 py-3 font-semibold">Harga</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Diajukan</th>
                    <th className="px-4 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {houses.map((house) => {
                    const pending = house.status === 'PENDING';
                    return (
                      <tr key={house.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3 font-medium">{house.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {house.owner?.fullName ?? house.owner?.email ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {[house.city, house.province].filter(Boolean).join(', ') || '-'}
                        </td>
                        <td className="px-4 py-3">
                          {house.minPrice != null ? formatCurrency(house.minPrice) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {house.status === 'APPROVED' ? (
                            <Badge variant="success">Aktif</Badge>
                          ) : house.status === 'PENDING' ? (
                            <Badge variant="warning">Menunggu</Badge>
                          ) : (
                            <Badge variant="secondary">{house.status}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(house.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {pending && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  setPendingMod({ houseId: house.id, name: house.name, status: 'APPROVED' })
                                }
                              >
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setPendingMod({ houseId: house.id, name: house.name, status: 'REJECTED' })
                                }
                              >
                                Tolak
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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

      <Dialog open={pendingMod !== null} onOpenChange={(open) => !open && setPendingMod(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingMod?.status === 'APPROVED' ? 'Setujui Kos?' : 'Tolak Kos?'}
            </DialogTitle>
            <DialogDescription>
              {pendingMod?.status === 'APPROVED'
                ? `${pendingMod?.name} akan tampil di pencarian publik.`
                : `${pendingMod?.name} tidak akan tampil dan owner akan diberi notifikasi.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingMod(null)}>
              Batal
            </Button>
            <Button
              variant={pendingMod?.status === 'REJECTED' ? 'destructive' : 'default'}
              disabled={moderationMutation.isPending}
              onClick={() => moderationMutation.mutate()}
            >
              {moderationMutation.isPending ? 'Memproses...' : 'Konfirmasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
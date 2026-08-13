import { useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
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
import { formatDate } from '@/utils/format';
import { toast } from 'sonner';
import type { PaginationMeta } from '@/types/auth';

interface AdminOwner {
  id: string;
  email?: string;
  user?: { email?: string };
  ownerProfile?: {
    fullName?: string;
    companyName?: string;
    verificationStatus?: string;
    isVerified?: boolean;
  };
  verification?: {
    status?: string;
    identityType?: string;
    submittedAt?: string;
  };
  createdAt?: string;
}

export function AdminOwnersPage() {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pendingReview, setPendingReview] = useState<{
    ownerId: string;
    name: string;
    status: 'APPROVED' | 'REJECTED';
  } | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin/owners', keyword, page, pageSize],
    queryFn: () =>
      adminApi.listOwners({ page, limit: pageSize, keyword: keyword || undefined }),
  });

  const owners = (data?.items ?? []) as AdminOwner[];
  const pagination = data?.pagination as PaginationMeta | undefined;

  const reviewMutation = useMutation({
    mutationFn: () =>
      adminApi.reviewOwnerVerification(pendingReview!.ownerId, {
        status: pendingReview!.status,
      }),
    onSuccess: () => {
      toast.success(
        pendingReview?.status === 'APPROVED' ? 'Owner disetujui.' : 'Verifikasi ditolak.',
      );
      setPendingReview(null);
      queryClient.invalidateQueries({ queryKey: ['admin/owners'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const ownerName = (owner: AdminOwner) =>
    owner.ownerProfile?.fullName ?? owner.ownerProfile?.companyName ?? owner.user?.email ?? owner.email ?? '-';

  const ownerStatus = (owner: AdminOwner) =>
    owner.verification?.status ?? owner.ownerProfile?.verificationStatus ?? 'NOT_SUBMITTED';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner"
        description="Tinjau verifikasi dan kelola akun pemilik kos."
        actions={
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama / email..."
              className="w-56"
            />
          </div>
        }
      />

      {isLoading ? (
        <LoadingState label="Memuat owner..." />
      ) : isError ? (
        <ErrorState
          title="Gagal memuat data owner"
          description={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : owners.length === 0 ? (
        <EmptyState title="Tidak ada owner" description="Tidak ditemukan owner dengan filter tersebut." />
      ) : (
        <>
          <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Nama</th>
                    <th className="px-4 py-3 font-semibold">Kontak</th>
                    <th className="px-4 py-3 font-semibold">Status Verifikasi</th>
                    <th className="px-4 py-3 font-semibold">Bergabung</th>
                    <th className="px-4 py-3 font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {owners.map((owner) => {
                    const status = ownerStatus(owner);
                    const pending = status === 'PENDING';
                    return (
                      <tr key={owner.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3 font-medium">{ownerName(owner)}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {owner.user?.email ?? owner.email ?? '-'}
                        </td>
                        <td className="px-4 py-3">
                          {status === 'APPROVED' ? (
                            <Badge variant="success">
                              <ShieldCheck className="mr-1 h-3 w-3" /> Terverifikasi
                            </Badge>
                          ) : status === 'PENDING' ? (
                            <Badge variant="warning">Menunggu</Badge>
                          ) : status === 'REJECTED' ? (
                            <Badge variant="destructive">Ditolak</Badge>
                          ) : (
                            <Badge variant="secondary">Belum Submit</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(owner.verification?.submittedAt ?? owner.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {pending && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  setPendingReview({ ownerId: owner.id, name: ownerName(owner), status: 'APPROVED' })
                                }
                              >
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setPendingReview({ ownerId: owner.id, name: ownerName(owner), status: 'REJECTED' })
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

      <Dialog open={pendingReview !== null} onOpenChange={(open) => !open && setPendingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingReview?.status === 'APPROVED' ? 'Setujui Verifikasi Owner?' : 'Tolak Verifikasi?'}
            </DialogTitle>
            <DialogDescription>
              {pendingReview?.status === 'APPROVED'
                ? `${pendingReview?.name} akan ditandai sebagai owner terverifikasi.`
                : `Verifikasi ${pendingReview?.name} akan ditolak.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingReview(null)}>
              Batal
            </Button>
            <Button
              variant={pendingReview?.status === 'REJECTED' ? 'destructive' : 'default'}
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate()}
            >
              {reviewMutation.isPending ? 'Memproses...' : 'Konfirmasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
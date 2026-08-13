import { useState } from 'react';
import { CheckCircle2, MessageCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/common/status-badge';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/common/states';
import { useOwnerBookings } from '@/hooks/use-entities';
import { bookingApi } from '@/services/booking.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency, formatDate } from '@/utils/format';
import { toast } from 'sonner';

const TABS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'PENDING', label: 'Menunggu Konfirmasi' },
  { value: 'CONFIRMED', label: 'Aktif' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

export function OwnerBookingsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const [pendingAction, setPendingAction] = useState<{ id: string; action: 'confirm' | 'reject' | 'complete' } | null>(null);

  const { data, isLoading, isError, error, refetch } = useOwnerBookings({
    page: 1,
    limit: 50,
    status: status === 'ALL' ? undefined : (status as never),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'confirm' | 'reject' | 'complete' }) =>
      action === 'confirm'
        ? bookingApi.confirm(id)
        : action === 'reject'
          ? bookingApi.reject(id)
          : bookingApi.complete(id),
    onSuccess: () => {
      const label =
        pendingAction?.action === 'confirm'
          ? 'Booking dikonfirmasi.'
          : pendingAction?.action === 'reject'
            ? 'Booking ditolak.'
            : 'Booking ditandai selesai.';
      toast.success(label);
      setPendingAction(null);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const bookings = data?.items ?? [];

  const runAction = () => {
    if (pendingAction) actionMutation.mutate(pendingAction);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking Masuk"
        description="Konfirmasi, kelola, dan selesaikan booking dari penyewa."
      />

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <LoadingState label="Memuat booking..." />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : bookings.length === 0 ? (
        <EmptyState title="Belum ada booking masuk" description="Booking dari penyewa akan tampil di sini." />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isPending = booking.status === 'PENDING';
            const isActive = booking.status === 'CONFIRMED';
            return (
              <Card key={booking.id}>
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {booking.room?.boardingHouse?.name ?? 'Kos'}
                      <span className="text-sm font-normal text-muted-foreground">
                        · {booking.bookingCode}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.tenant?.fullName ?? booking.tenant?.email ?? 'Penyewa'} · Kamar{' '}
                      {booking.room?.name ?? '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(booking.startDate)}
                      {booking.endDate ? ` sampai ${formatDate(booking.endDate)}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(booking.totalPrice)}</p>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex gap-2">
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => setPendingAction({ id: booking.id, action: 'confirm' })}
                          >
                            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Konfirmasi
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setPendingAction({ id: booking.id, action: 'reject' })}
                          >
                            <XCircle className="mr-1.5 h-4 w-4" /> Tolak
                          </Button>
                        </>
                      )}
                      {isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPendingAction({ id: booking.id, action: 'complete' })}
                        >
                          Tandai Selesai
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.action === 'confirm'
                ? 'Konfirmasi Booking?'
                : pendingAction?.action === 'reject'
                  ? 'Tolak Booking?'
                  : 'Tandai Selesai?'}
            </DialogTitle>
            <DialogDescription>
              {pendingAction?.action === 'confirm'
                ? 'Penyewa akan menerima notifikasi bahwa booking dikonfirmasi.'
                : pendingAction?.action === 'reject'
                  ? 'Booking ini akan ditolak dan penyewa diberi notifikasi.'
                  : 'Booking ditandai selesai. Penyewa dapat memberikan review.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)}>
              Batal
            </Button>
            <Button
              variant={pendingAction?.action === 'reject' ? 'destructive' : 'default'}
              onClick={runAction}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending ? 'Memproses...' : 'Ya, Lanjutkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
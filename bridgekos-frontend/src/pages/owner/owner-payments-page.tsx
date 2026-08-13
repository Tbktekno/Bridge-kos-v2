import { useState } from 'react';
import { CheckCircle2, Undo2, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/common/status-badge';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/common/states';
import { useOwnerPayments } from '@/hooks/use-entities';
import { paymentApi } from '@/services/booking.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency, formatDate } from '@/utils/format';
import { toast } from 'sonner';

const TABS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'WAITING_CONFIRMATION', label: 'Menunggu' },
  { value: 'PAID', label: 'Lunas' },
  { value: 'REJECTED', label: 'Ditolak' },
];

export function OwnerPaymentsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const [preview, setPreview] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useOwnerPayments({
    page: 1,
    limit: 50,
    status: status === 'ALL' ? undefined : (status as never),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => paymentApi.confirmPaid(id),
    onSuccess: () => {
      toast.success('Pembayaran dikonfirmasi lunas.');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const refundMutation = useMutation({
    mutationFn: (id: string) => paymentApi.refund(id),
    onSuccess: () => {
      toast.success('Pembayaran dikembalikan.');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const payments = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pembayaran"
        description="Verifikasi bukti transfer dan kelola status pembayaran."
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
        <LoadingState label="Memuat pembayaran..." />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : payments.length === 0 ? (
        <EmptyState title="Belum ada pembayaran" description="Pembayaran dari penyewa akan tampil di sini." />
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const isWaiting = payment.status === 'WAITING_CONFIRMATION';
            return (
              <Card key={payment.id}>
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {payment.boardingHouseName ?? 'Kos'} ·{' '}
                      <span className="text-muted-foreground">{payment.bookingCode ?? '-'}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payment.tenantName ?? 'Penyewa'} · {payment.roomName ?? '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Jatuh tempo {formatDate(payment.dueDate)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatCurrency(payment.amount)}</p>
                      <StatusBadge status={payment.status} />
                    </div>
                    <div className="flex gap-2">
                      {payment.receiptUrl && (
                        <Button size="sm" variant="outline" onClick={() => setPreview(payment.receiptUrl ?? null)}>
                          <Eye className="mr-1.5 h-4 w-4" /> Lihat Bukti
                        </Button>
                      )}
                      {isWaiting && (
                        <>
                          <Button size="sm" onClick={() => confirmMutation.mutate(payment.id)} disabled={confirmMutation.isPending}>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Konfirmasi Lunas
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => refundMutation.mutate(payment.id)} disabled={refundMutation.isPending}>
                            <Undo2 className="mr-1.5 h-4 w-4" /> Refund
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran</DialogTitle>
          </DialogHeader>
          {preview && (
            <img src={preview} alt="Bukti transfer" className="w-full rounded-lg object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
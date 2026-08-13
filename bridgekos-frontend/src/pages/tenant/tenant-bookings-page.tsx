import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarX, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/status-badge';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/common/states';
import { useMyBookings } from '@/hooks/use-entities';
import { bookingApi } from '@/services/booking.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency, formatDate } from '@/utils/format';
import { toast } from 'sonner';

const STATUS_TABS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'CONFIRMED', label: 'Aktif' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

export function TenantBookingsPage() {
  const [status, setStatus] = useState('ALL');
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useMyBookings({
    page: 1,
    limit: 50,
    status: status === 'ALL' ? undefined : (status as never),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    onSuccess: () => {
      toast.success('Booking dibatalkan.');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const bookings = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Booking Saya" description="Semua riwayat booking kos Anda." />

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
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
        <EmptyState
          title="Belum ada booking"
          description="Booking kos pertama Anda akan tampil di sini."
          action={
            <Button asChild>
              <Link to="/search">Cari Kos</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const payment = booking.payment;
            const needsPayment =
              booking.status === 'PENDING' &&
              payment &&
              (payment.status === 'PENDING' || payment.status === 'WAITING_CONFIRMATION');
            return (
              <Card key={booking.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {booking.room?.boardingHouse?.thumbnail ? (
                        <img
                          src={booking.room.boardingHouse.thumbnail}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/kos/${booking.room?.boardingHouse?.id ?? ''}`}
                        className="font-medium hover:text-primary"
                      >
                        {booking.room?.boardingHouse?.name ?? 'Kos'}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {booking.bookingCode} · Kamar {booking.room?.name ?? '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(booking.startDate)}
                        {booking.endDate ? ` — ${formatDate(booking.endDate)}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(booking.totalPrice)}</p>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="flex gap-2">
                      {needsPayment && (
                        <Button size="sm" asChild>
                          <Link to={`/payment/${booking.id}`}>Bayar Sekarang</Link>
                        </Button>
                      )}
                      {booking.status === 'PENDING' && !cancelMutation.isPending && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelMutation.mutate(booking.id)}
                        >
                          <CalendarX className="mr-1.5 h-4 w-4" /> Batalkan
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
    </div>
  );
}
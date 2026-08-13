import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { addDays } from 'date-fns';
import { CalendarDays, CheckCircle2, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Stepper } from '@/components/ui/stepper';
import { ErrorState, LoadingState } from '@/components/common/states';
import { roomApi } from '@/services/boarding-house.api';
import { bookingApi } from '@/services/booking.api';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency, formatDate } from '@/utils/format';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const schema = z.object({
  startDate: z.string().min(1, 'Pilih tanggal mulai'),
  endDate: z.string().optional(),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
});

type FormValues = z.infer<typeof schema>;

export function BookingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { data: room, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => roomApi.detail(roomId as string),
    enabled: Boolean(roomId),
  });
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const defaultEnd = useMemo(() => addDays(new Date(), 30).toISOString().slice(0, 10), []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { startDate: today, endDate: defaultEnd, notes: '' },
  });

  const startDate = form.watch('startDate') || today;
  const endDate = form.watch('endDate');

  const months = useMemo(() => {
    if (!endDate) return 1;
    const diff = Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000,
    );
    return Math.max(1, diff);
  }, [startDate, endDate]);

  const total = (room?.price ?? 0) * months;

  const onSubmit = async (values: FormValues) => {
    if (!roomId) return;
    setSubmitting(true);
    try {
      const booking = await bookingApi.create({
        roomId,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
        notes: values.notes || undefined,
      });
      toast.success('Booking berhasil dibuat!');
      navigate(`/payment/${booking.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState label="Memuat info kamar..." />;

  if (isError || !room) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          description={isError ? getErrorMessage(error) : 'Kamar tidak ditemukan'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Stepper
        current={1}
        steps={[{ title: 'Detail Booking' }, { title: 'Pembayaran' }, { title: 'Selesai' }]}
        className="mb-8"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-primary" />
            Booking — {room.name}
          </CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <span className="font-medium">Harga per bulan</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(room.price)}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    min={today}
                    className="pl-9"
                    value={startDate}
                    onChange={(e) => form.setValue('startDate', e.target.value, { shouldValidate: true })}
                  />
                </div>
                {form.formState.errors.startDate && (
                  <p className="text-xs font-medium text-destructive">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Selesai (opsional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  min={startDate}
                  className="pl-9"
                  {...form.register('endDate')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Misal: check-in sore hari, atau preferensi lantai atas..."
                rows={3}
                {...form.register('notes')}
              />
            </div>

            <div className="rounded-lg border p-4 text-sm">
              <div className="flex justify-between">
                <span>
                  {months} bulan mulai {formatDate(startDate)}
                  {endDate ? ` s.d. ${formatDate(endDate)}` : ''}
                </span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
              {room.deposit ? (
                <div className="mt-2 flex justify-between text-muted-foreground">
                  <span>Deposit (dikembalikan saat keluar)</span>
                  <span>{formatCurrency(room.deposit)}</span>
                </div>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="border-t">
            <div className="w-full space-y-3">
              <p className="text-sm text-muted-foreground">
                Dengan booking, kamar ini ditahan untuk Anda. Pembayaran DP dilakukan dengan
                transfer ke rekening pemilik — rinciannya ada di langkah berikutnya.
              </p>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Memproses booking...' : <CheckCircle2 className="mr-2 h-4 w-4" />}
                {submitting ? 'Memproses booking...' : 'Lanjut ke Pembayaran'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
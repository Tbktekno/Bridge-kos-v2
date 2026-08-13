import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Send,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { ErrorState, LoadingState } from '@/components/common/states';
import { useBooking } from '@/hooks/use-entities';
import { paymentApi } from '@/services/booking.api';
import { uploadApi } from '@/services/domain.api';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency, formatDate } from '@/utils/format';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: booking, isLoading, isError, error, refetch } = useBooking(bookingId);
  const [uploading, setUploading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');

  if (isLoading) return <LoadingState label="Memuat status pembayaran..." />;

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          description={isError ? getErrorMessage(error) : 'Pembayaran tidak ditemukan'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const payment = booking.payments?.[0] ?? null;

  const handleUpload = async (file: File) => {
    if (!payment?.id) return;
    setUploading(true);
    try {
      const res = await uploadApi.receipt(file);
      setReceiptUrl(res.url);
      toast.success('Bukti pembayaran berhasil diunggah.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!payment?.id) return;
    setPaying(true);
    try {
      await paymentApi.uploadReceipt(payment.id, { receiptUrl });
      toast.success('Bukti pembayaran terkirim. Menunggu konfirmasi pemilik.');
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate('/tenant/bookings');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Stepper
        current={2}
        steps={[{ title: 'Detail Booking' }, { title: 'Pembayaran' }, { title: 'Selesai' }]}
        className="mb-8"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Pembayaran — {booking.bookingCode}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2 rounded-lg border p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Sewa {formatDate(booking.startDate)}
                {booking.endDate ? ` s.d. ${formatDate(booking.endDate)}` : ''}
              </span>
              <span className="font-medium">{formatCurrency(booking.totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">DP yang harus dibayar</span>
              <span className="font-bold text-primary">
                {formatCurrency(booking.downPayment ?? booking.totalPrice)}
              </span>
            </div>
            {payment?.dueDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Batas pembayaran</span>
                <span>{formatDate(payment.dueDate)}</span>
              </div>
            )}
          </div>

          {payment?.status === 'PAID' ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
              <div>
                <p className="font-semibold">Pembayaran Selesai</p>
                <p className="text-sm text-muted-foreground">
                  Booking berstatus konfirmasi dan menunggu jadwal check-in.
                </p>
              </div>
              <Button onClick={() => navigate('/tenant/bookings')}>Lihat Booking</Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Upload Bukti Transfer</Label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  <Upload className="h-5 w-5" />
                  {uploading
                    ? 'Memproses...'
                    : receiptUrl
                      ? 'Ganti gambar bukti'
                      : 'Pilih foto struk transfer'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>
                {receiptUrl && (
                  <p className="flex items-center gap-1.5 text-sm text-primary">
                    <FileText className="h-4 w-4" /> Bukti siap dikirim ke pemilik
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Panduan</p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Hubungi pemilik untuk rincian rekening tujuan transfer.</li>
                  <li>Transfer DP sesuai nominal di atas.</li>
                  <li>Unggah screenshot bukti transfer, lalu kirim.</li>
                  <li>Pemilik akan konfirmasi dalam 1x24 jam.</li>
                </ol>
              </div>
            </>
          )}
        </CardContent>
        {payment?.status !== 'PAID' && (
          <CardFooter className="border-t">
            <div className="w-full space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleConfirm}
                disabled={!receiptUrl || paying}
              >
                {paying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Kirim Bukti Pembayaran
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Butuh bantuan? Hubungi pemilik melalui WhatsApp di halaman detail kos.
              </p>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
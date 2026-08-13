import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusKey =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'PAID'
  | 'REFUNDED'
  | 'WAITING_CONFIRMATION'
  | 'APPROVED'
  | 'ARCHIVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'BANNED'
  | 'NOT_SUBMITTED'
  | 'PUBLISHED'
  | 'DRAFT'
  | 'VERIFIED'
  | 'UNVERIFIED';

const LABELS: Record<StatusKey, string> = {
  PENDING: 'Menunggu',
  CONFIRMED: 'Dikonfirmasi',
  REJECTED: 'Ditolak',
  CANCELLED: 'Dibatalkan',
  COMPLETED: 'Selesai',
  EXPIRED: 'Kedaluwarsa',
  PAID: 'Lunas',
  REFUNDED: 'Dikembalikan',
  WAITING_CONFIRMATION: 'Menunggu Konfirmasi',
  APPROVED: 'Disetujui',
  ARCHIVED: 'Diarsipkan',
  ACTIVE: 'Aktif',
  SUSPENDED: 'Ditangguhkan',
  BANNED: 'Diblokir',
  NOT_SUBMITTED: 'Belum Diverifikasi',
  PUBLISHED: 'Tayang',
  DRAFT: 'Draf',
  VERIFIED: 'Terverifikasi',
  UNVERIFIED: 'Belum Diverifikasi',
};

const VARIANTS: Record<StatusKey, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  REJECTED: 'destructive',
  CANCELLED: 'secondary',
  COMPLETED: 'success',
  EXPIRED: 'secondary',
  PAID: 'success',
  REFUNDED: 'secondary',
  WAITING_CONFIRMATION: 'warning',
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  BANNED: 'destructive',
  APPROVED: 'success',
  ARCHIVED: 'secondary',
  NOT_SUBMITTED: 'secondary',
  PUBLISHED: 'success',
  DRAFT: 'warning',
  VERIFIED: 'success',
  UNVERIFIED: 'secondary',
};

export function StatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const key = (status ?? 'PENDING').toUpperCase() as StatusKey;
  return (
    <Badge variant={VARIANTS[key] ?? 'secondary'} className={cn('font-medium', className)}>
      {LABELS[key] ?? status}
    </Badge>
  );
}
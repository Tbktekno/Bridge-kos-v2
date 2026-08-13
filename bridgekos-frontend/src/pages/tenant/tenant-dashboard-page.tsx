import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BedDouble,
  Bell,
  CalendarCheck2,
  Clock3,
  Heart,
  Plus,
  Star,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/status-badge';
import { PageHeader, ErrorState } from '@/components/common/states';
import { useMyBookings, useUnreadCount, useFavorites } from '@/hooks/use-entities';
import { formatCurrency, formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/app';

export function TenantDashboardPage() {
  const navigate = useNavigate();
  const { data: bookingsData, isLoading: bookingsLoading } = useMyBookings({ limit: 5 });
  const { data: unread } = useUnreadCount();
  const { data: favorites } = useFavorites();

  const bookings = bookingsData?.items ?? [];
  const activeCount = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Penyewa"
        description="Pantau booking, pembayaran, dan aktivitas kos Anda."
        actions={
          <Button asChild>
            <Link to={ROUTES.search}>
              <Plus className="mr-2 h-4 w-4" /> Cari Kos
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Booking Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Selesai</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => navigate(ROUTES.tenant.notifications)}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unread ?? 0}</p>
              <p className="text-sm text-muted-foreground">Notifikasi Belum Dibaca</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Booking Terbaru</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.tenant.bookings}>
                  Lihat Semua <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            {bookingsLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Memuat...</p>
            ) : bookings.length === 0 ? (
              <div className="py-6 text-center">
                <BedDouble className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Belum ada booking.</p>
                <Button asChild className="mt-3" size="sm">
                  <Link to={ROUTES.search}>Mulai Cari Kos</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y">
                {bookings.map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-muted">
                        {booking.room?.boardingHouse?.thumbnail ? (
                          <img src={booking.room.boardingHouse.thumbnail} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <BedDouble className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">
                          {booking.room?.boardingHouse?.name ?? 'Kos'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.bookingCode} · {formatDate(booking.startDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{formatCurrency(booking.totalPrice)}</span>
                      <StatusBadge status={booking.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Favorit</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.tenant.wishlist}>
                  Lihat Semua <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            {!favorites || favorites.length === 0 ? (
              <div className="py-6 text-center">
                <Heart className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Simpan kos favorit dengan menekan ikon hati di halaman kos.
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {favorites.slice(0, 5).map((favorite) => (
                  <li key={favorite.id} className="py-3">
                    <Button variant="ghost" className="h-auto w-full justify-start px-0" asChild>
                      <Link to={`/kos/${favorite.boardingHouseId}`}>
                        <Clock3 className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Buka detail kos</span>
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
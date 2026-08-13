import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarCheck2,
  CircleDollarSign,
  LocateFixed,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader, ErrorState } from '@/components/common/states';
import { StatusBadge } from '@/components/common/status-badge';
import { useMyHouses, useOwnerBookings, useAnalyticsOverview } from '@/hooks/use-entities';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/constants/app';
import { useAuthStore } from '@/store/auth-store';

export function OwnerDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: housesData, isLoading: housesLoading, isError: housesError, error: housesErr, refetch: housesRefetch } = useMyHouses({ limit: 5, status: 'APPROVED' });
  const { data: bookingsData, isLoading: bookingsLoading } = useOwnerBookings({ limit: 5 });
  const { data: analytics, isLoading: analyticsLoading } = useAnalyticsOverview();

  const houses = housesData?.items ?? [];
  const bookings = bookingsData?.items ?? [];

  if (housesError) {
    return (
      <ErrorState
        title="Gagal memuat dashboard"
        description={getErrorMessage(housesErr)}
        onRetry={() => housesRefetch()}
      />
    );
  }

  const stats = [
    { label: 'Total Kos', value: analytics?.totalHouses ?? houses.length, icon: <Building2 className="h-5 w-5" />, loading: housesLoading || analyticsLoading },
    { label: 'Total Kamar', value: analytics?.totalRooms ?? 0, icon: <BedDouble className="h-5 w-5" />, loading: analyticsLoading },
    { label: 'Bookings Masuk', value: analytics?.totalBookings ?? 0, icon: <CalendarCheck2 className="h-5 w-5" />, loading: analyticsLoading },
    { label: 'Pendapatan', value: formatCurrency(analytics?.totalRevenue), icon: <CircleDollarSign className="h-5 w-5" />, loading: analyticsLoading },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Dashboard Owner`}
        description={`Kelola properti Anda — ${user?.email ?? ''}`}
        breadcrumb={null}
        actions={
          <Button onClick={() => navigate(ROUTES.owner.houses)}>
            <Plus className="mr-2 h-4 w-4" /> Kelola Kos
          </Button>
        }
      />

      {!user && <Skeleton className="h-8 w-1/3" />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {stat.icon}
              </div>
              <div>
                {stat.loading ? (
                  <Skeleton className="h-6 w-16" />
                ) : (
                  <p className="text-xl font-bold">{stat.value}</p>
                )}
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Kos Saya</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.owner.houses}>
                Lihat Semua <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {housesLoading ? (
            <Skeleton className="h-40" />
          ) : houses.length === 0 ? (
            <div className="py-6 text-center">
              <LocateFixed className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Belum ada kos terdaftar.</p>
              <Button asChild className="mt-3" size="sm">
                <Link to="/owner/kos/new">Daftarkan Kos Baru</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {houses.map((house) => (
                <li key={house.id} className="flex items-center justify-between gap-3 py-3">
                  <Link to={`/kos/${house.slug ?? house.id}`} className="flex min-w-0 items-center gap-3 hover:opacity-80">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {house.thumbnail ?? house.images?.[0] ? (
                        <img src={house.thumbnail ?? house.images?.[0]?.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{house.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[house.city, house.province].filter(Boolean).join(', ') || 'Belum ada lokasi'}
                      </p>
                    </div>
                  </Link>
                  <StatusBadge status={house.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Booking Terbaru Masuk</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.owner.bookings}>
                Lihat Semua <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {bookingsLoading ? (
            <Skeleton className="h-40" />
          ) : bookings.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada booking masuk.</p>
          ) : (
            <ul className="divide-y">
              {bookings.map((booking) => (
                <li key={booking.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {booking.room?.boardingHouse?.name ?? 'Kos'} — {booking.room?.name ?? '-'}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {booking.tenant?.fullName ?? booking.tenant?.email ?? 'Tenant'} · {booking.bookingCode}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
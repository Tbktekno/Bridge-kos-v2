import {
  BarChart3,
  BedDouble,
  CalendarCheck2,
  CircleDollarSign,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader, ErrorState } from '@/components/common/states';
import {
  useAnalyticsOverview,
  useOwnerBookings,
  useMyHouses,
} from '@/hooks/use-entities';
import { analyticsApi } from '@/services/domain.api';
import { useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency } from '@/utils/format';

export function OwnerAnalyticsPage() {
  const { data: overview, isLoading: overviewLoading, isError: overviewError, error, refetch } = useAnalyticsOverview();
  const { data: housesData } = useMyHouses({ limit: 100 });
  const { data: bookingsData } = useOwnerBookings({ limit: 100 });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics/revenue'],
    queryFn: () => analyticsApi.revenue({ range: '90d' }),
  });
  const { data: occupancy, isLoading: occupancyLoading } = useQuery({
    queryKey: ['analytics/occupancy'],
    queryFn: () => analyticsApi.occupancy(),
  });
  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ['analytics/trend'],
    queryFn: () => analyticsApi.bookingTrend(),
  });

  if (overviewError) {
    return (
      <ErrorState
        title="Gagal memuat analitik"
        description={getErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  const stats = [
    { label: 'Total Kos', value: overview?.totalHouses ?? 0, icon: <BarChart3 className="h-5 w-5" />, loading: overviewLoading },
    { label: 'Total Kamar', value: overview?.totalRooms ?? 0, icon: <BedDouble className="h-5 w-5" />, loading: overviewLoading },
    { label: 'Occupancy Rate', value: overview?.occupancyRate != null ? `${overview.occupancyRate}%` : '-', icon: <TrendingUp className="h-5 w-5" />, loading: overviewLoading },
    { label: 'Pendapatan', value: formatCurrency(overview?.totalRevenue), icon: <CircleDollarSign className="h-5 w-5" />, loading: overviewLoading },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analitik Kinerja"
        description="Pantau performa kos Anda dari waktu ke waktu."
      />

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan 90 Hari</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-64" />
            ) : !revenue || revenue.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">Belum ada data pendapatan.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))" }} labelStyle={{ color: "hsl(var(--muted-foreground))" }} formatter={(v: any) => typeof v === "number" ? v.toLocaleString("id-ID") : v} />
                    <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {occupancyLoading ? (
              <Skeleton className="h-64" />
            ) : !occupancy || occupancy.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">Belum ada data okupansi.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={occupancy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))" }} labelStyle={{ color: "hsl(var(--muted-foreground))" }} formatter={(v: any) => typeof v === "number" ? v.toLocaleString("id-ID") : v} />
                    <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tren Booking</CardTitle>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <Skeleton className="h-64" />
          ) : !trend || trend.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Belum ada data booking.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))" }} labelStyle={{ color: "hsl(var(--muted-foreground))" }} formatter={(v: any) => typeof v === "number" ? v.toLocaleString("id-ID") : v} />
                  <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4" /> Ringkasan Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsData ? (
              <p className="text-sm text-muted-foreground">
                Total {bookingsData.pagination.totalItems} booking tercatat. Kelola di menu Booking Masuk.
              </p>
            ) : (
              <Skeleton className="h-6" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-4 w-4" /> Ringkasan Kos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {housesData ? (
              <p className="text-sm text-muted-foreground">
                {housesData.pagination.totalItems} kos terdaftar. Kelola di menu Kos Saya.
              </p>
            ) : (
              <Skeleton className="h-6" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CircleDollarSign,
  CreditCard,
  FileWarning,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader, ErrorState } from '@/components/common/states';
import { StatusBadge } from '@/components/common/status-badge';
import { adminApi } from '@/services/domain.api';
import { useAdminOverview } from '@/hooks/use-entities';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency, initials, timeAgo } from '@/utils/format';
import { ROUTES } from '@/constants/app';
import { cn } from '@/lib/utils';

interface AdminOwnerRow {
  id: string;
  businessName?: string | null;
  verificationStatus?: string;
  user?: { email?: string; fullName?: string | null };
  createdAt?: string;
}

interface AdminHouseRow {
  id: string;
  name: string;
  status?: string;
  city?: string;
  province?: string;
  thumbnail?: string | null;
  createdAt?: string;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

const OWNER_CITY_COLORS = [
  'var(--primary)',
  'var(--secondary)',
  'var(--success)',
  'var(--warning)',
  'var(--destructive)',
];

function StatCard({
  label,
  value,
  caption,
  icon,
  loading,
  to,
}: {
  label: string;
  value: string | number;
  caption?: string;
  icon: ReactNode;
  loading: boolean;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group block rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          {icon}
        </div>
        <div className="min-w-0">
          {loading ? (
            <>
              <Skeleton className="h-7 w-16" />
              <Skeleton className="mt-1.5 h-3 w-24" />
            </>
          ) : (
            <>
              <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{label}</p>
              {caption && <p className="truncate text-xs text-muted-foreground/75">{caption}</p>}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AdminDashboardPage() {
  const {
    data: overview,
    isLoading: overviewLoading,
    isError: overviewError,
    error: overviewErr,
    refetch: overviewRefetch,
  } = useAdminOverview();

  const housesQuery = useQuery({
    queryKey: ['admin/dashboard/houses'],
    queryFn: () => adminApi.listBoardingHouses({ limit: 100 }),
  });

  const ownersQuery = useQuery({
    queryKey: ['admin/dashboard/owners'],
    queryFn: () => adminApi.listOwners({ limit: 100 }),
  });

  if (overviewError) {
    return (
      <ErrorState
        title="Gagal memuat dashboard"
        description={getErrorMessage(overviewErr)}
        onRetry={() => overviewRefetch()}
      />
    );
  }

  const owners = (ownersQuery.data?.items ?? []) as AdminOwnerRow[];
  const houses = (housesQuery.data?.items ?? []) as AdminHouseRow[];
  const recentOwners = owners.slice(0, 5);
  const recentHouses = houses.slice(0, 5);

  const totalOwners = overview?.totalOwners ?? 0;
  const pendingVerifications = owners.filter(
    (owner) => owner.verificationStatus === 'PENDING',
  ).length;
  const pendingModerations = houses.filter((house) => house.status === 'DRAFT').length;

  // Defensive: ensure overview exists and has expected structure
  const safeOverview = overview && typeof overview === 'object' ? overview : {};
  const topCities = Array.isArray(safeOverview.topCities) ? safeOverview.topCities : [];
  const topOwnerCities = Array.isArray(safeOverview.topOwnerCities) ? safeOverview.topOwnerCities : [];

  const topCity = topCities[0];

  const cityData = topCities.map((item) => ({
    city: item.city,
    count: item.count,
  }));

  const ownerCityData = topOwnerCities.map((item) => ({
    city: item.city,
    count: item.count,
  }));
  const ownerTotal = ownerCityData.reduce((sum, item) => sum + item.count, 0);

  const stats = [
    {
      label: 'Owner',
      value: totalOwners,
      caption: 'Akun pemilik kos',
      icon: <ShieldCheck className="h-5 w-5" />,
      to: ROUTES.admin.owners,
    },
    {
      label: 'Kos Terdaftar',
      value: overview?.totalBoardingHouses ?? 0,
      caption: topCity ? `Terbanyak di ${topCity.city}` : 'Kos terdaftar',
      icon: <Building2 className="h-5 w-5" />,
      to: ROUTES.admin.houses,
    },
    {
      label: 'Booking',
      value: overview?.totalBookings ?? 0,
      caption: 'Pesanan sewa kamar',
      icon: <CalendarCheck2 className="h-5 w-5" />,
      to: ROUTES.admin.reports,
    },
    {
      label: 'Pendapatan',
      value: formatCurrency(overview?.platformRevenue),
      caption: `${overview?.paidPayments ?? 0} pembayaran sukses`,
      icon: <CircleDollarSign className="h-5 w-5" />,
      to: ROUTES.admin.reports,
    },
  ];

  const quickActions = [
    {
      label: 'Tinjau Owner',
      description: 'Verifikasi pemilik kos',
      icon: ShieldCheck,
      to: ROUTES.admin.owners,
    },
    {
      label: 'Moderasi Kos',
      description: 'Persetujuan listing',
      icon: Building2,
      to: ROUTES.admin.houses,
    },
    {
      label: 'Cek Langganan',
      description: 'Status langganan owner',
      icon: CreditCard,
      to: ROUTES.admin.subscriptions,
    },
    {
      label: 'Laporan & Analitik',
      description: 'Metrik platform',
      icon: TrendingUp,
      to: ROUTES.admin.reports,
    },
  ];

  const hasPending = pendingVerifications > 0 || pendingModerations > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={greeting()}
        description={`Ringkasan platform BridgeKos — ${format(new Date(), 'EEEE, dd MMM yyyy', { locale: id })}.`}
        actions={
          <Button asChild>
            <Link to={ROUTES.admin.reports}>
              Laporan & Analitik <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} loading={overviewLoading} />
        ))}
      </div>

      {!overviewLoading && hasPending && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
                <FileWarning className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold">Ada pengajuan yang perlu ditinjau</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {pendingVerifications > 0 && `${pendingVerifications} verifikasi owner`}
                  {pendingVerifications > 0 && pendingModerations > 0 && ' & '}
                  {pendingModerations > 0 && `${pendingModerations} moderasi kos`} menunggu
                  tinjauan Anda.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {pendingVerifications > 0 && (
                <Button asChild size="sm">
                  <Link to={ROUTES.admin.owners}>
                    Tinjau Owner <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
              {pendingModerations > 0 && (
                <Button asChild variant="outline" size="sm">
                  <Link to={ROUTES.admin.houses}>
                    Tinjau Kos <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Distribusi Kos per Kota"
          description="Lima kota dengan kos terdaftar terbanyak."
          className="lg:col-span-2"
        >
          {overviewLoading ? (
            <Skeleton className="h-64" />
          ) : cityData.length === 0 ? (
            <p className="py-20 text-center text-sm text-muted-foreground">
              Belum ada data kos yang dipublikasikan.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={cityData}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="city"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                    interval={0}
                  />
                  <YAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'var(--popover)',
                    }}
                    labelStyle={{ color: 'var(--muted-foreground)' }}
                    formatter={(value) => [`${value} kos`, 'Jumlah']}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--primary)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Owner per Kota" description="Owner dengan kos terbit di tiap kota.">
          {overviewLoading ? (
            <Skeleton className="h-64" />
          ) : ownerCityData.length === 0 ? (
            <p className="py-20 text-center text-sm text-muted-foreground">
              Belum ada data owner per kota.
            </p>
          ) : (
            <div className="flex h-full flex-col">
              <div className="relative h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ownerCityData}
                      dataKey="count"
                      nameKey="city"
                      innerRadius="68%"
                      outerRadius="92%"
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {ownerCityData.map((entry, index) => (
                        <Cell
                          key={entry.city}
                          fill={OWNER_CITY_COLORS[index % OWNER_CITY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        background: 'var(--popover)',
                      }}
                      labelStyle={{ color: 'var(--muted-foreground)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold tracking-tight tabular-nums">{ownerTotal}</p>
                  <p className="text-xs text-muted-foreground">Owner di kota teratas</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5">
                {ownerCityData.map((entry, index) => {
                  const pct = ownerTotal > 0 ? Math.round((entry.count / ownerTotal) * 100) : 0;
                  return (
                    <li key={entry.city} className="flex items-center gap-2.5 text-sm">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: OWNER_CITY_COLORS[index % OWNER_CITY_COLORS.length],
                        }}
                      />
                      <span className="flex-1 text-muted-foreground">{entry.city}</span>
                      <span className="font-medium tabular-nums">{entry.count}</span>
                      <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                        {pct}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Owner Terbaru" description="Akun pemilik kos yang baru bergabung." className="h-full">
          {ownersQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : recentOwners.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Belum ada owner terdaftar.
            </p>
          ) : (
            <ul className="divide-y">
              {recentOwners.map((owner) => (
                <li key={owner.id} className="flex items-center gap-3 py-2.5">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {initials(owner.businessName ?? owner.user?.fullName ?? owner.user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {owner.businessName ?? owner.user?.fullName ?? owner.user?.email ?? '-'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {owner.user?.email ?? '-'}
                    </p>
                  </div>
                  <StatusBadge status={owner.verificationStatus} />
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {owner.createdAt ? timeAgo(owner.createdAt) : '-'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {recentOwners.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="mt-2 w-full">
              <Link to={ROUTES.admin.owners}>
                Lihat semua owner <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </ChartCard>

        <ChartCard title="Kos Terbaru" description="Listing yang baru terdaftar." className="h-full">
          {housesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : recentHouses.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Belum ada kos terdaftar.
            </p>
          ) : (
            <ul className="divide-y">
              {recentHouses.map((house) => (
                <li key={house.id} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {house.thumbnail ? (
                      <img src={house.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{house.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[house.city, house.province].filter(Boolean).join(', ') || 'Belum ada lokasi'}
                    </p>
                  </div>
                  <StatusBadge status={house.status} />
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {house.createdAt ? timeAgo(house.createdAt) : '-'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {recentHouses.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="mt-2 w-full">
              <Link to={ROUTES.admin.houses}>
                Lihat semua kos <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </ChartCard>
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold">Aksi Cepat</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pintasan ke tugas moderasi dan pengelolaan platform.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className={cn(
                  'group flex items-center gap-3 rounded-xl border bg-card p-4',
                  'transition-all hover:border-primary/40 hover:bg-accent/50',
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

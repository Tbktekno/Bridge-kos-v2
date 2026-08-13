import { CircleDollarSign, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/states';
import { useAdminOverview } from '@/hooks/use-entities';
import { formatCurrency } from '@/utils/format';

const BarChart3 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

export function AdminReportsPage() {
  const { data: overview, isLoading } = useAdminOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan & Analitik"
        description="Ringkasan kondisi platform secara menyeluruh."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Owner', value: overview?.totalOwners ?? 0, icon: <ShieldCheck className="h-5 w-5" /> },
          { label: 'Tenant', value: overview?.totalTenants ?? 0, icon: <Users className="h-5 w-5" /> },
          { label: 'Total Kos', value: overview?.totalBoardingHouses ?? 0, icon: <BarChart3 className="h-5 w-5" /> },
          { label: 'Pendapatan Platform', value: formatCurrency(overview?.platformRevenue), icon: <CircleDollarSign className="h-5 w-5" /> },
          { label: 'Bookings', value: overview?.totalBookings ?? 0, icon: <TrendingUp className="h-5 w-5" /> },
          { label: 'Pembayaran Sukses', value: overview?.paidPayments ?? 0, icon: <CircleDollarSign className="h-5 w-5" /> },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {stat.icon}
              </div>
              <div>
                {isLoading ? (
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
          <h2 className="mb-2 font-semibold">Catatan</h2>
          <p className="text-sm text-muted-foreground">
            Laporan granular (per bulan, per kota, tren okupansi, dsb.) tersedia melalui API
            analitik admin. Halaman ini menampilkan ringkasan operasional saat ini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
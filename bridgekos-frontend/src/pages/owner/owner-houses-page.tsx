import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/common/states';
import { useMyHouses } from '@/hooks/use-entities';
import { boardingHouseApi } from '@/services/boarding-house.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/constants/app';
import { toast } from 'sonner';

const TABS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'APPROVED', label: 'Aktif' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'REJECTED', label: 'Ditolak' },
];

export function OwnerHousesPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useMyHouses({
    limit: 100,
    status:
      status === 'ALL' ? undefined : (status as 'APPROVED' | 'PENDING' | 'REJECTED'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => boardingHouseApi.remove(id),
    onSuccess: () => {
      toast.success('Kos dihapus.');
      queryClient.invalidateQueries({ queryKey: ['boarding-houses'] });
      setPendingDelete(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const houses = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kos Saya"
        description="Kelola daftar kos yang Anda pasarkan."
        actions={
          <Button asChild>
            <Link to="/owner/kos/new">
              <Plus className="mr-2 h-4 w-4" /> Daftarkan Kos Baru
            </Link>
          </Button>
        }
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
        <LoadingState label="Memuat kos..." />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : houses.length === 0 ? (
        <EmptyState
          title="Belum ada kos"
          description="Daftarkan kos pertama Anda agar mulai menerima booking."
          action={
            <Button asChild>
              <Link to="/owner/kos/new">
                <Plus className="mr-2 h-4 w-4" /> Daftarkan Kos
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {houses.map((house) => (
            <Card key={house.id} className="flex flex-col overflow-hidden">
              <div className="relative aspect-[16/9] bg-muted">
                {house.thumbnail || house.images?.[0] ? (
                  <img
                    src={house.thumbnail ?? house.images?.[0]?.url}
                    alt={house.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
                <Badge className="absolute left-3 top-3" variant={house.status === 'APPROVED' ? 'success' : house.status === 'PENDING' ? 'warning' : 'secondary'}>
                  {house.status === 'APPROVED' ? 'Aktif' : house.status === 'PENDING' ? 'Menunggu Persetujuan' : house.status === 'REJECTED' ? 'Ditolak' : house.status}
                </Badge>
              </div>
              <CardContent className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 font-semibold">{house.name}</h3>
                </div>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">
                    {[house.subdistrict, house.district, house.city].filter(Boolean).join(', ') || 'Lokasi belum diatur'}
                  </span>
                </p>
                {house.minPrice != null && (
                  <p className="text-sm">
                    <span className="font-bold text-primary">{formatCurrency(house.minPrice)}</span>
                    <span className="text-xs text-muted-foreground"> / bulan</span>
                  </p>
                )}
                <div className="mt-auto flex gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="flex-1">
                    <Link to={`/owner/kos/${house.id}/edit`}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Link>
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => setPendingDelete(house.id)}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kos?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kos beserta kamar akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Kos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
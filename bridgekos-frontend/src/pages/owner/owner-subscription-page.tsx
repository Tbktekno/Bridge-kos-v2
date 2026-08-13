import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Crown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader, LoadingState, ErrorState } from '@/components/common/states';
import { useSubscriptionPlans, useCurrentSubscription } from '@/hooks/use-entities';
import { subscriptionApi } from '@/services/domain.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency, formatDate } from '@/utils/format';
import { toast } from 'sonner';

export function OwnerSubscriptionPage() {
  const { data: plans, isLoading, isError, error, refetch } = useSubscriptionPlans();
  const { data: current, isLoading: currentLoading } = useCurrentSubscription();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) => subscriptionApi.subscribe({ planId }),
    onSuccess: () => {
      toast.success('Langganan berhasil diaktifkan.');
      setSelectedPlan(null);
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <LoadingState label="Memuat paket langganan..." />;

  if (isError || !plans) {
    return <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />;
  }

  if (currentLoading) {
    return <LoadingState label="Memuat status langganan..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Paket Langganan" description="Pilih paket sesuai kebutuhan bisnis kos Anda." />

      {current && (
        <Card className="border-primary/40">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-semibold">
                Langganan aktif: {current.planName}
                {current.status === 'ACTIVE' && (
                  <Badge variant="success">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Aktif
                  </Badge>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Berlaku hingga {formatDate(current.expiresAt)}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/owner/kos')}>
              Kelola Kos
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.isPopular ? 'border-primary shadow-primary/10' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.isPopular && <Badge>Populer</Badge>}
              </div>
              <p className="text-3xl font-bold">
                {formatCurrency(plan.price)}
                <span className="text-sm font-normal text-muted-foreground">/{plan.durationDays} hari</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.description && (
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              )}
              {plan.maxHouses != null && (
                <p className="text-sm">
                  <CheckCircle2 className="mr-1.5 inline h-4 w-4 text-primary" />
                  Hingga {plan.maxHouses} kos
                </p>
              )}
              {plan.maxRooms != null && (
                <p className="text-sm">
                  <CheckCircle2 className="mr-1.5 inline h-4 w-4 text-primary" />
                  Hingga {plan.maxRooms} kamar per kos
                </p>
              )}
              {plan.features?.map((feature) => (
                <p key={feature} className="text-sm">
                  <CheckCircle2 className="mr-1.5 inline h-4 w-4 text-primary" />
                  {feature}
                </p>
              ))}
              <Button
                className="w-full"
                variant={plan.isPopular ? 'default' : 'outline'}
                disabled={current?.status === 'ACTIVE'}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {current?.status === 'ACTIVE' ? 'Langganan Aktif' : 'Pilih Paket'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={selectedPlan !== null} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembelian Paket</DialogTitle>
<DialogDescription>
              Paket akan diaktifkan setelah pembayaran dikonfirmasi admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPlan(null)}>
              Batal
            </Button>
            <Button
              disabled={subscribeMutation.isPending}
              onClick={() => selectedPlan && subscribeMutation.mutate(selectedPlan)}
            >
              {subscribeMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Crown className="mr-2 h-4 w-4" />
              )}
              Aktifkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
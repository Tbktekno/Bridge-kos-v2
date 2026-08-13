import { Link } from 'react-router-dom';
import { BellOff, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/common/states';
import { useNotifications } from '@/hooks/use-entities';
import { notificationApi } from '@/services/interaction.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/error';
import { timeAgo } from '@/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function TenantNotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useNotifications({ limit: 50 });

  const readAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      toast.success('Semua notifikasi dibaca.');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifikasi"
        description="Pembaruan status booking, pembayaran, dan sistem."
        actions={
          notifications.length > 0 ? (
            <Button variant="outline" size="sm" onClick={() => readAllMutation.mutate()} disabled={readAllMutation.isPending}>
              <CheckCheck className="mr-1.5 h-4 w-4" /> Tandai semua dibaca
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <LoadingState label="Memuat notifikasi..." />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Tidak ada notifikasi"
          description="Pembaruan tentang booking dan pembayaran akan muncul di sini."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const unread = !notification.read;
            return (
              <Card key={notification.id} className={cn(unread && 'border-primary/40')}>
                <CardContent
                  className={cn('flex items-start gap-4 p-4', !unread && 'opacity-70')}
                  onClick={() => !notification.read && readMutation.mutate(notification.id)}
                >
                  <div
                    className={cn(
                      'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
                      unread ? 'bg-primary' : 'bg-transparent',
                    )}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>
                    {notification.message && (
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    )}
                    {notification.link && (
                      <Link
                        to={notification.link}
                        className="block pt-1 text-xs text-primary hover:underline"
                      >
                        Buka tautan terkait →
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
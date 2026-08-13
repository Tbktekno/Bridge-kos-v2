import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { favoriteApi } from '@/services/interaction.api';
import { useFavorites } from '@/hooks/use-entities';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error';

export function FavoriteButton({ boardingHouseId, className }: {
  boardingHouseId: string;
  className?: string;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();
  const { data: favorites } = useFavorites();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  const isFavorite = optimistic ?? favorites?.some((f) => f.boardingHouseId === boardingHouseId) ?? false;

  const mutation = useMutation({
    mutationFn: () => (isFavorite ? favoriteApi.remove(boardingHouseId) : favoriteApi.add(boardingHouseId)),
    onMutate: () => setOptimistic(!isFavorite),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setOptimistic(null);
    },
  });

  return (
    <Button
      variant={isFavorite ? 'default' : 'ghost'}
      size="icon"
      className={cn('rounded-full', className)}
      aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
      onClick={() => {
        if (!isAuthenticated) {
          toast.info('Masuk dulu untuk menyimpan favorit');
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
        mutation.mutate();
      }}
    >
      <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
    </Button>
  );
}
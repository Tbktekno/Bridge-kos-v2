import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '@/components/common/states';
import { useFavorites } from '@/hooks/use-entities';
import { useBoardingHouse } from '@/hooks/use-entities';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/constants/app';

export function TenantWishlistPage() {
  const { data: favorites, isLoading, isError, error, refetch } = useFavorites();

  return (
    <div className="space-y-6">
      <PageHeader title="Favorit Saya" description="Kos yang Anda simpan untuk dibandingkan." />

      {isLoading ? (
        <LoadingState label="Memuat favorit..." />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !favorites || favorites.length === 0 ? (
        <EmptyState
          title="Belum ada favorit"
          description="Tekan ikon hati pada halaman kos untuk menyimpannya di sini."
          action={
            <Button asChild>
              <Link to={ROUTES.search}>Cari Kos</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <WishlistCard key={favorite.id} houseId={favorite.boardingHouseId} />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistCard({ houseId }: { houseId: string }) {
  const { data: house } = useBoardingHouse(houseId);

  if (!house) return null;

  return (
    <Link to={`/kos/${house.slug ?? house.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {house.thumbnail || house.images?.[0] ? (
            <img
              src={house.thumbnail ?? house.images?.[0]?.url}
              alt={house.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <Heart className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-1 font-semibold group-hover:text-primary">{house.name}</h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">
              {[house.subdistrict, house.district, house.city].filter(Boolean).join(', ') || 'Lokasi belum diatur'}
            </span>
          </p>
          {house.minPrice != null && (
            <p className="mt-auto text-sm font-bold text-primary">{formatCurrency(house.minPrice)}/bulan</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
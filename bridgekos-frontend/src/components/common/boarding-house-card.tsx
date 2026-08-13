import { Link } from 'react-router-dom';
import { BedDouble, MapPin, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/common/rating-stars';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/constants/app';
import type { BoardingHouseSummary } from '@/types/boarding-house';
import { cn } from '@/lib/utils';

function buildWhatsAppLink(house: BoardingHouseSummary): string | null {
  const number = house.owner?.whatsappNumber || house.owner?.user?.phone;
  if (!number) return null;
  const digits = number.replace(/\D/g, '').replace(/^0/, '62');
  const ownerName = house.owner?.businessName || house.owner?.user?.fullName || 'pemilik kos';
  const message = `Halo ${ownerName}, saya tertarik dengan kos '${house.name}'. Boleh info lebih lanjut?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function BoardingHouseCard({
  house,
  className,
}: {
  house: BoardingHouseSummary;
  className?: string;
}) {
  const waLink = buildWhatsAppLink(house);

  return (
    <Card
      className={cn(
        'group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md',
        className,
      )}
    >
      <Link to={ROUTES.boardingHouse(house.slug ?? house.id)} className="flex flex-1 flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {house.thumbnail || house.images?.[0] ? (
            <img
              src={house.thumbnail ?? house.images?.[0]?.url}
              alt={house.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <BedDouble className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          {house.status === 'PENDING' && (
            <Badge className="absolute left-3 top-3" variant="secondary">
              Menunggu Persetujuan
            </Badge>
          )}
          {house.gender && (
            <Badge
              className="absolute right-3 top-3"
              variant={
                house.gender === 'FEMALE'
                  ? 'destructive'
                  : house.gender === 'MALE'
                    ? 'default'
                    : 'secondary'
              }
            >
              {house.gender === 'COED' ? 'Campur' : house.gender === 'MALE' ? 'Putra' : 'Putri'}
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold group-hover:text-primary">{house.name}</h3>
            {typeof house.rating === 'number' && house.rating > 0 && (
              <RatingStars value={house.rating} size={13} showValue />
            )}
          </div>
          {house.city && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">
                {[house.subdistrict, house.district, house.city].filter(Boolean).join(', ')}
              </span>
            </p>
          )}
          {house.distanceKm !== null && house.distanceKm !== undefined && (
            <p className="text-xs text-muted-foreground">
              {house.distanceKm.toFixed(1)} km dari pusat
            </p>
          )}
          {house.facilities && house.facilities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {house.facilities.slice(0, 3).map((f) => (
                <Badge
                  key={f.id ?? f.name}
                  variant="outline"
                  className="text-[0.65rem] font-normal"
                >
                  {f.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>

      <CardFooter className="flex items-center justify-between gap-2 border-t p-4 pt-3">
        <div className="min-w-0">
          {typeof house.minPrice === 'number' ? (
            <p className="truncate text-sm">
              <span className="text-base font-bold text-primary">
                {formatCurrency(house.minPrice)}
              </span>
              <span className="text-xs text-muted-foreground"> / bulan</span>
            </p>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
          {typeof house.reviewCount === 'number' && house.reviewCount > 0 && (
            <p className="text-xs text-muted-foreground">{house.reviewCount} review</p>
          )}
        </div>
        {waLink && (
          <a href={waLink} target="_blank" rel="noreferrer" aria-label="Chat WhatsApp pemilik kos">
            <Button size="sm" variant="outline" className="shrink-0 gap-1.5">
              <MessageCircle className="h-4 w-4 text-secondary" /> WhatsApp
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  );
}

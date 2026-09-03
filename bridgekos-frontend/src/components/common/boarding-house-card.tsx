import { Link } from 'react-router-dom';
import {
  Archive,
  Bath,
  BedDouble,
  BookOpen,
  Car,
  CircleDot,
  Cctv,
  CookingPot,
  MapPin,
  MessageCircle,
  ShowerHead,
  Snowflake,
  Star,
  Tv,
  WashingMachine,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/constants/app';
import type { BoardingHouseSummary } from '@/types/boarding-house';
import { cn } from '@/lib/utils';

const FACILITY_ICONS: Record<string, LucideIcon> = {
  WiFi: Wifi,
  AC: Snowflake,
  'Kamar Mandi': Bath,
  Parkir: Car,
  'Mesin Cuci': WashingMachine,
  Dapur: CookingPot,
  Kasur: BedDouble,
  TV: Tv,
  'Water Heater': ShowerHead,
  CCTV: Cctv,
  Lemari: Archive,
  'Meja Belajar': BookOpen,
};

const GENDER_LABEL: Record<string, string> = {
  COED: 'Campur',
  MALE: 'Putra',
  FEMALE: 'Putri',
};

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
  const imageUrl = house.thumbnail ?? house.images?.[0]?.url;

  const shownFacilities = (house.facilities ?? []).slice(0, 4);

  return (
    <Card
      className={cn(
        'group h-full overflow-hidden rounded-2xl border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10',
        className,
      )}
    >
      <Link
        to={ROUTES.boardingHouse(house.slug ?? house.id)}
        className="flex h-full flex-col"
      >
        {/* Photo */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={house.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <BedDouble className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

          {house.status === 'PENDING' && (
            <Badge className="absolute left-3 top-3 bg-black/45 text-white backdrop-blur-sm">
              Menunggu Persetujuan
            </Badge>
          )}

          {house.gender && (
            <Badge className="absolute right-3 top-3 border-0 bg-black/45 text-white backdrop-blur-sm">
              {GENDER_LABEL[house.gender] ?? house.gender}
            </Badge>
          )}

          {typeof house.rating === 'number' && house.rating > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {house.rating.toFixed(1)}
              {typeof house.reviewCount === 'number' && house.reviewCount > 0 && (
                <span className="font-normal text-white/70">({house.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="space-y-1.5">
            <h3 className="line-clamp-1 text-base font-bold tracking-tight transition-colors group-hover:text-primary">
              {house.name}
            </h3>
            {house.city && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">
                  {[house.subdistrict, house.district, house.city].filter(Boolean).join(', ')}
                </span>
              </p>
            )}
          </div>

          {shownFacilities.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {shownFacilities.map((f) => {
                const Icon = FACILITY_ICONS[f.name] ?? CircleDot;
                return (
                  <span
                    key={f.id ?? f.name}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary/70" />
                    {f.name}
                  </span>
                );
              })}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                Mulai dari
              </p>
              {typeof house.minPrice === 'number' ? (
                <p className="truncate text-lg font-extrabold tracking-tight text-primary">
                  {formatCurrency(house.minPrice)}
                  <span className="text-xs font-normal text-muted-foreground"> / bulan</span>
                </p>
              ) : (
                <span className="text-sm text-muted-foreground">Hubungi pemilik</span>
              )}
            </div>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat WhatsApp pemilik kos"
                className="shrink-0"
              >
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-primary/30 text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
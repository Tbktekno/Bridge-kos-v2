import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BadgeCheck,
  BedDouble,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { RatingStars } from '@/components/common/rating-stars';
import { FavoriteButton } from '@/components/common/favorite-button';
import { ErrorState } from '@/components/common/states';
import { useBoardingHouse, useCloseBoardingHouse, useReviews } from '@/hooks/use-entities';
import { getErrorMessage } from '@/lib/error';
import { formatCurrency } from '@/utils/format';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES } from '@/constants/app';

const GENDER_LABEL = { COED: 'Campur', MALE: 'Putra', FEMALE: 'Putri' } as const;

export function BoardingHousePage() {
  const { id } = useParams<{ id: string }>();
  const { data: house, isLoading, isError, error, refetch } = useBoardingHouse(id);
  const { data: whatsapp } = useCloseBoardingHouse(id);
  const { data: reviewsData } = useReviews(id, { limit: 10 });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = useMemo(() => {
    if (!house) return [];
    const list = house.images?.map((img) => img.url) ?? [];
    if (house.thumbnail) list.unshift(house.thumbnail);
    return [...new Set(list)];
  }, [house]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="aspect-[16/7] w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError || !house) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          title="Kos tidak ditemukan"
          description={isError ? getErrorMessage(error) : 'Kos tidak ditemukan'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const cover = house.thumbnail ?? images[0] ?? '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to={ROUTES.search} className="hover:text-foreground">
          Cari Kos
        </Link>
        <span>/</span>
        <span className="text-foreground">{house.name}</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl border">
        {cover ? (
          <img src={cover} alt={house.name} className="h-72 w-full object-cover sm:h-96" />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-muted sm:h-96">
            <BedDouble className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 flex">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setLightboxIndex(0)}
              className="bg-background/90 backdrop-blur"
            >
              Lihat {images.length} foto
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{house.name}</h1>
              {house.gender ? <Badge>{GENDER_LABEL[house.gender]}</Badge> : null}
              {house.status === 'PENDING' && (
                <Badge variant="secondary">Menunggu Persetujuan</Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {house.rating != null && (
                <span className="inline-flex items-center gap-1">
                  <RatingStars value={house.rating} size={14} showValue />
                </span>
              )}
              {house.reviewCount != null && <span>{house.reviewCount} review</span>}
              {house.minPrice != null && <span>{formatCurrency(house.minPrice)} / bulan</span>}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {[house.subdistrict, house.district, house.city, house.province]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>

          {house.description && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Deskripsi</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {house.description}
              </p>
            </section>
          )}

          {house.category && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Kategori</h2>
              <Badge variant="outline">{house.category}</Badge>
            </section>
          )}

          {house.facilities && house.facilities.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Fasilitas</h2>
              <div className="flex flex-wrap gap-2">
                {house.facilities.map((f) => (
                  <Badge key={f.id ?? f.name} variant="secondary" className="py-1.5 pl-3 pr-3">
                    {f.name}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {house.rules && house.rules.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Peraturan</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {house.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </section>
          )}

          {house.nearbyPlaces && house.nearbyPlaces.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Lokasi Terdekat</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {house.nearbyPlaces.map((place) => (
                  <li key={place}>{place}</li>
                ))}
              </ul>
            </section>
          )}

          {house.googleMapsUrl && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Lokasi di Peta</h2>
              <a
                href={house.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Buka Google Maps
              </a>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-lg font-semibold">Kamar Tersedia</h2>
            {house.rooms && house.rooms.length > 0 ? (
              <div className="space-y-3">
                {house.rooms.map((room) => (
                  <Card key={room.id}>
                    <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <BedDouble className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{room.name}</span>
                        </div>
                        {room.capacity && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Users className="h-3.5 w-3.5" /> Kapsitas {room.capacity} orang
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(room.price)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {room.availableSlots
                              ? `${room.availableSlots} kamar tersedia`
                              : 'Sisa sedikit'}
                          </p>
                        </div>
                        <BookingButton
                          roomId={room.id}
                          waLink={whatsapp?.waLink}
                          disabled={!room.availableSlots}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada kamar yang diumumkan. Hubungi penyedia kos untuk info lebih lanjut.
              </p>
            )}
          </section>

          {reviewsData && reviewsData.items.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">
                Review ({reviewsData.pagination.totalItems})
              </h2>
              <div className="space-y-4">
                {reviewsData.items.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {review.tenant?.fullName ?? 'Pengguna'}
                          </span>
                          <RatingStars value={review.rating} size={13} />
                        </div>
                      </div>
                      {review.content && (
                        <p className="mt-2 text-sm text-muted-foreground">{review.content}</p>
                      )}
                      {review.reply && (
                        <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                          <span className="font-semibold">Balasan pemilik:</span>{' '}
                          {review.reply.content}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <CardTitle className="text-lg">Hubungi Pemilik</CardTitle>
            </CardHeader>
            <CardContent>
              {house.owner && (
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {(house.owner.fullName ?? 'P')?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-sm font-medium">
                      {house.owner.fullName}
                      {house.owner.isVerified && <BadgeCheck className="h-4 w-4 text-primary" />}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {house.owner.isVerified ? 'Terverifikasi' : 'Pemilik kos'}
                    </p>
                  </div>
                </div>
              )}
              {whatsapp ? (
                <a href={whatsapp.waLink} target="_blank" rel="noreferrer">
                  <Button className="w-full" size="lg">
                    <MessageCircle className="mr-2 h-5 w-5" /> Chat WhatsApp
                  </Button>
                </a>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  WhatsApp tidak tersedia
                </Button>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Konsultasi bebas, tanpa perantara.
              </p>
            </CardContent>
          </Card>

          {house.id && (
            <FavoriteButton boardingHouseId={house.id} className="w-full rounded-xl border" />
          )}
        </div>
      </div>

      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => !open && setLightboxIndex(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{house.name}</DialogTitle>
          </DialogHeader>
          {lightboxIndex !== null && (
            <div className="relative">
              <img
                src={images[lightboxIndex]}
                alt={`Foto ${house.name}`}
                className="max-h-[70vh] w-full rounded-lg object-cover"
              />
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setLightboxIndex((i) => (i! - 1 + images.length) % images.length)}
                  disabled={images.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Sebelum
                </Button>
                <span className="text-sm text-muted-foreground">
                  {lightboxIndex + 1} / {images.length}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setLightboxIndex((i) => (i! + 1) % images.length)}
                  disabled={images.length <= 1}
                >
                  Berikutnya <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingButton({
  roomId,
  waLink,
  disabled,
}: {
  roomId: string;
  waLink?: string;
  disabled?: boolean;
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (disabled) {
    return (
      <Button variant="outline" disabled>
        <X className="h-4 w-4" /> Penuh
      </Button>
    );
  }

  if (isAuthenticated && user?.role === 'TENANT') {
    return (
      <Button asChild>
        <Link to={`/booking/${roomId}`} className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4" /> Booking
        </Link>
      </Button>
    );
  }

  return waLink ? (
    <Button asChild>
      <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" /> Tanya via WhatsApp
      </a>
    </Button>
  ) : (
    <Button variant="outline" disabled>
      WhatsApp tidak tersedia
    </Button>
  );
}

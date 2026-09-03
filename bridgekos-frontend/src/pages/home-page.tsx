import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Banknote,
  BedDouble,
  Building2,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BoardingHouseCard } from '@/components/common/boarding-house-card';
import { PaginationBar } from '@/components/common/pagination-bar';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/states';
import { useBoardingHouses } from '@/hooks/use-entities';
import { getErrorMessage } from '@/lib/error';
import { ROUTES } from '@/constants/app';
import { cn } from '@/lib/utils';
import heroImage from '@/assets/hero-boarding.jpg';

const CITIES = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Malang'];

interface FilterState {
  keyword?: string;
  city?: string;
  page?: number;
}

function useMarketplaceFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<FilterState>(
    () => ({
      page: Number(searchParams.get('page') ?? '1'),
      keyword: searchParams.get('keyword') ?? undefined,
      city: searchParams.get('city') ?? undefined,
    }),
    [searchParams],
  );

  const setParam = (key: string, value: string | number | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === '') next.delete(key);
    else next.set(key, String(value));
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  return { params: filters, setParam };
}

export function HomePage() {
  const { params, setParam } = useMarketplaceFilters();
  const [searchInput, setSearchInput] = useState(params.keyword ?? '');

  const { data, isLoading, isError, error, refetch } = useBoardingHouses({
    page: params.page,
    keyword: params.keyword,
    city: params.city,
    limit: 9,
  });

  const totalItems = data?.pagination.totalItems ?? 0;

  const submitKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('keyword', searchInput);
  };

  return (
    <div>
      {/* Brand banner */}
      <section className="relative overflow-hidden bg-primary">
        <img
          src={heroImage}
          alt="Kamar kos modern, bersih, dan nyaman"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-10 hidden h-40 w-40 rounded-full bg-white/5 blur-2xl lg:block" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <Badge className="mb-4 gap-1.5 border-0 bg-black/45 text-white shadow-lg backdrop-blur-sm hover:bg-black/55">
                <Sparkles className="h-3.5 w-3.5" />
                Marketplace kos modern untuk mahasiswa & pekerja
              </Badge>

              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold text-primary shadow-lg">
                  K
                </span>
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:text-5xl">
                    BridgeKos
                  </h1>
                  <p className="text-primary-foreground/90 drop-shadow-md">
                    Cari kos, bandingkan harga, langsung hubungi owner.
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-xl text-lg text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
                Temukan ribuan kos di seluruh Indonesia dengan harga real-time, slot terjaga, dan
                tanpa biaya layanan.
              </p>

              <form
                onSubmit={submitKeyword}
                className="mt-7 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-primary/30"
              >
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari nama kos, daerah, atau kampus..."
                  className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
                <Button type="submit" className="h-10 px-6">
                  <Search className="mr-2 h-4 w-4" /> Cari
                </Button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-white/90 drop-shadow-sm">
                  <MapPin className="h-4 w-4" /> Populer:
                </span>
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => setParam('city', params.city === city ? undefined : city)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                      params.city === city
                        ? 'bg-white text-primary'
                        : 'bg-black/45 text-white shadow-sm hover:bg-black/60',
                    )}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="mt-9 grid max-w-xl grid-cols-3 gap-6 border-t border-white/25 pt-6">
                <div>
                  <p className="text-3xl font-bold text-white drop-shadow-md">
                    {isLoading ? '…' : totalItems.toLocaleString('id-ID')}
                  </p>
                  <p className="mt-0.5 text-sm text-white/85">Kos Terdaftar</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white drop-shadow-md">{CITIES.length}+</p>
                  <p className="mt-0.5 text-sm text-white/85">Kota Populer</p>
                </div>
                <div>
                  <p className="inline-flex items-center gap-1 text-2xl font-bold text-white drop-shadow-md">
                    <Banknote className="h-5 w-5" /> 0
                  </p>
                  <p className="mt-0.5 text-sm text-white/85">Biaya Layanan</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-3xl border border-white/20 bg-black/40 p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">Kos Terverifikasi</p>
                    <p className="text-sm text-primary-foreground/80">Data dimoderasi admin</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <BedDouble className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">Slot Real-Time</p>
                    <p className="text-sm text-primary-foreground/80">Tidak ada kamar ganda</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">Kontak Langsung WhatsApp</p>
                    <p className="text-sm text-primary-foreground/80">Tanpa perantara</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jelajahi Kos */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24" id="kos">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Marketplace Kos
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Jelajahi Kos
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Kos pilihan yang sudah terkurasi — harga transparan, fasilitas lengkap, dan terhubung
              langsung dengan pemiliknya tanpa perantara.
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-4xl font-extrabold tracking-tight text-primary">
              {isLoading ? '…' : totalItems.toLocaleString('id-ID')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">kos siap huni tersedia</p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState label="Mencari kos..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat kos"
            description={getErrorMessage(error)}
            onRetry={() => refetch()}
          />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="Tidak ada kos"
            description="Belum ada kos yang cocok dengan pencarian Anda. Coba lagi nanti atau ubah kata kunci pencarian di atas."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 lg:gap-8">
              {data.items.map((house) => (
                <BoardingHouseCard key={house.id} house={house} />
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <PaginationBar
                meta={data.pagination}
                onPageChange={(page) => setParam('page', page)}
              />
            </div>
          </>
        )}
      </section>

      {/* Owner CTA */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 text-center sm:px-6 lg:flex-row lg:text-left lg:px-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Punya Kos untuk Disewakan?
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Jangkau ribuan pencari kos. Kelola kamar, booking, dan pembayaran dalam satu aplikasi.
            </p>
          </div>
          <Button size="lg" className="shrink-0" asChild>
            <Link to={ROUTES.register}>
              <Building2 className="mr-2 h-4 w-4" /> Daftar sebagai Owner
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
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
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { BoardingHouseCard } from '@/components/common/boarding-house-card';
import { PaginationBar } from '@/components/common/pagination-bar';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/states';
import { useBoardingHouses } from '@/hooks/use-entities';
import { getErrorMessage } from '@/lib/error';
import { ROUTES } from '@/constants/app';
import { cn } from '@/lib/utils';
import type { BoardingGender } from '@/types/boarding-house';

const CITIES = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Malang'];
const FACILITY_OPTIONS = [
  'WiFi',
  'AC',
  'Kamar Mandi',
  'Parkir',
  'Mesin Cuci',
  'Dapur',
  'Kasur',
  'TV',
];

const GENDERS: { value: BoardingGender; label: string }[] = [
  { value: 'COED', label: 'Campur' },
  { value: 'MALE', label: 'Putra' },
  { value: 'FEMALE', label: 'Putri' },
];

const SORTS: { value: 'latest' | 'rating' | 'price_asc' | 'price_desc'; label: string }[] = [
  { value: 'rating', label: 'Rating Terbaik' },
  { value: 'latest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
];

interface FilterState {
  keyword?: string;
  city?: string;
  gender?: BoardingGender;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'latest' | 'rating' | 'price_asc' | 'price_desc';
  page?: number;
  facilities: string[];
}

function useMarketplaceFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<FilterState>(
    () => ({
      page: Number(searchParams.get('page') ?? '1'),
      keyword: searchParams.get('keyword') ?? undefined,
      city: searchParams.get('city') ?? undefined,
      gender: (searchParams.get('gender') as BoardingGender) ?? undefined,
      minPrice: searchParams.has('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.has('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      sort: (searchParams.get('sort') as FilterState['sort']) ?? 'rating',
      facilities: searchParams.getAll('facility'),
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

  const toggleFacility = (facility: string, checked: boolean) => {
    const next = new URLSearchParams(searchParams);
    const values = next.getAll('facility');
    if (checked && !values.includes(facility)) next.append('facility', facility);
    if (!checked) next.delete('facility', facility);
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => setSearchParams({}, { replace: true });

  return { params: filters, setParam, toggleFacility, resetFilters };
}

export function HomePage() {
  const { params, setParam, toggleFacility, resetFilters } = useMarketplaceFilters();
  const [searchInput, setSearchInput] = useState(params.keyword ?? '');
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useBoardingHouses({
    page: params.page,
    keyword: params.keyword,
    city: params.city,
    gender: params.gender,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sort: params.sort,
    facilities: params.facilities.length ? params.facilities : undefined,
    limit: 9,
  });

  const totalItems = data?.pagination.totalItems ?? 0;

  const submitKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('keyword', searchInput);
  };

  const renderFilters = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Kota / Daerah</Label>
        <Input
          placeholder="mis. Jakarta, Bandung"
          value={params.city ?? ''}
          onChange={(e) => setParam('city', e.target.value || undefined)}
        />
      </div>
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Gender</Label>
        <Select
          value={params.gender ?? ''}
          onValueChange={(v) => setParam('gender', v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Semua gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua gender</SelectItem>
            <SelectItem value="COED">Campur</SelectItem>
            <SelectItem value="MALE">Putra</SelectItem>
            <SelectItem value="FEMALE">Putri</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Rentang Harga / Bulan</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={params.minPrice ?? ''}
            onChange={(e) =>
              setParam('minPrice', e.target.value ? Number(e.target.value) : undefined)
            }
          />
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={params.maxPrice ?? ''}
            onChange={(e) =>
              setParam('maxPrice', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
      </div>
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Fasilitas</Label>
        <div className="grid grid-cols-2 gap-2">
          {FACILITY_OPTIONS.map((f) => (
            <label
              key={f}
              className="flex cursor-pointer items-center gap-2 rounded border p-2 text-sm has-[:checked]:border-primary"
            >
              <Checkbox
                checked={params.facilities.includes(f)}
                onCheckedChange={(c) => toggleFacility(f, Boolean(c))}
              />
              {f}
            </label>
          ))}
        </div>
      </div>
      <Button variant="ghost" className="w-full" onClick={resetFilters}>
        Reset Filter
      </Button>
    </div>
  );

  return (
    <div>
      {/* Brand banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-10 hidden h-40 w-40 rounded-full bg-white/5 blur-2xl lg:block" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <Badge className="mb-4 gap-1.5 bg-white/15 text-primary-foreground hover:bg-white/20">
                <Sparkles className="h-3.5 w-3.5" />
                Marketplace kos modern untuk mahasiswa & pekerja
              </Badge>

              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold text-primary shadow-lg">
                  K
                </span>
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    BridgeKos
                  </h1>
                  <p className="text-primary-foreground/80">
                    Cari kos, bandingkan harga, langsung hubungi owner.
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-xl text-lg text-primary-foreground/90">
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
                <span className="inline-flex items-center gap-1.5 text-primary-foreground/80">
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
                        : 'bg-white/15 text-white hover:bg-white/25',
                    )}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="mt-9 grid max-w-xl grid-cols-3 gap-6 border-t border-white/20 pt-6">
                <div>
                  <p className="text-3xl font-bold text-white">
                    {isLoading ? '…' : totalItems.toLocaleString('id-ID')}
                  </p>
                  <p className="mt-0.5 text-sm text-primary-foreground/80">Kos Terdaftar</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{CITIES.length}+</p>
                  <p className="mt-0.5 text-sm text-primary-foreground/80">Kota Populer</p>
                </div>
                <div>
                  <p className="inline-flex items-center gap-1 text-2xl font-bold text-white">
                    <Banknote className="h-5 w-5" /> 0
                  </p>
                  <p className="mt-0.5 text-sm text-primary-foreground/80">Biaya Layanan</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
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

      {/* Marketplace listing */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" id="kos">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Jelajahi Kos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoading ? 'Memuat...' : `${totalItems.toLocaleString('id-ID')} kos ditemukan`}
            </p>
          </div>
          <Select value={params.sort ?? 'rating'} onValueChange={(v) => setParam('sort', v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick category chips */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Kategori:</span>
          <button
            onClick={() => setParam('gender', undefined)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              !params.gender
                ? 'border-primary bg-primary text-primary-foreground'
                : 'hover:border-primary hover:text-primary',
            )}
          >
            Semua
          </button>
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => setParam('gender', params.gender === g.value ? undefined : g.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                params.gender === g.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:border-primary hover:text-primary',
              )}
            >
              {g.label}
            </button>
          ))}
          <span className="mx-1 hidden h-4 w-px bg-border sm:block" />
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setParam('city', params.city === city ? undefined : city)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                params.city === city
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:border-primary hover:text-primary',
              )}
            >
              {city}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border p-4">{renderFilters()}</div>
          </aside>

          <div>
            <form onSubmit={submitKeyword} className="mb-6 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari nama atau alamat kos..."
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline">
                Cari
              </Button>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button type="button" variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">{renderFilters()}</div>
                </SheetContent>
              </Sheet>
            </form>

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
                title="Tidak ada kos yang cocok"
                description="Coba ubah kata kunci, lokasi, atau filter pencarian Anda."
                action={
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset Filter
                  </Button>
                }
              />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {data.items.map((house) => (
                    <BoardingHouseCard key={house.id} house={house} />
                  ))}
                </div>
                <PaginationBar
                  meta={data.pagination}
                  onPageChange={(page) => setParam('page', page)}
                />
              </>
            )}
          </div>
        </div>
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

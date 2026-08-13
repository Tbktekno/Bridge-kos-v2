import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/app';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Halaman Tidak Ditemukan</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia.
      </p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.home}>Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
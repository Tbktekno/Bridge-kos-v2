import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/common/logo';
import { ROUTES } from '@/constants/app';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Platform pencarian kos terpercaya. Temukan kos sesuai kebutuhan, bandingkan harga, dan
              hubungi pemilik langsung melalui WhatsApp.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Navigasi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" to={ROUTES.home}>
                  Jelajahi Kos
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" to={ROUTES.register}>
                  Daftar sebagai Owner
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Kontak</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> halo@bridgekos.id
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +62 812-0000-0000
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Jakarta, Indonesia
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BridgeKos. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}

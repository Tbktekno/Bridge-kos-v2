import { Link, Outlet, useLocation } from 'react-router-dom';
import { Logo } from '@/components/common/logo';
import { ROUTES } from '@/constants/app';

export function AuthLayout() {
  const { pathname } = useLocation();
  const isFullScreen = pathname === ROUTES.login || pathname === ROUTES.register;

  return (
    <div className="flex min-h-svh flex-col">
      {!isFullScreen && (
        <header className="flex h-16 items-center border-b bg-background/80 px-6 backdrop-blur">
          <Link to={ROUTES.home} aria-label="Kembali ke beranda">
            <Logo />
          </Link>
        </header>
      )}
      <main className="flex w-full flex-1 items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
}

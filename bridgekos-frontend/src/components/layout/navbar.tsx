import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogIn, Menu, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/common/logo';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { useAuthStore } from '@/store/auth-store';
import { useUnreadCount } from '@/hooks/use-entities';
import { useLogout } from '@/hooks/use-auth';
import { initials } from '@/utils/format';
import { ROUTES } from '@/constants/app';

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { data: unread } = useUnreadCount();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  const dashboardPath =
    user?.role === 'OWNER'
      ? ROUTES.owner.dashboard
      : user?.role === 'ADMIN'
        ? ROUTES.admin.dashboard
        : ROUTES.tenant.dashboard;

  const handleLogout = () => {
    logout.mutate(undefined, { onSettled: () => navigate('/') });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to={ROUTES.home} aria-label="BridgeKos">
            <Logo />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate(ROUTES.tenant.notifications)}
              aria-label="Notifikasi"
            >
              <BellIcon />
              {unread ? (
                <span className="absolute -right-0.5 -top-0.5">
                  <Badge className="h-4 min-w-4 px-1 text-[0.6rem]">
                    {unread > 99 ? '99+' : unread}
                  </Badge>
                </span>
              ) : null}
            </Button>
          )}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-1.5 pr-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{initials(user?.email)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">
                    {user?.email}
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
                  Dashboard
                </DropdownMenuItem>
                {user?.role === 'TENANT' && (
                  <DropdownMenuItem onClick={() => navigate(ROUTES.tenant.notifications)}>
                    Notifikasi
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/account/profile')}>
                  Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => navigate(ROUTES.login)}
              >
                <LogIn className="mr-1.5 h-4 w-4" /> Masuk
              </Button>
              <Button size="sm" onClick={() => navigate(ROUTES.register)}>
                <UserPlus className="mr-1.5 h-4 w-4" /> Daftar
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col gap-1 pt-6">
                {!isAuthenticated && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setOpen(false);
                        navigate(ROUTES.login);
                      }}
                    >
                      Masuk
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setOpen(false);
                        navigate(ROUTES.register);
                      }}
                    >
                      Daftar
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

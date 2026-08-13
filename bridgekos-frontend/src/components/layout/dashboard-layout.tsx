import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/common/logo';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { SidebarContent, NAV_BY_ROLE } from '@/components/layout/dashboard-nav';
import { useAuthStore } from '@/store/auth-store';
import { useLogout } from '@/hooks/use-auth';
import { initials } from '@/utils/format';
import { ROUTES } from '@/constants/app';

const LABEL_BY_ROLE = {
  TENANT: 'Tenant',
  OWNER: 'Owner',
  ADMIN: 'Admin',
} as const;

export function DashboardLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!user) return null;

const role = user.role;
  const label = LABEL_BY_ROLE[role];

  const handleLogout = () => {
    logout.mutate(undefined, { onSettled: () => navigate('/') });
  };

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-background lg:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
        </div>
        <SidebarContent role={role} />
        <div className="border-t p-4 text-xs text-muted-foreground">
          Masuk sebagai <span className="font-semibold text-foreground">{label}</span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="h-16 border-b px-6">
                  <SheetTitle className="sr-only">Menu Dashboard</SheetTitle>
                  <Link to="/" className="flex items-center">
                    <Logo />
                  </Link>
                </SheetHeader>
                <SidebarContent role={role} onNavigate={() => setSheetOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm font-semibold sm:inline-flex">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-1.5 pr-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{initials(user.email)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/account/profile')}>Profil</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
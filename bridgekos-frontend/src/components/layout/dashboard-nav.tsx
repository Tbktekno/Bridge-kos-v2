import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  Crown,
  Heart,
  House,
  LayoutDashboard,
  ReceiptText,
  ShieldCheck,
  Star,
  UserRound,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ROUTES } from '@/constants/app';
import type { Role } from '@/types/auth';

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  end?: boolean;
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  TENANT: [
    { label: 'Dashboard', to: ROUTES.tenant.dashboard, icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { label: 'Booking Saya', to: ROUTES.tenant.bookings, icon: <ReceiptText className="h-4 w-4" /> },
    { label: 'Favorit', to: ROUTES.tenant.wishlist, icon: <Heart className="h-4 w-4" /> },
    { label: 'Review Saya', to: ROUTES.tenant.reviews, icon: <Star className="h-4 w-4" /> },
    { label: 'Notifikasi', to: ROUTES.tenant.notifications, icon: <Bell className="h-4 w-4" /> },
    { label: 'Profil', to: ROUTES.tenant.profile, icon: <UserRound className="h-4 w-4" /> },
  ],
  OWNER: [
    { label: 'Dashboard', to: ROUTES.owner.dashboard, icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { label: 'Kos Saya', to: ROUTES.owner.houses, icon: <Building2 className="h-4 w-4" /> },
    { label: 'Kamar', to: ROUTES.owner.rooms, icon: <House className="h-4 w-4" /> },
    { label: 'Booking Masuk', to: ROUTES.owner.bookings, icon: <ReceiptText className="h-4 w-4" /> },
    { label: 'Pembayaran', to: ROUTES.owner.payments, icon: <Wallet className="h-4 w-4" /> },
    { label: 'Analitik', to: ROUTES.owner.analytics, icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Langganan', to: ROUTES.owner.subscription, icon: <Crown className="h-4 w-4" /> },
    { label: 'Profil', to: ROUTES.owner.profile, icon: <UserRound className="h-4 w-4" /> },
  ],
  ADMIN: [
    { label: 'Dashboard', to: ROUTES.admin.dashboard, icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { label: 'Owner', to: ROUTES.admin.owners, icon: <ShieldCheck className="h-4 w-4" /> },
    { label: 'Kos', to: ROUTES.admin.houses, icon: <Building2 className="h-4 w-4" /> },
    { label: 'Laporan & Analitik', to: ROUTES.admin.reports, icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Langganan', to: ROUTES.admin.subscriptions, icon: <CreditCard className="h-4 w-4" /> },
  ],
};

export function SidebarContent({
  role,
  onNavigate,
  className,
}: {
  role: Role;
  onNavigate?: () => void;
  className?: string;
}) {
  const items = NAV_BY_ROLE[role] ?? [];

  return (
    <ScrollArea className={cn('flex-1', className)}>
      <nav className="space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            {item.icon}
            <span className="flex-1 truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </ScrollArea>
  );
}
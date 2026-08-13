import { createBrowserRouter, Navigate, useSearchParams } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/public-layout';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BlankShell } from '@/components/layout/blank-shell';
import { AuthLayout } from '@/components/layout/auth-layout';
import { RequireAuth, RequireRole, PublicOnly } from '@/routes/guards';
import { HomePage } from '@/pages/home-page';
import { BoardingHousePage } from '@/pages/boarding-house-page';
import { LoginPage } from '@/pages/auth/login-page';
import { RegisterPage } from '@/pages/auth/register-page';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password-page';
import { ResetPasswordPage } from '@/pages/auth/reset-password-page';
import { VerifyEmailPage } from '@/pages/auth/verify-email-page';
import { BookingPage } from '@/pages/booking/booking-page';
import { PaymentPage } from '@/pages/booking/payment-page';
import { TenantDashboardPage } from '@/pages/tenant/tenant-dashboard-page';
import { TenantBookingsPage } from '@/pages/tenant/tenant-bookings-page';
import { TenantWishlistPage } from '@/pages/tenant/tenant-wishlist-page';
import { TenantReviewsPage } from '@/pages/tenant/tenant-reviews-page';
import { TenantNotificationsPage } from '@/pages/tenant/tenant-notifications-page';
import { OwnerDashboardPage } from '@/pages/owner/owner-dashboard-page';
import { OwnerHousesPage } from '@/pages/owner/owner-houses-page';
import { OwnerHouseFormPage } from '@/pages/owner/owner-house-form-page';
import { OwnerRoomsPage } from '@/pages/owner/owner-rooms-page';
import { OwnerBookingsPage } from '@/pages/owner/owner-bookings-page';
import { OwnerPaymentsPage } from '@/pages/owner/owner-payments-page';
import { OwnerAnalyticsPage } from '@/pages/owner/owner-analytics-page';
import { OwnerSubscriptionPage } from '@/pages/owner/owner-subscription-page';
import { AdminDashboardPage } from '@/pages/admin/admin-dashboard-page';
import { AdminOwnersPage } from '@/pages/admin/admin-owners-page';
import { AdminHousesPage } from '@/pages/admin/admin-houses-page';
import { AdminReportsPage } from '@/pages/admin/admin-reports-page';
import { AdminSubscriptionsPage } from '@/pages/admin/admin-subscriptions-page';
import { ProfilePage } from '@/pages/profile-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { ROUTES } from '@/constants/app';

function LegacySearchRedirect() {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `/?${query}` : '/'} replace />;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/search', element: <LegacySearchRedirect /> },
      { path: '/cara-kerja', element: <Navigate to="/" replace /> },
      { path: '/kos/:id', element: <BoardingHousePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.login,
        element: (
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        ),
      },
      {
        path: ROUTES.register,
        element: (
          <PublicOnly>
            <RegisterPage />
          </PublicOnly>
        ),
      },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
      { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
      { path: ROUTES.verifyEmail, element: <VerifyEmailPage /> },
    ],
  },
  {
    element: (
      <RequireAuth>
        <BlankShell />
      </RequireAuth>
    ),
    children: [
      {
        path: '/booking/:roomId',
        element: (
          <RequireRole roles={['TENANT']}>
            <BookingPage />
          </RequireRole>
        ),
      },
      {
        path: '/payment/:bookingId',
        element: (
          <RequireRole roles={['TENANT']}>
            <PaymentPage />
          </RequireRole>
        ),
      },
    ],
  },
  {
    element: (
      <RequireAuth>
        <DashboardLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: ROUTES.tenant.dashboard,
        element: (
          <RequireRole roles={['TENANT']}>
            <TenantDashboardPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.tenant.bookings,
        element: (
          <RequireRole roles={['TENANT']}>
            <TenantBookingsPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.tenant.wishlist,
        element: (
          <RequireRole roles={['TENANT']}>
            <TenantWishlistPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.tenant.reviews,
        element: (
          <RequireRole roles={['TENANT']}>
            <TenantReviewsPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.tenant.notifications,
        element: (
          <RequireRole roles={['TENANT']}>
            <TenantNotificationsPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.owner.dashboard,
        element: (
          <RequireRole roles={['OWNER']}>
            <OwnerDashboardPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.owner.houses,
        element: (
          <RequireRole roles={['OWNER']}>
            <OwnerHousesPage />
          </RequireRole>
        ),
      },
      {
        path: '/owner/kos/new',
        element: (
          <RequireRole roles={['OWNER']}>
            <OwnerHouseFormPage />
          </RequireRole>
        ),
      },
      {
        path: '/owner/kos/:id/edit',
        element: (
          <RequireRole roles={['OWNER']}>
            <OwnerHouseFormPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.owner.rooms,
        element: (
          <RequireRole roles={['OWNER']}>
            <OwnerRoomsPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.owner.bookings,
        element: (
          <RequireRole roles={['OWNER']}>
            <OwnerBookingsPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.owner.payments,
        element: (
          <RequireRole roles={['OWNER']}>
            <OwnerPaymentsPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.owner.analytics,
        element: (
          <RequireRole roles={['OWNER']}>
            <OwnerAnalyticsPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.owner.subscription,
        element: (
          <RequireRole roles={['OWNER']}>
            <OwnerSubscriptionPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.admin.dashboard,
        element: (
          <RequireRole roles={['ADMIN']}>
            <AdminDashboardPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.admin.owners,
        element: (
          <RequireRole roles={['ADMIN']}>
            <AdminOwnersPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.admin.houses,
        element: (
          <RequireRole roles={['ADMIN']}>
            <AdminHousesPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.admin.reports,
        element: (
          <RequireRole roles={['ADMIN']}>
            <AdminReportsPage />
          </RequireRole>
        ),
      },
      {
        path: ROUTES.admin.subscriptions,
        element: (
          <RequireRole roles={['ADMIN']}>
            <AdminSubscriptionsPage />
          </RequireRole>
        ),
      },
      { path: '/account/profile', element: <ProfilePage /> },
    ],
  },
]);

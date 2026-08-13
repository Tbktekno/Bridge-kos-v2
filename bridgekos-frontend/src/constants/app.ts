export const APP_NAME = 'BridgeKos';

export const ROUTES = {
  home: '/',
  search: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  boardingHouse: (slug: string) => `/kos/${slug}`,
  tenant: {
    dashboard: '/tenant',
    bookings: '/tenant/bookings',
    wishlist: '/tenant/wishlist',
    notifications: '/tenant/notifications',
    reviews: '/tenant/reviews',
    profile: '/tenant/profile',
  },
  owner: {
    dashboard: '/owner',
    houses: '/owner/kos',
    rooms: '/owner/rooms',
    bookings: '/owner/bookings',
    payments: '/owner/payments',
    analytics: '/owner/analytics',
    subscription: '/owner/subscription',
    profile: '/owner/profile',
  },
  admin: {
    dashboard: '/admin',
    owners: '/admin/owners',
    houses: '/admin/kos',
    reports: '/admin/reports',
    analytics: '/admin/analytics',
    subscriptions: '/admin/subscriptions',
    settings: '/admin/settings',
  },
} as const;

export const QUERY_KEYS = {
  auth: { me: 'auth/me' },
  boardingHouses: { list: 'boarding-houses/list', detail: 'boarding-houses/detail' },
  bookings: { list: 'bookings/list', detail: 'bookings/detail' },
  notifications: { list: 'notifications/list', unread: 'notifications/unread' },
  favorites: { list: 'favorites/list' },
  owner: { profile: 'owner/profile', analytics: 'owner/analytics' },
} as const;

export interface NotificationItem {
  id: string;
  type?: string | null;
  title: string;
  message?: string | null;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  rating: number;
  content?: string | null;
  createdAt: string;
  boardingHouse?: {
    id: string;
    name: string;
    thumbnail?: string | null;
  } | null;
  tenant?: {
    id: string;
    fullName?: string | null;
    avatar?: string | null;
  } | null;
  reply?: {
    id: string;
    content: string;
    createdAt: string;
  } | null;
}

export interface ReviewInput {
  bookingId: string;
  rating: number;
  content?: string;
}

export interface ReviewReplyInput {
  content: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
  maxHouses?: number;
  maxRooms?: number;
  features?: string[];
  isPopular?: boolean;
}

export interface SubscriptionSummary {
  id: string;
  planName: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  startsAt: string;
  expiresAt: string;
  price: number;
  maxHouses?: number;
  maxRooms?: number;
}

export interface SubscribeInput {
  planId: string;
  paymentMethod?: string;
}

export interface OwnerProfile {
  id: string;
  userId: string;
  fullName?: string;
  avatar?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  isVerified?: boolean;
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  companyName?: string | null;
  address?: string | null;
  bankAccounts?: BankAccount[];
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isPrimary?: boolean;
}

export interface TenantProfile {
  id: string;
  userId: string;
  fullName?: string;
  avatar?: string | null;
  phone?: string | null;
  gender?: string | null;
  bio?: string | null;
}

export interface AdminOverview {
  totalOwners?: number;
  totalTenants?: number;
  totalBoardingHouses?: number;
  totalBookings?: number;
  platformRevenue?: number;
  paidPayments?: number;
  topCities?: Array<{ city: string; count: number }>;
  topOwnerCities?: Array<{ city: string; count: number }>;
  growth?: { monthly: number };
  [key: string]: unknown;
}

export interface OwnerAnalyticsOverview {
  totalHouses?: number;
  totalRooms?: number;
  totalBookings?: number;
  activeBookings?: number;
  totalRevenue?: number;
  occupancyRate?: number;
  rating?: number;
  [key: string]: unknown;
}

export interface AnalyticsSeriesPoint {
  label: string;
  value: number;
}

export interface WhatsAppContactResult {
  waLink: string;
  phone?: string;
  message?: string;
}
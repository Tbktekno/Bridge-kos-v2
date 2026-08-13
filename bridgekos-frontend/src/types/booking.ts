export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'EXPIRED';

export type PaymentStatus =
  | 'PENDING'
  | 'WAITING_CONFIRMATION'
  | 'PAID'
  | 'REJECTED'
  | 'REFUNDED'
  | 'EXPIRED';

export interface RoomSummary {
  id: string;
  boardingHouseId: string;
  name: string;
  type?: string | null;
  price: number;
  deposit?: number | null;
  capacity?: number;
  availableSlots?: number;
  sizeM2?: number | null;
  facilities?: string[];
  images?: string[];
  status?: string;
}

export interface BookingSummary {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  startDate: string;
  endDate?: string | null;
  totalPrice: number;
  downPayment?: number | null;
  tenant?: {
    id: string;
    fullName?: string;
    avatar?: string | null;
    email?: string;
  } | null;
  room?: {
    id: string;
    name: string;
    boardingHouse?: {
      id: string;
      name: string;
      thumbnail?: string | null;
      city?: string | null;
    } | null;
  } | null;
  payment?: {
    id: string;
    status: PaymentStatus;
    amount?: number;
    dueDate?: string;
  } | null;
  createdAt?: string;
  expiresAt?: string | null;
}

export interface BookingDetail extends BookingSummary {
  notes?: string | null;
  ownerNote?: string | null;
  totalPaid?: number;
  remainingAmount?: number;
  paymentDueDays?: number;
  payments?: Array<{
    id: string;
    amount: number;
    status: PaymentStatus;
    method?: string | null;
    dueDate?: string;
    paidAt?: string | null;
    receiptUrl?: string | null;
    createdAt?: string;
  }>;
}

export interface PaymentSummary {
  id: string;
  amount: number;
  status: PaymentStatus;
  method?: string | null;
  dueDate?: string;
  paidAt?: string | null;
  receiptUrl?: string | null;
  bookingId: string;
  bookingCode?: string;
  roomName?: string;
  boardingHouseName?: string;
  tenantName?: string;
  createdAt?: string;
}

export interface CreateBookingInput {
  roomId: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface PaymentReceiptInput {
  receiptUrl: string;
  note?: string;
}
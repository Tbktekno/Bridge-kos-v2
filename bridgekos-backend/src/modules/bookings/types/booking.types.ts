export interface CreateBookingInput {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guestCount?: number;
  notes?: string | null;
}

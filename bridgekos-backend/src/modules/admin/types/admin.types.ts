export interface AdminOverview {
  totalOwners: number;
  totalTenants: number;
  totalBoardingHouses: number;
  totalBookings: number;
  platformRevenue: number;
  paidPayments: number;
  topCities: Array<{ city: string; count: number }>;
  topOwnerCities: Array<{ city: string; count: number }>;
}

export interface ReviewVerificationInput {
  status: 'VERIFIED' | 'REJECTED';
  note?: string | null;
}

export interface ModerateBoardingInput {
  status: 'PUBLISHED' | 'ARCHIVED' | 'DRAFT';
}

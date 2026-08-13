import type { BoardingGender, BoardingStatus } from '../../../generated/prisma/client.js';

export interface CreateBoardingInput {
  name: string;
  description?: string | null;
  category?: string | null;
  gender?: BoardingGender;
  address: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  thumbnail?: string | null;
  facilities?: string[];
  rules?: string[];
  nearbyPlaces?: string[];
  operationalHours?: unknown;
  status?: BoardingStatus;
}

export type UpdateBoardingInput = Partial<CreateBoardingInput>;

export interface ListBoardingQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  province?: string;
  city?: string;
  district?: string;
  gender?: BoardingGender;
  minPrice?: number;
  maxPrice?: number;
  facilities?: string[];
  status?: BoardingStatus;
  sort?: 'latest' | 'rating' | 'price_asc' | 'price_desc';
}

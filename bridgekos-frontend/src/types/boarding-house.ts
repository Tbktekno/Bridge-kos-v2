import type { PaginationMeta } from '@/types/auth';

export type BoardingGender = 'COED' | 'MALE' | 'FEMALE';
export type BoardingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
export type BoardingCategory = 'KOST' | 'APARTEMEN' | 'KONTRAKAN' | 'CAMPURAN';

export interface BoardingFacility {
  id?: string;
  name: string;
  icon?: string | null;
}

export interface BoardingImage {
  id: string;
  url: string;
  caption?: string | null;
  isPrimary?: boolean;
  createdAt?: string;
}

export interface BoardingHouseSummary {
  id: string;
  slug?: string | null;
  name: string;
  category?: string | null;
  gender?: BoardingGender | null;
  description?: string | null;
  thumbnail?: string | null;
  city?: string | null;
  province?: string | null;
  district?: string | null;
  subdistrict?: string | null;
  status?: BoardingStatus;
  minPrice?: number | null;
  maxPrice?: number | null;
  rating?: number | null;
  reviewCount?: number;
  facilities?: BoardingFacility[];
  images?: BoardingImage[];
  distanceKm?: number | null;
  owner?: {
    whatsappNumber?: string | null;
    businessName?: string | null;
    user?: { fullName?: string | null; phone?: string | null } | null;
  } | null;
}

export interface BoardingHouseDetail extends BoardingHouseSummary {
  address?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsUrl?: string | null;
  rules?: string[] | null;
  nearbyPlaces?: string[] | null;
  operationalHours?: Record<string, unknown> | null;
  owner?: {
    id: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    whatsappNumber?: string | null;
    isVerified?: boolean;
  } | null;
  rooms?: Array<{
    id: string;
    name: string;
    price: number;
    capacity?: number;
    availableSlots?: number;
    facilities?: string[];
  }>;
  createdAt?: string;
}

export interface BoardingHouseListResponse {
  items: BoardingHouseSummary[];
  pagination: PaginationMeta;
}

export interface BoardingHouseQuery {
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
  sort?: 'latest' | 'rating' | 'price_asc' | 'price_desc';
  status?: BoardingStatus;
}

export interface CreateBoardingHouseInput {
  name: string;
  description?: string;
  category?: BoardingCategory;
  gender?: BoardingGender;
  address: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  thumbnail?: string;
  facilities?: string[];
  rules?: string[];
  nearbyPlaces?: string[];
  status?: BoardingStatus;
}

export type UpdateBoardingHouseInput = Partial<CreateBoardingHouseInput>;

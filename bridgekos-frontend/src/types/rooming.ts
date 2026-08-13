export interface RoomSummary {
  id: string;
  boardingHouseId?: string;
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

export interface RoomInput {
  boardingHouseId: string;
  name: string;
  type?: string;
  price: number;
  deposit?: number;
  capacity?: number;
  availableSlots?: number;
  sizeM2?: number;
  facilities?: string[];
  images?: string[];
}
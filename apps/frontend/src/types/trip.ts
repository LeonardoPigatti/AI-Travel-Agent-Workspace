export type TripStatus = "draft" | "planning" | "ready" | "archived";

export interface Trip {
  id: string;
  title: string;
  destination: string;
  duration_days: number;
  budget: string;
  currency: string;
  preferences: string | null;
  status: TripStatus;
  itinerary: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripListResponse {
  items: Trip[];
  total: number;
}

export interface TripCreate {
  title: string;
  destination: string;
  duration_days: number;
  budget: number;
  currency: string;
  preferences?: string;
}

export interface TripUpdate {
  title?: string;
  destination?: string;
  duration_days?: number;
  budget?: number;
  currency?: string;
  preferences?: string;
}
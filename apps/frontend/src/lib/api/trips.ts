import { api } from "./client";
import type { Trip, TripCreate, TripListResponse, TripUpdate } from "@/types/trip";

export const tripsApi = {
  list: (skip = 0, limit = 20) =>
    api.get<TripListResponse>(`/api/v1/trips/?skip=${skip}&limit=${limit}`),

  get: (id: string) =>
    api.get<Trip>(`/api/v1/trips/${id}`),

  create: (data: TripCreate) =>
    api.post<Trip>("/api/v1/trips/", data),

  update: (id: string, data: TripUpdate) =>
    api.patch<Trip>(`/api/v1/trips/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/v1/trips/${id}`),
};
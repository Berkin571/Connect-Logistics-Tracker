import type { Role } from "./auth";

export interface LocationPoint {
  lat: number;
  lng: number;
  accuracy?: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: number; // ms epoch
}

export interface LocationUpdatePayload {
  userId: string;
  companyId: string;
  point: LocationPoint;
}

export interface ShareRule {
  enabled: boolean;
  allowedRoles?: Role[];
  allowedCustomerCompanyIds?: string[];
}

export interface GeofenceRegion {
  id: string;
  lat: number;
  lng: number;
  radius: number; // meters
  companyId: string;
  label?: string;
}

export interface GeofenceEvent {
  userId: string;
  companyId: string;
  regionId: string;
  transition: "enter" | "exit";
  timestamp: number;
}

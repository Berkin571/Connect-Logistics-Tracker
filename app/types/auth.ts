export type Role = "admin" | "driver" | "carrier" | "supplier" | "warehouse";

export interface Address {
  city: string;
  zip: string;
  street: string;
  houseNumber: string;
  district: string;
  country: string;
}

export interface User {
  _id: string;
  id?: string; // Für Kompatibilität
  company: string;
  companyId?: string; // Für Kompatibilität
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  role: Role;
  roles?: Role[]; // Für Kompatibilität
  phone?: string;
  username?: string;
  address?: Address;
  pic?: string;
  isAdmin: boolean;
  isApproved: boolean;
  usagePurpose?: string;
  industry?: string;
  privacySettings?: boolean;
  twoFactorEnabled?: boolean;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RegisterData {
  company: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  username?: string;
  address: Address;
  usagePurpose?: string;
  industry?: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  token?: string; // Für Kompatibilität
}

export interface Session {
  user: User;
  tokens: AuthTokens;
}

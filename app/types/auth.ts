export type Role = "admin" | "driver" | "carrier" | "supplier" | "warehouse";

export interface User {
  id: string;
  name: string;
  email: string;
  companyId: string;
  roles: Role[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface Session {
  user: User;
  tokens: AuthTokens;
}

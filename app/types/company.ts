export interface Address {
  city: string;
  zip: string;
  street: string;
  houseNumber: string;
  district?: string;
  country: string;
}

export interface Company {
  _id: string;
  name: string;
  address?: Address;
  contactEmail?: string;
  phone?: string;
  website?: string;
  industry?: string;
  description?: string;
  companyType?: "supplier" | "carrier" | "both";
  taxId?: string;
  vatNumber?: string;
  registrationNumber?: string;
  foundedYear?: number;
  employeeCount?: number;
  annualRevenue?: string;
  certifications?: string[];
  specialties?: string[];
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  displayName?: string;
}

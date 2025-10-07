export enum BookingStatus {
  NEW = "new",
  IN_CONTACT = "in_contact",
  BOOKED = "booked",
  ON_WAY = "on_way",
  DONE = "done",
}

export enum PriceType {
  FIXED = "Festpreis",
  NEGOTIABLE = "Verhandelbar",
  AGREEMENT = "Nach Vereinbarung",
}

export enum TruckType {
  SMALL = "Kleintransporter",
  MEDIUM = "Sattelzug",
  LARGE = "Hängerzug",
  XLARGE = "Gliederzug",
  JUMBO = "Jumbo",
  SOLO = "Solo",
  FRIGO = "Frigo",
  THERMO = "Thermo",
  TANK = "Tanklaster",
}

export enum GoodsType {
  FOOD = "Food",
  NON_FOOD = "Non-Food",
  MEDICAL = "Medical",
  ELECTRIC = "Electric",
  ADR = "ADR",
  LIQUID = "Liquid",
  ANIMAL = "Animal-Transfer",
}

export interface Location {
  city: string;
  zip: number;
  street: string;
  houseNumber: number;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface FreightDetails {
  truckType: TruckType;
  goodsType: GoodsType;
  availableVolume: number;
}

export interface Booking {
  status: BookingStatus;
  bookedBy: string | null;
  negotiatedAt?: Date;
  bookedAt?: Date;
  onWayAt?: Date;
  completedAt?: Date;
}

export interface FreightUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Freight {
  _id: string;
  user: FreightUser;
  company: string;
  date: Date | string;
  start: Location;
  destination: Location;
  details: FreightDetails;
  booking: Booking;
  price: number;
  priceType: PriceType;
  geolocationStart: GeoLocation;
  geolocationDestination: GeoLocation;
  distance?: number;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Helper-Funktionen
export function isInMotion(freight: Freight): boolean {
  return freight?.booking?.status === BookingStatus.ON_WAY;
}

export function getStatusColor(status?: BookingStatus | string): string {
  if (!status) return "$gray600";

  switch (status) {
    case BookingStatus.NEW:
      return "$blue600";
    case BookingStatus.IN_CONTACT:
      return "$amber600";
    case BookingStatus.BOOKED:
      return "$purple600";
    case BookingStatus.ON_WAY:
      return "$green600";
    case BookingStatus.DONE:
      return "$gray600";
    default:
      return "$gray600";
  }
}

export function getStatusLabel(status?: BookingStatus | string): string {
  if (!status) return "Unbekannt";

  switch (status) {
    case BookingStatus.NEW:
      return "Neu";
    case BookingStatus.IN_CONTACT:
      return "In Kontakt";
    case BookingStatus.BOOKED:
      return "Gebucht";
    case BookingStatus.ON_WAY:
      return "Unterwegs";
    case BookingStatus.DONE:
      return "Abgeschlossen";
    default:
      return status.toString();
  }
}

export function getStatusIcon(status?: BookingStatus | string): string {
  if (!status) return "📦";

  switch (status) {
    case BookingStatus.NEW:
      return "📋";
    case BookingStatus.IN_CONTACT:
      return "💬";
    case BookingStatus.BOOKED:
      return "✅";
    case BookingStatus.ON_WAY:
      return "🚚";
    case BookingStatus.DONE:
      return "🏁";
    default:
      return "📦";
  }
}

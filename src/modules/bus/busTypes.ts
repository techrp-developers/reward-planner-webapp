// src/modules/bus/busTypes.ts
// Shared shapes for the Bus Booking module. Kept close to what a bus inventory API
// typically returns so the sample data in busService.ts can be swapped for real calls.

export interface BusCity {
  id: string;
  name: string;
  state: string;
  popular?: boolean;
}

export type BusLayout = 'sleeper' | 'seater';

export type Amenity =
  | 'wifi'
  | 'charging'
  | 'water'
  | 'blanket'
  | 'tv'
  | 'readingLight'
  | 'tracking'
  | 'snacks';

export interface BusPoint {
  id: string;
  time: string; // HH:MM
  name: string;
  address: string;
}

export interface BusTrip {
  id: string;
  operator: string;
  busType: string;
  ac: boolean;
  layout: BusLayout;
  fromCityId: string;
  toCityId: string;
  date: string; // YYYY-MM-DD
  departure: string; // HH:MM
  arrival: string; // HH:MM
  arrivalDayOffset: number;
  durationMins: number;
  fare: number; // lowest seat fare
  seatsLeft: number;
  rating: number;
  ratingsCount: number;
  amenities: Amenity[];
  womenFriendly: boolean;
  liveTracking: boolean;
  tags: string[];
  traceId?: string | number;
  resultIndex?: string;
  srdvIndex?: string;
}

export type SeatGender = 'female' | 'male';

export interface BusSeat {
  id: string;
  label: string;
  deck: 'lower' | 'upper';
  kind: 'sleeper' | 'seater';
  row: number;
  col: number; // 0..3, the aisle sits between columns
  price: number;
  booked: boolean;
  reservedFor?: SeatGender;
  bookedBy?: SeatGender;
}

export interface BusTripDetails {
  trip: BusTrip;
  seats: BusSeat[];
  boardingPoints: BusPoint[];
  droppingPoints: BusPoint[];
  cancellationPolicy: { window: string; charge: string }[];
  busPolicies: string[];
}

export type PassengerGender = 'M' | 'F' | 'O';

export interface PassengerDraft {
  seatId: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: PassengerGender | '';
}

export interface ContactDraft {
  email: string;
  phone: string;
}

export interface BusBookingConfirmation {
  pnr: string;
  ticketNo: string;
  trip: BusTrip;
  seats: BusSeat[];
  boarding: BusPoint;
  dropping: BusPoint;
  passengers: PassengerDraft[];
  contact: ContactDraft;
  totals: FareBreakdown;
}

export interface FareBreakdown {
  baseFare: number;
  gst: number;
  discount: number;
  pointsUsed: number;
  total: number;
}

export interface SavedTraveller {
  id: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: PassengerGender;
}

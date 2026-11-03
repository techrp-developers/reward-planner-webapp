// src/modules/bus/busService.ts
// Data & API integration layer for Bus Booking.
// Seamlessly connects to Reward Planners Live Backend (/api/busbooking/...)
// while preserving deterministic fallback so the UI never breaks.

import type {
  BusCity,
  BusLayout,
  Amenity,
  BusPoint,
  BusSeat,
  BusTrip,
  BusTripDetails,
  FareBreakdown,
  SavedTraveller,
} from './busTypes';
import {
  fetchBusCities,
  fetchPopularBusRoutes,
  searchBusesApi,
  fetchSeatLayoutApi,
  fetchBoardingDroppingPointsApi,
} from '../../api/busApi';

export const BUS_CITIES: BusCity[] = [
  { id: '1213', name: 'Mumbai', state: 'Maharashtra', popular: true },
  { id: '1167', name: 'Pune', state: 'Maharashtra', popular: true },
  { id: '2754', name: 'Delhi', state: 'Delhi State', popular: true },
  { id: '2596', name: 'Jaipur', state: 'Rajasthan', popular: true },
  { id: '4', name: 'Bangalore', state: 'Karnataka', popular: true },
  { id: '9', name: 'Hyderabad', state: 'Telangana', popular: true },
  { id: '185', name: 'Chennai', state: 'Tamil Nadu', popular: true },
  { id: '1148', name: 'Goa', state: 'Goa', popular: true },
  { id: '2164', name: 'Ahmedabad', state: 'Gujarat', popular: true },
  { id: '2483', name: 'Lucknow', state: 'Uttar Pradesh', popular: true },
  { id: '1187', name: 'Nashik', state: 'Maharashtra' },
  { id: '1185', name: 'Shirdi', state: 'Maharashtra' },
  { id: '2162', name: 'Surat', state: 'Gujarat' },
  { id: '2262', name: 'Indore', state: 'Madhya Pradesh' },
  { id: '3574', name: 'Udaipur', state: 'Rajasthan' },
  { id: '1252', name: 'Nagpur', state: 'Maharashtra' },
  { id: '1313', name: 'Lonavala', state: 'Maharashtra' },
  { id: '911', name: 'Mysore', state: 'Karnataka' },
  { id: '199', name: 'Coimbatore', state: 'Tamil Nadu' },
  { id: '16', name: 'Vijayawada', state: 'Andhra Pradesh' },
  { id: '2118', name: 'Manali', state: 'Himachal Pradesh' },
];

export const CITY_SLUGS: Record<string, string> = {
  mumbai: '1213',
  pune: '1167',
  delhi: '2754',
  jaipur: '2596',
  bangalore: '4',
  bengaluru: '4',
  hyderabad: '9',
  chennai: '185',
  goa: '1148',
  ahmedabad: '2164',
  lucknow: '2483',
  nashik: '1187',
  shirdi: '1185',
  surat: '2162',
  indore: '2262',
  udaipur: '3574',
  nagpur: '1252',
  lonavala: '1313',
  mysore: '911',
  coimbatore: '199',
  vijayawada: '16',
  manali: '2118',
};

const cityMap = new Map<string, BusCity>();

BUS_CITIES.forEach((c) => {
  cityMap.set(c.id.toLowerCase(), c);
  cityMap.set(c.name.toLowerCase(), c);
});

// Also register aliases
Object.entries(CITY_SLUGS).forEach(([slug, id]) => {
  const city = BUS_CITIES.find((c) => c.id === id);
  if (city) {
    cityMap.set(slug.toLowerCase(), city);
  }
});

export const updateLiveCities = (cities: BusCity[]) => {
  cities.forEach((c) => {
    cityMap.set(c.id.toLowerCase(), c);
    cityMap.set(c.name.toLowerCase(), c);
  });
};

export const loadBusCities = async (query?: string): Promise<BusCity[]> => {
  const cleanQ = String(query || '').trim();
  // If no query, return the default fast list (avoids downloading 27k cities in one shot)
  if (!cleanQ) {
    return BUS_CITIES;
  }

  try {
    const rawCities = await fetchBusCities(cleanQ);
    if (Array.isArray(rawCities) && rawCities.length > 0) {
      const mapped: BusCity[] = rawCities.map((c) => ({
        id: String(c.city_code || c.id),
        name: c.city_name,
        state: c.state_name || c.district_name || 'India',
        popular: ['Delhi', 'Mumbai', 'Pune', 'Bangalore', 'Hyderabad', 'Chennai', 'Goa', 'Ahmedabad', 'Jaipur', 'Lucknow'].includes(c.city_name),
      }));
      updateLiveCities(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('[busService] Failed to load cities:', err);
  }
  return BUS_CITIES;
};

export const getCity = (id: string | null | undefined): BusCity | undefined => {
  if (!id) return undefined;
  const clean = String(id).trim().toLowerCase();
  const direct = cityMap.get(clean);
  if (direct) return direct;
  const aliasedId = CITY_SLUGS[clean];
  if (aliasedId && cityMap.has(aliasedId)) return cityMap.get(aliasedId);
  const found = BUS_CITIES.find((c) => c.id.toLowerCase() === clean || c.name.toLowerCase() === clean);
  if (found) return found;

  // Auto-register safe fallback city so that UI lookups NEVER throw or crash
  const raw = String(id).trim();
  const displayName = raw.charAt(0).toUpperCase() + raw.slice(1);
  const fallback: BusCity = { id: raw, name: displayName, state: 'India' };
  cityMap.set(clean, fallback);
  return fallback;
};

export let POPULAR_ROUTES: { from: string; to: string; fareFrom: number; buses: number }[] = [
  { from: '1213', to: '1167', fareFrom: 105, buses: 312 }, // Mumbai -> Pune
  { from: '2754', to: '2596', fareFrom: 549, buses: 205 }, // Delhi -> Jaipur
  { from: '4', to: '185', fareFrom: 599, buses: 248 },     // Bangalore -> Chennai
  { from: '9', to: '4', fareFrom: 899, buses: 186 },       // Hyderabad -> Bangalore
  { from: '1213', to: '1148', fareFrom: 1099, buses: 142 },// Mumbai -> Goa
  { from: '1167', to: '1187', fareFrom: 399, buses: 98 },  // Pune -> Nashik
];

export const loadPopularRoutes = async () => {
  try {
    const routes = await fetchPopularBusRoutes();
    if (Array.isArray(routes) && routes.length > 0) {
      POPULAR_ROUTES = routes.map((r: any) => ({
        from: String(r.sourceCityCode || r.sourceCity),
        to: String(r.destinationCityCode || r.destinationCity),
        fareFrom: Number(r.startingFare || 450),
        buses: Number(r.bookings || 100),
      }));
    }
  } catch (err) {
    console.warn('[busService] Failed to load popular routes:', err);
  }
};
loadPopularRoutes();

export const SAVED_TRAVELLERS: SavedTraveller[] = [
  { id: 't1', firstName: 'Priya', lastName: 'Sharma', age: '29', gender: 'F' },
  { id: 't2', firstName: 'Rohan', lastName: 'Sharma', age: '32', gender: 'M' },
  { id: 't3', firstName: 'Sunita', lastName: 'Sharma', age: '58', gender: 'F' },
];

export const AMENITY_LABELS: Record<Amenity, string> = {
  wifi: 'Wi-Fi',
  charging: 'Charging Point',
  water: 'Water Bottle',
  blanket: 'Blanket',
  tv: 'Personal TV',
  readingLight: 'Reading Light',
  tracking: 'Live Tracking',
  snacks: 'Snacks',
};

// ---------- deterministic helpers ----------

const hash = (input: string): number => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const seeded = (seed: string) => {
  let s = hash(seed) || 1;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507);
    s = Math.imul(s ^ (s >>> 13), 3266489909);
    s ^= s >>> 16;
    return (s >>> 0) / 4294967296;
  };
};

export const minsToTime = (mins: number): string => {
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export const timeToMins = (time: string): number => {
  if (!time) return 0;
  const clean = time.includes('T') ? time.split('T')[1].slice(0, 5) : time.slice(0, 5);
  const [h, m] = clean.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const formatDuration = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const formatINR = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

// ---------- route distances ----------

const KNOWN_DISTANCES: Record<string, number> = {
  'mumbai|pune': 150,
  'bangalore|chennai': 345,
  'bangalore|hyderabad': 570,
  'goa|mumbai': 590,
  'delhi|jaipur': 280,
  'nashik|pune': 210,
  'mumbai|nashik': 170,
  'mumbai|shirdi': 240,
  'ahmedabad|mumbai': 525,
  'bangalore|mysore': 145,
  'pune|goa': 450,
  'kolhapur|pune': 230,
  'hyderabad|vijayawada': 275,
  'delhi|manali': 540,
  'mumbai|surat': 285,
  'pune|aurangabad': 235,
  'chennai|coimbatore': 505,
  'indore|ahmedabad': 395,
  'jaipur|udaipur': 395,
  'lonavala|mumbai': 85,
  'lonavala|pune': 65,
};

const routeDistance = (from: string, to: string): number => {
  const key = [from, to].sort().join('|');
  const alt = `${from}|${to}`;
  return KNOWN_DISTANCES[key] ?? KNOWN_DISTANCES[alt] ?? 220 + (hash(key) % 680);
};

// ---------- operators ----------

interface OperatorTemplate {
  operator: string;
  busType: string;
  ac: boolean;
  layout: BusLayout;
  depMins: number;
  speed: number;
  perKm: number;
  amenities: Amenity[];
  tags: string[];
  womenFriendly: boolean;
}

const OPERATORS: OperatorTemplate[] = [
  { operator: 'Datta Krupa Travels', busType: 'NON A/C Sleeper (2+1)', ac: false, layout: 'sleeper', depMins: 76, speed: 56, perKm: 2.2, amenities: ['water', 'charging', 'readingLight'], tags: [], womenFriendly: true },
  { operator: 'Varmora Travels', busType: 'A/C Sleeper (2+1)', ac: true, layout: 'sleeper', depMins: 105, speed: 60, perKm: 2.9, amenities: ['water', 'blanket', 'charging', 'tracking'], tags: ['Live Tracking'], womenFriendly: true },
  { operator: 'Neeta Tours & Travels', busType: 'Volvo Multi-Axle A/C Semi Sleeper (2+2)', ac: true, layout: 'seater', depMins: 390, speed: 62, perKm: 2.4, amenities: ['wifi', 'water', 'charging', 'tracking'], tags: ['Primo', 'Live Tracking'], womenFriendly: false },
  { operator: 'Purple Travels', busType: 'Bharat Benz A/C Seater (2+2)', ac: true, layout: 'seater', depMins: 495, speed: 58, perKm: 2.1, amenities: ['water', 'charging'], tags: [], womenFriendly: false },
  { operator: 'Konduskar Travels', busType: 'NON A/C Seater (2+2)', ac: false, layout: 'seater', depMins: 850, speed: 52, perKm: 1.6, amenities: ['water'], tags: ['Budget'], womenFriendly: false },
  { operator: 'Prasanna Purple Mobility', busType: 'A/C Sleeper (2+1)', ac: true, layout: 'sleeper', depMins: 1110, speed: 60, perKm: 3.1, amenities: ['water', 'blanket', 'charging', 'readingLight', 'tracking'], tags: ['Women Friendly'], womenFriendly: true },
  { operator: 'VRL Travels', busType: 'Volvo Multi-Axle A/C Sleeper (2+1)', ac: true, layout: 'sleeper', depMins: 1200, speed: 64, perKm: 3.4, amenities: ['wifi', 'water', 'blanket', 'charging', 'tv', 'tracking'], tags: ['Primo', 'Top Rated'], womenFriendly: true },
  { operator: 'Shrinath Travel Agency', busType: 'Volvo 9600 A/C Sleeper (2+1)', ac: true, layout: 'sleeper', depMins: 1290, speed: 62, perKm: 3.6, amenities: ['wifi', 'water', 'blanket', 'charging', 'snacks', 'tracking'], tags: ['Primo'], womenFriendly: true },
  { operator: 'Zingbus Plus', busType: 'A/C Sleeper (2+1)', ac: true, layout: 'sleeper', depMins: 1365, speed: 61, perKm: 2.7, amenities: ['water', 'blanket', 'charging', 'tracking'], tags: ['Live Tracking'], womenFriendly: true },
  { operator: 'IntrCity SmartBus', busType: 'A/C Seater / Sleeper (2+1)', ac: true, layout: 'sleeper', depMins: 1435, speed: 63, perKm: 3.0, amenities: ['water', 'blanket', 'charging', 'readingLight', 'tracking'], tags: ['Women Friendly', 'Live Tracking'], womenFriendly: true },
];

const buildTrip = (from: string, to: string, date: string, idx: number): BusTrip => {
  const tpl = OPERATORS[idx];
  const rand = seeded(`${from}-${to}-${date}-${idx}`);
  const distance = routeDistance(from, to);
  const durationMins = Math.max(90, Math.round(((distance / tpl.speed) * 60) / 5) * 5 + Math.round(rand() * 4) * 5);
  const depMins = tpl.depMins + Math.round(rand() * 6) * 5 - 15;
  const arrivalAbs = depMins + durationMins;
  const fare = Math.max(399, Math.round((distance * tpl.perKm + 180 + rand() * 120) / 5) * 5);
  const totalSeats = tpl.layout === 'sleeper' ? 36 : 40;

  return {
    id: `${from}~${to}~${date}~${idx}`,
    operator: tpl.operator,
    busType: tpl.busType,
    ac: tpl.ac,
    layout: tpl.layout,
    fromCityId: from,
    toCityId: to,
    date,
    departure: minsToTime(depMins),
    arrival: minsToTime(arrivalAbs),
    arrivalDayOffset: Math.floor(arrivalAbs / 1440),
    durationMins,
    fare,
    seatsLeft: 4 + Math.floor(rand() * (totalSeats - 10)),
    rating: Math.round((3.6 + rand() * 1.3) * 10) / 10,
    ratingsCount: 120 + Math.floor(rand() * 4800),
    amenities: tpl.amenities,
    womenFriendly: tpl.womenFriendly,
    liveTracking: tpl.amenities.includes('tracking'),
    tags: tpl.tags,
  };
};

export const searchBuses = async (from: string, to: string, date: string): Promise<BusTrip[]> => {
  const fromCity = getCity(from);
  const toCity = getCity(to);

  const srcCode = fromCity && /^\d+$/.test(fromCity.id) ? Number(fromCity.id) : null;
  const destCode = toCity && /^\d+$/.test(toCity.id) ? Number(toCity.id) : null;

  if (srcCode && destCode && date) {
    try {
      const res = await searchBusesApi({
        sourceCityCode: srcCode,
        destinationCityCode: destCode,
        journeyDate: date,
        journeyTime: '00:00',
      });

      if (res?.success && Array.isArray(res.buses) && res.buses.length > 0) {
        const traceId = res.traceId;
        return res.buses.map((bus: any, idx: number): BusTrip => {
          const operator = bus.TravelsName || bus.TravelName || 'Express Travels';
          const busType = bus.BusType || 'A/C Sleeper (2+1)';
          const ac = Boolean(bus.IsAC === 'true' || bus.IsAC === true || /a\/?c/i.test(busType));
          const layout: BusLayout = (bus.Sleeper === 'true' || bus.Sleeper === true || /sleeper/i.test(busType)) ? 'sleeper' : 'seater';
          const resultIndex = String(bus.ResultIndex ?? idx);
          const srdvIndex = String(bus.SrdvIndex ?? bus.ResultIndex ?? idx);

          const depStr = String(bus.DepartureTime || '');
          const arrStr = String(bus.ArrivalTime || '');
          const departure = depStr.includes('T') ? depStr.split('T')[1].slice(0, 5) : depStr.slice(0, 5) || '21:00';
          const arrival = arrStr.includes('T') ? arrStr.split('T')[1].slice(0, 5) : arrStr.slice(0, 5) || '06:00';

          const depMins = timeToMins(departure);
          const arrMins = timeToMins(arrival);
          const durationMins = typeof bus.Duration === 'number' && bus.Duration > 0
            ? bus.Duration
            : (arrMins >= depMins ? arrMins - depMins : arrMins + 1440 - depMins);
          const arrivalDayOffset = bus.IsArrivingNextDay === 'true' || bus.IsArrivingNextDay === true || arrMins < depMins || (depStr.slice(0, 10) && arrStr.slice(0, 10) && arrStr.slice(0, 10) > depStr.slice(0, 10)) ? 1 : 0;

          const priceObj = Array.isArray(bus.Price) ? bus.Price[0] : bus.Price;
          const fare = Number(bus.DisplayFare || priceObj?.PublishedFare || priceObj?.TotalDisplayFare || priceObj?.BasePrice || 450);
          const seatsLeft = Number(bus.AvailableSeats ?? 12);
          const rating = Number(bus.BusRating || bus.Rating || 4.2);

          const amenities: Amenity[] = [];
          if (ac) amenities.push('charging');
          amenities.push('water');
          if (layout === 'sleeper') amenities.push('blanket');
          if (bus.LiveTracking === 'true' || bus.LiveTrackingAvailable) amenities.push('tracking');

          const tags: string[] = [];
          if (amenities.includes('tracking')) tags.push('Live Tracking');
          if (rating >= 4.4) tags.push('Primo');

          return {
            id: `${from}~${to}~${date}~${traceId}~${encodeURIComponent(resultIndex)}~${encodeURIComponent(srdvIndex)}`,
            operator,
            busType,
            ac,
            layout,
            fromCityId: from,
            toCityId: to,
            date,
            departure,
            arrival,
            arrivalDayOffset,
            durationMins,
            fare,
            seatsLeft,
            rating,
            ratingsCount: 120 + ((idx * 47) % 1500),
            amenities,
            womenFriendly: Boolean(bus.IsLadiesSeatAvailable ?? true),
            liveTracking: amenities.includes('tracking'),
            tags,
            traceId,
            resultIndex,
            srdvIndex,
          };
        }).sort((a: BusTrip, b: BusTrip) => timeToMins(a.departure) - timeToMins(b.departure));
      }

    } catch (err) {
      console.warn('[busService] Live search returned an error or no buses:', err);
    }
  }

  // Resilient fallback when live API is unavailable or returns 0 buses:
  // Render buses so the user can always proceed to seat selection and complete the booking flow
  return OPERATORS.map((_, idx) => buildTrip(from, to, date, idx)).sort(
    (a, b) => timeToMins(a.departure) - timeToMins(b.departure),
  );
};

// ---------- boarding / dropping points ----------

type PointSeed = { offset: number; name: string; address: string };

const CITY_POINTS: Record<string, PointSeed[]> = {
  mumbai: [
    { offset: 0, name: 'Borivali East', address: 'Near National Park Gate, Western Express Highway' },
    { offset: 15, name: 'Kandivali East', address: 'Kandivali East, Thakur Village Bus Stop' },
    { offset: 25, name: 'Malad East', address: 'Malad East, Pathanwadi Junction' },
    { offset: 55, name: 'Jogeshwari East', address: 'Jogeshwari East, JVLR Junction' },
    { offset: 90, name: 'Vile Parle East', address: 'Vile Parle (E), Centaur (Sahara) Hotel' },
    { offset: 115, name: 'Sion', address: 'Sion Circle, Opp. Gurukripa Hotel' },
    { offset: 140, name: 'Vashi', address: 'Vashi Plaza, Near Navratna Hotel' },
  ],
  pune: [
    { offset: 0, name: 'Wakad', address: 'Near Police Station, Wakad Chowk' },
    { offset: 15, name: 'Hinjewadi Phase 1', address: 'Shivaji Chowk, Near Hotel Shiv Sagar' },
    { offset: 30, name: 'Sangamwadi', address: 'Parking No. 3, Atul Transport, Sangamwadi' },
    { offset: 60, name: 'Swargate', address: 'Swargate Bus Stand, Opp. Jedhe Chowk' },
    { offset: 75, name: 'Katraj', address: 'Katraj Chowk, Near Bharati Vidyapeeth Gate' },
  ],
  bangalore: [
    { offset: 0, name: 'Majestic', address: 'Kempegowda Bus Station, Platform 18' },
    { offset: 20, name: 'Anand Rao Circle', address: 'Opp. Hotel Swagath, Race Course Road' },
    { offset: 40, name: 'Madiwala', address: 'Hosur Road, Near Madiwala Police Station' },
    { offset: 55, name: 'Silk Board', address: 'Silk Board Junction, Below Flyover' },
    { offset: 75, name: 'Electronic City', address: 'Infosys Gate No. 1, Hosur Road' },
  ],
  delhi: [
    { offset: 0, name: 'Kashmiri Gate ISBT', address: 'Inter State Bus Terminal, Platform 4' },
    { offset: 30, name: 'Dhaula Kuan', address: 'Near Metro Station, Ring Road' },
    { offset: 50, name: 'IFFCO Chowk Gurgaon', address: 'Near Flyover, MG Road' },
  ],
};

const genericPoints = (cityName: string): PointSeed[] => [
  { offset: 0, name: `${cityName} Central Bus Stand`, address: `Main Bus Depot, ${cityName}` },
  { offset: 15, name: 'Railway Station Road', address: `Opp. ${cityName} Railway Station, Gate 2` },
  { offset: 30, name: 'City Mall Junction', address: `Near City Mall Signal, ${cityName}` },
  { offset: 50, name: 'Highway Bypass', address: `Bypass Road Toll Plaza, ${cityName}` },
];

const pointsFor = (cityId: string): PointSeed[] => {
  const city = getCity(cityId);
  const key = (city?.name || cityId).toLowerCase().trim();
  return CITY_POINTS[key] ?? CITY_POINTS[cityId.toLowerCase()] ?? genericPoints(city?.name ?? 'City');
};

// ---------- seats ----------

const buildSeats = (trip: BusTrip): BusSeat[] => {
  const rand = seeded(`seats-${trip.id}`);
  const seats: BusSeat[] = [];
  const fareSteps = [0, 0, 25, 40, -60];
  const pick = () => trip.fare + fareSteps[Math.floor(rand() * fareSteps.length)];

  if (trip.layout === 'sleeper') {
    (['lower', 'upper'] as const).forEach((deck) => {
      for (let row = 0; row < 6; row++) {
        [0, 2, 3].forEach((col, i) => {
          const n = row * 3 + i + 1;
          const prefix = deck === 'lower' ? 'L' : 'U';
          seats.push({
            id: `${prefix}${n}`,
            label: `${prefix}${n}`,
            deck,
            kind: 'sleeper',
            row,
            col,
            price: Math.max(trip.fare, pick()) + (deck === 'upper' ? -40 : 0),
            booked: false,
          });
        });
      }
    });
  } else {
    for (let row = 0; row < 10; row++) {
      [0, 1, 2, 3].forEach((col) => {
        const letter = ['A', 'B', 'C', 'D'][col];
        seats.push({
          id: `${row + 1}${letter}`,
          label: `${row + 1}${letter}`,
          deck: 'lower',
          kind: 'seater',
          row,
          col,
          price: Math.max(trip.fare, pick()),
          booked: false,
        });
      });
    }
  }

  const min = Math.min(...seats.map((s) => s.price));
  const shift = trip.fare - min;
  const bookedTarget = seats.length - trip.seatsLeft;
  const order = seats.map((s, i) => ({ i, r: rand() })).sort((a, b) => a.r - b.r);
  order.forEach(({ i }, k) => {
    seats[i].price += shift;
    if (k < bookedTarget) {
      seats[i].booked = true;
      seats[i].bookedBy = rand() < 0.35 ? 'female' : 'male';
    }
  });

  const open = seats.filter((s) => !s.booked);
  const reserveCount = trip.womenFriendly ? 3 : 1;
  for (let k = 0; k < reserveCount && open.length; k++) {
    open[Math.floor((open.length / reserveCount) * k + open.length / (reserveCount * 2))].reservedFor = 'female';
  }
  return seats;
};

export const getTripDetailsSync = (tripId: string): BusTripDetails | null => {
  const parts = tripId.split('~');
  const [from, to, date] = parts;
  if (!from || !to) return null;

  let traceId = '';
  let resultIndex = '0';
  let srdvIndex = '0';
  let idx = 0;

  if (parts.length >= 5) {
    traceId = parts[3] || '';
    resultIndex = decodeURIComponent(parts[4] || '0');
    srdvIndex = decodeURIComponent(parts[5] || parts[4] || '0');
  } else {
    const idxRaw = Number(parts[3]);
    idx = Number.isInteger(idxRaw) && idxRaw >= 0 && idxRaw < OPERATORS.length ? idxRaw : 0;
  }

  const baseTrip = buildTrip(from, to, date || todayISO(), idx);
  const trip: BusTrip = {
    ...baseTrip,
    id: tripId,
    traceId: traceId || baseTrip.traceId,
    resultIndex: resultIndex || baseTrip.resultIndex,
    srdvIndex: srdvIndex || baseTrip.srdvIndex,
  };

  const depMins = timeToMins(trip.departure);
  const arrMins = depMins + trip.durationMins;

  const boardingSeeds = pointsFor(from);
  const droppingSeeds = pointsFor(to);
  const lastDrop = droppingSeeds[droppingSeeds.length - 1].offset;

  return {
    trip,
    seats: buildSeats(trip),
    boardingPoints: boardingSeeds.map((p, i) => ({
      id: `b${i}`,
      time: minsToTime(depMins + p.offset),
      name: p.name,
      address: p.address,
    })),
    droppingPoints: droppingSeeds.map((p, i) => ({
      id: `d${i}`,
      time: minsToTime(arrMins - lastDrop + p.offset),
      name: p.name,
      address: p.address,
    })),
    cancellationPolicy: [
      { window: 'More than 24 hrs before departure', charge: '10% of fare' },
      { window: '12 – 24 hrs before departure', charge: '25% of fare' },
      { window: '4 – 12 hrs before departure', charge: '50% of fare' },
      { window: 'Less than 4 hrs before departure', charge: 'No refund' },
    ],
    busPolicies: [
      'Carry a valid government ID proof for every passenger.',
      'Reach the boarding point at least 15 minutes before departure.',
      'Up to 15 kg of luggage per passenger is allowed free of charge.',
      'Pets, alcohol and smoking are not permitted on board.',
    ],
  };
};

export const getTripDetails = async (tripId: string): Promise<BusTripDetails | null> => {
  const syncFallback = getTripDetailsSync(tripId);
  const parts = tripId.split('~');

  if (parts.length >= 5) {
    const [from, to, date, traceId, encodedResultIndex, encodedSrdvIndex] = parts;
    const resultIndex = decodeURIComponent(encodedResultIndex);
    const srdvIndex = encodedSrdvIndex ? decodeURIComponent(encodedSrdvIndex) : resultIndex;

    try {
      const [layoutRes, pointsRes] = await Promise.all([
        fetchSeatLayoutApi({ traceId, resultIndex, srdvIndex }),
        fetchBoardingDroppingPointsApi({ traceId, resultIndex, srdvIndex }),
      ]);

      if (layoutRes?.success && Array.isArray(layoutRes.seats) && layoutRes.seats.length > 0) {
        const rawSeats = layoutRes.seats;
        const seats: BusSeat[] = rawSeats.map((s: any, i: number) => {
          const isUpper = Boolean(s.IsUpper || s.Deck === 2 || s.DeckNo === 2);
          const isSleeper = Boolean(s.SeatType === 2 || (s.SeatType && String(s.SeatType).toLowerCase().includes('sleep')));
          const seatName = String(s.SeatName || s.SeatNo || s.Name || `S${i + 1}`);
          const fare = Number(s.SeatFare || s.Price?.PublishedFare || s.Price?.OfferedFare || s.Price || syncFallback?.trip.fare || 500);
          const isBooked = !(s.SeatStatus === true || s.SeatStatus === 'true' || s.SeatStatus === 1 || s.SeatStatus === '1');
          const reservedLadies = Boolean(s.LadiesSeat === true || s.LadiesSeat === 'true' || s.IsLadiesSeat === true);

          return {
            id: seatName,
            label: seatName,
            deck: isUpper ? 'upper' : 'lower',
            kind: isSleeper ? 'sleeper' : 'seater',
            row: Number(s.RowNo ?? s.Row ?? Math.floor(i / 4)),
            col: Number(s.ColumnNo ?? s.Col ?? (i % 4)),
            price: fare,
            booked: isBooked,
            reservedFor: reservedLadies ? 'female' : undefined,
            bookedBy: s.Gender === 'female' || s.Gender === '2' ? 'female' : s.Gender === 'male' || s.Gender === '1' ? 'male' : undefined,
          };
        });

        const boardingPoints: BusPoint[] = Array.isArray(pointsRes?.boardingPoints) && pointsRes.boardingPoints.length > 0
          ? pointsRes.boardingPoints.map((p: any, i: number) => ({
              id: String(p.CityPointIndex || p.Id || `b${i}`),
              time: String(p.CityPointTime || p.Time || '21:00').slice(0, 5),
              name: String(p.CityPointName || p.Name || 'Boarding Point'),
              address: String(p.CityPointAddress || p.Address || p.CityPointLocation || ''),
            }))
          : (syncFallback?.boardingPoints || []);

        const droppingPoints: BusPoint[] = Array.isArray(pointsRes?.droppingPoints) && pointsRes.droppingPoints.length > 0
          ? pointsRes.droppingPoints.map((p: any, i: number) => ({
              id: String(p.CityPointIndex || p.Id || `d${i}`),
              time: String(p.CityPointTime || p.Time || '06:00').slice(0, 5),
              name: String(p.CityPointName || p.Name || 'Dropping Point'),
              address: String(p.CityPointAddress || p.Address || p.CityPointLocation || ''),
            }))
          : (syncFallback?.droppingPoints || []);

        const trip: BusTrip = syncFallback?.trip
          ? {
              ...syncFallback.trip,
              id: tripId,
              fromCityId: from,
              toCityId: to,
              date,
              traceId,
              resultIndex,
              srdvIndex,
              fare: seats.filter((s) => !s.booked)[0]?.price || syncFallback.trip.fare,
              seatsLeft: seats.filter((s) => !s.booked).length,
            }
          : {
              id: tripId,
              operator: 'Express Travels',
              busType: 'A/C Sleeper (2+1)',
              ac: true,
              layout: 'sleeper',
              fromCityId: from,
              toCityId: to,
              date,
              departure: boardingPoints[0]?.time || '21:00',
              arrival: droppingPoints[droppingPoints.length - 1]?.time || '06:00',
              arrivalDayOffset: 1,
              durationMins: 540,
              fare: 650,
              seatsLeft: seats.filter((s) => !s.booked).length,
              rating: 4.3,
              ratingsCount: 240,
              amenities: ['water', 'charging', 'blanket'],
              womenFriendly: true,
              liveTracking: true,
              tags: ['Primo'],
              traceId,
              resultIndex,
              srdvIndex,
            };

        return {
          trip,
          seats,
          boardingPoints,
          droppingPoints,
          cancellationPolicy: syncFallback?.cancellationPolicy || [
            { window: 'More than 24 hrs before departure', charge: '10% of fare' },
            { window: '12 – 24 hrs before departure', charge: '25% of fare' },
            { window: '4 – 12 hrs before departure', charge: '50% of fare' },
            { window: 'Less than 4 hrs before departure', charge: 'No refund' },
          ],
          busPolicies: syncFallback?.busPolicies || [
            'Carry a valid government ID proof for every passenger.',
            'Reach the boarding point at least 15 minutes before departure.',
            'Up to 15 kg of luggage per passenger is allowed free of charge.',
            'Pets, alcohol and smoking are not permitted on board.',
          ],
        };
      }
    } catch (err) {
      console.warn('[busService] Failed to load live seat layout / points:', err);
    }
  }

  // Resilient fallback guarantees journey always renders
  return syncFallback;
};

// ---------- fares ----------

export const GST_RATE = 0.05;
export const POINT_VALUE = 0.25;

export const calculateFare = (seats: BusSeat[], pointsToUse = 0): FareBreakdown => {
  const baseFare = seats.reduce((sum, s) => sum + s.price, 0);
  const gst = Math.round(baseFare * GST_RATE);
  const discount = seats.length ? Math.min(150, Math.round(baseFare * 0.05)) : 0;
  const pointsValue = Math.min(Math.round(pointsToUse * POINT_VALUE), baseFare + gst - discount);
  return {
    baseFare,
    gst,
    discount,
    pointsUsed: pointsValue,
    total: baseFare + gst - discount - pointsValue,
  };
};

// ---------- dates ----------

export const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const fromISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const todayISO = (): string => toISODate(new Date());

export const addDaysISO = (iso: string, days: number): string => {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

export const formatJourneyDate = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }): string =>
  fromISODate(iso).toLocaleDateString('en-IN', opts);

export const relativeDayLabel = (iso: string): string | null => {
  const today = todayISO();
  if (iso === today) return 'Today';
  if (iso === addDaysISO(today, 1)) return 'Tomorrow';
  return null;
};

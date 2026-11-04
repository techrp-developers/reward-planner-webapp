// src/api/busApi.ts
// Bus Booking API layer connected to Reward Planners Backend
import api from './client';
import { ENDPOINTS } from './endpoints';

export interface BusCityDto {
  id: string;
  city_code: string;
  city_name: string;
  district_name?: string | null;
  state_name?: string | null;
  state_code?: string | null;
  country_name?: string | null;
  country_code?: string | null;
  city_type?: string;
}

export interface SearchBusesPayload {
  sourceCityCode: string | number;
  destinationCityCode: string | number;
  journeyDate: string; // YYYY-MM-DD
  journeyTime?: string; // HH:mm
}

export interface SeatLayoutPayload {
  traceId: string | number;
  resultIndex: string;
  srdvIndex?: string | number;
  boardingPointId?: string;
  droppingPointId?: string;
}

export interface BoardingDroppingPayload {
  traceId: string | number;
  resultIndex: string;
  srdvIndex?: string | number;
}

export interface BlockBusPassengerDto {
  Title: string; // Mr, Mrs, Ms, Miss
  FirstName: string;
  LastName: string;
  Gender: '1' | '2'; // 1: Male, 2: Female
  Age: number;
  Email: string;
  PhoneNo: string;
  Address: string;
  SeatName: string;
  LeadPassenger: boolean;
  IdType?: string;
  IdNumber?: string;
  GSTNumber?: string;
  GSTCompanyName?: string;
  GSTCompanyAddress?: string;
  GSTCompanyEmail?: string;
}

export interface BlockBusSeatPayload {
  traceId: string | number;
  resultIndex: string;
  srdvIndex?: string | number;
  boardingPointId: string;
  droppingPointId: string;
  refId: string;
  passengers: BlockBusPassengerDto[];
  sourceCity?: string;
  destinationCity?: string;
}

export interface VerifyBusPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface CancelBusTicketPayload {
  order_ref: string;
  seatNames: string | string[];
  remarks: string;
}

// 1. Fetch cities
export const fetchBusCities = async (query?: string): Promise<BusCityDto[]> => {
  try {
    const res = await api.get(ENDPOINTS.bus.cities, {
      params: query && query.trim() ? { q: query.trim() } : undefined,
    });
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (err) {
    console.warn('[BusApi] Failed to fetch cities:', err);
    return [];
  }
};

// 2. Fetch popular routes
export const fetchPopularBusRoutes = async () => {
  try {
    const res = await api.get(ENDPOINTS.bus.popularRoutes);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (err) {
    console.warn('[BusApi] Failed to fetch popular routes:', err);
    return [];
  }
};

// 3. Search buses
export const searchBusesApi = async (payload: SearchBusesPayload) => {
  try {
    const res = await api.post(ENDPOINTS.bus.search, {
      sourceCityCode: Number(payload.sourceCityCode),
      destinationCityCode: Number(payload.destinationCityCode),
      journeyDate: payload.journeyDate,
      journeyTime: payload.journeyTime || '00:00',
    });
    return res.data;
  } catch (err: any) {
    console.error('[BusApi] Search failed:', err?.response?.data || err?.message);
    throw err?.response?.data || err;
  }
};

// In-flight deduplication and short-term caching to prevent ErrorCode 7014
const inFlightApi = new Map<string, Promise<any>>();
const cacheApi = new Map<string, { timestamp: number; data: any }>();
const API_CACHE_TTL = 3 * 60 * 1000;

// 4. Get seat layout
export const fetchSeatLayoutApi = async (payload: SeatLayoutPayload) => {
  const traceId = payload.traceId != null ? String(payload.traceId).trim() : '';
  const resultIndex = String(payload.resultIndex).trim();
  const srdvIndex = String(payload.srdvIndex || payload.resultIndex).trim();
  const cacheKey = `layout:${traceId}:${resultIndex}:${payload.boardingPointId || ''}:${payload.droppingPointId || ''}`;

  const cached = cacheApi.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < API_CACHE_TTL) {
    return cached.data;
  }

  const inFlight = inFlightApi.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const p = (async () => {
    try {
      const res = await api.post(ENDPOINTS.bus.seatLayout, {
        traceId,
        resultIndex,
        srdvIndex,
        ...(payload.boardingPointId ? { boardingPointId: String(payload.boardingPointId) } : {}),
        ...(payload.droppingPointId ? { droppingPointId: String(payload.droppingPointId) } : {}),
      });
      cacheApi.set(cacheKey, { timestamp: Date.now(), data: res.data });
      return res.data;
    } catch (err: any) {
      console.error('[BusApi] Seat layout failed:', err?.response?.data || err?.message);
      throw err?.response?.data || err;
    } finally {
      inFlightApi.delete(cacheKey);
    }
  })();

  inFlightApi.set(cacheKey, p);
  return p;
};

// 5. Get boarding / dropping points
export const fetchBoardingDroppingPointsApi = async (payload: BoardingDroppingPayload) => {
  const traceId = payload.traceId != null ? String(payload.traceId).trim() : '';
  const resultIndex = String(payload.resultIndex).trim();
  const srdvIndex = String(payload.srdvIndex || payload.resultIndex).trim();
  const cacheKey = `points:${traceId}:${resultIndex}`;

  const cached = cacheApi.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < API_CACHE_TTL) {
    return cached.data;
  }

  const inFlight = inFlightApi.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const p = (async () => {
    try {
      const res = await api.post(ENDPOINTS.bus.boardingDroppingPoints, {
        traceId,
        resultIndex,
        srdvIndex,
      });
      cacheApi.set(cacheKey, { timestamp: Date.now(), data: res.data });
      return res.data;
    } catch (err: any) {
      console.error('[BusApi] Boarding/dropping points failed:', err?.response?.data || err?.message);
      throw err?.response?.data || err;
    } finally {
      inFlightApi.delete(cacheKey);
    }
  })();

  inFlightApi.set(cacheKey, p);
  return p;
};

// 6. Block seat
export const blockBusSeatApi = async (payload: BlockBusSeatPayload) => {
  try {
    const res = await api.post(ENDPOINTS.bus.block, {
      ...payload,
      srdvIndex: String(payload.srdvIndex || payload.resultIndex).trim(),
    });
    return res.data;
  } catch (err: any) {
    console.error('[BusApi] Block seat failed:', err?.response?.data || err?.message);
    throw err?.response?.data || err;
  }
};

// 7. Create Razorpay order
export const createBusPaymentOrderApi = async (orderRef: string | { order_ref?: string; orderRef?: string }) => {
  const ref = typeof orderRef === 'string' ? orderRef : (orderRef?.order_ref || orderRef?.orderRef || '');
  try {
    const res = await api.post(ENDPOINTS.bus.createOrder, { order_ref: ref });
    return res.data;
  } catch (err: any) {
    console.error('[BusApi] Create payment order failed:', err?.response?.data || err?.message);
    throw err?.response?.data || err;
  }
};

// 8. Verify Razorpay payment
export const verifyBusPaymentApi = async (payload: VerifyBusPaymentPayload) => {
  try {
    const res = await api.post(ENDPOINTS.bus.verifyPayment, payload);
    return res.data;
  } catch (err: any) {
    console.error('[BusApi] Verify payment failed:', err?.response?.data || err?.message);
    throw err?.response?.data || err;
  }
};

// 9. Book ticket (final provider book)
export const bookBusTicketApi = async (
  payload: string | { orderRef?: string; order_ref?: string; traceId?: string | number; srdvIndex?: string | number; resultIndex?: string }
) => {
  const body = typeof payload === 'string'
    ? { order_ref: payload, orderRef: payload }
    : {
        order_ref: payload.order_ref || payload.orderRef,
        orderRef: payload.order_ref || payload.orderRef,
        ...(payload.traceId ? { traceId: String(payload.traceId) } : {}),
        ...(payload.srdvIndex ? { srdvIndex: String(payload.srdvIndex) } : {}),
        ...(payload.resultIndex ? { resultIndex: String(payload.resultIndex) } : {}),
      };
  try {
    const res = await api.post(ENDPOINTS.bus.book, body);
    return res.data;
  } catch (err: any) {
    console.error('[BusApi] Final book failed:', err?.response?.data || err?.message);
    throw err?.response?.data || err;
  }
};

// 10. Get customer bookings
export const fetchMyBusBookingsApi = async (params: { page?: number; limit?: number } = {}) => {
  try {
    const res = await api.get(ENDPOINTS.bus.orders, { params });
    return res.data;
  } catch (err: any) {
    console.error('[BusApi] List bookings failed:', err?.response?.data || err?.message);
    throw err?.response?.data || err;
  }
};

// 11. Get booking detail
export const fetchBusBookingDetailApi = async (orderRef: string) => {
  try {
    const res = await api.get(ENDPOINTS.bus.orderDetail(orderRef));
    return res.data;
  } catch (err: any) {
    console.error('[BusApi] Booking detail failed:', err?.response?.data || err?.message);
    throw err?.response?.data || err;
  }
};

// 12. Cancel ticket
export const cancelBusTicketApi = async (payload: CancelBusTicketPayload) => {
  try {
    const res = await api.post(ENDPOINTS.bus.cancel, payload);
    return res.data;
  } catch (err: any) {
    console.error('[BusApi] Cancel ticket failed:', err?.response?.data || err?.message);
    throw err?.response?.data || err;
  }
};

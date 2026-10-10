import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export type CreateFirebaseEnquiryPayload = {
  service_id: number;
  variant_id: number;
  name: string;
  city?: string;
  mobile: string;
  email: string;
  enquiry_data: Record<string, unknown>;
};

export type CreateFirebaseEnquiryResponse = {
  success: true;
  id: string;
};

export type InsuranceLeadType = 'health' | 'supertopup' | 'personal_accident';

export type FirebaseInsuranceLead = {
  id: string;
  service_id: number;
  insuranceType: InsuranceLeadType;
  variant_id: number;
  name: string;
  city?: string;
  mobile: string;
  email: string;
  enquiry_data: Record<string, unknown>;
  createdAt?: import('firebase/firestore').Timestamp;
};

const INSURANCE_SERVICE_MAP: Record<number, InsuranceLeadType> = {
  1: 'health',
  2: 'supertopup',
  3: 'personal_accident',
};

const toInsuranceLead = (id: string, raw: Record<string, unknown>): FirebaseInsuranceLead | null => {
  const serviceId = Number(raw?.service_id);
  const insuranceType = INSURANCE_SERVICE_MAP[serviceId];
  if (!insuranceType) return null;

  return {
    id,
    service_id: serviceId,
    insuranceType,
    variant_id: Number(raw?.variant_id || 0),
    name: String(raw?.name || ''),
    city: typeof raw.city === 'string' ? raw.city : undefined,
    mobile: String(raw?.mobile || ''),
    email: String(raw?.email || ''),
    enquiry_data: (raw?.enquiry_data || {}) as Record<string, unknown>,
    createdAt: raw.createdAt as import('firebase/firestore').Timestamp | undefined,
  };
};

export const createFirebaseEnquiry = async (
  payload: CreateFirebaseEnquiryPayload,
  idempotencyKey?: string,
): Promise<CreateFirebaseEnquiryResponse> => {
  try {
    const enquiry = { ...payload, createdAt: serverTimestamp() };
    const docRef = idempotencyKey
      ? doc(collection(db, 'service_enquiries'), `insurance_${payload.service_id}_${idempotencyKey}`)
      : null;
    // Replace each supplied top-level field, including the whole enquiry_data map,
    // so editing members does not leave removed children in a retried record.
    if (docRef) await setDoc(docRef, enquiry, { mergeFields: Object.keys(enquiry) });
    const createdRef = docRef || await addDoc(collection(db, 'service_enquiries'), enquiry);

    if (import.meta.env.DEV) console.log('Firebase enquiry saved:', {
      id: createdRef.id,
      service_id: payload.service_id,
    });

    return {
      success: true,
      id: createdRef.id,
    };
  } catch (error) {
    console.error('❌ Firebase Error:', error);
    throw error;
  }
};

/**
 * Fetch only insurance leads from Firebase service_enquiries collection.
 * Includes: health (1), supertopup (2), personal_accident (3)
 */
export const getFirebaseInsuranceLeads = async (
  max = 100,
): Promise<FirebaseInsuranceLead[]> => {
  try {
    const insuranceServiceIds = [1, 2, 3];

    const q = query(
      collection(db, 'service_enquiries'),
      where('service_id', 'in', insuranceServiceIds),
      orderBy('createdAt', 'desc'),
      limit(max),
    );

    const snap = await getDocs(q);
    const leads = snap.docs
      .map((doc) => toInsuranceLead(doc.id, doc.data()))
      .filter((lead): lead is FirebaseInsuranceLead => lead !== null);

    if (import.meta.env.DEV) console.log(`Firebase insurance leads fetched: ${leads.length}`);
    return leads;
  } catch (error: unknown) {
    // Fallback path when composite index is not ready.
    if (String(error instanceof Error ? error.message : '').toLowerCase().includes('index')) {
      try {
        const fallbackQ = query(
          collection(db, 'service_enquiries'),
          where('service_id', 'in', [1, 2, 3]),
          limit(max),
        );

        const fallbackSnap = await getDocs(fallbackQ);
        const leads = fallbackSnap.docs
          .map((doc) => toInsuranceLead(doc.id, doc.data()))
          .filter((lead): lead is FirebaseInsuranceLead => lead !== null)
          .sort((a, b) => {
            const aMs = a.createdAt?.toMillis?.() || 0;
            const bMs = b.createdAt?.toMillis?.() || 0;
            return bMs - aMs;
          });

        if (import.meta.env.DEV) console.log(`Firebase insurance leads fetched (fallback): ${leads.length}`);
        return leads;
      } catch (fallbackError) {
        console.error('❌ Firebase Insurance Leads fallback error:', fallbackError);
        throw fallbackError;
      }
    }

    console.error('❌ Firebase Insurance Leads fetch error:', error);
    throw error;
  }
};



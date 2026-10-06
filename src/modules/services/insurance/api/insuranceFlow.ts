import { createFirebaseEnquiry } from './FirebaseService';
import { buildHealthEnquiryData, buildPersonalAccidentEnquiryData, buildSuperTopupEnquiryData } from './enquiryPayloadBuilders';
import { completeInsurance, getQuotes, saveStep } from './InsuranceCrmApi';
import { getAllPAPremiums, getAllPremiums, getAllSuperTopUpPremiums } from './PolicyPlannerApi';
import { mapBasicDetails, mapHealthCoverage, mapMembersAges, mapPaDetails, mapSuperTopupCoverage, normalizeQuotesForUi } from '../insurancePayloadMappers';
import type { InsuranceFormData, InsurancePageType, QuoteResponse } from '../types/insurance.types';
import { getAgeFromDateOfBirth, getCategoryFromNatureOfWork } from '../utils/insuranceUtils';
import { buildFamilyPremiumPayload, getInsuranceError } from '../utils/insuranceValidation';
import { SUPER_TOPUP_DEDUCTIBLE } from '../constant/InsuranceConstants';

// Keep sequencing and persistence outside the presentation component.
export async function submitInsuranceQuote(form: InsuranceFormData, type: InsurancePageType, coverAmount: number, onProgress: (message: string) => void) {
  const enquiryId = Number(form.details.enquiryId);
  if (!Number.isInteger(enquiryId) || enquiryId <= 0) throw new Error('Your enquiry has expired. Start again from the first step.');
  const members = mapMembersAges(form);
  if (!members.length || members.some((member) => !Number.isInteger(member.age) || member.age < 1 || member.age > 100)) {
    throw new Error('Enter a valid age for every insured member before requesting quotes.');
  }
  // The CRM completion contract reads the `members` section, not `members_ages`.
  // Re-save the snapshot so retries repair enquiries created by the earlier web flow.
  onProgress('Saving insured members...');
  await saveStep(enquiryId, 2, 'members', members);
  onProgress('Saving your insurance details...');
  await saveStep(enquiryId, 3, 'basic', mapBasicDetails(form));
  if (type === 'health') await saveStep(enquiryId, 4, 'health', mapHealthCoverage(coverAmount));
  else if (type === 'supertopup') await saveStep(enquiryId, 4, 'super_topup', mapSuperTopupCoverage(coverAmount, Number(form.details.deductible) || SUPER_TOPUP_DEDUCTIBLE));
  else await saveStep(enquiryId, 4, 'personal_accident', mapPaDetails(form, coverAmount, getCategoryFromNatureOfWork(form.details.natureOfWork) || undefined));

  // Write a deterministic record even when the insurer returns no plans. Retrying updates it.
  let notice = '';
  onProgress('Saving your enquiry...');
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      createFirebaseEnquiry({
        service_id: type === 'health' ? 1 : type === 'supertopup' ? 2 : 3, variant_id: 1,
        name: `${form.details.firstName || ''} ${form.details.lastName || ''}`.trim(),
        city: form.details.city, mobile: form.details.mobileNumber || '', email: '',
        enquiry_data: type === 'health' ? buildHealthEnquiryData(form, coverAmount) : type === 'supertopup' ? buildSuperTopupEnquiryData(form, coverAmount) : buildPersonalAccidentEnquiryData(form, coverAmount),
      }, String(enquiryId)),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Enquiry storage timed out.')), 12000); }),
    ]);
  } catch (error) {
    notice = `Your CRM enquiry is retained, but the Firebase record could not be confirmed. ${getInsuranceError(error)}`;
  } finally { clearTimeout(timer); }

  onProgress('Completing your insurance application...');
  await completeInsurance(enquiryId);
  onProgress('Finding available plans...');
  let quotes: QuoteResponse[] = [];
  let premiumError: unknown;
  try {
    const results = type === 'health' ? await getAllPremiums(buildFamilyPremiumPayload(form, coverAmount))
      : type === 'supertopup' ? await getAllSuperTopUpPremiums({ ...buildFamilyPremiumPayload(form, coverAmount), deductible: Number(form.details.deductible) || SUPER_TOPUP_DEDUCTIBLE })
      : await getAllPAPremiums({ coverAmount, category: getCategoryFromNatureOfWork(form.details.natureOfWork)!, age: getAgeFromDateOfBirth(form.details.dob || '')! });
    quotes = normalizeQuotesForUi(results);
  } catch (error) { premiumError = error; }
  if (!quotes.some((quote) => quote.success)) {
    onProgress('Checking CRM quote availability...');
    try {
      const crmQuotes = normalizeQuotesForUi(await getQuotes(enquiryId));
      if (crmQuotes.length) quotes = crmQuotes;
      if (premiumError) notice = [notice, 'Direct insurer quotes could not be reached; CRM quote availability was checked.'].filter(Boolean).join(' ');
    } catch (error) {
      if (!quotes.length) throw new Error([premiumError ? getInsuranceError(premiumError) : '', getInsuranceError(error, 'CRM quotes are unavailable.')].filter(Boolean).join(' '));
      notice = [notice, getInsuranceError(error, 'CRM quotes are unavailable.')].filter(Boolean).join(' ');
    }
  }
  return { quotes, notice };
}

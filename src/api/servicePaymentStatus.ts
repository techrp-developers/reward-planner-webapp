export function isServicePaymentVerified(response: any): boolean {
  const data = response?.data && typeof response.data === 'object' ? response.data : response;
  if (response?.success === false || response?.verified === false || data?.success === false || data?.verified === false) return false;
  const status = String(data?.payment_status ?? response?.payment_status ?? data?.status ?? response?.status ?? '').toLowerCase();
  if (status) return ['paid', 'captured', 'success', 'verified'].includes(status);
  return response?.success === true || response?.verified === true || data?.verified === true;
}

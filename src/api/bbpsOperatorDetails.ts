export type BbpsOperatorField = {
  param_name: string;
  param_label: string;
  param_type: string;
  param_id?: string;
  regex?: string;
  error_message?: string;
  logo_url?: string | null;
  logo_alt?: string | null;
};

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};

export function normalizeBbpsOperatorDetails(response: unknown, operatorId: string | number) {
  const root = record(response);
  // The API normally returns metadata beside a data ARRAY, not inside it.
  const nested = record(root.data);
  const metadata = { ...root, ...nested };
  const fields = Array.isArray(root.data) ? root.data : Array.isArray(nested.data) ? nested.data : [];
  return {
    operator_name: typeof metadata.operator_name === 'string' ? metadata.operator_name : '',
    operator_id: metadata.operator_id ?? operatorId,
    fetchBill: Number(metadata.fetchBill ?? 1),
    BBPS: Number(metadata.BBPS ?? 1),
    data: fields.flatMap((value): BbpsOperatorField[] => {
      const field = record(value);
      if (typeof field.param_name !== 'string' || !field.param_name.trim()) return [];
      return [{
        param_name: field.param_name,
        param_label: typeof field.param_label === 'string' ? field.param_label : field.param_name,
        param_type: typeof field.param_type === 'string' ? field.param_type : 'AlphaNumeric',
        param_id: field.param_id == null ? undefined : String(field.param_id),
        regex: typeof field.regex === 'string' ? field.regex : undefined,
        error_message: typeof field.error_message === 'string' ? field.error_message : undefined,
        logo_url: typeof field.logo_url === 'string' ? field.logo_url : null,
        logo_alt: typeof field.logo_alt === 'string' ? field.logo_alt : null,
      }];
    }),
  };
}

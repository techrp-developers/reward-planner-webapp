export type ServiceVariant = { id?: string | number; title?: string; variant_name?: string; price?: string | number; original_price?: string | number };
export type ServiceDocument = { id?: string | number; name: string; iconType: string };
export type ServiceFaqItem = { question: string; answer: string };
export type ServiceEnquiryField = { field_name: string; label: string; is_required?: boolean | number; field_type?: string; placeholder?: string; options?: string[] };
export type ServiceActionProps = {
  hideAddToCart: boolean;
  handleAddToCart: () => void | Promise<void>;
  addingToCart: boolean;
  insuranceQuotePath?: string | null;
  navigate: (path: string) => void;
  handleBuyNow: () => void;
  primaryCtaLabel: string;
};

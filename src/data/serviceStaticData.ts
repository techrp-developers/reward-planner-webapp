// src/data/serviceStaticData.ts
// Comprehensive fallback data and metadata for the 5 key services matching the UI mockups

export interface ServiceVariant {
  id: number;
  service_id?: number;
  title: string;
  price: string;
  original_price: string;
  savings_text?: string;
  is_popular?: boolean;
  features?: string[];
  details?: string[];
  short_description?: string;
  journey?: Array<{ title?: string; content: Array<string | [string, string]> }>;
  trust_stats?: string[];
  image_url?: string;
}

export interface OverviewItem {
  id: number;
  text: string;
  iconType: 'guide' | 'eligibility' | 'schedule' | 'tracking' | 'delivery' | 'thumb' | 'speed' | 'support' | string;
}

export interface JourneyStep {
  step: string;
  title: string;
  desc: string;
  color: 'purple' | 'blue' | 'teal' | 'orange' | string;
  iconType: 'edit' | 'document' | 'calendar' | 'truck' | string;
}

export interface TrustStat {
  value: string;
  label: string;
  color: 'purple' | 'blue' | 'teal' | string;
  iconType: 'badge' | 'percent' | 'clock' | string;
}

export interface RequiredDocument {
  id: number;
  name: string;
  step: string;
  iconType: 'id_card' | 'photo' | 'document' | string;
  is_mandatory: boolean | number;
  subtext?: string;
}

export interface EnquiryField {
  field_name: string;
  label: string;
  field_type: 'text' | 'tel' | 'email' | 'textarea' | string;
  placeholder?: string;
  is_required: boolean;
  options?: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ServiceEntity {
  id: number;
  category_id?: number;
  category_name?: string;
  name: string;
  description: string;
  price: string;
  original_price: string;
  estimated_days?: number;
  rating?: number;
  review_count?: number;
  hero_image?: string;
  service_image?: string;
  form_title?: string;
  form_subtitle?: string;
  cta_text?: string;
  is_insurance_wizard?: boolean;
}

export interface StaticServiceItem {
  service: ServiceEntity;
  variants: ServiceVariant[];
  overview: OverviewItem[];
  journey: JourneyStep[];
  trust_stats: TrustStat[];
  documents: RequiredDocument[];
  enquiry_fields: EnquiryField[];
  faqs: FAQItem[];
  safety?: any;
}

export const SERVICE_SLUG_MAP: Record<string, number> = {
  'four-wheeler-driving-licence': 4,
  'four-wheeler-license': 4,
  '4-wheeler': 4,
  'two-wheeler-driving-licence': 3,
  'two-wheeler-license': 3,
  '2-wheeler': 3,
  'domicile-certificate': 7,
  'domicile': 7,
  'rent-agreement': 9,
  'rent-agreement-services': 9,
  'pan-card': 1,
  'pan-card-services': 1,
  'pan': 1,
  'health-insurance': 12,
  'health': 12,
  'mediclaim': 12,
};

export const resolveServiceId = (param: string | number | undefined): number => {
  if (!param) return 1;
  const num = Number(param);
  if (!isNaN(num) && num > 0) return num;
  const normalized = String(param).toLowerCase().trim();
  return SERVICE_SLUG_MAP[normalized] || 1;
};

export const STATIC_SERVICES_DATA: Record<number, StaticServiceItem> = {
  // 1. FOUR-WHEELER DRIVING LICENSE (ID: 4)
  4: {
    service: {
      id: 4,
      category_id: 3,
      category_name: 'Government Documents',
      name: 'Four-Wheeler Driving Licence',
      description:
        'Get your car driving license without confusion. We guide you through form-filling, online slot & offline RTO assistance.',
      price: '4000.00',
      original_price: '4500.00',
      estimated_days: 6,
      rating: 4.8,
      review_count: 1420,
      hero_image: 'https://cdn.rewardplanners.com/public/services/4/service-1778821578327-thy9v6.png',
      form_title: 'Apply for 4-Wheeler Request',
      form_subtitle: 'Please fill out this form below and our team will get in touch with you shortly.',
    },
    variants: [
      {
        id: 401,
        title: 'Four-Wheeler Driving Licence',
        price: '4000.00',
        original_price: '4500.00',
        short_description:
          'Get your car driving license without confusion. We guide you through form-filling, online slot & offline RTO assistance.',
      },
    ],
    overview: [
      { id: 1, text: 'Step-by-step guidance flow', iconType: 'guide' },
      { id: 2, text: 'Smart eligibility check (age & docs)', iconType: 'eligibility' },
      { id: 3, text: 'Online slot & RTO scheduling', iconType: 'schedule' },
      { id: 4, text: 'Status tracking at every stage', iconType: 'tracking' },
      { id: 5, text: 'Physical DL license delivery', iconType: 'delivery' },
    ],
    journey: [
      {
        step: '01',
        title: 'Tell us your details',
        desc: 'Choose the service you need & share basic info',
        color: 'purple',
        iconType: 'edit',
      },
      {
        step: '02',
        title: 'We prepare & submit',
        desc: 'Our team fills the application, verifies documents, and submits it correctly',
        color: 'blue',
        iconType: 'document',
      },
      {
        step: '03',
        title: 'Slot booking & guidance',
        desc: 'Schedule DL test/biometric and send acknowledgment & checklist',
        color: 'teal',
        iconType: 'calendar',
      },
      {
        step: '04',
        title: 'License Issued & Delivered',
        desc: 'The driving license is approved and delivered to you via India Post/RTO',
        color: 'orange',
        iconType: 'truck',
      },
    ],
    trust_stats: [
      { value: '15,000+', label: 'Licences Processed', iconType: 'badge', color: 'purple' },
      { value: '97%', label: 'Approval Rate', iconType: 'percent', color: 'blue' },
      { value: '5+ Years', label: 'RTO Experts Team', iconType: 'clock', color: 'teal' },
    ],
    safety: {
      title: '100% Data Safety',
      text: 'Your personal details are securely handled and used only for service processing as per Govt guidelines.',
    },
    documents: [
      { id: 1, name: 'Aadhaar Card', step: '01', iconType: 'id_card', is_mandatory: 1 },
      { id: 2, name: 'Passport Size Photo', step: '02', iconType: 'photo', is_mandatory: 1 },
    ],
    enquiry_fields: [
      { field_name: 'name', label: 'Name', field_type: 'text', placeholder: 'Enter your name', is_required: true },
      { field_name: 'city', label: 'City', field_type: 'text', placeholder: 'Enter city', is_required: true },
      {
        field_name: 'pincode',
        label: 'Pincode',
        field_type: 'select',
        placeholder: 'Select pincode',
        options: ['400001 (Mumbai South)', '411001 (Pune Central)', '110001 (New Delhi)', '560001 (Bangalore)', '500001 (Hyderabad)', '600001 (Chennai)', 'Other'],
        is_required: true,
      },
      {
        field_name: 'has_learner_license',
        label: 'Do you already have a learner license?',
        field_type: 'select',
        options: ['No, I need a new Learner License first', 'Yes, I have an active Learner License'],
        is_required: false,
      },
      { field_name: 'mobile_number', label: 'Mobile Number', field_type: 'tel', placeholder: 'Enter your mobile No', is_required: true },
      { field_name: 'email_id', label: 'Email ID', field_type: 'email', placeholder: 'Enter your Email ID', is_required: true },
      { field_name: 'additional_notes', label: 'Additional Notes (optional)', field_type: 'textarea', placeholder: 'Enter additional notes', is_required: false },
    ],
    faqs: [
      { question: 'Who can apply for a four-wheeler license?', answer: 'Any Indian resident who is 18 years or older and holds a valid learner’s license (or applies for both) can apply for a four-wheeler (LMV) driving license.' },
      { question: 'Is a learner license required?', answer: 'Yes, as per Central Motor Vehicles Rules, a learner’s license is mandatory before booking the permanent driving license test.' },
      { question: 'What documents are required?', answer: 'You need Aadhaar Card (address & age proof), passport-sized photographs, and medical certificate (Form 1A if above 40 years).' },
      { question: 'How long does the process take?', answer: 'After successful driving test completion at the RTO, the physical smart card driving license is dispatched via India Post within 7-14 working days.' },
      { question: 'Can I apply online?', answer: 'Yes! Our team manages the entire Parivahan online application, document upload, slot booking, and fee payment on your behalf.' },
    ],
  },

  // 2. TWO-WHEELER DRIVING LICENSE (ID: 3)
  3: {
    service: {
      id: 3,
      category_id: 3,
      category_name: 'Government Documents',
      name: 'Two-Wheeler Driving Licence',
      description:
        'Apply for a new two-wheeler driving license or update your existing one. End-to-end assistance from application to appointment.',
      price: '2500.00',
      original_price: '3000.00',
      estimated_days: 5,
      rating: 4.8,
      review_count: 2150,
      hero_image: 'https://cdn.rewardplanners.com/public/services/3/service-1778821562712-q6blhw.png',
      form_title: 'Apply for 2-Wheeler Request',
      form_subtitle: 'Please fill out this form below and our team will get in touch with you shortly.',
    },
    variants: [
      {
        id: 301,
        title: 'Two-Wheeler Driving Licence',
        price: '2500.00',
        original_price: '3000.00',
        short_description:
          'Apply for a new two-wheeler driving license or update your existing one. End-to-end assistance from application to appointment.',
      },
    ],
    overview: [
      { id: 1, text: 'Step-by-step guidance flow', iconType: 'guide' },
      { id: 2, text: 'Smart eligibility check (age & docs)', iconType: 'eligibility' },
      { id: 3, text: 'Online slot & test scheduling', iconType: 'schedule' },
      { id: 4, text: 'Status tracking at every stage', iconType: 'tracking' },
      { id: 5, text: 'Physical DL license delivery', iconType: 'delivery' },
    ],
    journey: [
      {
        step: '01',
        title: 'Tell us your details',
        desc: 'Choose the service you need & share basic information',
        color: 'purple',
        iconType: 'edit',
      },
      {
        step: '02',
        title: 'We prepare & submit',
        desc: 'Our team fills the application, verifies documents, and submits it correctly',
        color: 'blue',
        iconType: 'document',
      },
      {
        step: '03',
        title: 'Slot booking & guidance',
        desc: 'Schedule DL test/biometric and send acknowledgment & checklist',
        color: 'teal',
        iconType: 'calendar',
      },
      {
        step: '04',
        title: 'License Issued & Delivered',
        desc: 'The driving license is approved and delivered to you via India Post/RTO',
        color: 'orange',
        iconType: 'truck',
      },
    ],
    trust_stats: [
      { value: '18,500+', label: 'Licences Processed', iconType: 'badge', color: 'purple' },
      { value: '97%', label: 'Approval Rate', iconType: 'percent', color: 'blue' },
      { value: '5+ Years', label: 'RTO Experts', iconType: 'clock', color: 'teal' },
    ],
    safety: {
      title: '100% Data Safety',
      text: 'Your personal details are securely handled and used only for service processing as per Govt guidelines.',
    },
    documents: [
      { id: 1, name: 'Age Proof', step: '01', iconType: 'id_card', is_mandatory: 1 },
      { id: 2, name: 'Address Proof (Aadhaar Card)', step: '02', iconType: 'id_card', is_mandatory: 1 },
      { id: 3, name: 'Passport Size Photo', step: '03', iconType: 'photo', is_mandatory: 1 },
    ],
    enquiry_fields: [
      { field_name: 'name', label: 'Name', field_type: 'text', placeholder: 'Enter your name', is_required: true },
      { field_name: 'city', label: 'City', field_type: 'text', placeholder: 'Enter city', is_required: true },
      {
        field_name: 'pincode',
        label: 'Pincode',
        field_type: 'select',
        placeholder: 'Select pincode',
        options: ['400001 (Mumbai)', '411001 (Pune)', '110001 (Delhi)', '560001 (Bangalore)', '500001 (Hyderabad)', '600001 (Chennai)', 'Other'],
        is_required: true,
      },
      {
        field_name: 'has_learner_license',
        label: 'Do you already have a learner’s license?',
        field_type: 'select',
        options: ['No, I need a new Two-Wheeler Learner License', 'Yes, I have a valid Learner License'],
        is_required: false,
      },
      { field_name: 'mobile_number', label: 'Mobile Number', field_type: 'tel', placeholder: 'Enter your mobile No', is_required: true },
      { field_name: 'email_id', label: 'Email ID', field_type: 'email', placeholder: 'Enter your Email ID', is_required: true },
      { field_name: 'additional_notes', label: 'Additional Notes (optional)', field_type: 'textarea', placeholder: 'Enter additional notes', is_required: false },
    ],
    faqs: [
      { question: 'Who can apply for a two-wheeler license?', answer: 'Anyone aged 16+ can apply for motorcycle without gear (up to 50cc) with parent consent, and aged 18+ for motorcycle with gear (MCWG).' },
      { question: 'Is a learner license required?', answer: 'Yes, a Learner’s License must be held for at least 30 days before taking the permanent driving license test.' },
      { question: 'What documents are required?', answer: 'Proof of Identity (Aadhaar/PAN), Proof of Address, Date of Birth proof, and passport size photographs.' },
      { question: 'How long does the process take?', answer: 'From application to test slot booking takes 3-7 days. Smart card delivery takes about 10 days after passing the test.' },
      { question: 'Can I apply online?', answer: 'Yes, our online assistance covers all documentation, Sarathi Parivahan filing, and slot booking.' },
    ],
  },

  // 3. DOMICILE CERTIFICATE (ID: 7)
  7: {
    service: {
      id: 7,
      category_id: 3,
      category_name: 'Government Documents',
      name: 'Domicile Certificate',
      description: 'Get your Domicile Certificate quickly with expert assistance.',
      price: '700.00',
      original_price: '900.00',
      estimated_days: 6,
      rating: 4.8,
      review_count: 520,
      hero_image: 'https://cdn.rewardplanners.com/public/services/7/service-1778821619990-9es5y7.png',
      form_title: 'Apply for Domicile Request',
      form_subtitle: 'Please fill out this form below and our team will get in touch with you shortly.',
    },
    variants: [
      {
        id: 701,
        title: 'Domicile Certificate',
        price: '700.00',
        original_price: '900.00',
        short_description: 'Get your Domicile Certificate quickly with expert assistance.',
      },
    ],
    overview: [
      { id: 1, text: 'Government-approved process', iconType: 'guide' },
      { id: 2, text: 'Fully online application', iconType: 'eligibility' },
      { id: 3, text: 'Document check guaranteed', iconType: 'schedule' },
      { id: 4, text: 'Fast & hassle-free execution', iconType: 'tracking' },
      { id: 5, text: 'Signed certificate delivery', iconType: 'delivery' },
    ],
    journey: [
      {
        step: '01',
        title: 'Tell us what you need',
        desc: 'Select the Domicile service and share details',
        color: 'purple',
        iconType: 'edit',
      },
      {
        step: '02',
        title: 'We prepare & file',
        desc: 'Our team verifies documents and files the application on the official state revenue portal',
        color: 'blue',
        iconType: 'document',
      },
      {
        step: '03',
        title: 'Get your certificate',
        desc: 'Issued after approval with digital signature and official stamp',
        color: 'teal',
        iconType: 'certificate',
      },
    ],
    trust_stats: [
      { value: '15+', label: 'States Covered', iconType: 'badge', color: 'purple' },
      { value: '500+', label: 'Applications Assisted', iconType: 'percent', color: 'blue' },
      { value: '3+ Years', label: 'Govt. Service Expertise', iconType: 'clock', color: 'teal' },
    ],
    safety: {
      title: '100% Data Safety',
      text: 'Your personal details are securely handled and used only for service processing as per Govt guidelines.',
    },
    documents: [
      { id: 1, name: 'Aadhaar Card', step: '01', iconType: 'id_card', is_mandatory: 1 },
      { id: 2, name: 'Passport Size Photo', step: '02', iconType: 'photo', is_mandatory: 1 },
    ],
    enquiry_fields: [
      { field_name: 'name', label: 'Name', field_type: 'text', placeholder: 'Enter your name', is_required: true },
      {
        field_name: 'state_of_residence',
        label: 'State of Residence',
        field_type: 'select',
        placeholder: 'Select State',
        options: [
          'Maharashtra',
          'Delhi',
          'Karnataka',
          'Gujarat',
          'Uttar Pradesh',
          'Rajasthan',
          'Madhya Pradesh',
          'Tamil Nadu',
          'West Bengal',
          'Haryana',
          'Punjab',
          'Other',
        ],
        is_required: true,
      },
      {
        field_name: 'reason_for_domicile',
        label: 'Reason for Domicile Certificate',
        field_type: 'select',
        placeholder: 'Select Reason',
        options: ['Government Job Application', 'College / School Admission', 'Scholarship / Govt. Scheme', 'Property Purchase', 'Other'],
        is_required: true,
      },
      { field_name: 'mobile_number', label: 'Mobile Number', field_type: 'tel', placeholder: 'Enter your mobile No', is_required: true },
      { field_name: 'email_id', label: 'Email ID', field_type: 'email', placeholder: 'Enter your Email ID', is_required: true },
      { field_name: 'additional_notes', label: 'Additional Notes (optional)', field_type: 'textarea', placeholder: 'Enter additional notes', is_required: false },
    ],
    faqs: [
      { question: 'Why is a domicile certificate required?', answer: 'A Domicile Certificate proves that a person has been residing in a particular state or union territory. It is essential for state quotas in education and govt jobs.' },
      { question: 'What is the usual validity period?', answer: 'In most Indian states, a Domicile Certificate has lifetime validity unless the individual relocates permanently to another state.' },
      { question: 'Is this certificate valid across India?', answer: 'Yes, the certificate issued by the competent state authority (Tehsildar/SDM) is legally recognized all over India.' },
      { question: 'What documents are needed?', answer: 'Proof of residence (e.g. ration card, voter ID, electricity bill for 10-15 years), Aadhaar card, and school leaving certificate/birth certificate.' },
      { question: 'How long does the process take?', answer: 'Government revenue departments typically process and issue the digital domicile certificate within 7 to 15 working days.' },
    ],
  },

  // 4. RENT AGREEMENT SERVICES (ID: 9)
  9: {
    service: {
      id: 9,
      category_id: 3,
      category_name: 'Government Documents',
      name: 'Rent Agreement Services',
      description: 'Get your rent agreement online quickly, securely, and seamlessly.',
      price: '1300.00',
      original_price: '1600.00',
      estimated_days: 6,
      rating: 4.7,
      review_count: 1840,
      hero_image: 'https://cdn.rewardplanners.com/public/services/9/service-1778821646585-dcr5uq.png',
      form_title: 'Apply for Agreement Request',
      form_subtitle: 'Please fill out this form below and our team will get in touch with you shortly.',
    },
    variants: [
      {
        id: 901,
        title: 'Rent Agreement Services',
        price: '1300.00',
        original_price: '1600.00',
        short_description: 'Get your rent agreement online quickly, securely, and seamlessly.',
      },
    ],
    overview: [
      { id: 1, text: 'Legally compliant draft agreement drafting', iconType: 'guide' },
      { id: 2, text: 'Customizable template as per tenant-owner mutual needs', iconType: 'eligibility' },
      { id: 3, text: 'Step-by-step registration guidance', iconType: 'schedule' },
      { id: 4, text: 'Biometric verification between parties', iconType: 'tracking' },
      { id: 5, text: 'Soft copy and hardcopy archived delivery', iconType: 'delivery' },
    ],
    journey: [
      {
        step: '01',
        title: 'Tell us your terms',
        desc: 'Property address, rent amount, security deposit, and owner/tenant identity details',
        color: 'purple',
        iconType: 'edit',
      },
      {
        step: '02',
        title: 'We draft the agreement',
        desc: 'Legally vetted draft is prepared with customized covenants and mutual clauses',
        color: 'blue',
        iconType: 'document',
      },
      {
        step: '03',
        title: 'Verification & Signatures',
        desc: 'Aadhaar-based eSign or biometric doorstep verification for registration',
        color: 'teal',
        iconType: 'calendar',
      },
      {
        step: '04',
        title: 'Agreement delivery',
        desc: 'Government registered rent agreement copy delivered via email and physical post',
        color: 'orange',
        iconType: 'truck',
      },
    ],
    trust_stats: [
      { value: '12+', label: 'Top Cities', iconType: 'badge', color: 'purple' },
      { value: '22,000+', label: 'Agreements Registered', iconType: 'percent', color: 'blue' },
      { value: '5+ Years', label: 'Real Estate Legal Exp.', iconType: 'clock', color: 'teal' },
    ],
    safety: {
      title: '100% Data Safety',
      text: 'Your personal details are securely handled and used only for service processing as per Govt guidelines.',
    },
    documents: [
      { id: 1, name: 'Aadhaar Card', step: '01', iconType: 'id_card', is_mandatory: 1 },
      { id: 2, name: 'PAN Card', step: '02', iconType: 'id_card', is_mandatory: 1 },
      { id: 3, name: 'Electricity / Tax Bill', step: '03', iconType: 'document', is_mandatory: 1 },
    ],
    enquiry_fields: [
      { field_name: 'name', label: 'Name', field_type: 'text', placeholder: 'Enter your name', is_required: true },
      { field_name: 'city', label: 'City of the Property', field_type: 'text', placeholder: 'Enter city', is_required: true },
      {
        field_name: 'user_role',
        label: 'Are you the tenant or owner?',
        field_type: 'select',
        placeholder: 'Select role',
        options: ['Tenant', 'Landlord / Owner', 'Agent / Broker'],
        is_required: true,
      },
      {
        field_name: 'agreement_type',
        label: 'Type of Agreement Needed',
        field_type: 'select',
        placeholder: 'Select type',
        options: ['11-Month Residential Agreement', 'Registered Rent Agreement (Biometric)', 'Commercial Lease Agreement', 'Notarized Agreement'],
        is_required: true,
      },
      { field_name: 'mobile_number', label: 'Mobile Number', field_type: 'tel', placeholder: 'Enter your mobile No', is_required: true },
      { field_name: 'email_id', label: 'Email ID', field_type: 'email', placeholder: 'Enter your Email ID', is_required: true },
      { field_name: 'additional_notes', label: 'Additional Notes (optional)', field_type: 'textarea', placeholder: 'Enter additional notes', is_required: false },
    ],
    faqs: [
      { question: 'Why is a rent agreement required?', answer: 'A rent agreement serves as legal proof of tenancy, defines rental obligations, security deposit return terms, and acts as official address proof for tenants.' },
      { question: 'What is the usual validity period?', answer: 'The standard residential rental agreement in India is executed for 11 months with an option for renewal.' },
      { question: 'Is an online rent agreement valid?', answer: 'Yes, digitally registered agreements with eSign or biometric authentication have full legal standing in court as per the Registration Act, 1908.' },
      { question: 'What documents are needed?', answer: 'Aadhaar card and PAN card of both landlord and tenant, along with the electricity bill or index-2 of the rented property.' },
      { question: 'How long does the process take?', answer: 'Drafting is completed within 2 hours. Once both parties complete eSign or biometric verification, the registered copy is available in 24-48 hours.' },
    ],
  },

  // 5. PAN CARD SERVICES (ID: 1)
  1: {
    service: {
      id: 1,
      category_id: 3,
      category_name: 'Government Documents',
      name: 'PAN Card Services',
      description: 'New PAN / Correction / Urgent - Complete assistance from application to delivery.',
      price: '175.00',
      original_price: '300.00',
      estimated_days: 3,
      rating: 4.8,
      review_count: 3120,
      hero_image: 'https://cdn.rewardplanners.com/public/services/1/service-1778823750142-2dwgjc.png',
      form_title: 'Apply for PAN Card Request',
      form_subtitle: 'Please fill out this form below and our team will get in touch with you shortly.',
    },
    variants: [
      {
        id: 14,
        title: 'New PAN card',
        price: '175.00',
        original_price: '300.00',
        short_description: 'Apply for a fresh Permanent Account Number (PAN) card for individuals, HUFs, or minors with doorstep delivery.',
      },
      {
        id: 15,
        title: 'PAN card correction',
        price: '175.00',
        original_price: '300.00',
        short_description: 'Update name, date of birth, father’s name, signature, or address on your existing PAN card with official verification.',
      },
      {
        id: 16,
        title: 'Duplicate PAN',
        price: '175.00',
        original_price: '300.00',
        short_description: 'Get a duplicate physical PAN card if your original card is lost, damaged, stolen, or illegible.',
      },
    ],
    overview: [
      { id: 1, text: 'Guided step-by-step application flow', iconType: 'guide' },
      { id: 2, text: 'Error check and pre-verification', iconType: 'eligibility' },
      { id: 3, text: 'Document upload assistance', iconType: 'schedule' },
      { id: 4, text: 'Rejection risk minimized', iconType: 'tracking' },
      { id: 5, text: 'Dedicated support till delivery', iconType: 'delivery' },
    ],
    journey: [
      {
        step: '01',
        title: 'Tell us all you need',
        desc: 'Choose your PAN service and share basic details',
        color: 'purple',
        iconType: 'edit',
      },
      {
        step: '02',
        title: 'We guide you',
        desc: 'Expert verifies documents and files the application accurately on NSDL / UTIITSL',
        color: 'blue',
        iconType: 'document',
      },
      {
        step: '03',
        title: 'PAN card PAN',
        desc: 'Receive digital e-PAN in 24-48 hours and physical plastic card delivered to your address',
        color: 'teal',
        iconType: 'certificate',
      },
    ],
    trust_stats: [
      { value: '24 h', label: 'Turnaround Time', iconType: 'clock', color: 'purple' },
      { value: '35,000+', label: 'Successful Applications', iconType: 'badge', color: 'blue' },
      { value: '5+ Years', label: 'Category Expertise', iconType: 'percent', color: 'teal' },
    ],
    safety: {
      title: '100% Data Safety',
      text: 'Your personal details are securely handled and used only for service processing as per Govt guidelines.',
    },
    documents: [
      { id: 1, name: 'Aadhaar Card', step: '01', iconType: 'id_card', is_mandatory: 1 },
      { id: 2, name: 'Address Proof', step: '02', iconType: 'id_card', is_mandatory: 1 },
      { id: 3, name: 'Passport Size Photo', step: '03', iconType: 'photo', is_mandatory: 1 },
    ],
    enquiry_fields: [
      { field_name: 'name', label: 'Name', field_type: 'text', placeholder: 'Enter your name', is_required: true },
      {
        field_name: 'reason_for_pan',
        label: 'Reason for PAN Card Request',
        field_type: 'select',
        placeholder: 'Select reason',
        options: ['New PAN Card', 'PAN Card Correction', 'PAN Card Reprint / Duplicate'],
        is_required: true,
      },
      { field_name: 'mobile_number', label: 'Mobile Number', field_type: 'tel', placeholder: 'Enter your mobile No', is_required: true },
      { field_name: 'email_id', label: 'Email ID', field_type: 'email', placeholder: 'Enter your Email ID', is_required: true },
      { field_name: 'additional_notes', label: 'Additional Notes (optional)', field_type: 'textarea', placeholder: 'Enter additional notes', is_required: false },
    ],
    faqs: [
      { question: 'Who can apply for a new PAN card?', answer: 'Any Indian citizen, NRI, minor, HUF, or foreign national who earns income or conducts business in India can apply for a PAN card.' },
      { question: 'When should I apply for PAN Correction?', answer: 'Apply for PAN correction whenever there is a spelling mistake, change in name after marriage, incorrect date of birth, or updated signature/photo.' },
      { question: 'What is PAN reprint used for?', answer: 'PAN reprint is used when your PAN details are completely correct, but the physical card is lost, damaged, broken, or faded.' },
      { question: 'What documents are required?', answer: 'Proof of Identity (Aadhaar Card), Proof of Address, Date of Birth proof, and 2 passport-size photographs.' },
      { question: 'How long does the process take?', answer: 'e-PAN is typically generated within 2-4 business days. The physical laminated PVC card arrives at your doorstep in 7-10 business days via India Post.' },
    ],
  },

  // 6. HEALTH INSURANCE (ID: 12)
  12: {
    service: {
      id: 12,
      category_id: 2,
      category_name: 'Insurance',
      name: 'Health Insurance',
      description: 'Simple health cover for you and your family',
      price: '350.00',
      original_price: '500.00',
      estimated_days: 2,
      rating: 4.8,
      review_count: 4210,
      hero_image: 'https://cdn.rewardplanners.com/public/services/12/service-1778820937088-kwgpdn.png',
      form_title: 'Apply for Health Insurance Request',
      form_subtitle: 'Please fill out this form below and our team will get in touch with you shortly.',
      is_insurance_wizard: true,
      cta_text: 'Enquire Now',
    },
    variants: [
      {
        id: 10,
        title: 'Health Insurance Made Easy',
        price: '350.00',
        original_price: '500.00',
        short_description: 'Simple health cover for you and your family',
      },
    ],
    overview: [
      { id: 1, text: 'Wide Network of Cashless Hospitals', iconType: 'guide' },
      { id: 2, text: 'Expert Help for Policy Selection', iconType: 'eligibility' },
      { id: 3, text: 'Coverage for Hospitalization & Emergencies', iconType: 'schedule' },
      { id: 4, text: 'Hassle-Free Claims Support', iconType: 'tracking' },
      { id: 5, text: 'Auto-Renewals', iconType: 'delivery' },
    ],
    journey: [
      {
        step: '01',
        title: 'Tell us what you need',
        desc: 'Share a few details to get started',
        color: 'purple',
        iconType: 'edit',
      },
      {
        step: '02',
        title: 'We guide you',
        desc: 'An expert helps you pick the right policy',
        color: 'blue',
        iconType: 'document',
      },
      {
        step: '03',
        title: 'Get insured',
        desc: 'Complete payment and receive your policy',
        color: 'teal',
        iconType: 'certificate',
      },
    ],
    trust_stats: [
      { value: '20+', label: 'Trusted Insurance Partners', iconType: 'badge', color: 'purple' },
      { value: '45,000+', label: 'Customers Seen', iconType: 'percent', color: 'blue' },
      { value: '5+ Years', label: 'Industry Experience', iconType: 'clock', color: 'teal' },
    ],
    safety: {
      title: '100% Data Safety',
      text: 'Your personal info is protected and used only for your service request.',
    },
    documents: [
      { id: 1, name: 'Aadhaar Card', step: '01', subtext: 'Proof of identity and residential details', iconType: 'id_card', is_mandatory: 1 },
      { id: 2, name: 'PAN Card', step: '02', subtext: 'For financial transactions', iconType: 'id_card', is_mandatory: 1 },
      { id: 3, name: 'Passport Size Photo', step: '03', subtext: 'Recent passport size photograph', iconType: 'photo', is_mandatory: 1 },
      { id: 4, name: 'Address Proof', step: '04', subtext: 'Proof of current residential address', iconType: 'document', is_mandatory: 1 },
    ],
    enquiry_fields: [
      { field_name: 'name', label: 'Name', field_type: 'text', placeholder: 'Enter your name', is_required: true },
      { field_name: 'mobile_number', label: 'Mobile Number', field_type: 'tel', placeholder: 'Enter your Mobile No', is_required: true },
      { field_name: 'pincode', label: 'Pincode', field_type: 'text', placeholder: 'Enter pincode', is_required: true },
      {
        field_name: 'zone',
        label: 'Zone',
        field_type: 'select',
        placeholder: 'Select Zone',
        options: ['Zone 1 (Tier 1 Metro)', 'Zone 2 (Tier 2 Cities)', 'Zone 3 (Rest of India)'],
        is_required: true,
      },
      { field_name: 'city', label: 'City', field_type: 'text', placeholder: 'Enter city', is_required: true },
      {
        field_name: 'cover_amount',
        label: 'Cover Amount',
        field_type: 'select',
        placeholder: 'Select Cover Amount',
        options: ['₹5 Lakh', '₹10 Lakh', '₹15 Lakh', '₹25 Lakh', '₹50 Lakh', '₹1 Crore'],
        is_required: true,
      },
      { field_name: 'additional_notes', label: 'Additional Notes (optional)', field_type: 'textarea', placeholder: 'Enter additional notes', is_required: false },
    ],
    faqs: [
      { question: 'Why do I need health insurance if I\'m young and healthy?', answer: 'Medical costs are rising rapidly. Health insurance protects your savings from unexpected medical bills and hospitalization.' },
      { question: 'What does health insurance cover?', answer: 'It covers in-patient hospitalization, pre- and post-hospitalization medical bills, daycare treatments, ICU charges, and emergency care.' },
      { question: 'What is the waiting period in health insurance?', answer: 'Most policies have a standard 30-day initial waiting period, and 2-4 years for pre-existing medical conditions.' },
      { question: 'Can I cover my family under one policy?', answer: 'Yes! A Family Floater health insurance policy covers you, your spouse, children, and parents under a shared sum insured.' },
      { question: 'What is cashless hospitalization?', answer: 'Treatment without paying cash upfront at network hospitals; the insurer settles the bill directly with the hospital.' },
    ],
  },
};

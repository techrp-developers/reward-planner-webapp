// src/constants/addressConstants.js

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const STATE_NAME_TO_ID = {
  'Andaman and Nicobar Islands': 29,
  'Andhra Pradesh': 1,
  'Arunachal Pradesh': 2,
  'Assam': 3,
  'Bihar': 4,
  'Chandigarh': 30,
  'Chhattisgarh': 5,
  'Dadra and Nagar Haveli and Daman and Diu': 31,
  'Delhi': 32,
  'Goa': 6,
  'Gujarat': 7,
  'Haryana': 8,
  'Himachal Pradesh': 9,
  'Jammu and Kashmir': 33,
  'Jharkhand': 10,
  'Karnataka': 11,
  'Kerala': 12,
  'Ladakh': 34,
  'Lakshadweep': 35,
  'Madhya Pradesh': 13,
  'Maharashtra': 14,
  'Manipur': 15,
  'Meghalaya': 16,
  'Mizoram': 17,
  'Nagaland': 18,
  'Odisha': 19,
  'Puducherry': 36,
  'Punjab': 20,
  'Rajasthan': 21,
  'Sikkim': 22,
  'Tamil Nadu': 23,
  'Telangana': 24,
  'Tripura': 25,
  'Uttar Pradesh': 26,
  'Uttarakhand': 27,
  'West Bengal': 28,
};

export const getStateId = (stateName) => STATE_NAME_TO_ID[stateName] || 14;

export const toBackendAddressPayload = (form) => ({
  address_type: form.address_type || 'home',
  contact_name: form.contact_name?.trim() || '',
  contact_phone: form.contact_phone?.trim() || '',
  address1: form.address1?.trim() || '',
  address2: (form.locality || form.address2 || '').trim() || null,
  city: form.city?.trim() || '',
  state_id: form.state_id || getStateId(form.state),
  zipcode: form.zipcode?.trim() || '',
  landmark: form.landmark?.trim() || null,
  is_default: form.is_default ? 1 : 0,
});

export const ADDRESS_TYPES = [
  {
    id: 'home',
    label: 'Home',
    description: 'All day delivery',
    icon: '🏠',
  },
  {
    id: 'work',
    label: 'Work',
    description: 'Delivery between 10 AM - 5 PM',
    icon: '🏢',
  },
];

export const validateAddressForm = (form) => {
  const errors = {};
  if (!form.contact_name?.trim()) {
    errors.contact_name = 'Name is required';
  }

  const cleanPhone = String(form.contact_phone || '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length !== 10) {
    errors.contact_phone = 'Enter a valid 10-digit mobile number';
  }

  const cleanPincode = String(form.zipcode || '').replace(/\D/g, '');
  if (!cleanPincode || cleanPincode.length !== 6) {
    errors.zipcode = 'Enter a valid 6-digit pincode';
  }

  if (!form.address1?.trim()) {
    errors.address1 = 'Address (Area and Street) is required';
  }

  if (!form.city?.trim()) {
    errors.city = 'City/District/Town is required';
  }

  if (!form.state?.trim()) {
    errors.state = 'Please select a state';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const formatFullAddress = (addr) => {
  if (!addr) return '';
  const parts = [
    addr.address1 || addr.address_line_1 || '',
    addr.address2 || addr.address_line_2 || addr.locality || '',
    addr.landmark ? `Near ${addr.landmark}` : '',
    addr.city || '',
    addr.state || '',
  ].filter(Boolean);

  const pin = addr.zipcode || addr.postal_code || '';
  return `${parts.join(', ')}${pin ? ` - ${pin}` : ''}`;
};

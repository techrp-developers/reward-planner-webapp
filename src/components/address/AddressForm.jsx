// src/components/address/AddressForm.jsx
import React, { useState } from 'react';
import {
  INDIAN_STATES,
  ADDRESS_TYPES,
  validateAddressForm,
} from '../../constants/addressConstants';
import CircularProgress from '@mui/material/CircularProgress';
import MyLocationOutlinedIcon from '@mui/icons-material/MyLocationOutlined';

export const AddressForm = ({
  initialData = null,
  onSave,
  onCancel,
  saveButtonText = 'SAVE AND DELIVER HERE',
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    contact_name: initialData?.contact_name || initialData?.name || '',
    contact_phone: initialData?.contact_phone || initialData?.phone || '',
    zipcode: initialData?.zipcode || initialData?.postal_code || '',
    locality: initialData?.locality || initialData?.address2 || '',
    address1: initialData?.address1 || initialData?.address_line_1 || '',
    city: initialData?.city || '',
    state: initialData?.state || 'Maharashtra',
    landmark: initialData?.landmark || '',
    alternate_phone: initialData?.alternate_phone || '',
    address_type: initialData?.address_type || initialData?.type || 'home',
  });

  const [errors, setErrors] = useState({});
  const isEditing = Boolean(initialData?.id || initialData?.address_id);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handlePhoneChange = (field, value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    handleChange(field, cleaned);
  };

  const handlePincodeChange = (value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    handleChange('zipcode', cleaned);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateAddressForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave({
      ...formData,
      id: initialData?.id || initialData?.address_id,
      address_id: initialData?.address_id || initialData?.id,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 sm:p-6 bg-purple-50/30 border border-purple-200/80 rounded-2xl space-y-4 animate-fadeIn text-xs"
    >
      <div className="flex items-center justify-between border-b border-purple-100 pb-3">
        <h4 className="font-extrabold text-sm text-gray-900">
          {isEditing ? 'Edit Delivery Address' : 'Add a New Address'}
        </h4>
        <span className="text-[11px] text-gray-500 font-medium">
          * Required fields
        </span>
      </div>

      {/* Row 1: Name & 10-Digit Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Rahul Sharma"
            value={formData.contact_name}
            onChange={(e) => handleChange('contact_name', e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl outline-none transition-all font-medium ${
              errors.contact_name
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-gray-300 focus:border-[#A654CD] focus:ring-2 focus:ring-[#A654CD]/20'
            }`}
          />
          {errors.contact_name && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">
              {errors.contact_name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            10-digit Mobile Number *
          </label>
          <div className="flex items-center">
            <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-600 font-bold select-none">
              +91
            </span>
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="e.g. 9876543210"
              value={formData.contact_phone}
              onChange={(e) => handlePhoneChange('contact_phone', e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-r-xl outline-none transition-all font-medium ${
                errors.contact_phone
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                  : 'border-gray-300 focus:border-[#A654CD] focus:ring-2 focus:ring-[#A654CD]/20'
              }`}
            />
          </div>
          {errors.contact_phone && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">
              {errors.contact_phone}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Pincode & Locality */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            Pincode *
          </label>
          <input
            type="text"
            required
            maxLength={6}
            placeholder="6-digit Pincode (e.g. 411013)"
            value={formData.zipcode}
            onChange={(e) => handlePincodeChange(e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl outline-none transition-all font-medium ${
              errors.zipcode
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-gray-300 focus:border-[#A654CD] focus:ring-2 focus:ring-[#A654CD]/20'
            }`}
          />
          {errors.zipcode && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">
              {errors.zipcode}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            Locality / Sector / Area
          </label>
          <input
            type="text"
            placeholder="e.g. Hadapsar, Magarpatta City"
            value={formData.locality}
            onChange={(e) => handleChange('locality', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl outline-none transition-all font-medium focus:border-[#A654CD] focus:ring-2 focus:ring-[#A654CD]/20"
          />
        </div>
      </div>

      {/* Row 3: Address (Area and Street / House / Flat No) */}
      <div>
        <label className="block text-[11px] font-bold text-gray-700 mb-1">
          Address (Flat No, House No, Building, Company, Street) *
        </label>
        <textarea
          rows={2}
          required
          placeholder="e.g. Flat 402, Tower B, Cyber City, Magarpatta Road"
          value={formData.address1}
          onChange={(e) => handleChange('address1', e.target.value)}
          className={`w-full px-3.5 py-2.5 bg-white border rounded-xl outline-none transition-all font-medium resize-none ${
            errors.address1
              ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
              : 'border-gray-300 focus:border-[#A654CD] focus:ring-2 focus:ring-[#A654CD]/20'
          }`}
        />
        {errors.address1 && (
          <p className="text-[11px] text-rose-600 font-semibold mt-1">
            {errors.address1}
          </p>
        )}
      </div>

      {/* Row 4: City & State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            City / District / Town *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Pune"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={`w-full px-3.5 py-2.5 bg-white border rounded-xl outline-none transition-all font-medium ${
              errors.city
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                : 'border-gray-300 focus:border-[#A654CD] focus:ring-2 focus:ring-[#A654CD]/20'
            }`}
          />
          {errors.city && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">
              {errors.city}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            State *
          </label>
          <select
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl outline-none font-medium focus:border-[#A654CD] focus:ring-2 focus:ring-[#A654CD]/20 cursor-pointer"
          >
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 5: Landmark (Optional) & Alternate Phone (Optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            Landmark (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Opposite Seasons Mall"
            value={formData.landmark}
            onChange={(e) => handleChange('landmark', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl outline-none font-medium focus:border-[#A654CD] focus:ring-2 focus:ring-[#A654CD]/20"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            Alternate Phone (Optional)
          </label>
          <input
            type="tel"
            maxLength={10}
            placeholder="10-digit number"
            value={formData.alternate_phone}
            onChange={(e) => handlePhoneChange('alternate_phone', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl outline-none font-medium focus:border-[#A654CD] focus:ring-2 focus:ring-[#A654CD]/20"
          />
        </div>
      </div>

      {/* Row 6: Address Type (Home vs Work) */}
      <div className="pt-1">
        <label className="block text-[11px] font-bold text-gray-700 mb-2">
          Address Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ADDRESS_TYPES.map((type) => {
            const isSelected = formData.address_type === type.id;
            return (
              <label
                key={type.id}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#A654CD] bg-purple-100/50 shadow-2xs ring-1 ring-[#A654CD]/30'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="address_type"
                  value={type.id}
                  checked={isSelected}
                  onChange={() => handleChange('address_type', type.id)}
                  className="accent-[#A654CD]"
                />
                <span className="text-base">{type.icon}</span>
                <div>
                  <span className="font-extrabold text-xs text-gray-900 block">
                    {type.label}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {type.description}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Row 7: Action Buttons */}
      <div className="pt-3 border-t border-purple-100 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FC8BAD] via-[#EA4988] to-[#A654CD] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={14} sx={{ color: '#ffffff' }} />
              <span>Saving...</span>
            </>
          ) : (
            <span>{saveButtonText}</span>
          )}
        </button>
      </div>
    </form>
  );
};

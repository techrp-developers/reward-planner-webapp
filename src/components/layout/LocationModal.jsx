// src/components/layout/LocationModal.jsx
import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useLocation } from '../../context/LocationContext';
import { GradientButton } from '../ui/GradientButton';

// Material UI Icons
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

export const LocationModal = () => {
  const {
    pincode,
    cityName,
    isServiceable,
    savedAddresses,
    selectedAddress,
    isModalOpen,
    isChecking,
    closeLocationModal,
    validatePincode,
    selectSavedAddress,
  } = useLocation();

  const [inputPin, setInputPin] = useState(pincode);
  const [errorMsg, setErrorMsg] = useState('');

  const handleApplyPincode = async (e) => {
    e.preventDefault();
    if (!inputPin || inputPin.length !== 6 || !/^\d{6}$/.test(inputPin)) {
      setErrorMsg('Please enter a valid 6-digit pincode');
      return;
    }
    setErrorMsg('');
    const serviceable = await validatePincode(inputPin);
    if (!serviceable) {
      setErrorMsg('Currently not serviceable for courier delivery, but digital items available.');
    } else {
      closeLocationModal();
    }
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeLocationModal} title="Choose your delivery location" maxWidth="max-w-md">
      <div className="space-y-5">
        <p className="text-xs text-gray-500">
          Delivery options and delivery speeds may vary for different locations. Enter your delivery pincode below:
        </p>

        {/* Pincode Input Form */}
        <form onSubmit={handleApplyPincode} className="flex gap-2">
          <div className="relative flex-1">
            <LocationOnOutlinedIcon sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              maxLength={6}
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit pincode"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent font-medium"
            />
          </div>
          <GradientButton type="submit" loading={isChecking} className="px-4 py-2 text-xs">
            Apply
          </GradientButton>
        </form>

        {errorMsg && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <ErrorOutlinedIcon sx={{ fontSize: 15 }} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Current status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircleIcon sx={{ fontSize: 16 }} className="text-emerald-600" />
            <span className="font-semibold text-gray-800">
              Active Location: {cityName} - {pincode}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            Standard Delivery
          </span>
        </div>

        {/* Saved Addresses (if logged in) */}
        {savedAddresses.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Or Select a Saved Address
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedAddresses.map((addr) => {
                const isSelected = selectedAddress?.id === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => selectSavedAddress(addr)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#8B5CF6] bg-violet-50/50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700 mt-0.5 flex items-center justify-center">
                      {addr.address_type === 'work' ? (
                        <BusinessOutlinedIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <HomeOutlinedIcon sx={{ fontSize: 16 }} />
                      )}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{addr.contact_name || 'My Address'}</span>
                        <span className="uppercase text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                          {addr.address_type || 'home'}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-1 mt-0.5">
                        {addr.address1} {addr.address2 ? `, ${addr.address2}` : ''}
                      </p>
                      <p className="text-gray-500 font-medium">
                        {addr.city}, {addr.zipcode}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LocationModal;

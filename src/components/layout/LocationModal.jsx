// src/components/layout/LocationModal.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { AddressCard } from '../address/AddressCard';
import { AddressForm } from '../address/AddressForm';

// Material UI Icons
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AddIcon from '@mui/icons-material/Add';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import CircularProgress from '@mui/material/CircularProgress';

export const LocationModal = () => {
  const {
    pincode,
    cityName,
    savedAddresses,
    selectedAddress,
    isModalOpen,
    isChecking,
    closeLocationModal,
    validatePincode,
    selectSavedAddress,
    saveAddress,
    deleteAddressById,
  } = useLocation();

  const { isAuthenticated, openAuth } = useAuth();

  const [inputPin, setInputPin] = useState(pincode || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (pincode) {
      setInputPin(pincode);
    }
  }, [pincode]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3200);
  };

  const handleApplyPincode = async (e) => {
    e.preventDefault();
    if (!inputPin || inputPin.length !== 6 || !/^\d{6}$/.test(inputPin)) {
      setErrorMsg('Please enter a valid 6-digit pincode');
      return;
    }
    setErrorMsg('');
    const serviceable = await validatePincode(inputPin);
    if (!serviceable) {
      setErrorMsg('Currently not serviceable for courier delivery, but digital services are available.');
    } else {
      showToast(`Location set to ${cityName || 'Selected City'} - ${inputPin}`);
      setTimeout(() => {
        closeLocationModal();
      }, 500);
    }
  };

  const handleSaveAddress = async (formData) => {
    setAddressSubmitting(true);
    try {
      await saveAddress(formData, editingAddress);
      setShowNewAddressForm(false);
      setEditingAddress(null);
      showToast(editingAddress ? 'Address updated successfully!' : 'New address saved & set as delivery location!');
    } catch (err) {
      console.error('Failed to save address:', err);
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      await deleteAddressById(addrId);
      showToast('Address removed.');
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleSelect = (addr) => {
    selectSavedAddress(addr);
    showToast(`Delivery location set to ${addr.city || 'Selected City'} - ${addr.zipcode || addr.postal_code}`);
  };

  const handleClose = () => {
    closeLocationModal();
    setShowNewAddressForm(false);
    setEditingAddress(null);
    setErrorMsg('');
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-['Poppins',sans-serif]">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-[60] bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-fadeIn border border-white/15">
          <CheckCircleIcon sx={{ fontSize: 18 }} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="w-full max-w-2xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 border border-gray-100 animate-scaleUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center">
              <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                Manage Addresses
                {isAuthenticated && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {savedAddresses.length}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-gray-400">Save, edit, and select your active delivery location</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <CloseOutlinedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Current Active Location Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-purple-50/50 rounded-2xl border border-purple-100/80 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircleIcon sx={{ fontSize: 16 }} className="text-emerald-600 shrink-0" />
            <span className="font-semibold text-gray-800 truncate">
              Active Header Location: <strong className="text-purple-900">{cityName} - {pincode}</strong>
              {selectedAddress?.contact_name && (
                <span className="text-gray-500 font-normal"> ({selectedAddress.contact_name})</span>
              )}
            </span>
          </div>
          <span className="text-[11px] font-bold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full shrink-0">
            Standard Delivery
          </span>
        </div>

        {/* Address Form (Add or Edit) */}
        {(showNewAddressForm || editingAddress) ? (
          <div className="py-1">
            <AddressForm
              initialData={editingAddress}
              onSave={handleSaveAddress}
              onCancel={() => {
                setShowNewAddressForm(false);
                setEditingAddress(null);
              }}
              isSubmitting={addressSubmitting}
              saveButtonText={editingAddress ? 'SAVE CHANGES' : 'SAVE & DELIVER HERE'}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Pincode Checker / Override */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                Deliver to a different pincode
              </label>
              <form onSubmit={handleApplyPincode} className="flex gap-2">
                <div className="relative flex-1">
                  <LocationOnOutlinedIcon sx={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit pincode"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChecking}
                  className="px-4 py-2 bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] text-white text-xs font-bold rounded-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  {isChecking ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Apply'}
                </button>
              </form>
              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <ErrorOutlinedIcon sx={{ fontSize: 15 }} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Authenticated Saved Addresses Section */}
            {isAuthenticated ? (
              <div className="space-y-3">
                {/* Add New Address Button (Flipkart Style) */}
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#8b3ab5]/40 hover:border-[#8b3ab5] bg-purple-50/40 hover:bg-purple-50 text-[#8b3ab5] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                  <span>ADD A NEW ADDRESS</span>
                </button>

                {/* List of Saved Addresses */}
                {savedAddresses.length === 0 ? (
                  <div className="text-center py-8 px-4 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                      <LocationOnOutlinedIcon sx={{ fontSize: 28 }} />
                    </div>
                    <p className="text-sm font-bold text-gray-700">No Saved Addresses Found</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Add a delivery address to set your preferred delivery location in the header.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Select Delivery Address (Click to Deliver Here)
                      </span>
                    </div>

                    {savedAddresses.map((addr) => {
                      const addrId = addr.id || addr.address_id;
                      const isSelected =
                        (selectedAddress?.id && selectedAddress.id === addrId) ||
                        (selectedAddress?.address_id && selectedAddress.address_id === addrId) ||
                        (selectedAddress?.zipcode === addr.zipcode && selectedAddress?.contact_name === addr.contact_name);

                      return (
                        <AddressCard
                          key={addrId}
                          address={addr}
                          isSelected={isSelected}
                          showRadio={true}
                          showDeliverHereButton={true}
                          onSelect={() => handleSelect(addr)}
                          onDeliverHere={() => handleSelect(addr)}
                          onEdit={(item) => {
                            setEditingAddress(item);
                            setShowNewAddressForm(false);
                          }}
                          onDelete={(id) => handleDeleteAddress(id)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 px-4 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#8b3ab5] flex items-center justify-center mx-auto">
                  <LocationOnOutlinedIcon sx={{ fontSize: 22 }} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-900">Sign In to See Saved Addresses</p>
                  <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                    Sign in to your corporate account to choose from your saved home and office locations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    openAuth();
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="py-2.5 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;


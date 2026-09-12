// src/context/LocationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { checkPincodeServiceability } from '../api/logisticsApi';
import { fetchAllAddresses, addAddress, updateAddress, deleteAddress } from '../api/addressApi';
import { toBackendAddressPayload } from '../constants/addressConstants';
import { useAuth } from './AuthContext';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [pincode, setPincode] = useState(() => localStorage.getItem('rp_delivery_pincode') || '400076');
  const [cityName, setCityName] = useState(() => localStorage.getItem('rp_delivery_city') || 'Mumbai');
  const [isServiceable, setIsServiceable] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('rp_saved_addresses_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedAddress, setSelectedAddress] = useState(() => {
    try {
      const saved = localStorage.getItem('rp_selected_delivery_address');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Load saved addresses when authenticated
  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetchAllAddresses();
      const list = Array.isArray(res) ? res : res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setSavedAddresses(list);
        localStorage.setItem('rp_saved_addresses_v1', JSON.stringify(list));

        // If no selected address, or current selected is not in list, set default or first
        setSelectedAddress((prev) => {
          if (prev) {
            const match = list.find((a) => (a.id || a.address_id) === (prev.id || prev.address_id));
            if (match) return match;
          }
          const defaultAddr = list.find((a) => a.is_default) || list[0];
          if (defaultAddr?.zipcode) {
            setPincode(defaultAddr.zipcode);
            setCityName(defaultAddr.city || 'Mumbai');
            localStorage.setItem('rp_delivery_pincode', defaultAddr.zipcode);
            localStorage.setItem('rp_delivery_city', defaultAddr.city || 'Mumbai');
            localStorage.setItem('rp_selected_delivery_address', JSON.stringify(defaultAddr));
          }
          return defaultAddr;
        });
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const validatePincode = useCallback(async (newPin) => {
    if (!newPin || newPin.length < 6) return false;
    setIsChecking(true);
    try {
      const res = await checkPincodeServiceability({ delivery_postcode: newPin });
      const serviceable = res?.serviceable !== false;
      setIsServiceable(serviceable);
      setPincode(newPin);
      localStorage.setItem('rp_delivery_pincode', newPin);
      if (res?.city) {
        setCityName(res.city);
        localStorage.setItem('rp_delivery_city', res.city);
      }
      return serviceable;
    } catch {
      setIsServiceable(true);
      setPincode(newPin);
      return true;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const selectSavedAddress = (address) => {
    setSelectedAddress(address);
    const pin = address.zipcode || address.postal_code || '';
    const city = address.city || '';
    if (pin) {
      setPincode(pin);
      localStorage.setItem('rp_delivery_pincode', pin);
      validatePincode(pin);
    }
    if (city) {
      setCityName(city);
      localStorage.setItem('rp_delivery_city', city);
    }
    localStorage.setItem('rp_selected_delivery_address', JSON.stringify(address));
    setIsModalOpen(false);
  };

  const saveAddress = async (data, editingAddress = null) => {
    const backendPayload = toBackendAddressPayload(data);
    if (editingAddress) {
      const addrId = editingAddress.id || editingAddress.address_id;
      try {
        await updateAddress(addrId, backendPayload);
      } catch {}
      const updated = savedAddresses.map((a) =>
        (a.id === addrId || a.address_id === addrId)
          ? { ...a, ...data, ...backendPayload }
          : a
      );
      setSavedAddresses(updated);
      localStorage.setItem('rp_saved_addresses_v1', JSON.stringify(updated));
      if (selectedAddress && (selectedAddress.id === addrId || selectedAddress.address_id === addrId)) {
        const newSelected = { ...selectedAddress, ...data, ...backendPayload };
        selectSavedAddress(newSelected);
      }
      return { success: true };
    } else {
      let newId = Date.now();
      try {
        const res = await addAddress(backendPayload);
        if (res?.address_id) newId = res.address_id;
        else if (res?.data?.address_id) newId = res.data.address_id;
      } catch {}
      const created = {
        ...data,
        ...backendPayload,
        id: newId,
        address_id: newId,
      };
      const updated = [created, ...savedAddresses];
      setSavedAddresses(updated);
      localStorage.setItem('rp_saved_addresses_v1', JSON.stringify(updated));
      selectSavedAddress(created);
      return { success: true, created };
    }
  };

  const deleteAddressById = async (addrId) => {
    try {
      await deleteAddress(addrId);
    } catch {}
    const remaining = savedAddresses.filter((a) => (a.id || a.address_id) !== addrId);
    setSavedAddresses(remaining);
    localStorage.setItem('rp_saved_addresses_v1', JSON.stringify(remaining));
    if (selectedAddress && (selectedAddress.id === addrId || selectedAddress.address_id === addrId)) {
      if (remaining.length > 0) {
        selectSavedAddress(remaining[0]);
      } else {
        setSelectedAddress(null);
        localStorage.removeItem('rp_selected_delivery_address');
      }
    }
  };

  return (
    <LocationContext.Provider
      value={{
        pincode,
        cityName,
        isServiceable,
        savedAddresses,
        selectedAddress,
        isModalOpen,
        isChecking,
        openLocationModal: () => setIsModalOpen(true),
        closeLocationModal: () => setIsModalOpen(false),
        validatePincode,
        selectSavedAddress,
        saveAddress,
        deleteAddressById,
        loadAddresses,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};

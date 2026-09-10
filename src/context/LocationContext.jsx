// src/context/LocationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { checkPincodeServiceability } from '../api/logisticsApi';
import { fetchAllAddresses } from '../api/addressApi';
import { useAuth } from './AuthContext';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [pincode, setPincode] = useState(() => localStorage.getItem('rp_delivery_pincode') || '400076');
  const [cityName, setCityName] = useState(() => localStorage.getItem('rp_delivery_city') || 'Mumbai');
  const [isServiceable, setIsServiceable] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Load saved addresses when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllAddresses().then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setSavedAddresses(list);
        if (list.length > 0) {
          const defaultAddr = list.find((a) => a.is_default) || list[0];
          setSelectedAddress(defaultAddr);
          if (defaultAddr.zipcode) {
            setPincode(defaultAddr.zipcode);
            setCityName(defaultAddr.city || 'Mumbai');
          }
        }
      });
    }
  }, [isAuthenticated]);

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
    if (address.zipcode) {
      validatePincode(address.zipcode);
    }
    if (address.city) {
      setCityName(address.city);
    }
    setIsModalOpen(false);
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

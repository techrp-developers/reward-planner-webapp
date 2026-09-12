// src/modules/profile/ProfilePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import {
  fetchUserInfo,
  updateProfile,
  deleteCustomer,
  changePassword,
  fetchUserAddresses,
} from '../../api/authApi';
import { fetchMyOrders } from '../../api/cartCheckoutApi';
import {
  fetchAllAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../../api/addressApi';
import { AddressCard } from '../../components/address/AddressCard';
import { AddressForm } from '../../components/address/AddressForm';
import { toBackendAddressPayload } from '../../constants/addressConstants';
import { OrdersModal } from './OrdersModal';

// Material UI Icons
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AddIcon from '@mui/icons-material/Add';
import PrivacyTipOutlinedIcon from '@mui/icons-material/PrivacyTipOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CircularProgress from '@mui/material/CircularProgress';

// ── Background SVG Geometric Pattern matching Mobile CardPattern ─────────────────
const CardPattern = () => {
  const lines = [];
  const spacing = 26;
  const height = 260;
  const strokeColor = 'rgba(255, 255, 255, 0.12)';
  const strokeWidth = 0.6;

  for (let i = -15; i < 28; i++) {
    lines.push(
      <path
        key={`d1-${i}`}
        d={`M ${i * spacing} -20 L ${i * spacing + height} ${height}`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }
  for (let i = -15; i < 28; i++) {
    lines.push(
      <path
        key={`d2-${i}`}
        d={`M ${i * spacing} ${height} L ${i * spacing + height} -20`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }
  for (let i = -5; i < 35; i++) {
    lines.push(
      <path
        key={`v-${i}`}
        d={`M ${i * (spacing / 2)} -20 L ${i * (spacing / 2)} ${height}`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {lines}
    </svg>
  );
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const orderIdParam = searchParams.get('orderId') ? Number(searchParams.get('orderId')) : null;
  const statusParam = searchParams.get('status');
  const { user: authUser, isAuthenticated, logout } = useAuth();
  const { openLocationModal } = useLocation();
  const fileInputRef = useRef(null);

  // User & Data States
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUri, setAvatarUri] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('rp_saved_addresses_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Interactive Modals
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // Form & Action States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Address CRUD Handlers for Profile
  const handleSaveProfileAddress = async (data) => {
    setAddressSubmitting(true);
    try {
      const backendPayload = toBackendAddressPayload(data);
      if (editingAddress) {
        const addrId = editingAddress.id || editingAddress.address_id;
        try {
          await updateAddress(addrId, backendPayload);
        } catch {}
        const updated = addresses.map((a) =>
          (a.id === addrId || a.address_id === addrId)
            ? { ...a, ...data, ...backendPayload }
            : a
        );
        setAddresses(updated);
        localStorage.setItem('rp_saved_addresses_v1', JSON.stringify(updated));
        setEditingAddress(null);
        showToast('Address updated successfully!');
      } else {
        let newId = Date.now();
        try {
          const res = await addAddress(backendPayload);
          if (res?.address_id) {
            newId = res.address_id;
          } else if (res?.data?.address_id) {
            newId = res.data.address_id;
          }
        } catch {}
        const created = {
          ...data,
          ...backendPayload,
          id: newId,
          address_id: newId,
        };
        const updated = [created, ...addresses];
        setAddresses(updated);
        localStorage.setItem('rp_saved_addresses_v1', JSON.stringify(updated));
        setShowNewAddressForm(false);
        showToast('New address saved successfully!');
      }
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleDeleteProfileAddress = async (addrId) => {
    try {
      await deleteAddress(addrId);
    } catch {}
    const remaining = addresses.filter((a) => (a.id || a.address_id) !== addrId);
    setAddresses(remaining);
    localStorage.setItem('rp_saved_addresses_v1', JSON.stringify(remaining));
    showToast('Address removed.');
  };

  // Load User Info
  const loadUser = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetchUserInfo();
      if (res?.success || res?.data) {
        const data = res.data || res.user || res;
        setUserInfo(data);
      }
    } catch (err) {
      console.error('Failed to load user info:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadUser();

    // Fetch Orders & Addresses in background
    fetchMyOrders()
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {});

    fetchAllAddresses()
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(list) && list.length > 0) {
          setAddresses(list);
          localStorage.setItem('rp_saved_addresses_v1', JSON.stringify(list));
        }
      })
      .catch(() => {});
  }, [loadUser]);

  useEffect(() => {
    if (tabParam === 'orders' || orderIdParam) {
      setOrdersModalVisible(true);
    } else if (tabParam === 'addresses' || tabParam === 'address') {
      openLocationModal();
    }
  }, [tabParam, orderIdParam, openLocationModal]);

  // Format Helpers matching mobile app
  const formatPhone = (phone) => {
    if (!phone) return '—';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    return phone;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Photo Upload Handler
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optimistic Preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarUri(previewUrl);
    setImageUploading(true);

    try {
      const formData = new FormData();
      formData.append('user_image', file);
      const res = await updateProfile(formData);
      if (res?.data?.user_image) {
        setUserInfo((prev) => ({ ...prev, userImage: res.data.user_image }));
      }
      showToast('Profile photo updated successfully!');
    } catch (err) {
      console.error('Failed to upload profile photo:', err);
      showToast('Could not update profile photo. Please try again.');
      setAvatarUri(null);
    } finally {
      setImageUploading(false);
    }
  };

  // Password Change Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg({ text: '', type: '' });

    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMsg({ text: 'Password updated successfully!', type: 'success' });
      setTimeout(() => {
        setChangePasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordMsg({ text: '', type: '' });
      }, 1500);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to update password. Verify current password.';
      setPasswordMsg({ text: errMsg, type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Logout Handler
  const handleLogoutConfirm = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLogoutLoading(false);
      setLogoutModalVisible(false);
    }
  };

  // Delete Account Handler
  const handleDeleteAccountConfirm = async () => {
    try {
      setDeleteLoading(true);
      await deleteCustomer();
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Delete account failed:', err);
      showToast('Could not delete account. Please try again or contact support.');
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
    }
  };

  const activeUser = userInfo || authUser || {};
  const emp = activeUser?.employeeInfo || {};
  const displayName = activeUser?.name || 'Valued Employee';
  const roleName = emp?.role || activeUser?.role || 'Corporate Member';
  const rewardPoints = activeUser?.rewardPoints ?? activeUser?.wallet_points ?? 2450;
  const companyName = activeUser?.company?.name || 'TechCorp Global';
  const companyLogo = activeUser?.company?.logo || null;
  const userAvatar = avatarUri || activeUser?.userImage || activeUser?.avatar || null;
  const memberSince = activeUser?.created_at || '2024-01-15';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 font-['Poppins',sans-serif]">
        <CircularProgress size={32} sx={{ color: '#7C3AED' }} />
        <span className="text-xs font-semibold text-gray-500">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8 pb-16 font-['Poppins',sans-serif]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-fadeIn border border-white/15">
          <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── TOP ACTION BAR ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-xl hover:bg-gray-100 cursor-pointer"
        >
          <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Verified Corporate Member
          </span>
        </div>
      </div>

      {/* ── MAIN CORPORATE PROFILE CREDENTIAL CARD ─────────────────────────────── */}
      <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] via-[#231e4e] to-[#4338CA] text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-white/20 animate-fadeIn">
        {/* Geometric Pattern Overlay */}
        <CardPattern />

        {/* Top Gloss Sheen Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20 pointer-events-none rounded-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6">
          {/* Avatar Section & Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-1 shadow-2xl ring-4 ring-white/25 flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A654CD] flex items-center justify-center text-white text-3xl font-black">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Upload Spinner */}
                {imageUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <CircularProgress size={22} sx={{ color: '#FFFFFF' }} />
                  </div>
                )}
              </div>

              {/* Camera Upload Trigger */}
              <label
                htmlFor="avatar-file-input"
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] active:scale-95 border-2 border-white text-white flex items-center justify-center shadow-lg cursor-pointer transition-all"
                title="Change profile picture"
              >
                <CameraAltOutlinedIcon sx={{ fontSize: 16 }} />
              </label>
              <input
                id="avatar-file-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={imageUploading}
              />
            </div>

            {/* User Details */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[11px] font-bold text-emerald-300">
                  Active Member
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-indigo-200/90">
                {roleName}
              </p>
              <p className="text-[11px] text-white/60 font-medium">
                Member since {formatDate(memberSince)}
              </p>
            </div>
          </div>

          {/* Metric Pills */}
          <div className="grid grid-cols-2 gap-3.5 sm:flex sm:items-center shrink-0 w-full lg:w-auto justify-center">
            {/* Reward Points */}
            <div className="flex items-center gap-3 p-3 sm:px-5 sm:py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shrink-0">
                <MonetizationOnOutlinedIcon sx={{ fontSize: 22 }} />
              </div>
              <div className="text-left min-w-0">
                <span className="block text-base sm:text-lg font-black text-white leading-tight truncate">
                  {rewardPoints.toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                  RP Points
                </span>
              </div>
            </div>

            {/* Company */}
            <div className="flex items-center gap-3 p-3 sm:px-5 sm:py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0 overflow-hidden">
                {companyLogo ? (
                  <img src={companyLogo} alt={companyName} className="w-7 h-7 object-contain" />
                ) : (
                  <BusinessOutlinedIcon sx={{ fontSize: 20 }} />
                )}
              </div>
              <div className="text-left min-w-0">
                <span className="block text-sm sm:text-base font-bold text-white leading-tight truncate max-w-[140px] sm:max-w-[200px]">
                  {companyName}
                </span>
                <span className="block text-[10px] font-semibold text-white/70 uppercase tracking-wider">
                  Company
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── USER INFO SECTION (CONTACT & WORK DIRECTORY) ───────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-black uppercase tracking-wider text-gray-500 px-1">
          User Info
        </div>
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Contact Info Column */}
            <div className="divide-y divide-gray-100">
              <div className="bg-indigo-50/70 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-[#4F46E5]">
                Contact Info
              </div>
              {/* Mobile */}
              <div className="flex items-center justify-between p-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                    <PhoneOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">Mobile</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {formatPhone(activeUser?.phone || '+91 98765 43210')}
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between p-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                    <EmailOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">Email</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[220px] sm:max-w-none">
                  {activeUser?.email || 'employee@company.com'}
                </span>
              </div>

              {/* User ID */}
              <div className="flex items-center justify-between p-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                    <BadgeOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">User ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-gray-900 font-mono">
                    #RP-{String(activeUser?.userId || activeUser?.id || 1042).padStart(5, '0')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Work Info Column */}
            <div className="divide-y divide-gray-100">
              <div className="bg-indigo-50/70 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-[#4F46E5]">
                Work Info
              </div>
              {/* Role */}
              <div className="flex items-center justify-between p-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                    <WorkOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">Role</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {emp?.role || activeUser?.role || 'Corporate Member'}
                </span>
              </div>

              {/* Department */}
              <div className="flex items-center justify-between p-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                    <BusinessOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">Department</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {emp?.department || 'Operations & Engineering'}
                </span>
              </div>

              {/* Joined Date */}
              <div className="flex items-center justify-between p-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                    <EventAvailableOutlinedIcon sx={{ fontSize: 17 }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">Joined</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {formatDate(emp?.dateOfJoining || memberSince)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADDRESS & ALL ORDERS SECTIONS ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Saved Addresses */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-gray-500 px-1">
            Address
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden flex-1 flex flex-col hover:border-indigo-300 hover:shadow-md transition-all">
            <button
              type="button"
              onClick={openLocationModal}
              className="w-full flex-1 flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50/80 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0 border border-indigo-100">
                  <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 block">
                    Saved Addresses
                  </span>
                  <span className="text-[11px] font-medium text-gray-400 block">
                    Manage primary delivery and office locations
                  </span>
                </div>
              </div>
              <ChevronRightOutlinedIcon sx={{ fontSize: 20 }} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* All Orders */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-gray-500 px-1">
            All Orders
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden flex-1 flex flex-col hover:border-indigo-300 hover:shadow-md transition-all">
            <button
              type="button"
              onClick={() => setOrdersModalVisible(true)}
              className="w-full flex-1 flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50/80 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0 border border-indigo-100">
                  <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 block">
                    All Orders
                  </span>
                  <span className="text-[11px] font-medium text-gray-400 block">
                    Products, services, BBPS, and tracking
                  </span>
                </div>
              </div>
              <ChevronRightOutlinedIcon sx={{ fontSize: 20 }} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* ── OTHERS & ACCOUNT ACTIONS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Others / Preferences (2 columns on desktop) */}
        <div className="flex flex-col gap-2 lg:col-span-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-gray-500 px-1">
            Others & Preferences
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden divide-y divide-gray-100">
            {/* Terms & Conditions */}
            <button
              type="button"
              onClick={() => setTermsModalVisible(true)}
              className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                  <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  Terms & Conditions
                </span>
              </div>
              <ChevronRightOutlinedIcon sx={{ fontSize: 19 }} className="text-gray-400" />
            </button>

            {/* Privacy Policy */}
            <button
              type="button"
              onClick={() => setPrivacyModalVisible(true)}
              className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                  <PrivacyTipOutlinedIcon sx={{ fontSize: 18 }} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  Privacy Policy
                </span>
              </div>
              <ChevronRightOutlinedIcon sx={{ fontSize: 19 }} className="text-gray-400" />
            </button>

            {/* Help & Support */}
            <button
              type="button"
              onClick={() => setHelpModalVisible(true)}
              className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                  <HelpOutlineOutlinedIcon sx={{ fontSize: 19 }} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  Help & Support
                </span>
              </div>
              <ChevronRightOutlinedIcon sx={{ fontSize: 19 }} className="text-gray-400" />
            </button>

            {/* Change Password */}
            <button
              type="button"
              onClick={() => {
                setPasswordMsg({ text: '', type: '' });
                setChangePasswordModalVisible(true);
              }}
              className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                  <LockResetOutlinedIcon sx={{ fontSize: 19 }} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800">
                  Change Password
                </span>
              </div>
              <ChevronRightOutlinedIcon sx={{ fontSize: 19 }} className="text-gray-400" />
            </button>

            {/* Rate Us */}
            <button
              type="button"
              onClick={() => showToast('Thank you for rating RewardPlanners! ⭐⭐⭐⭐⭐')}
              className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center shrink-0">
                  <StarOutlineOutlinedIcon sx={{ fontSize: 19 }} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800">Rate Us</span>
              </div>
              <ChevronRightOutlinedIcon sx={{ fontSize: 19 }} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Danger Zone (1 column on desktop) */}
        <div className="flex flex-col gap-2 lg:col-span-1">
          <div className="text-[11px] font-black uppercase tracking-wider text-rose-500 px-1">
            Account Actions
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden divide-y divide-gray-100">
            {/* Log Out */}
            <button
              type="button"
              onClick={() => setLogoutModalVisible(true)}
              className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-rose-50/50 transition-colors cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <LogoutOutlinedIcon sx={{ fontSize: 19 }} />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-rose-600 block">Log Out</span>
                  <span className="text-[11px] font-medium text-gray-400 block">
                    Safely end current session
                  </span>
                </div>
              </div>
              <ChevronRightOutlinedIcon sx={{ fontSize: 19 }} className="text-gray-400" />
            </button>

            {/* Delete Account */}
            <button
              type="button"
              onClick={() => setDeleteModalVisible(true)}
              className="w-full flex items-center justify-between p-4 sm:px-5 hover:bg-rose-50/50 transition-colors cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 19 }} />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-rose-600 block">
                    Delete Account
                  </span>
                  <span className="text-[11px] font-medium text-rose-400 block">
                    Permanent deletion
                  </span>
                </div>
              </div>
              <ChevronRightOutlinedIcon sx={{ fontSize: 19 }} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* ── FOOTER STATEMENTS ─────────────────────────────────────────────────── */}
      <div className="text-center pt-3 pb-6 space-y-1">
        <p className="text-xs font-semibold text-gray-400">
          Member since {formatDate(memberSince)}
        </p>
        <p className="text-[11px] text-gray-400">
          Encrypted Corporate Session • © 2026 Maa Pranaam Pro Planner Pvt. Ltd.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODALS & DIALOGS
      ══════════════════════════════════════════════════════════════════════════ */}

      {/* 1. LOGOUT CONFIRMATION MODAL */}
      {logoutModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center border border-gray-100 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogoutOutlinedIcon sx={{ fontSize: 24 }} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-900">Sign Out</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to sign out of RewardPlanners?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={logoutLoading}
                onClick={() => setLogoutModalVisible(false)}
                className="py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={logoutLoading}
                onClick={handleLogoutConfirm}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {logoutLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DELETE ACCOUNT CONFIRMATION MODAL */}
      {deleteModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center border border-rose-100 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 26 }} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-rose-700">Delete Account</h3>
              <p className="text-xs text-gray-600 leading-snug">
                Are you sure you want to permanently delete your account? All accumulated RP coins, benefits, and history will be lost.
              </p>
              <p className="text-[11px] font-bold text-rose-600">
                This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteModalVisible(false)}
                className="py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Keep Account
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAccountConfirm}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleteLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHANGE PASSWORD MODAL */}
      {changePasswordModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center">
                  <LockResetOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <h3 className="text-base font-black text-gray-900">Change Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setChangePasswordModalVisible(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            {passwordMsg.text && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setChangePasswordModalVisible(false)}
                  className="py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                >
                  {passwordLoading ? (
                    <CircularProgress size={14} sx={{ color: '#fff' }} />
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ALL ORDERS MODAL */}
      <OrdersModal
        isOpen={ordersModalVisible}
        onClose={() => setOrdersModalVisible(false)}
        initialOrderId={orderIdParam}
        isSuccess={statusParam === 'success'}
      />

      {/* 6. TERMS & CONDITIONS MODAL */}
      {termsModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-scaleUp max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900">Terms & Conditions</h3>
              <button
                type="button"
                onClick={() => setTermsModalVisible(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                Welcome to <strong>RewardPlanners</strong>. By using our corporate reward portal, mobile application, and related services, you agree to comply with and be bound by the following terms and conditions.
              </p>
              <h5 className="font-bold text-gray-900 pt-1">1. Corporate Eligibility</h5>
              <p>
                Benefits, reward coin balances, and insurance coverage are exclusive to active employees of partner organizations registered under Maa Pranaam Pro Planner Pvt. Ltd.
              </p>
              <h5 className="font-bold text-gray-900 pt-1">2. Reward Points & Redemption</h5>
              <p>
                Reward points carry no direct cash value outside the platform and may be redeemed against verified merchandise, utility bill payments, and wellness services.
              </p>
              <h5 className="font-bold text-gray-900 pt-1">3. Privacy & Compliance</h5>
              <p>
                We adhere strictly to Indian data protection and encryption standards. Your corporate details are shared exclusively with verified insurers and fulfillment partners.
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setTermsModalVisible(false)}
                className="py-2.5 px-5 rounded-xl bg-gray-900 text-white font-bold text-xs cursor-pointer hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PRIVACY POLICY MODAL */}
      {privacyModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-scaleUp max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-black text-gray-900">Privacy Policy</h3>
              <button
                type="button"
                onClick={() => setPrivacyModalVisible(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                At <strong>RewardPlanners</strong>, your data privacy and security are paramount. We collect only the information required to authenticate corporate benefits, manage group mediclaim policies, and deliver ordered rewards.
              </p>
              <h5 className="font-bold text-gray-900 pt-1">Data We Store</h5>
              <p>
                Name, corporate email, verified mobile number, employee role, department, and default shipping addresses. We do not sell your personal data to third-party marketers.
              </p>
              <h5 className="font-bold text-gray-900 pt-1">Security & Encryption</h5>
              <p>
                All data transmission between your browser and our servers is secured via 256-bit TLS/SSL encryption and corporate multi-tenant isolation.
              </p>
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setPrivacyModalVisible(false)}
                className="py-2.5 px-5 rounded-xl bg-gray-900 text-white font-bold text-xs cursor-pointer hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. HELP & SUPPORT MODAL */}
      {helpModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center">
                  <HelpOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <h3 className="text-base font-black text-gray-900">Help & Corporate Support</h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalVisible(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <p>
                Need assistance with claims, reward points redemption, or order tracking? Our corporate support desk is available Monday to Saturday, 9:00 AM – 7:00 PM IST.
              </p>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Support Email:</span>
                  <a href="mailto:support@rewardplanners.com" className="text-[#4F46E5] font-bold">
                    support@rewardplanners.com
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">Toll-Free Helpline:</span>
                  <span className="text-gray-900 font-extrabold">1800 890 2450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">WhatsApp Desk:</span>
                  <span className="text-emerald-700 font-bold">+91 98765 43210</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setHelpModalVisible(false)}
                className="py-2.5 px-5 rounded-xl bg-gray-900 text-white font-bold text-xs cursor-pointer hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

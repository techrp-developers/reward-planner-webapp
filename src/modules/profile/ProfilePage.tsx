// src/modules/profile/ProfilePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import {
  fetchUserInfo,
  updateProfile,
  deleteCustomer,
  changePassword,
} from '../../api/authApi';
import { fetchMyOrders } from '../../api/cartCheckoutApi';
import { fetchAllAddresses } from '../../api/addressApi';
import { OrdersModal } from './OrdersModal';
import coinsIcon from '../../assets/home/coinsicon.png';
import userAvatarPlaceholder from '../../assets/home/user-avatar.png';
import profileCardBg from '../../assets/home/profilecardbg.png';

// Material UI Icons
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PrivacyTipOutlinedIcon from '@mui/icons-material/PrivacyTipOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CircularProgress from '@mui/material/CircularProgress';

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
  const [addresses, setAddresses] = useState([]);

  // Interactive Modals
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [rateUsModalVisible, setRateUsModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [wishlistModalVisible, setWishlistModalVisible] = useState(false);

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
        }
      })
      .catch(() => {});
  }, [loadUser]);

  useEffect(() => {
    if (tabParam === 'support') {
      navigate('/customer-support', { replace: true });
    } else if (tabParam === 'orders' || orderIdParam) {
      setOrdersModalVisible(true);
    } else if (tabParam === 'addresses' || tabParam === 'address') {
      openLocationModal();
    }
  }, [tabParam, orderIdParam, openLocationModal, navigate]);

  // Format Helpers
  const formatPhone = (phone) => {
    if (!phone) return '+91 93704 99816';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    return phone;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '17 March 2025';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '17 March 2025';
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return '17 March 2025';
    }
  };

  // Photo Upload Handler
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
  const displayName = activeUser?.name || 'Sakshi Chavan';
  const roleName = emp?.role || activeUser?.role || activeUser?.designation || 'Software Engineer';
  const departmentName = emp?.department || activeUser?.department || 'IT';
  const companyName = activeUser?.company?.name || activeUser?.company_name || 'MPS Global';
  const phoneDisplay = formatPhone(activeUser?.phone || activeUser?.mobile);
  const emailDisplay = activeUser?.email || 'chavansakshi685@gmail.com';
  const userIdDisplay = activeUser?.user_id || (activeUser?.id ? `#RP-${String(activeUser.id).padStart(5, '0')}` : '#RP-00037');
  const memberSinceDisplay = activeUser?.created_at ? formatDate(activeUser.created_at) : '17 March 2025';
  const rewardPointsNumber = activeUser?.rewardPoints ?? activeUser?.wallet_points ?? activeUser?.points ?? 2964;
  const rewardPointsFormatted = Number(rewardPointsNumber).toLocaleString('en-IN');
  const userAvatar = avatarUri || activeUser?.userImage || activeUser?.avatar || userAvatarPlaceholder;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 font-['Poppins',sans-serif] bg-[#F7F9FD]">
        <CircularProgress size={34} sx={{ color: '#6366F1' }} />
        <span className="text-xs font-semibold text-slate-500">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] py-6 sm:py-8 px-4 sm:px-6 lg:px-10 font-['Poppins',sans-serif] text-slate-900 pb-20 select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-fadeIn border border-white/15">
          <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hidden Photo Upload Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-[1360px] mx-auto flex flex-col gap-5 sm:gap-6">
        {/* ── 1. TOP HEADER TITLE BAR ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-1.5 cursor-pointer group"
              title="Return to previous screen"
            >
              <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
              My Profile
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] font-medium mt-1">
              Manage your personal and work details.
            </p>
          </div>

          <div className="flex items-center self-start sm:self-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6F9F0] border border-[#A7F3D0] text-[#059669] text-sm font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Verified Corporate Member
            </span>
          </div>
        </div>

        {/* ── 2. HERO PROFILE CREDENTIAL CARD ────────────────────────────────────── */}
        <div className="w-full relative overflow-hidden rounded-3xl border border-[#E2E8F0]/80 p-6 sm:p-8 shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-[#F3EBFA]">
          {/* Custom Background Image Layout Card */}
          <img
            src={profileCardBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
          />

          {/* Left: Avatar & User Identity */}
          <div className="relative z-10 flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-22 h-22 sm:w-24 sm:h-24 rounded-full ring-4 ring-white shadow-md overflow-hidden bg-white cursor-pointer group"
                title="Click to update profile photo"
              >
                <img
                  src={userAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                />
                {imageUploading && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                    <CircularProgress size={24} sx={{ color: '#fff' }} />
                  </div>
                )}
              </div>

              {/* Attached Camera Upload Button Badge */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={imageUploading}
                className="absolute -bottom-0.5 -right-0.5 sm:bottom-0 sm:right-0 w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] active:scale-95 border-2 border-white text-white flex items-center justify-center shadow-md cursor-pointer transition-all z-20"
                title="Upload profile photo"
                aria-label="Upload profile photo"
              >
                <CameraAltOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                {displayName}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-[#475569] mt-1">
                {roleName}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-xs sm:text-sm text-[#64748B] font-semibold">{companyName}</span>
                <span className="hidden sm:inline text-slate-300 font-bold">•</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#E6F9F0] text-[#16A34A] text-[11px] sm:text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  Active Member
                </span>
              </div>
            </div>
          </div>

          {/* Right: Points and Company Stats Cards */}
          <div className="relative z-10 flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Stat 1: RP Points */}
            <div className="bg-white/95 backdrop-blur-xs border border-purple-100/90 rounded-2xl p-3.5 sm:px-6 sm:py-4 shadow-2xs flex items-center gap-3.5 min-w-[150px] sm:min-w-[170px]">
              <img
                src={coinsIcon}
                alt="RP Coins"
                className="w-11 h-11 object-contain shrink-0"
              />
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold text-[#0F172A] leading-tight">
                  {rewardPointsFormatted}
                </span>
                <span className="block text-xs sm:text-sm font-semibold text-[#64748B] mt-0.5">
                  RP Points
                </span>
              </div>
            </div>

            {/* Stat 2: Company */}
            <div className="bg-white/95 backdrop-blur-xs border border-purple-100/90 rounded-2xl p-3.5 sm:px-6 sm:py-4 shadow-2xs flex items-center gap-3.5 min-w-[150px] sm:min-w-[170px]">
              <div className="w-11 h-11 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                <BusinessOutlinedIcon sx={{ fontSize: 24 }} />
              </div>
              <div>
                <span className="block text-base sm:text-lg font-extrabold text-[#0F172A] leading-tight truncate max-w-[130px]">
                  {companyName}
                </span>
                <span className="block text-xs sm:text-sm font-semibold text-[#64748B] mt-0.5">
                  Company
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. FOUR CORE INFORMATION & ACTION CARDS (2x2 GRID) ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* CARD 1: Personal Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                  <PersonOutlinedIcon sx={{ fontSize: 24 }} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-tight">
                    Personal Information
                  </h3>
                  <p className="text-sm text-[#64748B] font-medium mt-0.5">
                    Your basic contact details.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {/* Mobile Number */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <PhoneOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <span className="text-sm font-semibold text-[#64748B]">Mobile Number</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                    {phoneDisplay}
                  </span>
                </div>

                {/* Email Address */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <EmailOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <span className="text-sm font-semibold text-[#64748B]">Email Address</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#0F172A] truncate max-w-[200px] sm:max-w-xs text-right">
                    {emailDisplay}
                  </span>
                </div>

                {/* User ID */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <BadgeOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <span className="text-sm font-semibold text-[#64748B]">User ID</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                      {userIdDisplay}
                    </span>
                    <span className="inline-flex px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Work Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                  <WorkOutlineOutlinedIcon sx={{ fontSize: 23 }} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-tight">
                    Work Information
                  </h3>
                  <p className="text-sm text-[#64748B] font-medium mt-0.5">
                    Your professional details.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {/* Role */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <EventAvailableOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <span className="text-sm font-semibold text-[#64748B]">Role</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                    {roleName}
                  </span>
                </div>

                {/* Department */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <BusinessOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <span className="text-sm font-semibold text-[#64748B]">Department</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                    {departmentName}
                  </span>
                </div>

                {/* Company */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <ApartmentOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <span className="text-sm font-semibold text-[#64748B]">Company</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                    {companyName}
                  </span>
                </div>

                {/* Member Since */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <EventAvailableOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <span className="text-sm font-semibold text-[#64748B]">Member Since</span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-[#0F172A]">
                    {memberSinceDisplay}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: My Activity */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                  <StarOutlineOutlinedIcon sx={{ fontSize: 22 }} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-tight">
                    My Activity
                  </h3>
                  <p className="text-sm text-[#64748B] font-medium mt-0.5">
                    Manage your orders, wishlist, and saved addresses.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {/* My Orders */}
                <button
                  type="button"
                  onClick={() => setOrdersModalVisible(true)}
                  className="w-full flex items-center justify-between py-4 px-1.5 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#0F172A] leading-tight">
                        My Orders
                      </h4>
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                        View and track your orders, products and services.
                      </p>
                    </div>
                  </div>
                  <ChevronRightOutlinedIcon sx={{ fontSize: 21 }} className="text-slate-400 group-hover:text-[#6366F1] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={() => setWishlistModalVisible(true)}
                  className="w-full flex items-center justify-between py-4 px-1.5 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <FavoriteBorderOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#0F172A] leading-tight">
                        Wishlist
                      </h4>
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                        Your saved products and services.
                      </p>
                    </div>
                  </div>
                  <ChevronRightOutlinedIcon sx={{ fontSize: 21 }} className="text-slate-400 group-hover:text-[#6366F1] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Saved Addresses */}
                <button
                  type="button"
                  onClick={openLocationModal}
                  className="w-full flex items-center justify-between py-4 px-1.5 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#0F172A] leading-tight">
                        Saved Addresses
                      </h4>
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                        Manage your delivery and office locations.
                      </p>
                    </div>
                  </div>
                  <ChevronRightOutlinedIcon sx={{ fontSize: 21 }} className="text-slate-400 group-hover:text-[#6366F1] group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          </div>

          {/* CARD 4: Other Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                  <DescriptionOutlinedIcon sx={{ fontSize: 24 }} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] leading-tight">
                    Other Information
                  </h3>
                  <p className="text-sm text-[#64748B] font-medium mt-0.5">
                    Policies, support and other resources.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {/* Terms & Conditions */}
                <button
                  type="button"
                  onClick={() => navigate('/terms', { state: { from: 'profile' } })}
                  className="w-full flex items-center justify-between py-3 px-1.5 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#0F172A] leading-tight">
                        Terms & Conditions
                      </h4>
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                        Read our terms and conditions
                      </p>
                    </div>
                  </div>
                  <ChevronRightOutlinedIcon sx={{ fontSize: 21 }} className="text-slate-400 group-hover:text-[#6366F1] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Privacy Policy */}
                <button
                  type="button"
                  onClick={() => navigate('/privacy-policy', { state: { from: 'profile' } })}
                  className="w-full flex items-center justify-between py-3 px-1.5 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <PrivacyTipOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#0F172A] leading-tight">
                        Privacy Policy
                      </h4>
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                        Understand how we use your data
                      </p>
                    </div>
                  </div>
                  <ChevronRightOutlinedIcon sx={{ fontSize: 21 }} className="text-slate-400 group-hover:text-[#6366F1] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Rate Us */}
                <button
                  type="button"
                  onClick={() => setRateUsModalVisible(true)}
                  className="w-full flex items-center justify-between py-3 px-1.5 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <StarOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#0F172A] leading-tight">
                        Rate Us
                      </h4>
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                        Share your feedback with us
                      </p>
                    </div>
                  </div>
                  <ChevronRightOutlinedIcon sx={{ fontSize: 21 }} className="text-slate-400 group-hover:text-[#6366F1] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Help & Support */}
                <button
                  type="button"
                  onClick={() => setHelpModalVisible(true)}
                  className="w-full flex items-center justify-between py-3 px-1.5 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <HelpOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#0F172A] leading-tight">
                        Help & Support
                      </h4>
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                        Get assistance and support
                      </p>
                    </div>
                  </div>
                  <ChevronRightOutlinedIcon sx={{ fontSize: 21 }} className="text-slate-400 group-hover:text-[#6366F1] group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Change Password */}
                <button
                  type="button"
                  onClick={() => {
                    setPasswordMsg({ text: '', type: '' });
                    setChangePasswordModalVisible(true);
                  }}
                  className="w-full flex items-center justify-between py-3 px-1.5 hover:bg-slate-50/80 rounded-xl transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#6366F1] flex items-center justify-center shrink-0">
                      <VpnKeyOutlinedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#0F172A] leading-tight">
                        Change Password
                      </h4>
                      <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                        Keep your account secure
                      </p>
                    </div>
                  </div>
                  <ChevronRightOutlinedIcon sx={{ fontSize: 21 }} className="text-slate-400 group-hover:text-[#6366F1] group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. BOTTOM ACCOUNT ACTIONS (LOG OUT & DELETE ACCOUNT) ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-1">
          {/* Log Out Button Card */}
          <button
            type="button"
            onClick={() => setLogoutModalVisible(true)}
            className="w-full bg-[#FFF5F5] hover:bg-[#FFEBEB] border border-[#FECDD3] rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white text-[#E11D48] flex items-center justify-center shrink-0 shadow-2xs border border-rose-100">
                <LockOutlinedIcon sx={{ fontSize: 22 }} />
              </div>
              <div className="text-left">
                <h4 className="text-sm sm:text-base font-bold text-[#E11D48]">
                  Log Out
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                  Safely end your current session
                </p>
              </div>
            </div>
            <ChevronRightOutlinedIcon sx={{ fontSize: 22 }} className="text-[#E11D48] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Delete Account Button Card */}
          <button
            type="button"
            onClick={() => setDeleteModalVisible(true)}
            className="w-full bg-[#FFF5F5] hover:bg-[#FFEBEB] border border-[#FECDD3] rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white text-[#E11D48] flex items-center justify-center shrink-0 shadow-2xs border border-rose-100">
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 22 }} />
              </div>
              <div className="text-left">
                <h4 className="text-sm sm:text-base font-bold text-[#E11D48]">
                  Delete Account
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                  Permanent deletion of your account
                </p>
              </div>
            </div>
            <ChevronRightOutlinedIcon sx={{ fontSize: 22 }} className="text-[#E11D48] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODALS & DIALOGS (ALL PRESERVED & WORKING)
      ══════════════════════════════════════════════════════════════════════════ */}

      {/* 1. LOGOUT CONFIRMATION MODAL */}
      {logoutModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center border border-gray-100 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LockOutlinedIcon sx={{ fontSize: 24 }} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">Sign Out</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to sign out of RewardPlanners?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                disabled={logoutLoading}
                onClick={() => setLogoutModalVisible(false)}
                className="py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={logoutLoading}
                onClick={handleLogoutConfirm}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5"
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
              <h3 className="text-base font-bold text-rose-700">Delete Account</h3>
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
                className="py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Keep Account
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAccountConfirm}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-md cursor-pointer flex items-center justify-center gap-1.5"
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
                  <VpnKeyOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Change Password</h3>
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
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
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
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
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
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
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
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold text-xs shadow-md hover:opacity-95 cursor-pointer flex items-center gap-1.5"
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

      {/* 4. ALL ORDERS MODAL */}
      <OrdersModal
        isOpen={ordersModalVisible}
        onClose={() => setOrdersModalVisible(false)}
        initialOrderId={orderIdParam}
        isSuccess={statusParam === 'success'}
      />

      {/* 5. WISHLIST MODAL */}
      {wishlistModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <FavoriteBorderOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Your Wishlist</h3>
              </div>
              <button
                type="button"
                onClick={() => setWishlistModalVisible(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <FavoriteBorderOutlinedIcon sx={{ fontSize: 28 }} />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Saved items will appear here
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Tap the heart icon on any product in the Rewards Store to save it for later.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setWishlistModalVisible(false)}
                className="py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setWishlistModalVisible(false);
                  navigate('/store');
                }}
                className="py-2.5 px-5 rounded-xl bg-[#6366F1] text-white font-semibold text-xs shadow-md hover:bg-[#4F46E5] cursor-pointer"
              >
                Explore Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. RATE US MODAL */}
      {rateUsModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-center border border-gray-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Rate Your Experience</h3>
              <button
                type="button"
                onClick={() => setRateUsModalVisible(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="py-3 space-y-3">
              <p className="text-xs text-slate-500">
                How would you rate your corporate perks and rewards experience?
              </p>
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className="p-1 text-amber-400 hover:scale-115 transition-transform cursor-pointer"
                  >
                    {star <= selectedRating ? (
                      <StarIcon sx={{ fontSize: 32 }} />
                    ) : (
                      <StarOutlineOutlinedIcon sx={{ fontSize: 32 }} className="text-slate-300" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-indigo-600">
                {selectedRating === 5
                  ? 'Excellent! 🎉'
                  : selectedRating === 4
                  ? 'Very Good! 👍'
                  : selectedRating === 3
                  ? 'Good'
                  : 'We will work to improve'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRateUsModalVisible(false)}
                className="py-2.5 px-4 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setRateUsModalVisible(false);
                  showToast('Thank you for your valuable feedback! ⭐');
                }}
                className="py-2.5 px-4 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-xs font-semibold text-white shadow-md cursor-pointer"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. TERMS & CONDITIONS MODAL */}
      {termsModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-scaleUp max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Terms & Conditions</h3>
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
                Welcome to <strong>RewardPlanners</strong>. By using our corporate reward portal and related services, you agree to comply with and be bound by the following terms and conditions.
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
                We adhere strictly to data protection and encryption standards. Your corporate details are shared exclusively with verified fulfillment partners.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setTermsModalVisible(false)}
                className="py-2.5 px-4 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer hover:bg-gray-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setTermsModalVisible(false);
                  navigate('/terms', { state: { from: 'profile' } });
                }}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold text-xs cursor-pointer hover:opacity-95 shadow-xs"
              >
                View Full Terms & Conditions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. PRIVACY POLICY MODAL */}
      {privacyModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-scaleUp max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Privacy Policy</h3>
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
                At <strong>RewardPlanners</strong>, your data privacy and security are paramount. We collect only the information required to authenticate corporate benefits, manage mediclaim policies, and deliver ordered rewards.
              </p>
              <h5 className="font-bold text-gray-900 pt-1">Data We Store</h5>
              <p>
                Name, corporate email, verified mobile number, employee role, department, and default shipping addresses. We do not sell your personal data to third parties.
              </p>
              <h5 className="font-bold text-gray-900 pt-1">Security & Encryption</h5>
              <p>
                All data transmission between your browser and our servers is secured via 256-bit TLS/SSL encryption and corporate multi-tenant isolation.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPrivacyModalVisible(false)}
                className="py-2.5 px-4 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer hover:bg-gray-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrivacyModalVisible(false);
                  navigate('/privacy-policy', { state: { from: 'profile' } });
                }}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold text-xs cursor-pointer hover:opacity-95 shadow-xs"
              >
                View Full Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. HELP & SUPPORT MODAL */}
      {helpModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6366F1] flex items-center justify-center">
                  <HelpOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <h3 className="text-base font-bold text-gray-900">Help & Corporate Support</h3>
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
                className="py-2.5 px-5 rounded-xl bg-gray-900 text-white font-semibold text-xs cursor-pointer hover:bg-gray-800"
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

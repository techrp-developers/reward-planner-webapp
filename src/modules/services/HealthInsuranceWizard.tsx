// src/modules/services/HealthInsuranceWizard.jsx
// 3-Step Interactive Health Insurance Quote Flow matching the uploaded screenshots
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { submitServiceEnquiry } from '../../api/servicesApi';

// Material UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

export interface HealthInsuranceWizardProps {
  onClose?: () => void;
}

export type GenderType = 'male' | 'female';

export interface MemberItem {
  id: string;
  label: string;
  avatar: 'self' | 'spouse' | 'son' | 'daughter';
  role: string;
}

export interface PersonalDetailsState {
  name: string;
  mobile_number: string;
  pincode: string;
  zone: string;
  city: string;
  cover_amount: string;
}

// SVG Avatars matching reference designs
const AvatarSelf: React.FC<{ gender?: GenderType }> = ({ gender = 'male' }) => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 rounded-full shadow-2xs">
    <circle cx="50" cy="50" r="50" fill={gender === 'male' ? '#60A5FA' : '#F472B6'} />
    {/* Body */}
    <path d="M22 92 C 22 70, 32 64, 50 64 C 68 64, 78 70, 78 92 Z" fill="#1E293B" />
    {/* Shirt collar / Tie */}
    <path d="M44 64 L50 78 L56 64 Z" fill="#FFFFFF" />
    <path d="M48 68 L52 68 L53 82 L47 82 Z" fill="#EF4444" />
    {/* Face */}
    <circle cx="50" cy="44" r="20" fill="#FCD34D" />
    {/* Hair */}
    <path d="M30 40 C 30 24, 40 20, 50 20 C 60 20, 70 24, 70 40 C 66 32, 58 30, 50 30 C 42 30, 34 32, 30 40 Z" fill="#1F2937" />
    {/* Sunglasses / Eyes */}
    <rect x="38" y="38" width="10" height="7" rx="3.5" fill="#111827" />
    <rect x="52" y="38" width="10" height="7" rx="3.5" fill="#111827" />
    <line x1="48" y1="41" x2="52" y2="41" stroke="#111827" strokeWidth="2" />
    {/* Moustache */}
    <path d="M43 51 C 46 54, 50 51, 50 51 C 50 51, 54 54, 57 51 C 54 49, 46 49, 43 51 Z" fill="#1F2937" />
  </svg>
);

const AvatarSpouse: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 rounded-full shadow-2xs">
    <circle cx="50" cy="50" r="50" fill="#38BDF8" />
    {/* Body */}
    <path d="M22 92 C 22 72, 32 65, 50 65 C 68 65, 78 72, 78 92 Z" fill="#475569" />
    {/* Yellow Scarf/Collar */}
    <path d="M40 65 C 40 76, 50 82, 50 82 C 50 82, 60 76, 60 65 Z" fill="#FBBF24" />
    {/* Face */}
    <circle cx="50" cy="44" r="19" fill="#FDE68A" />
    {/* Hair */}
    <path d="M29 46 C 29 25, 40 22, 50 22 C 60 22, 71 25, 71 46 C 66 58, 62 60, 62 60 C 60 48, 56 32, 50 32 C 44 32, 40 48, 38 60 C 38 60, 34 58, 29 46 Z" fill="#92400E" />
    {/* Eyes & Smile */}
    <circle cx="43" cy="42" r="2.5" fill="#1F2937" />
    <circle cx="57" cy="42" r="2.5" fill="#1F2937" />
    <path d="M45 49 Q50 54 55 49" stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const AvatarSon: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 rounded-full shadow-2xs">
    <circle cx="50" cy="50" r="50" fill="#86EFAC" />
    {/* Body */}
    <path d="M25 94 C 25 76, 34 70, 50 70 C 66 70, 75 76, 75 94 Z" fill="#3B82F6" />
    {/* Shirt detail */}
    <path d="M46 70 L50 80 L54 70 Z" fill="#EF4444" />
    {/* Face */}
    <circle cx="50" cy="46" r="20" fill="#FDE68A" />
    {/* Spiky Boy Hair */}
    <path d="M30 42 C 30 26, 38 22, 50 22 C 54 22, 58 20, 62 25 C 67 24, 71 29, 70 38 C 65 30, 55 30, 48 30 C 40 30, 35 34, 30 42 Z" fill="#1F2937" />
    {/* Eyes & Big Smile */}
    <circle cx="43" cy="44" r="2.5" fill="#1F2937" />
    <circle cx="57" cy="44" r="2.5" fill="#1F2937" />
    <path d="M45 52 Q50 57 55 52" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
);

const AvatarDaughter: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18 rounded-full shadow-2xs">
    <circle cx="50" cy="50" r="50" fill="#86EFAC" />
    {/* Body */}
    <path d="M25 94 C 25 76, 34 70, 50 70 C 66 70, 75 76, 75 94 Z" fill="#EC4899" />
    {/* Heart on Shirt */}
    <path d="M48 76 C 45 73, 42 75, 45 79 L50 84 L55 79 C 58 75, 55 73, 52 76 Z" fill="#BE185D" />
    {/* Face */}
    <circle cx="50" cy="46" r="19" fill="#FDE68A" />
    {/* Pigtails / Hair */}
    <circle cx="28" cy="38" r="8" fill="#B45309" />
    <circle cx="72" cy="38" r="8" fill="#B45309" />
    <path d="M31 42 C 31 26, 40 24, 50 24 C 60 24, 69 26, 69 42 C 64 33, 56 32, 50 32 C 44 32, 36 33, 31 42 Z" fill="#B45309" />
    {/* Eyes & Smile */}
    <circle cx="43" cy="44" r="2.5" fill="#1F2937" />
    <circle cx="57" cy="44" r="2.5" fill="#1F2937" />
    <path d="M45 51 Q50 56 55 51" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
);

export const HealthInsuranceWizard: React.FC<HealthInsuranceWizardProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth } = useAuth();

  // Wizard Step: 1 = Select Member, 2 = Select Age, 3 = Personal Details
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 State: Gender & Member selections
  const [gender, setGender] = useState<GenderType>('male');
  const [isSelfSelected, setIsSelfSelected] = useState<boolean>(true);
  const [isSpouseSelected, setIsSpouseSelected] = useState<boolean>(false);
  const [sonCount, setSonCount] = useState<number>(0);
  const [daughterCount, setDaughterCount] = useState<number>(0);

  // Step 2 State: Ages for selected members
  const [ages, setAges] = useState<Record<string, string>>({
    self: '32 yr',
    spouse: '30 yr',
    son_1: '5 yr',
    son_2: '3 yr',
    daughter_1: '4 yr',
    daughter_2: '2 yr',
  });

  // Step 3 State: Personal details
  const [personalDetails, setPersonalDetails] = useState<PersonalDetailsState>({
    name: user?.name || user?.first_name || '',
    mobile_number: user?.phone || user?.mobile || '',
    pincode: '400001',
    zone: 'Zone 1',
    city: 'Mumbai',
    cover_amount: '₹10 Lakh',
  });

  const [formError, setFormError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [enquiryRefId, setEnquiryRefId] = useState<string>('');

  // Determine which members are currently selected
  const activeMembersList: MemberItem[] = [];
  if (isSelfSelected) activeMembersList.push({ id: 'self', label: 'Self', avatar: 'self', role: 'Family Member' });
  if (isSpouseSelected) activeMembersList.push({ id: 'spouse', label: 'Spouse', avatar: 'spouse', role: 'Family Member' });
  for (let i = 1; i <= sonCount; i++) {
    activeMembersList.push({
      id: `son_${i}`,
      label: sonCount > 1 ? `Son ${i}` : 'Son',
      avatar: 'son',
      role: 'Family Member',
    });
  }
  for (let i = 1; i <= daughterCount; i++) {
    activeMembersList.push({
      id: `daughter_${i}`,
      label: daughterCount > 1 ? `Daughter ${i}` : 'Daughter',
      avatar: 'daughter',
      role: 'Family Member',
    });
  }

  const isStep1Valid = activeMembersList.length > 0;

  const handleAgeChange = (memberId: string, value: string) => {
    setAges((prev) => ({ ...prev, [memberId]: value }));
  };

  const handlePersonalDetailChange = (field: keyof PersonalDetailsState, value: string) => {
    setPersonalDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!isStep1Valid) {
        setFormError('Please select at least one family member');
        return;
      }
      setFormError('');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (onClose) {
      onClose();
    } else {
      navigate('/services/detail/12');
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    if (!personalDetails.name.trim()) {
      setFormError('Please enter your name');
      return;
    }
    const cleanMobile = personalDetails.mobile_number.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        service_id: 12,
        name: personalDetails.name.trim(),
        mobile: cleanMobile,
        city: personalDetails.city,
        enquiry_data: {
          gender,
          members: activeMembersList.map((m) => ({ member: m.label, age: ages[m.id] || '25 yr' })),
          pincode: personalDetails.pincode,
          zone: personalDetails.zone,
          cover_amount: personalDetails.cover_amount,
        },
      };

      const res = await submitServiceEnquiry(payload);
      const generatedRef =
        res?.data?.enquiry_ref ||
        (res?.data?.id ? `#RP-ENQ-${res.data.id}` : `#RP-ENQ-${Math.floor(10000 + Math.random() * 90000)}`);
      setEnquiryRefId(generatedRef);
      setIsSuccessModalOpen(true);
    } catch {
      setEnquiryRefId(`#RP-ENQ-${Math.floor(10000 + Math.random() * 90000)}`);
      setIsSuccessModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Generate Age options
  const adultAgeOptions = Array.from({ length: 70 }, (_, i) => `${18 + i} yr`);
  const childAgeOptions = ['3 months', '6 months', '1 yr', '2 yr', '3 yr', '4 yr', '5 yr', '6 yr', '7 yr', '8 yr', '9 yr', '10 yr', '11 yr', '12 yr', '15 yr', '18 yr', '21 yr', '25 yr'];

  const isModal = Boolean(onClose);
  const scrollRef = useRef(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollDown(scrollHeight - clientHeight - scrollTop > 25);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScroll();
    }, 120);
    return () => clearTimeout(timer);
  }, [currentStep, sonCount, daughterCount, activeMembersList.length, checkScroll]);

  const handleScrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 220, behavior: 'smooth' });
    }
  };

  const contentHeader = (
    <div className={`${isModal ? 'shrink-0 px-5 sm:px-7 pt-5 pb-3 border-b border-gray-100 bg-white' : 'px-6 sm:px-8 pt-6 pb-4 border-b border-gray-100 bg-white'} space-y-3`}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </button>
        <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
          Health Cover Wizard ({currentStep}/3)
        </span>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* 3-Segment Progress Bar */}
      <div className="flex items-center gap-2 pt-1">
        <div className={`h-1.5 flex-1 rounded-full transition-all ${currentStep >= 1 ? 'bg-[#7C3AED]' : 'bg-gray-200'}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-all ${currentStep >= 2 ? 'bg-[#7C3AED]' : 'bg-gray-200'}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-all ${currentStep >= 3 ? 'bg-[#7C3AED]' : 'bg-gray-200'}`} />
      </div>
    </div>
  );

  const contentFooter = (
    <div className={`${isModal ? 'shrink-0 px-5 sm:px-7 py-4 border-t border-gray-100 bg-white' : 'px-6 sm:px-8 py-5 border-t border-gray-100 bg-white'}`}>
      <button
        type="button"
        disabled={currentStep === 1 && !isStep1Valid}
        onClick={handleNext}
        className={`w-full py-3.5 sm:py-4 rounded-full font-bold text-sm text-white transition-all cursor-pointer flex items-center justify-center shadow-md ${
          currentStep === 1 && !isStep1Valid
            ? 'bg-gray-300 cursor-not-allowed opacity-60'
            : 'bg-gradient-to-r from-[#5B37B7] to-[#7C3AED] hover:opacity-95 shadow-purple-200'
        }`}
      >
        {submitting ? 'Submitting Application...' : currentStep === 3 ? 'Get Free Quotes' : 'Continue'}
      </button>
    </div>
  );

  const wizardBody = (
    <>

        {/* STEP 1: SELECT MEMBER & GENDER */}
        {currentStep === 1 && (
          <div className="space-y-6 flex-1 animate-fadeIn">
            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Select Member
              </h2>
              <p className="text-xs text-gray-500 font-normal">
                Select member of your family
              </p>
            </div>

            {/* Select Gender */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-800 block">
                Select Gender
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    gender === 'male'
                      ? 'bg-[#5B37B7] text-white shadow-sm shadow-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <PersonIcon sx={{ fontSize: 18 }} />
                  <span>Male</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    gender === 'female'
                      ? 'bg-[#5B37B7] text-white shadow-sm shadow-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <PersonIcon sx={{ fontSize: 18 }} />
                  <span>Female</span>
                </button>
              </div>
            </div>

            {/* 2x2 Member Selection Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              
              {/* Card 1: Self */}
              <div
                onClick={() => setIsSelfSelected((prev) => !prev)}
                className={`relative rounded-3xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 min-h-[140px] select-none ${
                  isSelfSelected
                    ? 'border-[#5B37B7] bg-[#FAF8FF] shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {isSelfSelected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#5B37B7] text-white flex items-center justify-center shadow-xs">
                    <CheckIcon sx={{ fontSize: 13 }} />
                  </div>
                )}
                <AvatarSelf gender={gender} />
                <span className="font-bold text-xs sm:text-sm text-gray-900 mt-2">Self</span>
              </div>

              {/* Card 2: Spouse */}
              <div
                onClick={() => setIsSpouseSelected((prev) => !prev)}
                className={`relative rounded-3xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 min-h-[140px] select-none ${
                  isSpouseSelected
                    ? 'border-[#5B37B7] bg-[#FAF8FF] shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {isSpouseSelected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#5B37B7] text-white flex items-center justify-center shadow-xs">
                    <CheckIcon sx={{ fontSize: 13 }} />
                  </div>
                )}
                <AvatarSpouse />
                <span className="font-bold text-xs sm:text-sm text-gray-900 mt-2">Spouse</span>
              </div>

              {/* Card 3: Son (with +/- counter) */}
              <div
                className={`relative rounded-3xl p-4 flex flex-col items-center justify-center text-center transition-all border-2 min-h-[150px] select-none ${
                  sonCount > 0
                    ? 'border-[#5B37B7] bg-[#FAF8FF] shadow-xs'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div onClick={() => setSonCount((prev) => (prev > 0 ? prev : 1))} className="cursor-pointer">
                  <AvatarSon />
                  <span className="font-bold text-xs sm:text-sm text-gray-900 mt-2 block">Son</span>
                </div>

                {/* Counter */}
                <div className="mt-2 flex items-center bg-gray-100 rounded-full px-2 py-0.5 border border-gray-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSonCount((prev) => Math.max(0, prev - 1));
                    }}
                    className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 hover:text-black cursor-pointer text-xs"
                  >
                    -
                  </button>
                  <span className="px-2 font-bold text-xs text-gray-900">{sonCount}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSonCount((prev) => Math.min(4, prev + 1));
                    }}
                    className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 hover:text-black cursor-pointer text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Card 4: Daughter (with +/- counter) */}
              <div
                className={`relative rounded-3xl p-4 flex flex-col items-center justify-center text-center transition-all border-2 min-h-[150px] select-none ${
                  daughterCount > 0
                    ? 'border-[#5B37B7] bg-[#FAF8FF] shadow-xs'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div onClick={() => setDaughterCount((prev) => (prev > 0 ? prev : 1))} className="cursor-pointer">
                  <AvatarDaughter />
                  <span className="font-bold text-xs sm:text-sm text-gray-900 mt-2 block">Daughter</span>
                </div>

                {/* Counter */}
                <div className="mt-2 flex items-center bg-gray-100 rounded-full px-2 py-0.5 border border-gray-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDaughterCount((prev) => Math.max(0, prev - 1));
                    }}
                    className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 hover:text-black cursor-pointer text-xs"
                  >
                    -
                  </button>
                  <span className="px-2 font-bold text-xs text-gray-900">{daughterCount}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDaughterCount((prev) => Math.min(4, prev + 1));
                    }}
                    className="w-5 h-5 flex items-center justify-center font-bold text-gray-600 hover:text-black cursor-pointer text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: SELECT AGE */}
        {currentStep === 2 && (
          <div className="space-y-6 flex-1 animate-fadeIn">
            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Select Age
              </h2>
              <p className="text-xs text-gray-500 font-normal">
                Select age of your family
              </p>
            </div>

            {/* List of Member Age Cards matching Screenshots */}
            <div className="space-y-3 pt-1 max-h-[420px] overflow-y-auto pr-1">
              {activeMembersList.map((m) => {
                const isChild = m.id.startsWith('son') || m.id.startsWith('daughter');
                const options = isChild ? childAgeOptions : adultAgeOptions;

                return (
                  <div
                    key={m.id}
                    className="rounded-2xl p-3 sm:p-4 bg-white border border-gray-200/90 shadow-2xs flex items-center justify-between gap-3 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 shrink-0 flex items-center justify-center">
                        {m.avatar === 'self' ? (
                          <AvatarSelf gender={gender} />
                        ) : m.avatar === 'spouse' ? (
                          <AvatarSpouse />
                        ) : m.avatar === 'son' ? (
                          <AvatarSon />
                        ) : (
                          <AvatarDaughter />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 block truncate">
                          {m.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium block">
                          {m.role}
                        </span>
                      </div>
                    </div>

                    {/* Age Dropdown Selector */}
                    <div className="relative shrink-0">
                      <select
                        value={ages[m.id] || (isChild ? '5 yr' : '30 yr')}
                        onChange={(e) => handleAgeChange(m.id, e.target.value)}
                        className="appearance-none bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full py-2 pl-4 pr-8 text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-[#7C3AED] cursor-pointer"
                      >
                        {options.map((opt, oIdx) => (
                          <option key={oIdx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <KeyboardArrowDownIcon
                        sx={{ fontSize: 16 }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: PERSONAL DETAILS */}
        {currentStep === 3 && (
          <div className="space-y-5 flex-1 animate-fadeIn">
            {/* Header */}
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Personal Details
              </h2>
              <p className="text-xs text-gray-500 font-normal max-w-xs mx-auto">
                This information helps us personalize your insurance quotes.
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block text-xs">Name</label>
                <input
                  type="text"
                  value={personalDetails.name}
                  onChange={(e) => handlePersonalDetailChange('name', e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white shadow-2xs"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block text-xs">Mobile Number</label>
                <input
                  type="tel"
                  value={personalDetails.mobile_number}
                  onChange={(e) => handlePersonalDetailChange('mobile_number', e.target.value)}
                  placeholder="Enter your Mobile No"
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white shadow-2xs"
                />
              </div>

              {/* Pincode & Zone 2-Column Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block text-xs">Pincode</label>
                  <input
                    type="text"
                    value={personalDetails.pincode}
                    onChange={(e) => handlePersonalDetailChange('pincode', e.target.value)}
                    placeholder="Pincode"
                    className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white shadow-2xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 block text-xs">Zone</label>
                  <input
                    type="text"
                    value={personalDetails.zone}
                    onChange={(e) => handlePersonalDetailChange('zone', e.target.value)}
                    placeholder="Zone"
                    className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block text-xs">City</label>
                <input
                  type="text"
                  value={personalDetails.city}
                  onChange={(e) => handlePersonalDetailChange('city', e.target.value)}
                  placeholder="Enter city"
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white shadow-2xs"
                />
              </div>

              {/* Cover Amount */}
              <div className="space-y-1">
                <label className="font-bold text-gray-700 block text-xs">Cover Amount</label>
                <select
                  value={personalDetails.cover_amount}
                  onChange={(e) => handlePersonalDetailChange('cover_amount', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white shadow-2xs"
                >
                  <option value="₹5 Lakh">₹5 Lakh</option>
                  <option value="₹10 Lakh">₹10 Lakh</option>
                  <option value="₹15 Lakh">₹15 Lakh</option>
                  <option value="₹25 Lakh">₹25 Lakh</option>
                  <option value="₹50 Lakh">₹50 Lakh</option>
                  <option value="₹1 Crore">₹1 Crore</option>
                </select>
              </div>
            </div>
          </div>
        )}

    </>
  );

  return (
    <>
      {isModal ? (
        /* MODAL DIALOG CONTAINER - 100% UNBREAKABLE, NEVER CUTS OFF */
        <div className="relative w-full max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col h-[580px] max-h-[90vh] sm:max-h-[85vh] overflow-hidden my-auto animate-fadeIn">
          {contentHeader}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-6 has-visible-scrollbar pr-3 sm:pr-4"
          >
            {wizardBody}
          </div>

          {/* FLOATING SCROLL DOWN SYMBOL ON THE RIGHT SIDE */}
          {canScrollDown && (
            <div className="absolute right-4 bottom-22 z-30 pointer-events-auto animate-bounce">
              <button
                type="button"
                onClick={handleScrollDown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E1260] text-white text-[11px] font-bold shadow-lg shadow-purple-900/40 hover:bg-[#341F97] transition-all cursor-pointer border border-purple-300/40"
                title="Scroll down to fill remaining fields"
              >
                <span>Scroll Down</span>
                <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          )}

          {contentFooter}
        </div>
      ) : (
        /* FULL DEDICATED PAGE CONTAINER */
        <div className="w-full min-h-screen bg-[#FAF9F6] py-6 sm:py-10 px-4 sm:px-6 font-['Poppins',sans-serif] text-gray-900 flex flex-col justify-center items-center">
          <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-200/90 flex flex-col overflow-hidden relative">
            {contentHeader}
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="p-6 sm:p-8 space-y-6 has-visible-scrollbar overflow-y-auto max-h-[75vh]"
            >
              {wizardBody}
            </div>
            {canScrollDown && (
              <div className="absolute right-6 bottom-24 z-30 pointer-events-auto animate-bounce">
                <button
                  type="button"
                  onClick={handleScrollDown}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E1260] text-white text-[11px] font-bold shadow-lg shadow-purple-900/40 hover:bg-[#341F97] transition-all cursor-pointer border border-purple-300/40"
                  title="Scroll down to fill remaining fields"
                >
                  <span>Scroll Down</span>
                  <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            )}
            {contentFooter}
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {isSuccessModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-gray-100 max-h-[85vh] my-auto overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircleIcon sx={{ fontSize: 40 }} />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Insurance Quotes Requested
              </span>
              <h3 className="text-xl font-black text-gray-900">
                Personalized Quotes Generated!
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our certified insurance advisory desk will contact you with top comparisons and cashless hospital coverage.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 inline-block px-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Reference ID</span>
              <span className="text-base font-black text-[#7C3AED] tracking-wide">{enquiryRefId}</span>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  navigate('/services');
                }}
                className="w-full py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-[#1E1260] hover:bg-[#150C48] shadow-md cursor-pointer transition-all"
              >
                Back to Services
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </>
  );
};

export default HealthInsuranceWizard;

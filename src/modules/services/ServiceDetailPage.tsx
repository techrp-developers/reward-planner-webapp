// src/modules/services/ServiceDetailPage.jsx
// Web-Based & Mobile-Responsive Service Detail Module
// Faithfully implements all 5 service designs (Four-Wheeler License, Two-Wheeler License, Domicile, Rent Agreement, PAN Card)

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { submitServiceEnquiry } from '../../api/servicesApi';
import { getImageUrl } from '../../api/client';
import { useServiceQuery } from './serviceQueries';
import ServiceSectionState from './components/ServiceSectionState';
import { ServiceVariants, ServiceDocuments, ServiceFaq, ServicePricing, ServiceCartActions, ServiceEnquiryForm } from './components/ServiceDetailSections';
import ServiceImage from '../../components/services/ServiceImage';
import { useAuth } from '../../context/AuthContext';
import { useServiceCart } from '../../context/ServiceCartContext';
import ServiceBannerCarousel, { getServiceBanner } from '../../components/services/ServiceBannerCarousel';
import { SERVICE_PAGE_BANNERS } from '../../components/services/servicePageBanners';
import RichText from '../../components/common/RichText';
import { resolveServiceId, STATIC_SERVICES_DATA } from '../../data/serviceStaticData';
import type { StaticServiceItem } from '../../data/serviceStaticData';
import { getInsuranceQuotePath } from './insurance/insuranceProducts';
import './ServiceDetailPage.css';

// Material UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
import PhotoCameraFrontOutlinedIcon from '@mui/icons-material/PhotoCameraFrontOutlined';

// Team Advisors Images (Mock / crisp avatars for bottom support banner)
import userAvatar1 from '../../assets/home/user-avatar.png';

const shouldHideAddToCartForService = (serviceId: string | number | undefined, serviceName = ''): boolean => {
  const sId = Number(serviceId || 0);
  const normalizedName = String(serviceName || '').toLowerCase();
  return (
    sId === 12 ||
    sId === 18 ||
    sId === 19 ||
    normalizedName.includes('health insurance') ||
    normalizedName.includes('super top-up') ||
    normalizedName.includes('super top up') ||
    normalizedName.includes('personal accident')
  );
};

export const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId?: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth } = useAuth();
  const { addToCart, serviceCartCount } = useServiceCart();

  // Resolve numerical ID (supports both /services/detail/4 and /services/four-wheeler-license)
  const resolvedId = useMemo(() => resolveServiceId(serviceId), [serviceId]);
  const staticData = useMemo<StaticServiceItem>(() => STATIC_SERVICES_DATA[resolvedId] || {
    service: { id: Number(resolvedId), name: 'Service', description: '', price: '0', original_price: '0' },
    variants: [], overview: [], journey: [], trust_stats: [], documents: [], enquiry_fields: [], faqs: [],
  }, [resolvedId]);

  const detailQuery = useServiceQuery('detail', resolvedId);
  const serviceData = detailQuery.data;
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const loading = detailQuery.isPending;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [enquiryRefId, setEnquiryRefId] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);


  const enquiryLock = useRef(false);
  const cartLock = useRef(false);
  const enquiryFormRef = useRef<HTMLDivElement | null>(null);
  const mobileEnquiryFormRef = useRef<HTMLDivElement | null>(null);
  const detailRootRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);

  // Match the real header height, including tablet navigation and font reflow.
  useEffect(() => {
    const root = detailRootRef.current;
    const header = document.querySelector('header');
    if (!root || !header) return;
    const sidebar = sidebarRef.current;
    const updateOffset = () => {
      root.style.setProperty('--service-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
      if (sidebar) root.style.setProperty('--service-sidebar-height', `${Math.ceil(sidebar.getBoundingClientRect().height)}px`);
    };
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(header);
    if (sidebar) observer.observe(sidebar);
    return () => observer.disconnect();
  }, [loading, detailQuery.isError]);

  useEffect(() => {
    setSelectedVariant(current => serviceData?.variants?.find(variant => variant.id === current?.id) || serviceData?.variants?.[0] || staticData?.variants?.[0] || null);
    setFormError('');
  }, [serviceData, staticData]);

  // Pre-fill user details into form
  useEffect(() => {
    if (user) {
      setFormValues((prev) => ({
        ...prev,
        name: prev.name || user.name || user.first_name || '',
        mobile_number: prev.mobile_number || user.phone || user.mobile || '',
        email_id: prev.email_id || user.email || '',
      }));
    }
  }, [user]);

  // Consolidated service entity (API data prioritized, static mock guarantees full UX fidelity)
  const service = serviceData?.service || staticData.service;
  const insuranceQuotePath = getInsuranceQuotePath(resolvedId, service?.name);
  const isInsuranceService = Boolean(insuranceQuotePath);
  const primaryCtaLabel = isInsuranceService ? 'Compare quotes' : 'Buy Now';
  const formTitle = service.form_title || staticData.service.form_title || `Apply for ${service.name}`;
  const formSubtitle = service.form_subtitle || staticData.service.form_subtitle || 'Share your details and our team will help you with the next steps.';
  const variants = (serviceData?.variants && serviceData.variants.length > 0)
    ? serviceData.variants
    : staticData.variants;
  const activeVariant = selectedVariant || variants[0] || staticData.variants[0];

  const price = Number(activeVariant?.price || service?.price || 0);
  const originalPrice = Number(activeVariant?.original_price || service?.original_price || (price > 0 ? price * 1.25 : 0));
  const savings = originalPrice > price ? originalPrice - price : 0;
  const rating = Number(service?.rating || staticData.service.rating || 4.8);

  // Overview checklist (5 points from static or variant details)
  const overviewList = useMemo(() => {
    const feats = Array.isArray(activeVariant?.details) && activeVariant.details.length
      ? activeVariant.details
      : (activeVariant?.features || []);
    if (feats.length) {
      return feats.map((f, i) => ({ id: i, text: String(f), iconType: ['guide', 'eligibility', 'schedule', 'tracking', 'delivery'][i % 5] }));
    }
    if (staticData?.overview?.length) return staticData.overview;
    return [
      { id: 1, text: 'Step-by-step guidance flow', iconType: 'guide' },
      { id: 2, text: 'Document review and application assistance', iconType: 'eligibility' },
      { id: 3, text: 'Support with the next steps', iconType: 'schedule' },
      { id: 4, text: 'Status tracking at every stage', iconType: 'tracking' },
    ];
  }, [staticData, activeVariant]);

  // Journey timeline (From start to finish, here's what happens)
  const journeySteps = useMemo(() => {
    const apiJourney = activeVariant?.journey?.[0]?.content;
    if (Array.isArray(apiJourney) && apiJourney.length) {
      const colors = ['purple', 'blue', 'teal', 'orange'];
      const icons = ['edit', 'document', 'calendar', 'truck'];
      return apiJourney.map((step, idx) => ({
        step: `0${idx + 1}`,
        title: Array.isArray(step) ? step[0] : String(step),
        desc: Array.isArray(step) ? step[1] : '',
        color: colors[idx % colors.length],
        iconType: icons[idx % icons.length],
      }));
    }
    return staticData.journey || [];
  }, [staticData, activeVariant]);

  // Trust stats (3 cards)
  const trustStats = useMemo(() => {
    if (activeVariant?.trust_stats?.length) {
      const colors = ['purple', 'blue', 'teal'];
      const icons = ['badge', 'percent', 'clock'];
      return activeVariant.trust_stats.slice(0, 3).map((item, idx) => {
        const str = String(item).trim();
        const spaceIdx = str.indexOf(' ');
        return {
          value: spaceIdx === -1 ? str : str.substring(0, spaceIdx),
          label: spaceIdx === -1 ? 'Verified' : str.substring(spaceIdx + 1),
          color: colors[idx % colors.length],
          iconType: icons[idx % icons.length],
        };
      });
    }
    return staticData.trust_stats || [];
  }, [staticData, activeVariant]);

  // Required documents
  const documentList = useMemo(() => {
    const docs = serviceData?.documents || [];
    if (docs.length) {
      return docs.map((d, i) => ({
        id: d.id || i,
        name: d.document_name,
        step: `0${i + 1}`,
        iconType: i === 0 ? 'id_card' : (i === 1 ? 'photo' : 'document'),
        is_mandatory: d.is_mandatory,
      }));
    }
    return staticData.documents || [];
  }, [staticData, serviceData]);

  // Enquiry Fields
  const enquiryFields = useMemo(() => {
    const apiFields = serviceData?.enquiry_fields || service?.enquiry_fields;
    if (Array.isArray(apiFields) && apiFields.length && apiFields.every(field => field.field_name && field.label)) return apiFields;
    return staticData?.enquiry_fields?.length ? staticData.enquiry_fields : [
      { field_name: 'name', label: 'Name', field_type: 'text', placeholder: 'Enter your name', is_required: true },
      { field_name: 'city', label: 'City', field_type: 'text', placeholder: 'Enter city', is_required: true },
      { field_name: 'mobile_number', label: 'Mobile Number', field_type: 'tel', placeholder: 'Enter your mobile No', is_required: true },
      { field_name: 'email_id', label: 'Email ID', field_type: 'email', placeholder: 'Enter your Email ID', is_required: true },
      { field_name: 'additional_notes', label: 'Additional Notes (optional)', field_type: 'textarea', placeholder: 'Enter additional notes', is_required: false },
    ];
  }, [staticData, serviceData, service]);

  // FAQs
  const faqList = useMemo(() => {
    const apiFaqs = serviceData?.service_sections?.find((s) => s.section_type === 'faq')?.content;
    if (Array.isArray(apiFaqs) && apiFaqs.length) return apiFaqs;
    return staticData?.faqs || [];
  }, [serviceData, staticData]);

  // Hero image resolution (high res photo)
  const heroImageSrc = useMemo(() => {
    if (service?.hero_image) return service.hero_image;
    if (activeVariant?.image_url) return getImageUrl(activeVariant.image_url);
    if (service?.service_image) return getImageUrl(service.service_image);
    return getServiceBanner(resolvedId, service?.name);
  }, [service, activeVariant, resolvedId]);

  const scrollToEnquiry = () => {
    const target = window.matchMedia('(min-width: 1024px)').matches ? enquiryFormRef.current : mobileEnquiryFormRef.current;
    target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service?.name || 'Reward Planners Service',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    const sId = Number(resolvedId);
    const vId = Number(activeVariant?.id || 0);
    navigate(`/services/checkout?mode=buy_now&serviceId=${sId}&variantId=${vId}`);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    const sId = Number(resolvedId);
    const vId = Number(activeVariant?.id || 0);
    if (cartLock.current) return;
    cartLock.current = true;
    setAddingToCart(true);
    try {
      await addToCart({
        service_id: sId,
        variant_id: vId,
        serviceName: activeVariant?.title || service.name,
      });
    } catch {
      // Toast notification handled in ServiceCartContext
    } finally {
      cartLock.current = false;
      setAddingToCart(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    const name = formValues.name || user?.name || user?.first_name || '';
    const mobile = formValues.mobile_number || formValues.mobile || user?.phone || user?.mobile || '';
    const email = formValues.email_id || formValues.email || user?.email || '';
    const city = formValues.city || formValues.state_of_residence || '';

    if (!name.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    for (const field of enquiryFields) {
      if (field.is_required && !formValues[field.field_name]?.toString().trim()) {
        setFormError(`Please provide ${field.label}`);
        return;
      }
    }

    setFormError('');
    if (enquiryLock.current) return;
    enquiryLock.current = true;
    setSubmitting(true);

    try {
      const payload = {
        service_id: Number(resolvedId),
        variant_id: activeVariant?.id || null,
        name: name.trim(),
        mobile: cleanMobile,
        email: email.trim(),
        city: city.trim(),
        enquiry_data: formValues,
      };
      const res = await submitServiceEnquiry(payload);
      if (res?.success === false) throw new Error(res.message || 'Enquiry was rejected.');
      const generatedRef =
        res?.data?.enquiry_ref ||
        (res?.data?.id ? `#RP-ENQ-${res.data.id}` : 'Submitted');
      setEnquiryRefId(generatedRef);
      setIsSuccessModalOpen(true);
    } catch (error) {
      setFormError(error?.response?.data?.message || error?.message || 'Could not submit your enquiry. Please try again.');
    } finally {
      enquiryLock.current = false;
      setSubmitting(false);
    }
  };

  const renderIcon = (type, className = '') => {
    switch (type) {
      case 'guide':
        return <HomeOutlinedIcon className={className} sx={{ fontSize: 18 }} />;
      case 'eligibility':
        return <PersonOutlinedIcon className={className} sx={{ fontSize: 18 }} />;
      case 'schedule':
        return <CalendarMonthOutlinedIcon className={className} sx={{ fontSize: 18 }} />;
      case 'tracking':
        return <SyncOutlinedIcon className={className} sx={{ fontSize: 18 }} />;
      case 'delivery':
        return <LocalShippingOutlinedIcon className={className} sx={{ fontSize: 18 }} />;
      case 'edit':
        return <EditNoteOutlinedIcon className={className} sx={{ fontSize: 20 }} />;
      case 'document':
        return <AssignmentTurnedInOutlinedIcon className={className} sx={{ fontSize: 20 }} />;
      case 'calendar':
        return <CalendarMonthOutlinedIcon className={className} sx={{ fontSize: 20 }} />;
      case 'truck':
        return <LocalShippingOutlinedIcon className={className} sx={{ fontSize: 20 }} />;
      case 'certificate':
        return <VerifiedUserIcon className={className} sx={{ fontSize: 20 }} />;
      case 'badge':
        return <BadgeOutlinedIcon className={className} sx={{ fontSize: 22 }} />;
      case 'percent':
        return <PercentOutlinedIcon className={className} sx={{ fontSize: 22 }} />;
      case 'clock':
        return <AccessTimeOutlinedIcon className={className} sx={{ fontSize: 22 }} />;
      case 'id_card':
        return <AccountBoxOutlinedIcon className={className} sx={{ fontSize: 28 }} />;
      case 'photo':
        return <PhotoCameraFrontOutlinedIcon className={className} sx={{ fontSize: 28 }} />;
      default:
        return <DescriptionOutlinedIcon className={className} sx={{ fontSize: 24 }} />;
    }
  };

  const hideAddToCart = shouldHideAddToCartForService(resolvedId, service?.name);

  if (detailQuery.isError) return <ServiceSectionState query={detailQuery} label="service details" />;

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded-lg" />
        <div className="aspect-[16/9] max-h-[380px] w-full bg-gray-200 rounded-3xl" />
        <div className="h-28 bg-gray-200 rounded-2xl" />
        <div className="h-60 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div ref={detailRootRef} className="service-detail w-full min-h-screen bg-[#FDFBF9] pb-24 md:pb-16 font-['Poppins',sans-serif] text-gray-900 selection:bg-purple-100 selection:text-purple-900">
      
      <ServiceSectionState query={detailQuery} label="service details" />
      {/* MOBILE TOP SEARCH / NAVIGATION BAR (App Header Style) */}
      <div className="service-detail__mobile-nav md:hidden sticky z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-3 shadow-2xs">
        <button
          onClick={() => navigate('/services')}
          className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center shrink-0"
          aria-label="Back"
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </button>

        <div className="flex-1 flex items-center gap-2 bg-gray-100/90 rounded-full px-3.5 py-1.5 text-xs text-gray-400">
          <SearchIcon sx={{ fontSize: 17 }} className="text-gray-400" />
          <span className="truncate">Search &quot;PAN, Driving, Domicile...&quot;</span>
        </div>

        <button
          onClick={handleShare}
          className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 relative"
          aria-label="Share"
        >
          <ShareOutlinedIcon sx={{ fontSize: 18 }} />
          {copiedLink && (
            <span className="absolute -bottom-8 right-0 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
      </div>

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">

        {/* DESKTOP BREADCRUMB & SHARE BAR */}
        <div className="hidden md:flex items-center justify-between text-xs font-semibold text-gray-500">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/services')}
              className="flex items-center gap-1 hover:text-[#7C3AED] transition-colors cursor-pointer"
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              <span>Services</span>
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/services/category/${service.category_id || 3}`)}
              className="hover:text-[#7C3AED] transition-colors cursor-pointer"
            >
              {service.category_name || 'Government Documents'}
            </button>
            <span>/</span>
            <span className="text-gray-900 font-bold truncate max-w-md">{service.name}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs cursor-pointer relative"
          >
            <ShareOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Share Service</span>
            {copiedLink && (
              <span className="absolute -bottom-7 right-0 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                Link Copied!
              </span>
            )}
          </button>
        </div>

        {/* MAIN RESPONSIVE CONTAINER (Desktop: 2-Column Grid | Mobile: 1-Column Flow) */}
        <div className="service-detail__grid grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* LEFT COLUMN: HERO, VARIANTS, OVERVIEW, TIMELINE, STATS, SAFETY, DOCS, FAQS */}
          <div className="service-detail__content min-w-0 lg:col-span-7 xl:col-span-8 space-y-6">

            {/* 1. HERO IMAGE BANNER (Aspect Ratio clean photo with subtle curve & border) */}
            <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200/90 shadow-xs group">
              <div className="w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[2/1] max-h-[420px] flex items-center justify-center overflow-hidden bg-white">
                <ServiceImage
                  src={heroImageSrc}
                  fallbackSrc={getServiceBanner(resolvedId, service.name)}
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 65vw, 100vw"
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              {/* Verified Badge Overlay */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-gray-100 shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-gray-800 tracking-tight">Govt. Verified Service</span>
              </div>
            </div>

            {/* 2. PLAN / VARIANT SELECTOR PILLS (Image 5 Style - When Multiple Variants Available) */}
            <ServiceVariants variants={variants} selectedVariant={selectedVariant} setSelectedVariant={setSelectedVariant} />

            {/* 3. SERVICE TITLE, RATING & DESCRIPTION */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#7C3AED] bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
                      {service.category_name || 'Government Documents'}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                    {activeVariant?.title || service.name}
                  </h1>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/70 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} sx={{ fontSize: 16 }} />
                    ))}
                  </div>
                  <span className="text-xs font-extrabold text-amber-900">{rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {activeVariant?.short_description || service.description}
              </p>

              {/* Pricing Display on Mobile View */}
              <div className="lg:hidden flex items-baseline justify-between pt-2 border-t border-gray-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                  {originalPrice > price && (
                    <span className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                  )}
                  {savings > 0 && (
                    <span className="text-xs font-bold text-emerald-600 ml-1">Save ₹{savings.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-gray-400">Includes all taxes</span>
              </div>

              {/* Primary Dual CTA Buttons (Matching Mobile App Reference) */}
<ServiceCartActions hideAddToCart={hideAddToCart} handleAddToCart={handleAddToCart} addingToCart={addingToCart} insuranceQuotePath={insuranceQuotePath} navigate={navigate} handleBuyNow={handleBuyNow} primaryCtaLabel={primaryCtaLabel} />
            </div>

            {/* 4. SERVICE OVERVIEW CARD (5 Bullet Items with Violet/Blue Icon Badges) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-4">
              <h2 className="text-sm sm:text-base font-black text-gray-900 tracking-tight">
                Service Overview
              </h2>
              <div className="divide-y divide-gray-100">
                {overviewList.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3.5 first:pt-0 last:pb-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0 border border-purple-100/60 shadow-2xs">
                      {renderIcon(item.iconType, 'text-[#7C3AED]')}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. PROCESS TIMELINE ("From start to finish: Here's what happens") */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-4">
              <h2 className="text-sm sm:text-base font-black text-gray-900 tracking-tight">
                From start to finish: Here&apos;s what happens
              </h2>

              <div className="space-y-3.5 relative pt-1">
                {journeySteps.map((step, idx) => {
                  const isLast = idx === journeySteps.length - 1;
                  const iconBg =
                    step.color === 'purple'
                      ? 'bg-purple-50 text-[#8B3AB5]'
                      : step.color === 'blue'
                      ? 'bg-sky-50 text-sky-600'
                      : step.color === 'teal'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600';

                  return (
                    <div key={idx} className="flex items-start gap-3 sm:gap-4 relative">
                      {/* Step Number Badge + Connecting Line */}
                      <div className="flex flex-col items-center shrink-0 pt-0.5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1E1260] text-white text-[11px] sm:text-xs font-black flex items-center justify-center shadow-xs z-10">
                          {step.step}
                        </div>
                        {!isLast && <div className="w-0.5 h-12 sm:h-14 bg-purple-200/80 my-1" />}
                      </div>

                      {/* Step Card */}
                      <div className="flex-1 bg-gray-50/70 border border-gray-100/90 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 transition-colors hover:bg-purple-50/30">
                        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                          {renderIcon(step.iconType)}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                            {step.title}
                          </h4>
                          {step.desc && (
                            <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-normal">
                              {step.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. TRUST METRICS STATS ROW (3 Modern Metric Cards) */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
              {trustStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-3.5 sm:p-5 border border-gray-200/90 text-center shadow-2xs space-y-1.5 flex flex-col items-center justify-center"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                    {renderIcon(stat.iconType, 'text-[#7C3AED]')}
                  </div>
                  <span className="text-sm sm:text-lg lg:text-xl font-black text-gray-900 block leading-tight">
                    {stat.value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-semibold block leading-tight">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* 7. 100% DATA SAFETY CARD (With Green Shield & Security Vault Illustration) */}
            <div className="bg-gradient-to-r from-emerald-50/80 via-white to-green-50/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-emerald-200/80 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldOutlinedIcon sx={{ fontSize: 22 }} />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                    <span>100% Data Safety</span>
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                    Your personal details are securely handled and used only for service processing as per Govt guidelines.
                  </p>
                </div>
              </div>

              {/* Green Vault Lock Graphic */}
              <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center shrink-0 text-emerald-600">
                <LockOutlinedIcon sx={{ fontSize: 30 }} />
              </div>
            </div>

            {/* 8. REQUIRED DOCUMENTS SECTION (With Stepper Indicator Track) */}
            <ServiceDocuments documentList={documentList} renderIcon={renderIcon} />

            {/* 9. ON MOBILE: RENDER ENQUIRY FORM HERE IN-LINE */}
            <div className="lg:hidden">
              <div
                ref={mobileEnquiryFormRef}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-xs space-y-4"
              >
                <div className="space-y-1 border-b border-gray-100 pb-3">
                  <h3 className="text-base font-black text-gray-900">
                    {formTitle}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formSubtitle}
                  </p>
                </div>

                <ServiceEnquiryForm handleFormSubmit={handleFormSubmit} formError={formError} enquiryFields={enquiryFields} formValues={formValues} handleFieldChange={handleFieldChange} submitting={submitting} />
              </div>
            </div>

            {/* 10. FAQ ACCORDION SECTION (With Blue Circular '?' Badge) */}
            <ServiceFaq faqList={faqList} openFaqIdx={openFaqIdx} setOpenFaqIdx={setOpenFaqIdx} />

            {/* 11. BOTTOM ASSISTANCE BANNER ("Need document help? Quick guidance from our team") */}
            <div className="bg-gradient-to-r from-[#F0F2FF] via-[#E8EDFF] to-[#F5F3FF] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-indigo-100 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900">
                    Need document help?
                  </h4>
                  <p className="text-xs text-gray-600 mt-0.5 font-medium">
                    Quick guidance from our team
                  </p>
                </div>

                {/* Team Face Avatars */}
                <div className="flex items-center -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <ServiceImage
                      key={i}
                      src={userAvatar1}
                      alt="Advisor"
                      className="w-8 h-8 rounded-full border-2 border-white object-cover bg-gray-200"
                    />
                  ))}
                </div>
              </div>

              {/* Call and Chat Buttons Side-by-Side */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                {/* Purple Call Button */}
                <a
                  href="tel:+918660583751"
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#2A1870] hover:bg-[#201058] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <PhoneInTalkIcon sx={{ fontSize: 16 }} />
                  <span>+91 8660583751</span>
                </a>

                {/* Bright Green WhatsApp / Chat Button */}
                <a
                  href="https://wa.me/918660583751?text=Hi%2C%20I%20need%20assistance%20with%20Government%20Services"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <WhatsAppIcon sx={{ fontSize: 16 }} />
                  <span>Chat with us</span>
                </a>
              </div>
            </div>

            {/* 12. PROMOTIONAL OFFERS / RELATED SERVICES CAROUSEL */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
                <h3 className="text-xs sm:text-sm font-black text-gray-900">
                  Related Services & Offers
                </h3>
                <span className="text-[11px] text-[#7C3AED] font-bold">100% Verified</span>
              </div>
              <ServiceBannerCarousel banners={SERVICE_PAGE_BANNERS} fullWidthArtwork />
            </div>

          </div>

          {/* RIGHT COLUMN (DESKTOP ONLY): STICKY BOOKING CARD & DYNAMIC APPLICATION FORM */}
          <aside ref={sidebarRef} aria-label="Service booking" className="service-detail__sidebar hidden lg:col-span-5 xl:col-span-4">

            {/* DESKTOP PRICING & BOOKING ACTION CARD */}
            <div className="service-detail__pricing">
              <ServicePricing price={price} originalPrice={originalPrice} savings={savings} insuranceQuotePath={insuranceQuotePath} navigate={navigate} handleBuyNow={handleBuyNow} primaryCtaLabel={primaryCtaLabel} hideAddToCart={hideAddToCart} handleAddToCart={handleAddToCart} addingToCart={addingToCart} />
            </div>

            <div className="service-detail__sidebar-content space-y-4">

            {/* DESKTOP APPLICATION FORM CARD */}
            <div
              ref={enquiryFormRef}
              className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-md space-y-4"
            >
              <div className="space-y-1 border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-gray-900">
                  {formTitle}
                </h3>
                <p className="text-xs text-gray-500">
                  {formSubtitle}
                </p>
              </div>

              <ServiceEnquiryForm handleFormSubmit={handleFormSubmit} formError={formError} enquiryFields={enquiryFields} formValues={formValues} handleFieldChange={handleFieldChange} submitting={submitting} />
            </div>

            {/* DEDICATED ASSISTANCE HELPLINE WIDGET */}
            <div className="p-4 rounded-2xl bg-[#F6F7FE] border border-indigo-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1E1260] text-white flex items-center justify-center shrink-0">
                <PhoneInTalkIcon sx={{ fontSize: 18 }} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-gray-500 uppercase block">Expert Helpline</span>
                <a href="tel:+918660583751" className="text-xs font-black text-gray-900 hover:text-[#7C3AED] block">
                  +91 8660583751 (9 AM - 7 PM)
                </a>
              </div>
            </div>

            </div>
          </aside>

        </div>

      </div>

      {/* ENQUIRY SUBMISSION SUCCESS MODAL */}
      {isSuccessModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-gray-100 max-h-[85vh] my-auto overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircleIcon sx={{ fontSize: 40 }} />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Request Registered
              </span>
              <h3 className="text-xl font-black text-gray-900">
                Application Submitted Successfully
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our verification officer will review your information and reach out to you shortly.
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


    </div>
  );
};

export default ServiceDetailPage;

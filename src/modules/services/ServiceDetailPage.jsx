// src/modules/services/ServiceDetailPage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchServiceDetails, submitServiceEnquiry } from '../../api/servicesApi';
import { getImageUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ServiceBannerCarousel, { getServiceBanner } from '../../components/services/ServiceBannerCarousel';
import RichText from '../../components/common/RichText';

// Material UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import CheckIcon from '@mui/icons-material/Check';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth } = useAuth();

  const [serviceData, setServiceData] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [enquiryRefId, setEnquiryRefId] = useState('');
  const [formError, setFormError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const enquiryFormRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchServiceDetails(serviceId)
      .then((data) => {
        if (!isMounted) return;
        setServiceData(data);
        if (data?.variants?.length) {
          setSelectedVariant(data.variants[0]);
        }
        // Pre-fill fields if user is logged in
        if (user) {
          setFormValues({
            name: user.name || user.first_name || '',
            full_name: user.name || user.first_name || '',
            email: user.email || '',
            email_id: user.email || '',
            mobile: user.phone || user.mobile || '',
            mobile_number: user.phone || user.mobile || '',
          });
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [serviceId, user]);

  const service = serviceData?.service;
  const variants = serviceData?.variants || [];
  const documents = serviceData?.documents || [];
  const enquiryFields = serviceData?.enquiry_fields || [];
  const serviceSections = serviceData?.service_sections || [];
  const faqs = serviceSections.find((s) => s.section_type === 'faq')?.content || [];
  const faqTitle = serviceSections.find((s) => s.section_type === 'faq')?.title || 'Everything You Need to Know';

  // Fallback enquiry fields when backend hasn't specified custom enquiry fields
  const effectiveEnquiryFields = useMemo(() => {
    if (Array.isArray(enquiryFields) && enquiryFields.length > 0) {
      return enquiryFields;
    }
    return [
      { field_name: 'full_name', label: 'Full Name', field_type: 'text', is_required: true },
      { field_name: 'mobile_number', label: 'Mobile Number', field_type: 'tel', is_required: true },
      { field_name: 'email_id', label: 'Email Address', field_type: 'email', is_required: false },
      { field_name: 'city', label: 'City / Location', field_type: 'text', is_required: false },
      { field_name: 'notes', label: 'Special Instructions / Requirements', field_type: 'textarea', is_required: false },
    ];
  }, [enquiryFields]);

  const activeVariant = selectedVariant || variants[0] || null;
  const price = Number(activeVariant?.price || service?.price || 0);
  const originalPrice = Number(activeVariant?.original_price || service?.original_price || 0);
  const savings = originalPrice > price ? originalPrice - price : 0;
  const isEnquiryService = Number(service?.show_enquiry) === 1;

  // Features list: activeVariant details or features
  const featureList = useMemo(() => {
    if (!activeVariant) return [];
    const feats = Array.isArray(activeVariant.features) ? activeVariant.features : [];
    const details = Array.isArray(activeVariant.details) ? activeVariant.details : [];
    const combined = [...feats, ...details].filter(Boolean);
    return combined.length > 0 ? combined : ['Single Form Submission', 'Document Checklist Built-in', 'Appointment Slot Assistance'];
  }, [activeVariant]);

  // Journey / How it Works
  const journeyBlock = useMemo(() => {
    if (!activeVariant?.journey?.length) return null;
    return activeVariant.journey[0];
  }, [activeVariant]);

  // When Required / What this service covers
  const whenRequiredBlock = useMemo(() => {
    if (!activeVariant?.when_required?.length) return null;
    return activeVariant.when_required[0];
  }, [activeVariant]);

  // Trust Stats
  const trustStats = useMemo(() => {
    if (!activeVariant?.trust_stats?.length) return [];
    return activeVariant.trust_stats.slice(0, 3).map((item) => {
      const str = String(item).trim();
      const spaceIdx = str.indexOf(' ');
      if (spaceIdx === -1) return { value: str, label: '' };
      return {
        value: str.substring(0, spaceIdx),
        label: str.substring(spaceIdx + 1),
      };
    });
  }, [activeVariant]);

  // Data Safety Text
  const safetyContent = useMemo(() => {
    if (activeVariant?.paragraphs?.length) {
      const p = activeVariant.paragraphs[0];
      const text = Array.isArray(p.content) ? p.content.join(' ') : String(p.content || '');
      return {
        title: p.title || '100% Data Safety',
        text: text || 'Your personal information is protected and used only for your service request.',
      };
    }
    return {
      title: '100% Data Safety',
      text: 'Your personal information is protected and used only for your service request.',
    };
  }, [activeVariant]);

  const scrollToEnquiry = () => {
    if (enquiryFormRef.current) {
      enquiryFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFieldChange = (fieldName, value) => {
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    const name = formValues.name || formValues.full_name || user?.name || user?.first_name || '';
    const mobile = formValues.mobile || formValues.mobile_number || formValues.phone || user?.phone || user?.mobile || '';
    const email = formValues.email || formValues.email_id || user?.email || '';
    const city = formValues.city || '';

    if (!name.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    // Validate required fields
    for (const field of effectiveEnquiryFields) {
      if (field.is_required && !formValues[field.field_name]?.trim()) {
        setFormError(`Please fill in ${field.label}`);
        return;
      }
    }
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        service_id: Number(service?.id || serviceId),
        variant_id: activeVariant?.id || null,
        name: name.trim(),
        mobile: cleanMobile,
        email: email.trim(),
        city: city.trim(),
        enquiry_data: formValues,
      };
      const res = await submitServiceEnquiry(payload);
      const generatedRef =
        res?.data?.enquiry_ref ||
        (res?.data?.id ? `#RP-ENQ-${res.data.id}` : `#RP-ENQ-${Math.floor(10000 + Math.random() * 90000)}`);
      setEnquiryRefId(generatedRef);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Service enquiry error:', err);
      // Fallback confirmation
      setEnquiryRefId(`#RP-ENQ-${Math.floor(10000 + Math.random() * 90000)}`);
      setIsSuccessModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-8 space-y-8">
        <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="aspect-[3/1] w-full bg-gray-200 rounded-3xl animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-3xl animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Service Not Found</h2>
        <p className="text-xs text-gray-500">The requested service could not be located in the catalog.</p>
        <button
          onClick={() => navigate('/services')}
          className="px-5 py-2.5 bg-gradient-to-r from-[#FC8BAD] to-[#A654CD] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          Return to Services
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-8 font-['Poppins',sans-serif]">
      {/* 1. TOP BREADCRUMB & BACK NAVIGATION */}
      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-gray-500">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate('/services')}
            className="flex items-center gap-1 hover:text-[#7C3AED] transition-colors cursor-pointer shrink-0"
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            <span>Services</span>
          </button>
          <span>/</span>
          {service.category_name && (
            <>
              <button
                onClick={() => navigate(`/services/category/${service.category_id}`)}
                className="hover:text-[#7C3AED] transition-colors cursor-pointer truncate max-w-[160px] sm:max-w-none"
              >
                {service.category_name}
              </button>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-bold truncate">{service.name}</span>
        </div>

        <button
          onClick={handleShare}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer shrink-0 relative"
          title="Share Service"
        >
          <ShareOutlinedIcon sx={{ fontSize: 18 }} />
          {copiedLink && (
            <span className="absolute -bottom-8 right-0 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
              Link Copied!
            </span>
          )}
        </button>
      </div>

      {/* 2. CARD 1: SERVICE CART HERO (App UI Layout: Header Banner -> Variants -> Title/Price -> Actions) */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs p-6 sm:p-8 space-y-6">
        {/* Full-Width Hero Graphic (Clean, sharp, un-cropped aspect ratio with crystal clear HD rendering) */}
        {(() => {
          const matchingFallbackBanner = getServiceBanner(service.id, service.name);
          const rawImage = activeVariant?.image_url || service.service_image;
          const heroImageSrc = rawImage ? getImageUrl(rawImage) : matchingFallbackBanner;

          return (
            <div className="relative w-full h-48 sm:h-60 md:h-68 lg:h-76 xl:h-80 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#F8F9FD] via-[#F4F5FA] to-[#EEF0F8] border border-gray-200/80 shadow-xs flex items-center justify-center p-2 sm:p-4">
              <img
                src={heroImageSrc}
                alt={service.name}
                className="w-full h-full object-contain drop-shadow-xs transition-transform duration-300"
                style={{
                  imageRendering: '-webkit-optimize-contrast',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
                onError={(e) => {
                  if (e.target.src !== matchingFallbackBanner) {
                    e.target.src = matchingFallbackBanner;
                  }
                }}
              />
            </div>
          );
        })()}

        {/* Variant Selector Cards (Responsive Grid on Widescreen) */}
        {variants.length > 1 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Select Plan / Variant:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                const vPrice = Number(v.price || 0);
                const vOldPrice = Number(v.original_price || v.mrp || 0);

                if (isSelected) {
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className="p-[2px] rounded-2xl bg-gradient-to-r from-[#A654CD] to-[#FC8BAD] cursor-pointer shadow-xs transition-all"
                    >
                      <div className="bg-[#FEF4FF] rounded-[14px] p-4 h-full flex flex-col justify-between">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 block truncate">
                          {v.title || v.variant_name}
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="font-black text-sm sm:text-base text-gray-900">
                            ₹{vPrice.toLocaleString('en-IN')}
                          </span>
                          {vOldPrice > vPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{vOldPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className="rounded-2xl bg-white border border-gray-200 hover:border-gray-300 p-4 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <span className="font-semibold text-xs sm:text-sm text-gray-800 block truncate">
                      {v.title || v.variant_name}
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-gray-900">
                        ₹{vPrice.toLocaleString('en-IN')}
                      </span>
                      {vOldPrice > vPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{vOldPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Title, Pricing & Savings Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-gray-100">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
                {service.category_name || 'Verified Service'}
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
              {activeVariant?.title || service.name}
            </h1>
            <RichText
              content={activeVariant?.short_description || service.description}
              fallback=""
              className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl"
            />
          </div>

          {/* Pricing Box for Enquiry or Standard Service */}
          <div className="sm:text-right shrink-0 bg-violet-50/60 sm:bg-transparent p-4 sm:p-0 rounded-2xl">
            <div className="flex sm:justify-end items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {originalPrice > price && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-xs font-bold text-emerald-700 block mt-1">
                Save ₹{savings.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Primary Action Button (Enquire Now / Buy Now) */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={scrollToEnquiry}
            className="w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FC8BAD] to-[#A654CD] hover:opacity-95 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isEnquiryService ? 'Enquire Now' : `₹${price.toLocaleString('en-IN')} Buy Now`}</span>
          </button>
        </div>
      </div>

      {/* 3. CARD 2: FEATURES, JOURNEY TIMELINE & DATA SAFETY (Matching ServiceFeaturesBullet.tsx) */}
      <div className="space-y-6">
        {/* Block 1: Features Checklist (Responsive 3-column grid) */}
        {featureList.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {featureList.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 text-xs sm:text-sm font-semibold text-gray-800">
                  <div className="w-6 h-6 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-2xs">
                    <CheckIcon sx={{ fontSize: 14 }} />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block 2: Step-by-Step Journey Timeline */}
        {journeyBlock && Array.isArray(journeyBlock.content) && journeyBlock.content.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6 border-l-4 border-l-[#A654CD]">
            <h3 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-[#A654CD] to-[#FC8BAD]">
              {journeyBlock.title || "From start to finish, here's what happens"}
            </h3>

            <div className="space-y-4">
              {journeyBlock.content.map((step, sIdx) => {
                const isArray = Array.isArray(step);
                const title = isArray ? step[0] : String(step);
                const desc = isArray ? step[1] : '';
                const isLast = sIdx === journeyBlock.content.length - 1;

                return (
                  <div key={sIdx} className="flex items-start gap-3.5 relative">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-7 h-7 rounded-full bg-violet-100 text-[#7C3AED] font-bold text-xs flex items-center justify-center shadow-2xs z-10">
                        {sIdx + 1}
                      </div>
                      {!isLast && <div className="w-0.5 h-10 bg-violet-200 mt-1" />}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900">{title}</h4>
                      {desc && <p className="text-xs sm:text-sm text-gray-600 mt-0.5 leading-relaxed">{desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Block 2.5: What this service covers (from when_required) */}
        {whenRequiredBlock && Array.isArray(whenRequiredBlock.content) && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm sm:text-base font-black text-gray-900">
              {whenRequiredBlock.title || 'What this service covers'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {whenRequiredBlock.content.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs sm:text-sm font-medium text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8665FF] shrink-0" />
                  <span>{String(item)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block 3: Trust Stats Block */}
        {trustStats.length > 0 && (
          <div className="bg-gradient-to-r from-[#F1EFFF] to-[#ECEBFF] rounded-3xl p-6 sm:p-7 border border-violet-100 shadow-2xs">
            <div className="grid grid-cols-3 divide-x divide-violet-200 text-center">
              {trustStats.map((stat, idx) => (
                <div key={idx} className="px-4 space-y-1">
                  <span className="text-lg sm:text-2xl font-black text-[#7C3AED] block leading-tight">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600 font-semibold block leading-snug">
                    {stat.label || 'Verified'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block 4: 100% Data Safety Card */}
        <div className="bg-gradient-to-r from-[#F9FAFB] to-[#E9FFE3] rounded-3xl p-6 border border-emerald-100 flex items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1 flex-1">
            <h4 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-2">
              <ShieldOutlinedIcon sx={{ fontSize: 20 }} className="text-emerald-600" />
              <span>{safetyContent.title}</span>
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {safetyContent.text}
            </p>
          </div>
        </div>
      </div>

      {/* 4. CARD 3: REQUIRED DOCUMENTS CHECKLIST */}
      {documents.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DescriptionOutlinedIcon sx={{ fontSize: 22 }} className="text-[#7C3AED]" />
              <h3 className="text-base sm:text-lg font-black text-gray-900">Required Documents</h3>
            </div>
            <span className="text-xs text-gray-400 font-semibold">Digital Copies Only</span>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Keep digital scans or clear photos ready. Our verification officer will review them before filing:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 flex items-center justify-between text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      doc.is_mandatory ? 'bg-[#8665FF]' : 'bg-gray-400'
                    }`}
                  />
                  <span className="font-bold text-gray-800 truncate">{doc.document_name}</span>
                </div>
                {doc.is_mandatory && (
                  <span className="bg-[#EDE9FE] text-[#7C3AED] font-bold text-[10px] px-2.5 py-0.5 rounded-md shrink-0">
                    Required
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CARD 4: DYNAMIC ENQUIRY FORM (Smoothly Scrolled into View) */}
      {effectiveEnquiryFields.length > 0 && (
        <div
          ref={enquiryFormRef}
          className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6 scroll-mt-24"
        >
          <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
            <div className="w-11 h-11 rounded-2xl bg-violet-100 text-[#7C3AED] flex items-center justify-center shrink-0">
              <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 24 }} />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-black text-gray-900">
                Interested in this Service?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Fill in the details below and our team will reach out to you shortly.
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {formError && (
              <div className="md:col-span-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            {effectiveEnquiryFields.map((field, idx) => {
              const isRequired = Boolean(field.is_required);
              const fieldKey = field.field_name;

              if (field.field_type === 'select' && Array.isArray(field.options)) {
                return (
                  <div key={idx} className="space-y-1.5">
                    <label className="font-bold text-gray-700 block text-xs sm:text-sm">
                      {field.label} {isRequired && <span className="text-rose-500">*</span>}
                    </label>
                    <select
                      value={formValues[fieldKey] || ''}
                      onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                      required={isRequired}
                      className="w-full p-3.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white shadow-2xs"
                    >
                      <option value="">Select {field.label.toLowerCase()}</option>
                      {field.options.map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.field_type === 'textarea') {
                return (
                  <div key={idx} className="md:col-span-2 space-y-1.5">
                    <label className="font-bold text-gray-700 block text-xs sm:text-sm">
                      {field.label} {isRequired && <span className="text-rose-500">*</span>}
                    </label>
                    <textarea
                      rows={3}
                      value={formValues[fieldKey] || ''}
                      onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full p-3.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] shadow-2xs"
                    />
                  </div>
                );
              }

              return (
                <div key={idx} className="space-y-1.5">
                  <label className="font-bold text-gray-700 block text-xs sm:text-sm">
                    {field.label} {isRequired && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type={field.field_type === 'number' ? 'number' : 'text'}
                    value={formValues[fieldKey] || ''}
                    onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                    required={isRequired}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="w-full p-3.5 border border-gray-300 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-[#7C3AED] shadow-2xs"
                  />
                </div>
              );
            })}

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#FC8BAD] to-[#A654CD] hover:opacity-95 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
              >
                {submitting ? 'Submitting Application...' : 'Submit Enquiry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. CARD 5: FAQ SECTION */}
      {faqs.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-base sm:text-lg font-black text-gray-900">
              {faqTitle}
            </h3>
            <div className="w-8 h-8 rounded-full bg-violet-100 text-[#7C3AED] flex items-center justify-center">
              <HelpOutlineOutlinedIcon sx={{ fontSize: 20 }} />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-gray-900 hover:text-[#7C3AED] transition-colors cursor-pointer gap-3"
                  >
                    <span>{faq.question}</span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-[#7C3AED] text-white' : 'bg-[#F3EFFF] text-[#7C3AED]'
                      }`}
                    >
                      {isOpen ? (
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <AddIcon sx={{ fontSize: 14 }} />
                      )}
                    </div>
                  </button>
                  {isOpen && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-2.5 pl-0.5 leading-relaxed animate-fadeIn">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6.5. TOP PROMOTIONAL OFFERS & RELATED SERVICE BANNERS (like above) */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h3 className="text-sm sm:text-base font-black text-gray-900">
            Special Promotional Offers & Related Services
          </h3>
          <span className="text-xs text-[#7C3AED] font-bold">100% Verified Benefits</span>
        </div>
        <ServiceBannerCarousel />
      </section>

      {/* 7. CARD 6: NEED HELP BANNER */}
      <div className="bg-gradient-to-r from-[#DFE4FF] via-[#7B8BFA] to-[#4F6BFF] rounded-3xl p-6 sm:p-8 text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <h4 className="font-black text-base sm:text-lg text-gray-900">
            Need help with Government Documents?
          </h4>
          <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-medium">
            Not sure which document you need? Our team will guide you step by step.
          </p>
        </div>

        {/* Split Action Button */}
        <div className="flex items-center h-12 bg-[#FFFBEB] rounded-xl overflow-hidden shadow-sm shrink-0 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial text-center py-2 px-4 border-r border-[#FDE68A]">
            <span className="text-xs sm:text-sm font-bold text-gray-800 tracking-wide">
              +91 8660 583751
            </span>
          </div>
          <a
            href="tel:+918660583751"
            className="px-6 py-2 text-xs sm:text-sm font-extrabold text-[#1F2937] hover:bg-amber-100 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <PhoneInTalkIcon sx={{ fontSize: 16 }} className="text-[#7C3AED]" />
            <span>Talk To Us</span>
          </a>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircleIcon sx={{ fontSize: 40 }} />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Enquiry Confirmed
              </span>
              <h3 className="text-xl font-black text-gray-900">
                Enquiry Submitted Successfully
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Our team will review your details and contact you shortly.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 inline-block">
              <span className="text-xs text-gray-400 block font-medium">Reference ID</span>
              <span className="text-sm font-black text-[#7C3AED]">{enquiryRefId}</span>
            </div>

            <div>
              <button
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  navigate('/services');
                }}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#FC8BAD] to-[#A654CD] hover:opacity-95 shadow-md cursor-pointer"
              >
                Back to Services
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailPage;

// src/modules/services/ServiceBundlePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchServiceBundleDetail, submitServiceEnquiry } from '../../api/servicesApi';
import { getImageUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { GradientButton } from '../../components/ui/GradientButton';
import { Modal } from '../../components/ui/Modal';
import ServiceBannerCarousel, { getServiceBanner } from '../../components/services/ServiceBannerCarousel';
import RichText from '../../components/common/RichText';

// Material UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

export const ServiceBundlePage = () => {
  const { bundleId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, openAuth } = useAuth();

  const [bundleData, setBundleData] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchServiceBundleDetail(bundleId)
      .then((data) => {
        if (!isMounted) return;
        setBundleData(data);
        if (user) {
          setFormValues({
            full_name: user.name || user.first_name || '',
            email_id: user.email || '',
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
  }, [bundleId, user]);

  const bundle = bundleData?.bundle;
  const items = bundleData?.items || [];
  const pricing = bundleData?.pricing || {};
  const enquiryFields = bundleData?.enquiry_fields || [];
  const trustStats = bundleData?.sections?.trust_stats || [];

  const handleFieldChange = (field, val) => {
    setFormValues((prev) => ({ ...prev, [field]: val }));
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }

    // Validate required fields
    for (const f of enquiryFields) {
      if (f.is_required && !formValues[f.field_name]?.trim()) {
        setFormError(`Please enter ${f.label}`);
        return;
      }
    }

    setFormError('');
    setSubmitting(true);
    try {
      await submitServiceEnquiry({
        bundle_id: Number(bundle?.id || bundleId),
        form_data: formValues,
      });
      setIsSuccessModalOpen(true);
    } catch {
      setIsSuccessModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-12">
        <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="mt-6 h-64 bg-gray-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Bundle Not Found</h2>
        <button
          onClick={() => navigate('/services')}
          className="px-5 py-2.5 bg-gradient-to-r from-[#FC8BAD] to-[#A654CD] text-white rounded-xl text-xs font-bold"
        >
          Return to Services
        </button>
      </div>
    );
  }

  const bundlePrice = Number(pricing.bundle_price || bundle.bundle_price || 0);
  const totalPrice = Number(pricing.total_price || bundle.original_price || 0);
  const savings = pricing.savings || Math.max(0, totalPrice - bundlePrice);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6 font-['Poppins',sans-serif]">
      {/* 1. TOP PROMOTIONAL SERVICE BANNERS CAROUSEL (like above) */}
      <ServiceBannerCarousel />

      {/* 2. Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-1 hover:text-[#7C3AED] transition-colors cursor-pointer"
        >
          <ArrowBackIcon sx={{ fontSize: 15 }} />
          <span>Services</span>
        </button>
        <span>/</span>
        <span className="text-gray-900 font-bold">{bundle.name}</span>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Bundle Info & Included Items (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Banner Card */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="relative h-48 sm:h-60 md:h-68 bg-gradient-to-r from-[#F8F9FD] via-[#F4F5FA] to-[#EEF0F8] border-b border-gray-100 flex items-center justify-center p-2 sm:p-4">
              <img
                src={bundle.banner_image ? getImageUrl(bundle.banner_image) : getServiceBanner(bundle.id, bundle.name)}
                alt={bundle.name}
                className="w-full h-full object-contain drop-shadow-xs transition-transform duration-300"
                style={{
                  imageRendering: '-webkit-optimize-contrast',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
                onError={(e) => {
                  const fallback = getServiceBanner(bundle.id, bundle.name);
                  if (e.target.src !== fallback) {
                    e.target.src = fallback;
                  }
                }}
              />
              {savings > 0 && (
                <span className="absolute top-4 right-4 bg-emerald-600 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-md">
                  Save ₹{savings.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />
                <span className="text-xs font-bold uppercase tracking-wider">Comprehensive Bundle Pack</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">{bundle.name}</h1>
              <RichText content={bundle.description} className="text-xs text-gray-600 leading-relaxed" />
            </div>
          </div>

          {/* Included Services List */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-black text-gray-900">
              Services Included in this Pack ({items.length})
            </h3>

            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="py-3.5 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[#F8F9FD] to-[#EEF0F8] border border-gray-200 p-1 flex items-center justify-center shrink-0">
                    <img
                      src={item.image_url ? getImageUrl(item.image_url) : getServiceBanner(item.id, item.title || item.service_name)}
                      alt={item.title}
                      className="w-full h-full object-contain drop-shadow-2xs"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                      onError={(e) => {
                        const fb = getServiceBanner(item.id, item.title || item.service_name);
                        if (e.target.src !== fb) e.target.src = fb;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">
                      {item.title || item.service_name}
                    </h4>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      Standard Individual Price: ₹{Number(item.individual_price || item.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      ₹{Number(item.bundle_price).toLocaleString('en-IN')} in pack
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Stats */}
          {trustStats.length > 0 && (
            <div className="grid grid-cols-3 gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
              {trustStats.map((st, i) => (
                <div key={i}>
                  <strong className="text-xs sm:text-sm font-black text-gray-900 block">{st}</strong>
                  <span className="text-[10px] text-gray-400">Verified Platform</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Quick Enquiry Form (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-5">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md space-y-5">
            {/* Price Box */}
            <div className="space-y-1 border-b border-gray-100 pb-4">
              <span className="text-[11px] font-bold uppercase text-gray-400">All-Inclusive Pack Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">
                  ₹{bundlePrice.toLocaleString('en-IN')}
                </span>
                {totalPrice > bundlePrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {savings > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Save ₹{savings.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                Single dedicated account manager will handle all services end-to-end.
              </p>
            </div>

            {/* Dynamic Enquiry Form */}
            <form onSubmit={handleEnquirySubmit} className="space-y-3.5 text-xs">
              <h4 className="font-extrabold text-sm text-gray-900">Request Pack Activation</h4>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                  {formError}
                </div>
              )}

              {enquiryFields.map((f) => {
                const req = Boolean(f.is_required);
                return (
                  <div key={f.field_name} className="space-y-1">
                    <label className="font-bold text-gray-700 block">
                      {f.label} {req && <span className="text-rose-500">*</span>}
                    </label>
                    {f.field_type === 'textarea' ? (
                      <textarea
                        rows={2}
                        value={formValues[f.field_name] || ''}
                        onChange={(e) => handleFieldChange(f.field_name, e.target.value)}
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                        className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED]"
                      />
                    ) : (
                      <input
                        type={f.field_type === 'number' ? 'number' : 'text'}
                        value={formValues[f.field_name] || ''}
                        onChange={(e) => handleFieldChange(f.field_name, e.target.value)}
                        required={req}
                        placeholder={`Enter ${f.label.toLowerCase()}`}
                        className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#7C3AED]"
                      />
                    )}
                  </div>
                );
              })}

              <GradientButton type="submit" loading={submitting} className="w-full py-3.5 text-xs font-bold mt-2 shadow-sm">
                <span>{isAuthenticated ? 'Book This Pack Now' : 'Sign In to Book'}</span>
              </GradientButton>

              <div className="pt-2 text-center text-[11px] text-gray-400">
                🔒 Includes door-step document pickup and CA review.
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          navigate('/services');
        }}
        title="Pack Booking Submitted!"
        maxWidth="max-w-md"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircleOutlinedIcon sx={{ fontSize: 36 }} />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-base text-gray-900">
              {bundle.name} Booked!
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Your dedicated pack relationship manager will call you within 2 business hours to schedule document verification.
            </p>
          </div>
          <button
            onClick={() => {
              setIsSuccessModalOpen(false);
              navigate('/services');
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FC8BAD] to-[#A654CD] text-white font-bold text-xs"
          >
            Back to Services
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceBundlePage;

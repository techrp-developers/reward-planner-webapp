// src/modules/services/ServiceCategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchServicesByCategory } from '../../api/servicesApi';
import { getImageUrl } from '../../api/client';
import ServiceBannerCarousel, { getServiceBanner } from '../../components/services/ServiceBannerCarousel';
import { stripHtml } from '../../components/common/RichText';

// Material UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';


export const ServiceCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchServicesByCategory(categoryId)
      .then((res) => {
        if (!isMounted) return;
        if (res?.data?.category) setCategory(res.data.category);
        if (Array.isArray(res?.data?.services)) setServices(res.data.services);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  const filtered = services.filter((s) =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6 font-['Poppins',sans-serif]">
      {/* 1. TOP PROMOTIONAL SERVICE BANNERS CAROUSEL (like above) */}
      <ServiceBannerCarousel />

      {/* 2. Breadcrumbs & Back Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-1 hover:text-[#7C3AED] transition-colors cursor-pointer"
        >
          <ArrowBackIcon sx={{ fontSize: 15 }} />
          <span>All Services</span>
        </button>
        <span>/</span>
        <span className="text-gray-900 font-bold">{category?.name || 'Category'}</span>
      </div>

      {/* 3. Category Hero Card */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md p-3 flex items-center justify-center shrink-0 border border-white/30">
              {category?.icon ? (
                <img
                  src={getImageUrl(category.icon)}
                  alt={category.name}
                  className="w-full h-full object-contain filter drop-shadow"
                />
              ) : (
                <BuildOutlinedIcon sx={{ fontSize: 36 }} className="text-white" />
              )}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-pink-200">
                Official Government & Certified Hub
              </span>
              <h1 className="text-xl sm:text-3xl font-black mt-1 leading-tight">
                {category?.name || 'Services'}
              </h1>
              <p className="text-xs text-white/80 mt-1 max-w-xl">
                Explore end-to-end verified applications, document renewals, and expert advisory with fast processing.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${category?.name || 'category'}...`}
              className="w-full px-4 py-2.5 text-xs bg-white text-gray-900 rounded-xl outline-none shadow-sm placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 3. Services Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h2 className="text-sm sm:text-base font-black text-gray-900">
            Available Services ({filtered.length})
          </h2>
          <span className="text-xs text-gray-500 font-medium">Verified by Govt Agents</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-2">
            <h3 className="font-bold text-gray-900 text-sm">No services found</h3>
            <p className="text-xs text-gray-400">Try clearing your search query or view all services.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((srv) => {
              const price = Number(srv.price || 0);
              const days = srv.estimated_days || 3;
              const rating = Number(srv.rating || 4.5);
              const reviews = srv.review_count || 0;

              return (
                <div
                  key={srv.id}
                  onClick={() => navigate(`/services/detail/${srv.id}`)}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-24 h-20 sm:w-28 sm:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#F8F9FD] to-[#EEF0F8] border border-gray-100 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-102 transition-transform">
                      <img
                        src={srv.service_image ? getImageUrl(srv.service_image) : getServiceBanner(srv.id, srv.name)}
                        alt={srv.name}
                        className="w-full h-full object-contain drop-shadow-2xs"
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                        onError={(e) => {
                          const fallback = getServiceBanner(srv.id, srv.name);
                          if (e.target.src !== fallback) {
                            e.target.src = fallback;
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          {days} Days Delivery
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                          <StarIcon sx={{ fontSize: 13 }} />
                          <span className="text-[11px] font-bold text-gray-800">{rating}</span>
                          {reviews > 0 && <span className="text-[10px] text-gray-400">({reviews})</span>}
                        </div>
                      </div>

                      <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 mt-1 line-clamp-1 group-hover:text-[#7C3AED] transition-colors">
                        {srv.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {stripHtml(srv.description)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-gray-900">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-medium">all inclusive</span>
                    </div>

                    <button className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FC8BAD] to-[#A654CD] shadow-xs group-hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer">
                      <span>Get Started</span>
                      <ArrowForwardIcon sx={{ fontSize: 13 }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Help & Support Banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <VerifiedOutlinedIcon sx={{ fontSize: 24 }} className="text-emerald-600" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">Need Custom Corporate Processing?</h4>
            <p className="text-[11px] text-gray-500">
              Bulk submissions for employee tax filing, group insurance, and visa passports are available with custom invoicing.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/services')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default ServiceCategoryPage;

// src/modules/services/ServicesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchServiceCategories,
  fetchAllServices,
  fetchServiceBanners,
  fetchServiceBundles,
} from '../../api/servicesApi';
import { getImageUrl } from '../../api/client';
import ServiceBannerCarousel, { getServiceBanner } from '../../components/services/ServiceBannerCarousel';
import { stripHtml } from '../../components/common/RichText';

// Material UI Icons
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

export const ServicesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      fetchServiceCategories(),
      fetchServiceBanners(),
      fetchServiceBundles(),
      fetchAllServices(),
    ]).then(([catRes, banRes, bunRes, srvRes]) => {
      if (!isMounted) return;
      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value)) {
        setCategories(catRes.value);
      }
      if (banRes.status === 'fulfilled' && Array.isArray(banRes.value)) {
        setBanners(banRes.value);
      }
      if (bunRes.status === 'fulfilled' && Array.isArray(bunRes.value)) {
        setBundles(bunRes.value);
      }
      if (srvRes.status === 'fulfilled' && Array.isArray(srvRes.value)) {
        setServices(srvRes.value);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryClick = (cat) => {
    const displayType = String(cat.display_type || 'list').toLowerCase();
    const catName = String(cat.name || '').toLowerCase();

    if (displayType === 'content' || catName.includes('mutual fund')) {
      navigate('/services/mutual-funds');
    } else if (displayType === 'direct' && cat.direct_service_id) {
      navigate(`/services/detail/${cat.direct_service_id}`);
    } else {
      navigate(`/services/category/${cat.id}`);
    }
  };

  const filteredServices = services.filter((srv) =>
    (srv.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (srv.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (srv.category_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-8">
      {/* 1. TOP PROMOTIONAL SERVICE BANNERS CAROUSEL (EXACT PREVIOUS BANNER UI, DUMMY FALLBACKS, SAME BG IMAGES & CONTENT) */}
      <ServiceBannerCarousel banners={banners} />

      {/* 2. SEARCH BAR & QUICK FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-black text-gray-900">
            Explore Services
          </span>
          <span className="text-xs text-gray-400 font-semibold">
            ({categories.length} Categories · {services.length} Services)
          </span>
        </div>

        <div className="w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PAN, MSEB, Tax, Insurance, Driving License..."
            className="w-full px-4 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] font-medium shadow-2xs"
          />
        </div>
      </div>

      {/* 3. SERVICE CATEGORIES (App UI Layout: 3 equal cards on Row 1, Wide + Narrow card on Row 2) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h2 className="text-sm sm:text-base font-black text-gray-900">
            Browse Services by Category
          </h2>
          <span className="text-xs text-gray-400">
            {categories.length} Specialized Hubs
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Row 1: First 3 Categories (Tax Filing, Insurance, Government Document) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {categories.slice(0, 3).map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className="relative h-32 rounded-2xl p-5 overflow-hidden border border-[#ECE7FF] bg-gradient-to-br from-[#FAF8FF] to-[#EFEAFF] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <h3 className="text-sm sm:text-base font-black text-[#1F2937] leading-snug max-w-[65%] group-hover:text-[#7C3AED] transition-colors">
                    {cat.name}
                  </h3>

                  <div className="absolute right-3 bottom-2 w-20 h-20 flex items-center justify-center pointer-events-none group-hover:scale-108 transition-transform duration-300">
                    {cat.icon ? (
                      <img
                        src={getImageUrl(cat.icon)}
                        alt={cat.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <BuildOutlinedIcon sx={{ fontSize: 40 }} className="text-[#A654CD]" />
                    )}
                  </div>

                  <span className="text-[11px] font-bold text-[#7C3AED] group-hover:underline">
                    Explore Services →
                  </span>
                </div>
              ))}
            </div>

            {/* Row 2: Next 2 Categories (Mutual Fund = Wide 2/3, MSEB Name Change = Narrow 1/3) */}
            {categories.length > 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* 4th Category: Mutual Fund (Wide 8 columns) */}
                {categories[3] && (
                  <div
                    onClick={() => handleCategoryClick(categories[3])}
                    className="sm:col-span-8 relative h-32 rounded-2xl p-5 overflow-hidden border border-[#ECE7FF] bg-gradient-to-br from-[#FAF8FF] to-[#EFEAFF] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="max-w-[65%] space-y-1">
                      <h3 className="text-sm sm:text-base font-black text-[#1F2937] leading-snug group-hover:text-[#7C3AED] transition-colors">
                        {categories[3].name}
                      </h3>
                      <p className="text-[11px] text-gray-500 line-clamp-1">
                        SIP calculators, goal planning, and verified educational guides
                      </p>
                    </div>

                    <div className="absolute right-4 bottom-2 w-28 h-24 flex items-center justify-center pointer-events-none group-hover:scale-108 transition-transform duration-300">
                      {categories[3].icon ? (
                        <img
                          src={getImageUrl(categories[3].icon)}
                          alt={categories[3].name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <BuildOutlinedIcon sx={{ fontSize: 44 }} className="text-[#A654CD]" />
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-[#7C3AED] group-hover:underline">
                      Calculate & Learn →
                    </span>
                  </div>
                )}

                {/* 5th Category: MSEB Name Change (Narrow 4 columns) */}
                {categories[4] && (
                  <div
                    onClick={() => handleCategoryClick(categories[4])}
                    className="sm:col-span-4 relative h-32 rounded-2xl p-5 overflow-hidden border border-[#ECE7FF] bg-gradient-to-br from-[#FAF8FF] to-[#EFEAFF] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                  >
                    <h3 className="text-sm sm:text-base font-black text-[#1F2937] leading-snug max-w-[65%] group-hover:text-[#7C3AED] transition-colors">
                      {categories[4].name}
                    </h3>

                    <div className="absolute right-3 bottom-2 w-20 h-20 flex items-center justify-center pointer-events-none group-hover:scale-108 transition-transform duration-300">
                      {categories[4].icon ? (
                        <img
                          src={getImageUrl(categories[4].icon)}
                          alt={categories[4].name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <BuildOutlinedIcon sx={{ fontSize: 40 }} className="text-[#A654CD]" />
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-[#7C3AED] group-hover:underline">
                      Book Now →
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. VALUE SERVICE BUNDLES & PACKS (Clean 2:1 ratio, uncropped graphics) */}
      {bundles.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />
              </div>
              <h2 className="text-sm sm:text-base font-black text-gray-900">
                All-in-One Value Packs & Bundles
              </h2>
            </div>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Save up to 25%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bundles.map((bundle) => {
              const savings = Math.max(0, Number(bundle.original_price || 0) - Number(bundle.bundle_price || 0));
              return (
                <div
                  key={bundle.id}
                  onClick={() => navigate(`/services/bundle/${bundle.id}`)}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="relative aspect-[2/1] w-full bg-gradient-to-br from-[#F8F9FD] to-[#EEF0F8] overflow-hidden flex items-center justify-center p-1.5">
                    <img
                      src={bundle.banner_image ? getImageUrl(bundle.banner_image) : getServiceBanner(bundle.id, bundle.name)}
                      alt={bundle.name}
                      className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-500 drop-shadow-2xs"
                      style={{ imageRendering: '-webkit-optimize-contrast' }}
                      onError={(e) => {
                        const fb = getServiceBanner(bundle.id, bundle.name);
                        if (e.target.src !== fb) e.target.src = fb;
                      }}
                    />
                    {savings > 0 && (
                      <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md">
                        Save ₹{savings.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-black text-sm sm:text-base text-gray-900 group-hover:text-[#7C3AED] transition-colors">
                      {bundle.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {stripHtml(bundle.description)}
                    </p>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-black text-gray-900">
                            ₹{Number(bundle.bundle_price).toLocaleString('en-IN')}
                          </span>
                          {Number(bundle.original_price) > Number(bundle.bundle_price) && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{Number(bundle.original_price).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold">Bundle Discount Applied</span>
                      </div>

                      <button className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] shadow-sm group-hover:opacity-95 flex items-center gap-1.5 cursor-pointer">
                        <span>View Pack</span>
                        <ArrowForwardIcon sx={{ fontSize: 14 }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. ALL ACTIVE SERVICES GRID (Clean 2:1 Service image display without cutting off illustrations) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-sm sm:text-base font-black text-gray-900">
              Popular & Certified Services
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Choose from verified legal, government, and financial services
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            Showing {filteredServices.length} services
          </span>
        </div>

        {filteredServices.length === 0 && !loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
            <p className="text-sm font-bold text-gray-700">No services matched your query</p>
            <p className="text-xs text-gray-400">Try searching for PAN, Tax, Insurance, or License</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((srv) => {
              const price = Number(srv.price || 0);
              const days = srv.estimated_days || 3;
              const rating = Number(srv.rating || 4.5);

              return (
                <div
                  key={srv.id}
                  onClick={() => navigate(`/services/detail/${srv.id}`)}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="flex gap-3.5 items-start">
                    {/* Uncropped Service Image Thumbnail with padded canvas matching mobile Card.tsx */}
                    <div className="w-28 h-20 sm:w-32 sm:h-22 rounded-xl overflow-hidden bg-gradient-to-br from-[#F8F9FD] to-[#EEF0F8] border border-gray-100 flex items-center justify-center p-1.5 shrink-0 group-hover:scale-102 transition-transform">
                      <img
                        src={srv.service_image ? getImageUrl(srv.service_image) : getServiceBanner(srv.id, srv.name)}
                        alt={srv.name}
                        className="w-full h-full object-contain drop-shadow-2xs"
                        style={{ imageRendering: '-webkit-optimize-contrast' }}
                        onError={(e) => {
                          const fb = getServiceBanner(srv.id, srv.name);
                          if (e.target.src !== fb) e.target.src = fb;
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full line-clamp-1 border border-violet-100">
                          {srv.category_name || 'Service'}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                          <StarIcon sx={{ fontSize: 13 }} />
                          <span className="text-[11px] font-bold text-gray-700">{rating}</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 mt-1 line-clamp-1 group-hover:text-[#7C3AED] transition-colors">
                        {srv.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {stripHtml(srv.description)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-gray-900">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">all inclusive</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                        <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} className="text-emerald-600" />
                        <span>Est. {days} working days</span>
                      </div>
                    </div>

                    <button className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#8b3ab5] bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1">
                      <span>Book Service</span>
                      <ArrowForwardIcon sx={{ fontSize: 13 }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. TRUST & SAFETY BADGE */}
      <div className="bg-gradient-to-r from-violet-50 via-pink-50 to-amber-50 rounded-2xl border border-pink-200/60 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#A654CD] shrink-0">
            <VerifiedOutlinedIcon sx={{ fontSize: 26 }} />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900">100% Data Confidentiality & CA Verification</h4>
            <p className="text-xs text-gray-600 mt-0.5">
              Your personal and financial records are processed strictly through authorized govt channels and certified CAs.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-gray-700 bg-white/80 px-3 py-1.5 rounded-lg border border-gray-200">
            🔒 256-bit Encrypted
          </span>
          <span className="text-xs font-bold text-gray-700 bg-white/80 px-3 py-1.5 rounded-lg border border-gray-200">
            🛡️ Authorized Govt Vendors
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;

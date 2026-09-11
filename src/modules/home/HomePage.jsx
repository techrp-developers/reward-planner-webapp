// src/modules/home/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchBestSellers, fetchTrending, fetchNewArrivals, fetchAllProducts } from '../../api/productApi';
import { fetchBbpsCategories } from '../../api/bbpsApi';
import ProductCard from '../../components/product/ProductCard';
import OurServicesSection from '../../components/home/OurServicesSection';
import HeroBannerCarousel from '../../components/home/HeroBannerCarousel';
import BrandPartnersSection from '../../components/home/BrandPartnersSection';

// Enterprise Components from RewardPlanners.com
import MetricsSocialProofSection from '../../components/home/MetricsSocialProofSection';
import PlatformCapabilitiesSection from '../../components/home/PlatformCapabilitiesSection';
import BirthdayCelebrationModal from '../../components/home/BirthdayCelebrationModal.jsx';
import { getCompanyFromUser, getTodayCelebrations } from '../../services/celebrationService.js';

// Material UI Icons
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BoltIcon from '@mui/icons-material/Bolt';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import TvOutlinedIcon from '@mui/icons-material/TvOutlined';
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [bestSellers, setBestSellers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [deals, setDeals] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [bbpsCategories, setBbpsCategories] = useState([]);
  const [birthdays, setBirthdays] = useState(() => {
    try {
      const cached = localStorage.getItem('rp_user_profile');
      const initialUser = cached ? JSON.parse(cached) : user;
      const compName = getCompanyFromUser(initialUser);
      const userEmps = initialUser?.company?.employees || initialUser?.employees || initialUser?.colleagues || [];
      return getTodayCelebrations(compName, userEmps);
    } catch {
      return getTodayCelebrations('TechCorp Global');
    }
  });
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        const [bsData, trData, naData, bbpsData, allData] = await Promise.allSettled([
          fetchBestSellers(),
          fetchTrending(),
          fetchNewArrivals(),
          fetchBbpsCategories(),
          fetchAllProducts({ limit: 40 }),
        ]);

        if (!isMounted) return;

        const all =
          allData.status === 'fulfilled' && Array.isArray(allData.value)
            ? allData.value
            : [];
        setAllProducts(all);

        const na =
          naData.status === 'fulfilled' && Array.isArray(naData.value) && naData.value.length > 0
            ? naData.value
            : all.slice(0, 10);

        const bs =
          bsData.status === 'fulfilled' && Array.isArray(bsData.value) && bsData.value.length > 0
            ? bsData.value
            : all.slice(0, 10);
        setBestSellers(bs);

        const tr =
          trData.status === 'fulfilled' && Array.isArray(trData.value) && trData.value.length > 0
            ? trData.value
            : all.slice(10, 20);
        setTrending(tr);

        // Flash deals: products with good discount from database
        const discounted = all.filter((p) => {
          const disc = parseInt(String(p.discount || '').replace(/\D/g, ''), 10);
          return disc > 15;
        });
        setDeals(discounted.length > 0 ? discounted : na.length > 0 ? na : all.slice(0, 10));

        if (bbpsData.status === 'fulfilled' && Array.isArray(bbpsData.value)) {
          setBbpsCategories(bbpsData.value);
        }

        // Dynamic birthdays for corporate celebration banner based on user's company
        const compName = getCompanyFromUser(user);
        const userEmps = user?.company?.employees || user?.employees || user?.colleagues || [];
        const activeCelebrations = getTodayCelebrations(compName, userEmps);
        setBirthdays(activeCelebrations);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Recalculate celebrations whenever user data updates
  useEffect(() => {
    const compName = getCompanyFromUser(user);
    const userEmps = user?.company?.employees || user?.employees || user?.colleagues || [];
    const activeCelebrations = getTodayCelebrations(compName, userEmps);
    setBirthdays(activeCelebrations);
  }, [user]);

  // Open modal if user navigates to /birthdays
  useEffect(() => {
    if (window.location.pathname === '/birthdays' || window.location.hash.includes('birthdays')) {
      setCelebrationModalOpen(true);
    }
  }, []);

  const displayDeals =
    deals.length > 0
      ? deals.slice(0, 5)
      : bestSellers.length > 0
      ? bestSellers.slice(0, 5)
      : allProducts.slice(0, 5);

  const displayTrending =
    trending.length > 0
      ? trending.slice(0, 5)
      : bestSellers.length > 5
      ? bestSellers.slice(5, 10)
      : allProducts.slice(5, 10);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-6 space-y-4 text-gray-900">
      {/* 1. CORPORATE CELEBRATIONS TICKER / RIBBON (ALWAYS VISIBLE) */}
      <div className="w-full bg-violet-50/80 border-b border-violet-100 py-1.5 px-4 shadow-2xs">
        <div className="max-w-[1600px] mx-auto flex items-center justify-end">
          {/* Right: Birthday Wishes to your Colleagues button */}
          <button
            type="button"
            onClick={() => setCelebrationModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-violet-200 text-violet-900 shadow-2xs hover:bg-violet-100/60 hover:border-violet-300 hover:shadow-xs transition-all cursor-pointer group"
            title="Click to view colleagues celebrating today"
          >
            <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[11px] group-hover:scale-105 transition-transform shadow-2xs">
              🎂
            </span>
            <span className="text-[11px] sm:text-xs font-semibold tracking-tight text-violet-900 group-hover:text-[#7C3AED] transition-colors">
              Birthday Wishes to your Colleagues
            </span>
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#7C3AED] text-white shadow-xs">
              {birthdays.length > 0 ? birthdays.length : 2}
            </span>
            <ChevronRightIcon sx={{ fontSize: 14 }} className="text-violet-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Birthday Celebration Modal */}
      <BirthdayCelebrationModal
        isOpen={celebrationModalOpen}
        onClose={() => setCelebrationModalOpen(false)}
        companyName={getCompanyFromUser(user)}
        celebrants={birthdays.length > 0 ? birthdays : getTodayCelebrations(getCompanyFromUser(user))}
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 space-y-6">
        {/* 2. SENIOR UI/UX HERO PROMOTIONAL BANNER CAROUSEL (50VH, 3-SEC AUTO SLIDE) */}
        <HeroBannerCarousel />

        {/* 3. PROVEN CORPORATE IMPACT & METRICS SOCIAL PROOF BAR */}
        <MetricsSocialProofSection />

        {/* 4. FLASH DEALS OF THE DAY WITH TIMER */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <WhatshotIcon sx={{ fontSize: 22 }} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                  Flash Deals of the Day
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-normal flex items-center gap-1.5 mt-0.5">
                  <AccessTimeIcon sx={{ fontSize: 14 }} className="text-rose-500" />
                  <span>Ends in <strong className="text-rose-600 font-bold">04h : 32m : 18s</strong></span>
                </p>
              </div>
            </div>
            <Link
              to="/deals"
              className="text-xs sm:text-sm font-semibold text-[#7C3AED] hover:underline flex items-center gap-0.5 shrink-0"
            >
              <span>View All Deals</span>
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayDeals.map((prod) => (
              <ProductCard key={prod.id} item={prod} />
            ))}
          </div>
        </section>

        {/* 5. OUR SERVICES & MODULES RIBBON */}
        <OurServicesSection />

        {/* 6. 1-CLICK UTILITY BILL PAYMENTS (BBPS GRID) */}
        <section className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <BoltIcon sx={{ fontSize: 22 }} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                  Quick Utility Bill Payments & Recharges
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
                  Instant BBPS confirmation with RP Coins cash discount
                </p>
              </div>
            </div>
            <Link to="/bbps" className="text-xs sm:text-sm font-semibold text-[#7C3AED] hover:underline shrink-0">
              All 20+ Categories →
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2.5 pt-1">
            {[
              { title: 'Electricity', icon: LightbulbOutlinedIcon, catId: 1, color: 'text-amber-500 bg-amber-50' },
              { title: 'Mobile', icon: PhoneAndroidOutlinedIcon, catId: 2, color: 'text-blue-500 bg-blue-50' },
              { title: 'DTH TV', icon: TvOutlinedIcon, catId: 3, color: 'text-purple-500 bg-purple-50' },
              { title: 'FASTag', icon: DirectionsCarOutlinedIcon, catId: 4, color: 'text-emerald-500 bg-emerald-50' },
              { title: 'Piped Gas', icon: LocalFireDepartmentOutlinedIcon, catId: 5, color: 'text-rose-500 bg-rose-50' },
              { title: 'Water', icon: WaterDropOutlinedIcon, catId: 6, color: 'text-cyan-500 bg-cyan-50' },
              { title: 'Wifi/Fiber', icon: WifiOutlinedIcon, catId: 7, color: 'text-indigo-500 bg-indigo-50' },
              { title: 'Loan EMI', icon: CreditCardOutlinedIcon, catId: 8, color: 'text-orange-500 bg-orange-50' },
            ].map((biller, idx) => {
              const BillerIcon = biller.icon;
              return (
                <Link
                  key={idx}
                  to={`/bbps?category=${biller.catId}`}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-100 bg-white hover:bg-violet-50/50 hover:border-violet-200 transition-all text-center group cursor-pointer shadow-2xs"
                >
                  <div className={`p-2.5 rounded-xl mb-1.5 transition-transform group-hover:scale-110 ${biller.color}`}>
                    <BillerIcon sx={{ fontSize: 24 }} />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#7C3AED]">
                    {biller.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 8. ENTERPRISE CAPABILITIES & ONE DASHBOARD PILLARS */}
        <PlatformCapabilitiesSection />

        {/* 9. ON-DEMAND CORPORATE & PROFESSIONAL SERVICES (FULL WIDTH) */}
        <section className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-[#4F6BFF] flex items-center justify-center shrink-0">
                <BuildOutlinedIcon sx={{ fontSize: 22 }} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                  On-Demand Corporate & Professional Services
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
                  Government filings, legal docs, CA advisory, and home cleaning
                </p>
              </div>
            </div>
            <Link to="/services" className="text-xs sm:text-sm font-semibold text-[#4F6BFF] hover:underline shrink-0">
              View All Services →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {[
              {
                title: 'ITR & Tax Filing',
                desc: 'Salaried & Freelancer returns with CA verification',
                price: 'From ₹499 + 200 Coins',
                badge: 'Tax Season',
                cardBg: 'bg-gradient-to-b from-blue-50/80 to-indigo-50/30',
                border: 'border-blue-200/80 hover:border-blue-400',
                badgeStyle: 'text-blue-700 bg-blue-100/90 border border-blue-200/70',
                accentColor: 'text-blue-600',
                titleHover: 'group-hover:text-blue-600',
              },
              {
                title: 'Full Home Cleaning',
                desc: 'Sanitization, Sofa, and Kitchen deep cleanup',
                price: 'From ₹899 + 400 Coins',
                badge: 'Popular',
                cardBg: 'bg-gradient-to-b from-emerald-50/80 to-teal-50/30',
                border: 'border-emerald-200/80 hover:border-emerald-400',
                badgeStyle: 'text-emerald-800 bg-emerald-100/90 border border-emerald-200/70',
                accentColor: 'text-emerald-600',
                titleHover: 'group-hover:text-emerald-700',
              },
              {
                title: 'Rental Agreement',
                desc: 'Digital e-stamped legal agreement with doorstep delivery',
                price: 'From ₹999 + 500 Coins',
                badge: 'Govt Verified',
                cardBg: 'bg-gradient-to-b from-amber-50/80 to-orange-50/30',
                border: 'border-amber-200/80 hover:border-amber-400',
                badgeStyle: 'text-amber-800 bg-amber-100/90 border border-amber-200/70',
                accentColor: 'text-amber-600',
                titleHover: 'group-hover:text-amber-700',
              },
              {
                title: 'Legal Advisory',
                desc: 'Consult verified corporate advocates & chartered accountants',
                price: 'From ₹599 + 150 Coins',
                badge: 'Verified',
                cardBg: 'bg-gradient-to-b from-purple-50/80 to-pink-50/30',
                border: 'border-purple-200/80 hover:border-purple-400',
                badgeStyle: 'text-purple-800 bg-purple-100/90 border border-purple-200/70',
                accentColor: 'text-[#7C3AED]',
                titleHover: 'group-hover:text-[#7C3AED]',
              },
            ].map((service, idx) => (
              <div
                key={idx}
                onClick={() => navigate('/services')}
                className={`p-4 rounded-2xl border ${service.border} ${service.cardBg} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
              >
                <div>
                  <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full ${service.badgeStyle}`}>
                    {service.badge}
                  </span>
                  <h5 className={`font-bold text-sm text-gray-900 mt-2 ${service.titleHover} transition-colors`}>{service.title}</h5>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">{service.desc}</p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-black/5 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-gray-900">{service.price}</span>
                  <span className={`text-xs sm:text-sm font-bold ${service.accentColor} group-hover:translate-x-0.5 transition-transform`}>Book →</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. BESTSELLERS IN CORPORATE TECH & FASHION */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-violet-100 text-[#7C3AED] flex items-center justify-center shrink-0">
                <TrendingUpIcon sx={{ fontSize: 22 }} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                  Trending in Corporate Perks & Tech
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5">
                  Most popular electronics, lifestyle perks, and corporate rewards this week
                </p>
              </div>
            </div>
            <Link to="/store" className="text-xs sm:text-sm font-semibold text-[#7C3AED] hover:underline flex items-center gap-0.5 shrink-0">
              <span>Explore Store</span>
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayTrending.map((prod) => (
              <ProductCard key={`trend-${prod.id}`} item={prod} />
            ))}
          </div>
        </section>

        {/* 9. TRUSTED BY CLIENTS & BRAND PARTNERS */}
        <BrandPartnersSection />
      </div>
    </div>
  );
};

export default HomePage;

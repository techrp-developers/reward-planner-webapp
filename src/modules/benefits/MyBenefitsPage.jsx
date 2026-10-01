// src/modules/benefits/MyBenefitsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Headphones,
  ShieldCheck,
  Utensils,
  GraduationCap,
  Stethoscope,
  FileText,
  Calendar,
  CheckCircle2,
  BookOpen,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import pageBgAurora from '../../assets/page_bg_aurora.png';

// Visual assets
import benefitsHeroShield from '../../assets/benefits/benefits_hero_shield.png';
import benefitsBannerCharacter from '../../assets/sidebarpagesimages/my benefits hero section.png';
import featuredHealthInsurance from '../../assets/sidebarpagesimages/health insurance my benefits pages.png';
import featuredMealBenefits from '../../assets/sidebarpagesimages/meal benefits from my benefits pages.png';
import featuredLearningVoucher from '../../assets/sidebarpagesimages/learning voucher my benefits.png';
import benefitsCardPromo from '../../assets/benefits/benefits_card_promo.png';

export const MyBenefitsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [toastMessage, setToastMessage] = useState(null);

  const tabs = ['Overview', 'Insurance', 'Perks & Offers', 'History'];

  const recentActivities = [
    {
      id: 1,
      type: 'Activated',
      name: 'Health Insurance',
      timestamp: '24 Sep 2026 • 09:30 AM',
      status: 'Active',
      statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
      icon: ShieldCheck,
      iconColor: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 2,
      type: 'Claimed',
      name: 'Meal Benefits',
      timestamp: '20 Sep 2026 • 01:15 PM',
      status: 'Claimed',
      statusColor: 'bg-purple-50 text-purple-700 border border-purple-200/80',
      icon: Utensils,
      iconColor: 'bg-pink-50 text-pink-600',
    },
    {
      id: 3,
      type: 'Redeemed',
      name: 'Learning Voucher',
      timestamp: '18 Sep 2026 • 04:45 PM',
      status: 'Redeemed',
      statusColor: 'bg-purple-50 text-purple-700 border border-purple-200/80',
      icon: GraduationCap,
      iconColor: 'bg-purple-50 text-purple-600',
    },
    {
      id: 4,
      type: 'Used',
      name: 'Doctor Consultation',
      timestamp: '12 Sep 2026 • 11:00 AM',
      status: 'Used',
      statusColor: 'bg-purple-50 text-purple-700 border border-purple-200/80',
      icon: Stethoscope,
      iconColor: 'bg-blue-50 text-blue-600',
    },
    {
      id: 5,
      type: 'Enrolled',
      name: 'Wellness Cover',
      timestamp: '08 Sep 2026 • 03:20 PM',
      status: 'Enrolled',
      statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
      icon: FileText,
      iconColor: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const [benefits, setBenefits] = useState([
    {
      id: 1,
      title: 'Health Insurance',
      image: featuredHealthInsurance,
      badgeText: 'Coverage Activated',
      badgeIcon: CheckCircle2,
      btnText: 'View',
      isActioned: false,
    },
    {
      id: 2,
      title: 'Meal Benefits',
      image: featuredMealBenefits,
      badgeText: 'Monthly Benefit',
      badgeIcon: Calendar,
      btnText: 'Use Now',
      isActioned: false,
    },
    {
      id: 3,
      title: 'Learning Voucher',
      image: featuredLearningVoucher,
      badgeText: 'Available Benefit',
      badgeIcon: BookOpen,
      btnText: 'Redeem',
      isActioned: false,
    },
  ]);

  const handleBenefitAction = (id, title) => {
    setBenefits((prev) =>
      prev.map((ben) => {
        if (ben.id === id) {
          const nextState = !ben.isActioned;
          showToast(nextState ? `Claimed action for "${title}" successfully!` : `Reset "${title}" action.`);
          return {
            ...ben,
            isActioned: nextState,
            btnText: nextState ? 'Claimed ✓' : (ben.id === 2 ? 'Use Now' : ben.id === 3 ? 'Redeem' : 'View'),
          };
        }
        return ben;
      })
    );
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3500);
  };

  return (
    <div className="h-full w-full bg-[#F8FAFD] flex flex-col overflow-hidden">
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col md:flex-row h-full overflow-hidden">

        {/* Main Content Area */}
        <main
          className="relative flex-1 min-w-0 h-full flex flex-col justify-start pt-2 pb-6 px-4 sm:px-6 lg:px-8 overflow-y-auto overflow-x-hidden gap-3.5 bg-no-repeat bg-cover bg-right-top"
          style={{
            backgroundImage: `url(${pageBgAurora})`,
          }}
        >
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-20 right-6 z-50 bg-[#0A0A5C] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs sm:text-sm animate-fadeIn">
              <Check size={16} className="text-emerald-400 stroke-[3]" />
              <span>{toastMessage}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="ml-2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. TOP HEADER & BREADCRUMBS                                               */}
          {/* ========================================================================= */}
          <section className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 pt-0.5">
            {/* Left: Breadcrumbs + Title */}
            <div className="space-y-1 relative z-10">
              <nav className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 mb-0.5" aria-label="Breadcrumb">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="hover:text-[#6D28D9] transition-colors cursor-pointer"
                >
                  Home
                </button>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="text-[#111827] font-semibold">My Benefits</span>
              </nav>

              <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight leading-tight">
                My <span className="text-[#6D28D9]">Benefits</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
                Access, manage and use your employee benefits with ease.
              </p>
            </div>

            {/* Right: 3D Shield Hero Art with 'Plan Reward Grow' */}
            <div className="shrink-0 flex items-center justify-end select-none relative">
              <img
                src={benefitsHeroShield}
                alt="Plan Reward Grow - My Benefits"
                className="h-[74px] sm:h-[84px] lg:h-[92px] w-auto object-contain block select-none pointer-events-none drop-shadow-2xs"
              />
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 2. MAIN TWO-COLUMN CONTENT GRID                                           */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-start flex-1 min-h-0">
            
            {/* --------------------------------------------------------------------- */}
            {/* LEFT COLUMN: Tab Navigation + Stage Banner + Recent Activity          */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              
              {/* Tab Navigation Bar */}
              <div className="bg-white rounded-2xl p-1.5 border border-slate-100/90 shadow-2xs flex items-center gap-1 sm:gap-2 overflow-x-auto">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'text-[#6D28D9] bg-purple-50/70 shadow-2xs'
                          : 'text-slate-600 hover:text-[#6D28D9] hover:bg-slate-50'
                      }`}
                    >
                      {tab}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-[#6D28D9] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Main Hero Banner: Unlock benefits that work for you! */}
              <div
                onClick={() => showToast('Opening employee benefits catalog...')}
                className="relative rounded-2xl overflow-hidden shadow-xs border border-purple-900/10 group cursor-pointer transition-all duration-300 hover:shadow-md aspect-[2.6/1]"
                title="Unlock benefits that work for you! - Explore Benefits"
              >
                <img
                  src={benefitsBannerCharacter}
                  alt="Unlock benefits that work for you!"
                  className="w-full h-full object-cover object-center block select-none group-hover:scale-[1.01] transition-transform duration-300"
                />
              </div>

              {/* Recent Activity Card */}
              <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Recent Activity</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('History')}
                    className="text-xs sm:text-sm font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition-colors cursor-pointer flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="divide-y divide-slate-100/80">
                  {recentActivities.map((act) => {
                    const Icon = act.icon;
                    return (
                      <div
                        key={act.id}
                        className="py-2.5 sm:py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${act.iconColor}`}>
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {act.type}
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                              {act.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                          <span className="text-[11px] sm:text-xs text-slate-400 hidden sm:inline-block">
                            {act.timestamp}
                          </span>
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${act.statusColor}`}>
                            {act.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: Featured Benefits + Promo Box + Need Help Support       */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              
              {/* Featured Benefits Card */}
              <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Featured Benefits</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('Perks & Offers')}
                      className="text-xs sm:text-sm font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition-colors cursor-pointer flex items-center gap-0.5"
                    >
                      <span>View All</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next featured benefit"
                      className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

                {/* 3 Featured Benefit Cards Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {benefits.map((ben) => {
                    const BadgeIcon = ben.badgeIcon;
                    return (
                      <div
                        key={ben.id}
                        className="flex flex-col bg-white rounded-xl border border-slate-100/90 overflow-hidden shadow-3xs hover:shadow-2xs transition-all duration-200 group"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          <img
                            src={ben.image}
                            alt={ben.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-2 sm:p-2.5 flex flex-col flex-1 justify-between gap-2">
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-[13px] font-bold text-[#0A0A5C] truncate" title={ben.title}>
                              {ben.title}
                            </h4>
                            <div className="flex items-center gap-1 text-[10px] text-purple-700 font-medium truncate">
                              <BadgeIcon size={11} className="shrink-0 text-purple-600" />
                              <span className="truncate">{ben.badgeText}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleBenefitAction(ben.id, ben.title)}
                            className={`w-full py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                              ben.isActioned
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white active:scale-98'
                            }`}
                          >
                            {ben.btnText}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Promo Box: Want to discover more? */}
              <section className="relative rounded-2xl bg-gradient-to-r from-[#F0F2FD] via-[#F4EEFD] to-[#FCF4FE] p-4 sm:p-5 border border-purple-100/60 shadow-2xs overflow-hidden flex items-center justify-between gap-3">
                <div className="space-y-2 relative z-10 max-w-[62%] sm:max-w-[65%]">
                  <h4 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Want to discover more?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Browse insurance, perks and employee offers curated for your needs.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Insurance')}
                    className="inline-flex items-center justify-center bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    See All Benefits
                  </button>
                </div>

                <div className="shrink-0 w-24 sm:w-28 flex items-center justify-center select-none pointer-events-none">
                  <img
                    src={benefitsCardPromo}
                    alt="Want to discover more"
                    className="w-full h-auto object-contain drop-shadow-sm"
                  />
                </div>
              </section>

              {/* Need Help Support Widget */}
              <section className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/80 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100/90 text-emerald-700 flex items-center justify-center shrink-0">
                    <Headphones size={20} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#0A0A5C]">Need Help?</h5>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Have a question about your employee benefits? Our support team is here to help.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/customer-support')}
                  className="shrink-0 px-3.5 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-600/40 rounded-xl hover:bg-emerald-100/70 transition-all cursor-pointer shadow-2xs"
                >
                  Get Support
                </button>
              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyBenefitsPage;

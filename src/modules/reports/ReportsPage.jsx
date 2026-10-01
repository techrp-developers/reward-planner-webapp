// src/modules/reports/ReportsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Headphones,
  FileText,
  Download,
  Share2,
  Eye,
  Calendar,
  Users,
  BarChart2,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';
import { EmployeeSidebar } from '../home/components/EmployeeSidebar';
import pageBgAurora from '../../assets/page_bg_aurora.png';

// Visual assets
import reportsHeroCharts from '../../assets/reports/reports_hero_charts.png';
import reportsBannerCharacter from '../../assets/sidebarpagesimages/make smarter decisons my reports pages.png';
import featuredRewardsSummary from '../../assets/sidebarpagesimages/rewards summary my report pagess.png';
import featuredBenefitUsage from '../../assets/sidebarpagesimages/benefit usage my reports pages.png';
import featuredWellnessInsights from '../../assets/sidebarpagesimages/wellness insights my reports pages.png';
import reportsInsightsPromo from '../../assets/reports/reports_insights_promo.png';

export const ReportsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [toastMessage, setToastMessage] = useState(null);

  const tabs = ['Overview', 'Rewards Reports', 'Usage Analytics', 'History'];

  const recentActivities = [
    {
      id: 1,
      type: 'Generated',
      name: 'Monthly Rewards Report',
      timestamp: '25 Sep 2026 • 09:30 AM',
      status: 'Ready',
      statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
      icon: FileText,
      iconColor: 'bg-purple-50 text-purple-600',
    },
    {
      id: 2,
      type: 'Downloaded',
      name: 'Benefits Summary',
      timestamp: '22 Sep 2026 • 11:15 AM',
      status: 'Downloaded',
      statusColor: 'bg-blue-50 text-blue-700 border border-blue-200/80',
      icon: Download,
      iconColor: 'bg-blue-50 text-blue-600',
    },
    {
      id: 3,
      type: 'Shared',
      name: 'Wellness Engagement Report',
      timestamp: '18 Sep 2026 • 04:00 PM',
      status: 'Shared',
      statusColor: 'bg-pink-50 text-pink-700 border border-pink-200/80',
      icon: Share2,
      iconColor: 'bg-pink-50 text-pink-600',
    },
    {
      id: 4,
      type: 'Generated',
      name: 'Usage Analytics Report',
      timestamp: '12 Sep 2026 • 02:20 PM',
      status: 'Ready',
      statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
      icon: FileText,
      iconColor: 'bg-purple-50 text-purple-600',
    },
    {
      id: 5,
      type: 'Viewed',
      name: 'Quarterly Insights',
      timestamp: '08 Sep 2026 • 10:10 AM',
      status: 'Viewed',
      statusColor: 'bg-purple-50 text-purple-700 border border-purple-200/80',
      icon: Eye,
      iconColor: 'bg-amber-50 text-amber-600',
    },
  ];

  const [reports, setReports] = useState([
    {
      id: 1,
      title: 'Rewards Summary',
      image: featuredRewardsSummary,
      badgeText: 'Monthly Overview',
      badgeIcon: Calendar,
      btnText: 'View',
      isOpened: false,
    },
    {
      id: 2,
      title: 'Benefit Usage',
      image: featuredBenefitUsage,
      badgeText: 'Department Wise',
      badgeIcon: Users,
      btnText: 'Open',
      isOpened: false,
    },
    {
      id: 3,
      title: 'Wellness Insights',
      image: featuredWellnessInsights,
      badgeText: 'Engagement Trends',
      badgeIcon: BarChart2,
      btnText: 'Analyze',
      isOpened: false,
    },
  ]);

  const handleReportAction = (id, title) => {
    setReports((prev) =>
      prev.map((rep) => {
        if (rep.id === id) {
          const nextState = !rep.isOpened;
          showToast(nextState ? `Opening "${title}" data analytics...` : `Closed "${title}".`);
          return {
            ...rep,
            isOpened: nextState,
            btnText: nextState ? 'Opened ✓' : (rep.id === 2 ? 'Open' : rep.id === 3 ? 'Analyze' : 'View'),
          };
        }
        return rep;
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
        {/* Left Sidebar (Corporate Employee Navigation with 'Reports' highlighted) */}
        <EmployeeSidebar activeItem="Reports" />

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
                <span className="text-[#111827] font-semibold">Reports</span>
              </nav>

              <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight leading-tight">
                Reports &amp; <span className="text-[#6D28D9]">Analytics</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium pt-0.5">
                Track rewards, benefits and engagement insights with clear and actionable reporting.
              </p>
            </div>

            {/* Right: 3D Charts Hero Art with 'Plan Reward Grow' */}
            <div className="shrink-0 flex items-center justify-end select-none relative">
              <img
                src={reportsHeroCharts}
                alt="Plan Reward Grow - Reports"
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

              {/* Main Hero Banner: Make smarter decisions! */}
              <div
                onClick={() => showToast('Opening workplace analytics dashboard...')}
                className="relative rounded-2xl overflow-hidden shadow-xs border border-purple-900/10 group cursor-pointer transition-all duration-300 hover:shadow-md aspect-[2.6/1]"
                title="Make smarter decisions - View Insights"
              >
                <img
                  src={reportsBannerCharacter}
                  alt="Make smarter decisions!"
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
            {/* RIGHT COLUMN: Featured Reports + Promo Box + Need Help Support        */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              
              {/* Featured Reports Card */}
              <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100/90 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Featured Reports</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('Rewards Reports')}
                      className="text-xs sm:text-sm font-semibold text-[#6D28D9] hover:text-[#5B21B6] transition-colors cursor-pointer flex items-center gap-0.5"
                    >
                      <span>View All</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next featured report"
                      className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors cursor-pointer"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

                {/* 3 Featured Report Cards Grid */}
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {reports.map((rep) => {
                    const BadgeIcon = rep.badgeIcon;
                    return (
                      <div
                        key={rep.id}
                        className="flex flex-col bg-white rounded-xl border border-slate-100/90 overflow-hidden shadow-3xs hover:shadow-2xs transition-all duration-200 group"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                          <img
                            src={rep.image}
                            alt={rep.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-2 sm:p-2.5 flex flex-col flex-1 justify-between gap-2">
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-[13px] font-bold text-[#0A0A5C] truncate" title={rep.title}>
                              {rep.title}
                            </h4>
                            <div className="flex items-center gap-1 text-[10px] text-purple-700 font-medium truncate">
                              <BadgeIcon size={11} className="shrink-0 text-purple-600" />
                              <span className="truncate">{rep.badgeText}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleReportAction(rep.id, rep.title)}
                            className={`w-full py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                              rep.isOpened
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white active:scale-98'
                            }`}
                          >
                            {rep.btnText}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Promo Box: Need deeper insights? */}
              <section className="relative rounded-2xl bg-gradient-to-r from-[#F0F2FD] via-[#F4EEFD] to-[#FCF4FE] p-4 sm:p-5 border border-purple-100/60 shadow-2xs overflow-hidden flex items-center justify-between gap-3">
                <div className="space-y-2 relative z-10 max-w-[62%] sm:max-w-[65%]">
                  <h4 className="text-sm sm:text-base font-bold text-[#0A0A5C]">Need deeper insights?</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Explore downloadable summaries and visual analytics tailored for HR and admin teams.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Usage Analytics')}
                    className="inline-flex items-center justify-center bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    See All Reports
                  </button>
                </div>

                <div className="shrink-0 w-24 sm:w-28 flex items-center justify-center select-none pointer-events-none">
                  <img
                    src={reportsInsightsPromo}
                    alt="Need deeper insights"
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
                      Need help understanding your reports? Our support team is here to help.
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

export default ReportsPage;

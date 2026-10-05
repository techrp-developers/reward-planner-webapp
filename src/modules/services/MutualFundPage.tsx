// src/modules/services/MutualFundPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMutualFundTree } from '../../api/servicesApi';
import { getImageUrl } from '../../api/client';
import ServiceBannerCarousel from '../../components/services/ServiceBannerCarousel';

// Material UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

export const MutualFundPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sip'); // 'sip' | 'lumpsum' | 'articles'

  // SIP Calculator State
  const [monthlyInvest, setMonthlyInvest] = useState(5000);
  const [returnRate, setReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  // Lumpsum Calculator State
  const [lumpInvest, setLumpInvest] = useState(100000);
  const [lumpRate, setLumpRate] = useState(12);
  const [lumpYears, setLumpYears] = useState(10);

  // Articles & Knowledge Tree
  const [treeData, setTreeData] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoadingArticles(true);

    fetchMutualFundTree(4)
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data)) setTreeData(data);
        setLoadingArticles(false);
      })
      .catch(() => {
        if (isMounted) setLoadingArticles(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // SIP Math Calculation: M * [ ( (1 + i)^n - 1 ) / i ] * (1 + i)
  const calculateSip = () => {
    const P = Number(monthlyInvest);
    const i = Number(returnRate) / 12 / 100;
    const n = Number(timePeriod) * 12;

    if (P <= 0 || i <= 0 || n <= 0) return { invested: 0, returns: 0, total: 0 };

    const totalInvested = P * n;
    const totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const estReturns = Math.max(0, totalValue - totalInvested);

    return {
      invested: Math.round(totalInvested),
      returns: Math.round(estReturns),
      total: Math.round(totalValue),
    };
  };

  // Lumpsum Math: P * (1 + r/100)^n
  const calculateLumpsum = () => {
    const P = Number(lumpInvest);
    const r = Number(lumpRate) / 100;
    const n = Number(lumpYears);

    if (P <= 0 || r <= 0 || n <= 0) return { invested: 0, returns: 0, total: 0 };

    const totalValue = P * Math.pow(1 + r, n);
    const estReturns = Math.max(0, totalValue - P);

    return {
      invested: Math.round(P),
      returns: Math.round(estReturns),
      total: Math.round(totalValue),
    };
  };

  const sipResult = calculateSip();
  const lumpResult = calculateLumpsum();

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6 font-['Poppins',sans-serif]">
      {/* 1. TOP PROMOTIONAL SERVICE BANNERS CAROUSEL (like above) */}
      <ServiceBannerCarousel />

      {/* 2. Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-1 hover:text-[#7C3AED] transition-colors cursor-pointer"
        >
          <ArrowBackIcon sx={{ fontSize: 15 }} />
          <span>Services</span>
        </button>
        <span>/</span>
        <span className="text-gray-900 font-bold">Mutual Funds & Wealth Planning</span>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-200">
              Corporate Wealth Hub & Advisory
            </span>
            <h1 className="text-xl sm:text-3xl font-black leading-tight">
              Mutual Fund Calculators & Educational Knowledgebase
            </h1>
            <p className="text-xs text-white/80 mt-1 leading-relaxed">
              Calculate projected returns on Systematic Investment Plans (SIP), explore goal planning, and read verified AMFI investment guides.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/30 shrink-0">
            <button
              onClick={() => setActiveTab('sip')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sip' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              SIP Calculator
            </button>
            <button
              onClick={() => setActiveTab('lumpsum')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'lumpsum' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              Lumpsum
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'articles' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              Learning Articles
            </button>
          </div>
        </div>
      </div>

      {/* CALCULATOR TABS */}
      {activeTab === 'sip' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sliders Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <CalculateOutlinedIcon sx={{ fontSize: 20 }} className="text-emerald-600" />
                <span>Systematic Investment Plan (SIP)</span>
              </h3>
              <span className="text-[11px] text-gray-400 font-semibold">Compounded Monthly</span>
            </div>

            {/* Monthly Investment Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Monthly Investment</span>
                <span className="font-black text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  ₹{Number(monthlyInvest).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="100000"
                step="500"
                value={monthlyInvest}
                onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                <span>₹500</span>
                <span>₹50,000</span>
                <span>₹1,00,000</span>
              </div>
            </div>

            {/* Expected Return Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Expected Annual Return Rate (p.a)</span>
                <span className="font-black text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  {returnRate}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                <span>1%</span>
                <span>15%</span>
                <span>30%</span>
              </div>
            </div>

            {/* Time Period in Years */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Time Horizon (Years)</span>
                <span className="font-black text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  {timePeriod} Years
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={timePeriod}
                onChange={(e) => setTimePeriod(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                <span>1 Yr</span>
                <span>15 Yrs</span>
                <span>30 Yrs</span>
              </div>
            </div>
          </div>

          {/* Results Summary Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-lg">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Projected Maturity Wealth
            </h4>

            <div className="space-y-1">
              <span className="text-xs text-gray-400">Total Expected Value</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                ₹{sipResult.total.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="space-y-3 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span>Invested Amount</span>
                </span>
                <strong className="text-white">₹{sipResult.invested.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Estimated Wealth Gain</span>
                </span>
                <strong className="text-emerald-400">₹{sipResult.returns.toLocaleString('en-IN')}</strong>
              </div>

              {/* Graphical Proportion Bar */}
              <div className="h-3 w-full rounded-full bg-gray-700 overflow-hidden flex mt-2">
                <div
                  style={{ width: `${(sipResult.invested / sipResult.total) * 100}%` }}
                  className="bg-blue-400 h-full"
                />
                <div
                  style={{ width: `${(sipResult.returns / sipResult.total) * 100}%` }}
                  className="bg-emerald-400 h-full"
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed pt-2">
              Mutual Fund investments are subject to market risks. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      )}

      {/* LUMPSUM CALCULATOR */}
      {activeTab === 'lumpsum' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <CalculateOutlinedIcon sx={{ fontSize: 20 }} className="text-blue-600" />
                <span>Lumpsum One-Time Investment</span>
              </h3>
              <span className="text-[11px] text-gray-400 font-semibold">Single Deposit</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">One-Time Deposit Amount</span>
                <span className="font-black text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  ₹{Number(lumpInvest).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="1000000"
                step="5000"
                value={lumpInvest}
                onChange={(e) => setLumpInvest(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Expected Return Rate (p.a)</span>
                <span className="font-black text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  {lumpRate}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                value={lumpRate}
                onChange={(e) => setLumpRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">Time Horizon (Years)</span>
                <span className="font-black text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  {lumpYears} Years
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={lumpYears}
                onChange={(e) => setLumpYears(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-lg">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Projected Maturity Wealth
            </h4>

            <div className="space-y-1">
              <span className="text-xs text-gray-400">Total Expected Value</span>
              <div className="text-3xl sm:text-4xl font-black text-blue-400">
                ₹{lumpResult.total.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Initial Deposit</span>
                <strong className="text-white">₹{lumpResult.invested.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Estimated Capital Growth</span>
                <strong className="text-blue-400">₹{lumpResult.returns.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ARTICLES & KNOWLEDGEBASE (Real Backend Tree) */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <MenuBookOutlinedIcon sx={{ fontSize: 22 }} className="text-emerald-700" />
            <h2 className="text-sm sm:text-base font-black text-gray-900">
              Mutual Fund Guides & Education (AMFI Compliant)
            </h2>
          </div>
          <span className="text-xs text-gray-400">Free Investor Awareness</span>
        </div>

        {loadingArticles ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {treeData.map((section) => (
              <div key={section.id} className="space-y-4">
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>{section.title}</span>
                </h3>

                {section.children?.map((childSection) => (
                  <div key={childSection.id} className="space-y-3 pl-3">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      {childSection.title} ({childSection.article_count} Guides)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {childSection.articles?.map((article) => (
                        <div
                          key={article.id}
                          onClick={() => setSelectedArticle(article)}
                          className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                        >
                          <div className="flex gap-3 items-start">
                            {article.thumbnail ? (
                              <img
                                src={getImageUrl(article.thumbnail)}
                                alt={article.title}
                                className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100 shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                <MenuBookOutlinedIcon sx={{ fontSize: 24 }} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                                {article.title}
                              </h5>
                              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-snug">
                                {article.short_description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                            <span>Read Full Guide</span>
                            <span>→</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ARTICLE DETAILS MODAL */}
      {selectedArticle && (
        <div
          onClick={() => setSelectedArticle(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative animate-scaleUp"
          >
            <div className="flex justify-between items-start gap-4">
              <h3 className="font-black text-base sm:text-lg text-gray-900 leading-tight">
                {selectedArticle.title}
              </h3>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 text-gray-400 hover:text-gray-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {selectedArticle.thumbnail && (
              <img
                src={getImageUrl(selectedArticle.thumbnail)}
                alt={selectedArticle.title}
                className="w-full h-48 object-cover rounded-2xl border border-gray-100"
              />
            )}

            <p className="text-xs text-gray-600 leading-relaxed">
              {selectedArticle.short_description}
            </p>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MutualFundPage;

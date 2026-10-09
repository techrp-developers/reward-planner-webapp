import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Check, Zap, Sparkles, Filter } from 'lucide-react';

export const BbpsRechargePlansModal = ({
  plansData,
  loadingPlans,
  plansError = '',
  onSelectPlan,
  onClose,
  mobile,
  operatorName,
}) => {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Prevent background scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Groups of plans returned by backend Eko
  const groups = useMemo(() => {
    const rawGroups = plansData?.groups || [];
    if (rawGroups.length > 0) return rawGroups;

    // Fallback if plans are flat
    const flatPlans = plansData?.plans || [];
    if (flatPlans.length > 0) {
      return [{ label: 'All Plans', plans: flatPlans }];
    }

    return [];
  }, [plansData]);

  // Current active group plans
  const currentPlans = useMemo(() => {
    if (groups.length === 0) return [];
    const group = groups[activeGroupIndex] || groups[0];
    let plans = group.plans || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      plans = plans.filter(
        (p) =>
          String(p.amount || p.price || '').includes(q) ||
          String(p.validity || '').toLowerCase().includes(q) ||
          String(p.description || '').toLowerCase().includes(q)
      );
    }

    return plans;
  }, [groups, activeGroupIndex, searchQuery]);

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] my-auto">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#1C0E28] to-[#3B1953] text-white flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{operatorName || 'Mobile'} Recharge Plans</span>
            </h3>
            {mobile && (
              <p className="text-xs text-purple-200 mt-0.5">
                Showing best offers for {mobile}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 sm:p-5 border-b border-gray-100 space-y-3 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by amount, data, or validity (e.g. 299, 1.5GB, 84 days)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 text-xs sm:text-sm font-medium outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Group Category Tabs */}
          {groups.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              {groups.map((group, index) => {
                const isActive = activeGroupIndex === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveGroupIndex(index)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {group.label || `Pack ${index + 1}`}
                    <span className="ml-1.5 text-[10px] opacity-75 font-normal">
                      ({group.plans?.length || 0})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Plans List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {loadingPlans ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-medium">Fetching available recharge packs...</p>
            </div>
          ) : plansError ? (
            <div role="alert" className="py-16 text-center space-y-2">
              <p className="text-sm font-bold text-gray-800">Could not load recharge plans</p>
              <p className="text-xs text-gray-500">{plansError}</p>
            </div>
          ) : currentPlans.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm font-bold text-gray-800">No plans found</p>
              <p className="text-xs text-gray-500">
                {searchQuery ? 'Try clearing your search query.' : 'No plans available for this tab.'}
              </p>
            </div>
          ) : (
            currentPlans.map((plan, idx) => {
              const amount = plan.amount || plan.price || '0';
              const validity = plan.validity || plan.validityDescription || 'N/A';
              const description = plan.description || plan.planDescription || 'Standard recharge plan';

              return (
                <div
                  key={plan.planId || idx}
                  className="group p-4 rounded-2xl bg-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl sm:text-2xl font-black text-gray-900">
                        ₹{amount}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                        Validity: {validity}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed font-normal">
                      {description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan)}
                    className="self-end sm:self-center px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    Select Plan
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BbpsRechargePlansModal;

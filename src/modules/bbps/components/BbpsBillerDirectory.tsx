// src/modules/bbps/components/BbpsBillerDirectory.jsx
import React, { useState, useMemo } from 'react';
import { Search, MapPin, ChevronRight, Building2, ArrowLeft } from 'lucide-react';

const CATEGORY_NAMES = {
  5: 'Mobile Prepaid',
  7: 'Credit Card',
  8: 'Electricity',
  10: 'Mobile Postpaid',
  22: 'FASTag',
};

const getInitials = (name) => {
  if (!name) return 'BP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const getAvatarGradient = (id) => {
  const gradients = [
    'from-violet-500 to-purple-700',
    'from-blue-500 to-indigo-700',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-700',
    'from-rose-500 to-pink-700',
    'from-cyan-500 to-blue-700',
  ];
  return gradients[Number(id || 0) % gradients.length];
};

export const BbpsBillerDirectory = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  onBackToHome,
  operators = [],
  loadingOperators = false,
  locations = [],
  selectedCircle,
  onSelectCircle,
  onSelectOperator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter operators by search query
  const filteredOperators = useMemo(() => {
    let result = operators;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (op) =>
          op.name?.toLowerCase().includes(q) ||
          String(op.operator_id).includes(q)
      );
    }

    return result;
  }, [operators, searchQuery]);

  const currentCategoryName =
    CATEGORY_NAMES[selectedCategory] ||
    categories.find((c) => Number(c.operator_category_id) === Number(selectedCategory))
      ?.operator_category_name ||
    'All Utilities & Billers';

  const isRechargeCategory = Number(selectedCategory) === 5; // Mobile Prepaid

  return (
    <div id="bbps-billers-section" className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Navigation & Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#E7E1F0] shadow-xs space-y-6">
        {/* Back Button and Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="w-11 h-11 rounded-2xl bg-[#F4F0F8] border border-[#E5DDED] flex items-center justify-center text-[#704096] hover:bg-[#E8D8F4] transition-colors cursor-pointer shrink-0"
                title="Back to All Categories"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            <div className="flex items-start gap-2.5">
              <div className="w-1.5 h-6 bg-[#704096] rounded-full shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#17131D] tracking-tight">
                    {currentCategoryName}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-purple-50 text-[#704096] border border-purple-200/60 text-xs font-bold">
                    {filteredOperators.length} billers
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#716A7A] font-medium mt-0.5">
                  Select your service provider or utility operator below
                </p>
              </div>
            </div>
          </div>

          {/* Search Box & Circle Dropdown */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search operator (e.g. BSES, Airtel)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-gray-50/80 hover:bg-white focus:bg-white border border-[#E7E1F0] focus:border-[#704096] focus:ring-2 focus:ring-[#704096]/20 text-xs sm:text-sm font-medium transition-all outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Telecom Circle Dropdown (shown for Mobile Prepaid) */}
            {isRechargeCategory && locations.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <MapPin size={16} className="text-[#704096]" />
                <select
                  value={selectedCircle || ''}
                  onChange={(e) => onSelectCircle(e.target.value)}
                  className="w-full sm:w-auto text-xs font-bold bg-[#F4F0F8] text-[#17131D] border border-[#E5DDED] rounded-xl px-3.5 py-2.5 outline-none cursor-pointer focus:ring-2 focus:ring-[#704096]/20"
                >
                  <option value="">All Telecom Circles</option>
                  {locations.map((loc) => (
                    <option key={loc.operator_location_id} value={loc.operator_location_id}>
                      {loc.operator_location_name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pt-3 border-t border-[#ECE7F2]">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              !selectedCategory
                ? 'bg-[#704096] text-white shadow-xs'
                : 'bg-[#F4F0F8] text-[#554D5D] hover:bg-[#EAE4F2]'
            }`}
          >
            All Billers
          </button>

          {categories.map((cat) => {
            const isSelected = Number(selectedCategory) === Number(cat.operator_category_id);
            return (
              <button
                key={cat.operator_category_id}
                type="button"
                onClick={() => onSelectCategory(cat.operator_category_id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#704096] text-white shadow-xs'
                    : 'bg-[#F4F0F8] text-[#554D5D] hover:bg-[#EAE4F2]'
                }`}
              >
                {cat.operator_category_name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Billers Grid - Responsive 5 columns on wide full-width screens */}
      {loadingOperators ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E7E1F0] animate-pulse space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredOperators.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E7E1F0] space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 text-[#704096] flex items-center justify-center">
            <Building2 size={28} />
          </div>
          <h4 className="text-base font-bold text-[#17131D]">No operators found</h4>
          <p className="text-xs sm:text-sm text-[#716A7A] max-w-sm mx-auto">
            {searchQuery
              ? `No operators matched "${searchQuery}". Try a different keyword.`
              : 'No billers are currently available for this category.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs sm:text-sm font-bold text-[#704096] hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredOperators.map((op) => {
            const initials = getInitials(op.name);
            const gradient = getAvatarGradient(op.operator_id);
            const categoryName = CATEGORY_NAMES[op.operator_category] || 'Utility';
            const isRecharge = Number(op.operator_category) === 5;

            return (
              <div
                key={op.operator_id}
                onClick={() => onSelectOperator(op)}
                className="group bg-white rounded-2xl p-4 sm:p-5 border border-[#E7E1F0] hover:border-[#704096] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
              >
                <div className="flex items-start gap-3.5">
                  {/* Operator Avatar */}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-[#17131D] leading-snug line-clamp-2 group-hover:text-[#704096] transition-colors">
                      {op.name}
                    </h4>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-md bg-[#F4F0F8] text-[#716A7A] text-[10px] font-semibold">
                      {categoryName}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#ECE7F2] flex items-center justify-between text-xs font-bold text-[#704096]">
                  <span className="text-[11px] font-semibold text-[#716A7A]">
                    {isRecharge ? 'Browse Plans' : 'Fetch Bill'}
                  </span>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Proceed</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BbpsBillerDirectory;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Tag,
  ShieldCheck,
  Gift,
  Flame,
} from 'lucide-react';
import navratriBanner from '../../assets/home/Navratri_banner.png';
import ProductCard from '../../components/product/ProductCard';
import { fetchAllProducts } from '../../api/productApi';
import { useCart } from '../../context/CartContext';

// Festive collection quick filter tabs
const FESTIVE_TAGS = [
  'All Deals',
  'Garba & Ethnic Wear',
  'Pooja Essentials',
  'Festive Sweets & Dry Fruits',
  'Home & Lighting',
  'Electronics & Sound',
];

export const NavratriProductsPage = () => {
  const navigate = useNavigate();
  const { totalQuantity, openCartDrawer } = useCart();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTag, setSelectedTag] = useState<string>('All Deals');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

  // =========================================================================
  // NAVRATRI SPECIAL PRODUCTS API INTEGRATION:
  // When your backend Navratri API is available (e.g. GET /v1/product/navratri-products),
  // simply plug the endpoint call in here.
  // =========================================================================
  useEffect(() => {
    let isMounted = true;
    const fetchNavratriProducts = async () => {
      setLoading(true);
      try {
        /*
        // --- LIVE API CALL (UNCOMMENT WHEN API IS AVAILABLE) ---
        // import api from '../../api/client';
        // const res = await api.get('/v1/product/navratri-special');
        // if (isMounted) setProducts(res.data?.products || []);
        */

        // Current graceful fallback: Load catalog products so page is active
        const data = await fetchAllProducts({ limit: 40 });
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load Navratri products:', err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNavratriProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const title = (p.title || p.product_name || p.name || '').toLowerCase();
        const category = (p.category_name || '').toLowerCase();
        return title.includes(q) || category.includes(q);
      });
    }

    // Festive tag filter
    if (selectedTag !== 'All Deals') {
      const tagLower = selectedTag.toLowerCase();
      const filtered = list.filter((p) => {
        const title = (p.title || p.product_name || p.name || '').toLowerCase();
        const category = (p.category_name || '').toLowerCase();
        if (tagLower.includes('ethnic') || tagLower.includes('wear')) {
          return category.includes('fashion') || category.includes('cloth') || title.includes('kurta') || title.includes('saree');
        }
        if (tagLower.includes('pooja') || tagLower.includes('home')) {
          return category.includes('home') || title.includes('diya') || title.includes('pooja') || title.includes('light');
        }
        if (tagLower.includes('electronics') || tagLower.includes('sound')) {
          return category.includes('electronic') || title.includes('speaker') || title.includes('audio') || title.includes('earbud');
        }
        return title.includes(tagLower) || category.includes(tagLower);
      });
      // Fallback to all if tag filter yields zero while waiting for specific tags in real API
      if (filtered.length > 0) list = filtered;
    }

    // Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => (a.price ?? a.sale_price ?? 0) - (b.price ?? b.sale_price ?? 0));
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => (b.price ?? b.sale_price ?? 0) - (a.price ?? a.sale_price ?? 0));
    } else if (sortBy === 'discount') {
      list.sort((a, b) => {
        const discA = a.mrp && a.price ? ((a.mrp - a.price) / a.mrp) : 0;
        const discB = b.mrp && b.price ? ((b.mrp - b.price) / b.mrp) : 0;
        return discB - discA;
      });
    }

    return list;
  }, [products, searchQuery, selectedTag, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EE] to-[#FAF8FF] font-['Plus_Jakarta_Sans',sans-serif] pb-16">
      {/* 1. TOP NAV & BREADCRUMB BAR */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200/70 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          {/* Back button and breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/store')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs sm:text-sm font-semibold border border-amber-200/80 transition-all cursor-pointer group"
              title="Return to store catalog"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Store</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Link to="/" className="hover:text-amber-700">Home</Link>
              <span>/</span>
              <Link to="/store" className="hover:text-amber-700">Store</Link>
              <span>/</span>
              <span className="text-amber-800 font-semibold">Navratri Special</span>
            </div>
          </div>

          {/* Quick Cart Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCartDrawer}
              className="relative p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer transition-transform hover:scale-105"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={19} />
              {totalQuantity > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-[#E11D48] text-white text-[11px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-xs">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6">
        {/* 2. HERO NAVRATRI BANNER HEADER */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(245,158,11,0.18)] border border-amber-200/90 mb-6 bg-gradient-to-r from-amber-500 to-rose-500">
          <img
            src={navratriBanner}
            alt="Navratri Special - Shop • Celebrate • Save"
            className="w-full h-[180px] sm:h-[280px] md:h-[360px] lg:h-[420px] object-cover object-[center_42%]"
            draggable={false}
          />

          {/* Bottom Festive Strip */}
          <div className="bg-gradient-to-r from-amber-900/90 via-rose-900/90 to-purple-900/90 text-white px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-300" />
              <span><strong>Navratri Mahotsav</strong> — Exclusive Deals & Special Rewards</span>
            </div>
            <div className="flex items-center gap-4 text-amber-200">
              <span className="flex items-center gap-1.5">
                <Flame size={14} className="text-orange-400" /> Flat Festive Discounts
              </span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:flex items-center gap-1.5">
                <Gift size={14} className="text-amber-300" /> 2x RP Reward Coins
              </span>
            </div>
          </div>
        </div>

        {/* 3. SEARCH & FILTER TOOLBAR */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-amber-100 mb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Navratri specials, sweets, clothes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort & Count */}
            <div className="flex items-center justify-between md:justify-end gap-3">
              <span className="text-xs sm:text-sm font-bold text-slate-600">
                {filteredProducts.length} Festive {filteredProducts.length === 1 ? 'Product' : 'Products'}
              </span>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="featured">Featured Deals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 mt-3 border-t border-slate-100 no-scrollbar">
            {FESTIVE_TAGS.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-800'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. PRODUCT GRID */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4.5">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs animate-pulse space-y-3"
              >
                <div className="w-full h-44 bg-slate-200 rounded-xl" />
                <div className="w-3/4 h-4 bg-slate-200 rounded" />
                <div className="w-1/2 h-4 bg-slate-200 rounded" />
                <div className="w-full h-8 bg-slate-200 rounded-lg mt-2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4.5">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={`${prod.id}-${prod.variant_id || 0}`}
                item={prod}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-amber-100 shadow-2xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Tag size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Festive Products Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-5">
              {searchQuery
                ? `No results matching "${searchQuery}". Try a different keyword.`
                : 'No festive items in this category right now.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('All Deals');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold shadow-xs cursor-pointer transition-all"
            >
              <RotateCcw size={15} /> Reset Filters
            </button>
          </div>
        )}

        {/* 5. FESTIVE VALUE PROPOSITION CALLOUTS */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-amber-200/80">
          <div className="bg-white/80 rounded-2xl p-4 border border-amber-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">100% Festive Verified</h4>
              <p className="text-[11px] sm:text-xs text-slate-500">Curated authentic products with quality check.</p>
            </div>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-amber-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Gift size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">Bonus Reward Coins</h4>
              <p className="text-[11px] sm:text-xs text-slate-500">Earn higher coins on every festive order.</p>
            </div>
          </div>

          <div className="bg-white/80 rounded-2xl p-4 border border-amber-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">Fast & Safe Delivery</h4>
              <p className="text-[11px] sm:text-xs text-slate-500">Doorstep delivery in time for celebrations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavratriProductsPage;

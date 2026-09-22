// src/modules/ecommerce/ProductListingPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  fetchAllProducts,
  fetchProductsByCategory,
  fetchProductsBySubcategory,
  fetchCategoriesWithSub,
  fetchBestSellers,
  fetchTrending,
  fetchNewArrivals,
  fetchMostViewedProducts,
  fetchRecentProducts,
  fetchRecommendations,
} from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import EcommerceAdBannerCarousel from './components/EcommerceAdBannerCarousel';
import EcommerceCategoriesGrid from './components/EcommerceCategoriesGrid';
import EcommerceCampaignPosters from './components/EcommerceCampaignPosters';
import EcommerceFlashSale from './components/EcommerceFlashSale';
import EcommerceHorizontalSection from './components/EcommerceHorizontalSection';
import EcommerceFeaturedWeek from './components/EcommerceFeaturedWeek';
import EcommerceCategoryTabGrid from './components/EcommerceCategoryTabGrid';
import { Filter, SlidersHorizontal, ChevronDown, ChevronRight, Check, Star, RotateCcw, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Pagination from '@mui/material/Pagination';

export const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { totalQuantity } = useCart();

  const query = searchParams.get('q') || searchParams.get('search') || '';
  const viewParam = searchParams.get('view') || '';
  const categoryParam = searchParams.get('category') || '';
  const subParam = searchParams.get('sub') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Determine whether to display the Landing Showcase vs Catalog with Filters
  const isCatalogMode = Boolean(
    viewParam === 'all' ||
    (categoryParam && categoryParam !== 'all') ||
    subParam ||
    query
  );
  const isLandingMode = !isCatalogMode;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [loading, setLoading] = useState(false);

  // Landing Page Showcase State (Step-by-Step Sections)
  const [newArrivals, setNewArrivals] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [landingLoading, setLandingLoading] = useState(true);

  // Live ticking countdown timer for Flash Deals (Ends in 04h : 32m : 18s)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 32, seconds: 18 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filters State for Catalog Mode
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedMinRating, setSelectedMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // 1. Fetch Categories once on mount
  useEffect(() => {
    fetchCategoriesWithSub()
      .then((cats) => {
        if (Array.isArray(cats)) setCategories(cats);
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // 2. Load Landing Data (New Arrivals, Most Viewed, Recommendations, Recent, Featured) on mount
  useEffect(() => {
    let isMounted = true;
    const loadLandingData = async () => {
      setLandingLoading(true);
      try {
        const [naData, mvData, recData, recpData, allData] = await Promise.allSettled([
          fetchNewArrivals(),
          fetchMostViewedProducts(10),
          fetchRecommendations(10),
          fetchRecentProducts(10),
          fetchAllProducts({ limit: 40 }),
        ]);

        if (!isMounted) return;

        const all = allData.status === 'fulfilled' && Array.isArray(allData.value) ? allData.value : [];
        const na = naData.status === 'fulfilled' && Array.isArray(naData.value) && naData.value.length > 0
          ? naData.value
          : all.slice(0, 10);
        const mv = mvData.status === 'fulfilled' && Array.isArray(mvData.value) && mvData.value.length > 0
          ? mvData.value
          : all.slice(10, 20);
        const rec = recData.status === 'fulfilled' && Array.isArray(recData.value) && recData.value.length > 0
          ? recData.value
          : all.slice(20, 30);
        const recp = recpData.status === 'fulfilled' && Array.isArray(recpData.value) && recpData.value.length > 0
          ? recpData.value
          : [];
        const feat = all.length > 0 ? all.slice(5, 17) : na.slice(0, 10);

        setNewArrivals(na);
        setMostViewed(mv);
        setRecommendations(rec);
        setRecentProducts(recp);
        setFeaturedProducts(feat);
      } catch (err) {
        console.error('Error loading store landing data:', err);
      } finally {
        if (isMounted) setLandingLoading(false);
      }
    };

    loadLandingData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-expand category if active in catalog mode
  useEffect(() => {
    if (categoryParam && categoryParam !== 'all') {
      setExpandedCategories((prev) => ({ ...prev, [categoryParam]: true }));
    }
  }, [categoryParam]);

  // Resolve category ID whether passed as number or name alias
  const resolvedCategoryId = useMemo(() => {
    if (!categoryParam || categoryParam === 'all') return '';
    if (/^\d+$/.test(categoryParam)) return categoryParam;
    const found = categories.find(
      (c) =>
        c.name.toLowerCase().includes(categoryParam.toLowerCase()) ||
        categoryParam.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
    );
    return found ? String(found.id) : categoryParam;
  }, [categoryParam, categories]);

  // 3. Fetch Products whenever in Catalog Mode and category, sub, query, or page changes
  useEffect(() => {
    if (!isCatalogMode) return;

    let isMounted = true;
    setLoading(true);

    const loadProducts = async () => {
      try {
        let resList = [];
        const limit = 36; // 36 items per page for a rich 3- or 4-column grid

        if (subParam) {
          resList = await fetchProductsBySubcategory(subParam, {
            page: currentPage,
            limit,
            search: query || undefined,
          });
        } else if (resolvedCategoryId) {
          resList = await fetchProductsByCategory(resolvedCategoryId, {
            page: currentPage,
            limit,
            search: query || undefined,
          });
        } else {
          resList = await fetchAllProducts({
            page: currentPage,
            limit,
            search: query || undefined,
          });
        }

        if (!isMounted) return;

        setProducts(resList || []);
        setTotalProducts(resList?.total || (resList?.length || 0));
        setTotalPages(resList?.totalPages || Math.ceil((resList?.total || resList?.length || 1) / limit) || 1);
      } catch (err) {
        console.error('Failed to load products from database:', err);
        if (isMounted) {
          setProducts([]);
          setTotalProducts(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [isCatalogMode, resolvedCategoryId, subParam, query, currentPage]);

  // Handle Category Selection (switches to Catalog Mode)
  const handleSelectCategory = (catId) => {
    const params = new URLSearchParams();
    if (catId === 'all') {
      params.set('view', 'all');
    } else {
      params.set('category', catId);
    }
    params.set('page', '1');
    setCurrentPage(1);
    setSearchParams(params);
    setMobileFilterOpen(false);
  };

  // Handle Subcategory Selection (switches to Catalog Mode)
  const handleSelectSubcategory = (catId, subId) => {
    const params = new URLSearchParams();
    params.set('category', catId);
    params.set('sub', subId);
    params.set('page', '1');
    setCurrentPage(1);
    setSearchParams(params);
    setMobileFilterOpen(false);
  };

  // Return to Store Landing View
  const handleBackToStoreHome = () => {
    setSearchParams({});
    setCurrentPage(1);
    setSelectedPriceRange('all');
    setSelectedMinRating(0);
    setSortBy('popular');
  };

  // Reset all filters in Catalog Mode
  const handleResetFilters = () => {
    setSelectedPriceRange('all');
    setSelectedMinRating(0);
    setSortBy('popular');
    const params = new URLSearchParams();
    if (viewParam) params.set('view', viewParam);
    if (categoryParam) params.set('category', categoryParam);
    if (subParam) params.set('sub', subParam);
    if (query) params.set('q', query);
    setSearchParams(params);
    setCurrentPage(1);
  };

  // Toggle subcategory accordion
  const toggleCategoryExpand = (catId, e) => {
    e.stopPropagation();
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Active Category Name for Breadcrumb
  const activeCategoryObj = useMemo(() => {
    if (!resolvedCategoryId) return null;
    return categories.find((c) => String(c.id) === String(resolvedCategoryId));
  }, [categories, resolvedCategoryId]);

  const activeSubcategoryObj = useMemo(() => {
    if (!subParam || !activeCategoryObj) return null;
    return (activeCategoryObj.subcategories || []).find((s) => String(s.id) === String(subParam));
  }, [activeCategoryObj, subParam]);

  // Client-side Price Range & Rating filtering and Sorting on currently loaded products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const price = p.price || 0;
        if (selectedPriceRange === 'under-1000' && price >= 1000) return false;
        if (selectedPriceRange === '1000-3000' && (price < 1000 || price > 3000)) return false;
        if (selectedPriceRange === '3000-5000' && (price < 3000 || price > 5000)) return false;
        if (selectedPriceRange === 'above-5000' && price <= 5000) return false;

        if (selectedMinRating > 0 && (p.rating || 0) < selectedMinRating) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'discount') {
          const discA = parseInt(String(a.discount || '').replace(/\D/g, ''), 10) || 0;
          const discB = parseInt(String(b.discount || '').replace(/\D/g, ''), 10) || 0;
          return discB - discA;
        }
        return (b.id || 0) - (a.id || 0); // popular
      });
  }, [products, selectedPriceRange, selectedMinRating, sortBy]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    const params = new URLSearchParams(searchParams);
    params.set('page', String(value));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 space-y-6 text-gray-900 pt-5">
      {/* ========================================================================= */}
      {/* VIEW A: STORE LANDING VIEW (WHEN ALL PRODUCTS / FILTERS NOT EXPLICITLY CLICKED) */}
      {/* ========================================================================= */}
      {isLandingMode ? (
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 space-y-8">
          {/* Top End-Corner: 'All Products' Link & Shopping Cart in One Row (Below Header, Above Categories) */}
          <div className="flex justify-end items-center gap-2 sm:gap-3 mb-1">
            <button
              type="button"
              onClick={() => handleSelectCategory('all')}
              className="text-sm font-bold text-gray-700 hover:text-[#7C3AED] flex items-center gap-1 transition-colors cursor-pointer group py-1.5 px-3 rounded-xl hover:bg-white hover:shadow-2xs border border-transparent hover:border-gray-200"
            >
              <span>All Products</span>
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform text-gray-500 group-hover:text-[#7C3AED]" />
            </button>

            {/* Shopping Cart Button with Live Badge */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative p-2 rounded-xl text-gray-700 hover:text-[#7C3AED] bg-white border border-gray-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-center group"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={20} className="group-hover:scale-105 transition-transform" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EC4899] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-xs">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>

          {/* ADVERTISEMENT HERO BANNER CAROUSEL (EXACT BANNERS MATCHING APP REFERENCE) */}
          <EcommerceAdBannerCarousel onSelectCategory={handleSelectCategory} />

          {/* 1. CATEGORIES SECTION (WITH 3D PEDESTAL ICONS) */}
          <EcommerceCategoriesGrid
            onSelectCategory={handleSelectCategory}
          />

          {/* 2. CURATED PROMO POSTERS (VERTICAL POSTERS FROM /v1/campaign/home) */}
          <EcommerceCampaignPosters onSelectCategory={handleSelectCategory} />

          {/* 3. FLASH SALE SECTION (AMBER FLAME PATTERN + 3D LOGO + COUNTDOWN + CAMPAIGN 4 PRODUCTS) */}
          <EcommerceFlashSale campaignId={4} />

          {/* 4. NEW ARRIVALS ("The latest trends, just for you") */}
          <EcommerceHorizontalSection
            title="New Arrivals"
            subtitle="The latest trends, just for you"
            actionText="View All"
            onAction={() => handleSelectCategory('all')}
            products={newArrivals}
            loading={landingLoading}
          />

          {/* 5. MOST VIEWED */}
          <EcommerceHorizontalSection
            title="Most Viewed"
            actionText="Explore More"
            onAction={() => handleSelectCategory('all')}
            products={mostViewed}
            loading={landingLoading}
          />

          {/* 6. YOU MAY LIKE THIS (RECOMMENDATIONS) */}
          <EcommerceHorizontalSection
            title="You May Like This"
            actionText="Explore More"
            onAction={() => handleSelectCategory('all')}
            products={recommendations}
            loading={landingLoading}
          />

          {/* 7. FEATURED THIS WEEK (WARM GOLD DUAL-ROW GRADIENT) */}
          <EcommerceFeaturedWeek
            products={featuredProducts}
            loading={landingLoading}
            onExplore={() => handleSelectCategory('all')}
          />

          {/* 8. RECENTLY VIEWED (SHOWN IF HISTORY PRESENT) */}
          {recentProducts.length > 0 && (
            <EcommerceHorizontalSection
              title="Recently Viewed"
              actionText="View All"
              onAction={() => handleSelectCategory('all')}
              products={recentProducts}
              loading={landingLoading}
            />
          )}

          {/* 9. BOTTOM INTERACTIVE CATEGORY TABS & DYNAMIC PRODUCT GRID */}
          <EcommerceCategoryTabGrid
            onOpenCategoryCatalog={(catId) => handleSelectCategory(catId)}
          />
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW B: FULL CATALOG & FILTER SIDEBAR VIEW                                 */
        /* (SHOWN WHEN USER EXPLICITLY CLICKS 'ALL PRODUCTS' OR ANY CATEGORY/SEARCH)  */
        /* ========================================================================= */
        <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 space-y-6">
          {/* Breadcrumbs & Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <nav className="text-xs text-gray-500 mb-1 flex items-center gap-1.5 flex-wrap">
                <span
                  onClick={handleBackToStoreHome}
                  className="hover:text-[#7C3AED] cursor-pointer"
                >
                  Home
                </span>
                <span>/</span>
                <span
                  onClick={handleBackToStoreHome}
                  className={`hover:text-[#7C3AED] cursor-pointer ${
                    viewParam === 'all' && !categoryParam && !query ? 'text-gray-900 font-bold' : ''
                  }`}
                >
                  Store
                </span>
                {viewParam === 'all' && !categoryParam && !subParam && !query && (
                  <>
                    <span>/</span>
                    <span className="text-gray-900 font-bold">All Products</span>
                  </>
                )}
                {activeCategoryObj && (
                  <>
                    <span>/</span>
                    <span
                      onClick={() => handleSelectCategory(activeCategoryObj.id)}
                      className={`hover:text-[#7C3AED] cursor-pointer ${
                        !subParam ? 'text-gray-900 font-bold' : ''
                      }`}
                    >
                      {activeCategoryObj.name}
                    </span>
                  </>
                )}
                {activeSubcategoryObj && (
                  <>
                    <span>/</span>
                    <span className="text-gray-900 font-bold">{activeSubcategoryObj.name}</span>
                  </>
                )}
                {query && (
                  <>
                    <span>/</span>
                    <span className="text-[#7C3AED] font-bold">Search: "{query}"</span>
                  </>
                )}
              </nav>

              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                {query
                  ? `Search Results for "${query}"`
                  : activeSubcategoryObj
                  ? activeSubcategoryObj.name
                  : activeCategoryObj
                  ? activeCategoryObj.name
                  : 'All Products'}
              </h2>
            </div>

            {/* Top Controls: Mobile Filter Button & Sort By Dropdown */}
            <div className="flex items-center gap-3 self-end md:self-auto text-sm font-semibold">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 rounded-xl shadow-2xs text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                <Filter size={16} className="text-[#7C3AED]" />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 hidden sm:inline text-sm">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-800 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#7C3AED] shadow-2xs cursor-pointer font-medium"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="discount">Biggest Discount</option>
                </select>
              </div>

              {/* Shopping Cart Button with Live Badge */}
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="relative p-2 rounded-xl text-gray-700 hover:text-[#7C3AED] bg-white border border-gray-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-center group"
                title="Shopping Cart"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={19} className="group-hover:scale-105 transition-transform" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EC4899] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-xs">
                    {totalQuantity}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* MAIN CATALOG WORKSPACE: Filter Sidebar + Product Grid */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* LEFT FILTER SIDEBAR (STICKY ON DESKTOP, DRAWER ON MOBILE) */}
            <aside
              className={`${
                mobileFilterOpen
                  ? 'fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 shadow-2xl overflow-y-auto block'
                  : 'hidden lg:block'
              } lg:w-64 shrink-0 space-y-6 lg:sticky lg:top-14`}
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <SlidersHorizontal size={17} className="text-[#7C3AED]" />
                  <span>Filter Products</span>
                </div>
                {(selectedPriceRange !== 'all' || selectedMinRating > 0 || subParam || (categoryParam && categoryParam !== 'all')) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>
                )}
                {mobileFilterOpen && (
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="lg:hidden text-gray-400 hover:text-gray-700 text-base font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* 1. Category Hierarchy Filter */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Categories</h4>
                <div className="space-y-1">
                  {/* All Products option */}
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      viewParam === 'all' && !categoryParam && !subParam
                        ? 'bg-purple-100 text-[#7C3AED] font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>All Products</span>
                    {viewParam === 'all' && !categoryParam && !subParam && <Check size={16} />}
                  </button>

                  {/* Category Tree with Accordion Subcategories */}
                  {categories.map((cat) => {
                    const isCatSelected = String(resolvedCategoryId) === String(cat.id);
                    const isExpanded = Boolean(expandedCategories[cat.id]);
                    const subList = cat.subcategories || [];

                    return (
                      <div key={cat.id} className="rounded-lg">
                        <div
                          onClick={() => handleSelectCategory(cat.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer group ${
                            isCatSelected && !subParam
                              ? 'bg-purple-100 text-[#7C3AED] font-bold'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <div className="flex items-center gap-1">
                            {subList.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => toggleCategoryExpand(cat.id, e)}
                                className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700"
                              >
                                <ChevronDown
                                  size={16}
                                  className={`transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subcategories Accordion */}
                        {isExpanded && subList.length > 0 && (
                          <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-purple-200 ml-3 mt-1">
                            {subList.map((sub) => {
                              const isSubSelected = String(subParam) === String(sub.id);
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => handleSelectSubcategory(cat.id, sub.id)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors block truncate cursor-pointer ${
                                    isSubSelected
                                      ? 'text-[#7C3AED] font-bold bg-purple-50'
                                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                  }`}
                                >
                                  {sub.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Price Range Filter */}
              <div className="space-y-2.5 border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Price Range</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  {[
                    { label: 'All Prices', value: 'all' },
                    { label: 'Under ₹1,000', value: 'under-1000' },
                    { label: '₹1,000 - ₹3,000', value: '1000-3000' },
                    { label: '₹3,000 - ₹5,000', value: '3000-5000' },
                    { label: 'Above ₹5,000', value: 'above-5000' },
                  ].map((p) => (
                    <label key={p.value} className="flex items-center gap-2.5 cursor-pointer py-0.5 hover:text-gray-900">
                      <input
                        type="radio"
                        name="priceFilter"
                        checked={selectedPriceRange === p.value}
                        onChange={() => setSelectedPriceRange(p.value)}
                        className="accent-[#7C3AED] h-4 w-4"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Rating Filter */}
              <div className="space-y-2.5 border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Customer Rating</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  {[
                    { label: 'All Ratings', rating: 0 },
                    { label: '4★ & above', rating: 4 },
                    { label: '3★ & above', rating: 3 },
                    { label: '2★ & above', rating: 2 },
                  ].map((r) => (
                    <label key={r.rating} className="flex items-center gap-2.5 cursor-pointer py-0.5 hover:text-gray-900">
                      <input
                        type="radio"
                        name="ratingFilter"
                        checked={selectedMinRating === r.rating}
                        onChange={() => setSelectedMinRating(r.rating)}
                        className="accent-[#7C3AED] h-4 w-4"
                      />
                      <span className="flex items-center gap-1">
                        {r.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* RIGHT FULL-WIDTH PRODUCT GRID */}
            <main className="flex-1 space-y-8">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse space-y-3">
                      <div className="aspect-square bg-gray-100 rounded-xl" />
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-8 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 space-y-4 shadow-xs">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-50 text-[#8b3ab5] flex items-center justify-center">
                    <Filter size={28} />
                  </div>
                  <h4 className="text-base font-bold text-gray-900">No matching products found</h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    We couldn't find any products matching your active filters or search query in the database.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] text-white text-xs font-bold rounded-xl hover:opacity-95 transition-opacity cursor-pointer shadow-sm"
                  >
                    <RotateCcw size={14} />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Product Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((prod) => (
                      <ProductCard key={`${prod.id}-${prod.variant_id || 0}`} item={prod} />
                    ))}
                  </div>

                  {/* Pagination Bar */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
                      <span className="text-sm text-gray-600 font-medium">
                        Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                      </span>

                      <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                        size="medium"
                        sx={{
                          '& .Mui-selected': {
                            backgroundColor: '#8b3ab5 !important',
                            color: '#fff !important',
                            fontWeight: 'bold',
                          },
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListingPage;

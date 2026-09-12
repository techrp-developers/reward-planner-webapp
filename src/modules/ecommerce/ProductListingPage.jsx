// src/modules/ecommerce/ProductListingPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  fetchAllProducts,
  fetchProductsByCategory,
  fetchProductsBySubcategory,
  fetchCategoriesWithSub,
} from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import { Filter, SlidersHorizontal, ChevronDown, ChevronRight, Check, Star, RotateCcw } from 'lucide-react';
import Pagination from '@mui/material/Pagination';

export const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const subParam = searchParams.get('sub') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [loading, setLoading] = useState(true);

  // Filters State
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

  // Auto-expand category if active
  useEffect(() => {
    if (categoryParam && categoryParam !== 'all') {
      setExpandedCategories((prev) => ({ ...prev, [categoryParam]: true }));
    }
  }, [categoryParam]);

  // Resolve category ID whether passed as number or name alias
  const resolvedCategoryId = useMemo(() => {
    if (!categoryParam || categoryParam === 'all') return 'all';
    if (/^\d+$/.test(categoryParam)) return categoryParam;
    const found = categories.find(
      (c) =>
        c.name.toLowerCase().includes(categoryParam.toLowerCase()) ||
        categoryParam.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
    );
    return found ? String(found.id) : categoryParam;
  }, [categoryParam, categories]);

  // 2. Fetch Products whenever category, sub, query, or page changes
  useEffect(() => {
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
        } else if (resolvedCategoryId && resolvedCategoryId !== 'all') {
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
  }, [resolvedCategoryId, subParam, query, currentPage]);

  // Handle Category Selection
  const handleSelectCategory = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId === 'all') {
      params.delete('category');
      params.delete('sub');
    } else {
      params.set('category', catId);
      params.delete('sub');
    }
    params.set('page', '1');
    setCurrentPage(1);
    setSearchParams(params);
    setMobileFilterOpen(false);
  };

  // Handle Subcategory Selection
  const handleSelectSubcategory = (catId, subId) => {
    const params = new URLSearchParams(searchParams);
    params.set('category', catId);
    params.set('sub', subId);
    params.set('page', '1');
    setCurrentPage(1);
    setSearchParams(params);
    setMobileFilterOpen(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedPriceRange('all');
    setSelectedMinRating(0);
    setSortBy('popular');
    const params = new URLSearchParams();
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
    if (!resolvedCategoryId || resolvedCategoryId === 'all') return null;
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
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <nav className="text-xs text-gray-500 mb-1 flex items-center gap-1.5 flex-wrap">
            <span
              onClick={() => handleSelectCategory('all')}
              className="hover:text-[#7C3AED] cursor-pointer"
            >
              Home
            </span>
            <span>/</span>
            <span
              onClick={() => handleSelectCategory('all')}
              className={`hover:text-[#7C3AED] cursor-pointer ${
                categoryParam === 'all' && !query ? 'text-gray-900 font-bold' : ''
              }`}
            >
              Store
            </span>
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

          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-baseline gap-2 flex-wrap">
            <span>
              {query
                ? `Search Results for "${query}"`
                : activeSubcategoryObj
                ? activeSubcategoryObj.name
                : activeCategoryObj
                ? activeCategoryObj.name
                : 'Explore Products'}
            </span>
            <span className="text-xs font-semibold text-gray-500">
              ({totalProducts > 0 ? `${totalProducts} Products in Database` : `${filteredProducts.length} Products`})
            </span>
          </h2>
        </div>

        {/* Top Controls: Mobile Filter Button & Sort By Dropdown */}
        <div className="flex items-center gap-3 self-end md:self-auto text-xs font-semibold">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-xl shadow-2xs text-gray-700 font-bold hover:bg-gray-50"
          >
            <Filter size={15} className="text-[#7C3AED]" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#7C3AED] shadow-2xs"
            >
              <option value="popular">Popularity / Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Biggest Discount %</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sticky Filter Sidebar (Left) + Product Grid (Right) */}
      <div className="flex gap-8 items-start">
        {/* LEFT STICKY FILTER SIDEBAR (280px) */}
        <aside
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } lg:block w-full lg:w-72 shrink-0 lg:sticky lg:top-28 bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-6 z-20`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <Filter size={16} className="text-[#7C3AED]" /> Filter Products
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#7C3AED] hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Reset All</span>
            </button>
          </div>

          {/* Real Categories from Database */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">Categories</h5>
              <span className="text-[10px] text-gray-400 font-semibold">{categories.length} Hubs</span>
            </div>

            <div className="space-y-1 text-xs max-h-80 overflow-y-auto pr-1">
              {/* All Categories Button */}
              <button
                onClick={() => handleSelectCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  categoryParam === 'all'
                    ? 'bg-violet-50 text-[#7C3AED] font-bold border border-violet-200 shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>All Products</span>
                {categoryParam === 'all' && <Check size={14} className="text-[#7C3AED]" />}
              </button>

              {/* Individual Real Database Categories */}
              {categories.map((cat) => {
                const isSelected = String(categoryParam) === String(cat.id);
                const isExpanded = expandedCategories[cat.id];
                const subs = cat.subcategories || [];

                return (
                  <div key={cat.id} className="space-y-1">
                    <div
                      className={`w-full px-3 py-2 rounded-xl font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-violet-50 text-[#7C3AED] font-bold border border-violet-200 shadow-2xs'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectCategory(cat.id)}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {subs.length > 0 && (
                          <button
                            type="button"
                            onClick={(e) => toggleCategoryExpand(cat.id, e)}
                            className="p-1 hover:bg-violet-100/70 rounded-full text-gray-400 hover:text-gray-700"
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        )}
                        {isSelected && !subParam && <Check size={14} className="text-[#7C3AED]" />}
                      </div>
                    </div>

                    {/* Subcategories Accordion */}
                    {isExpanded && subs.length > 0 && (
                      <div className="pl-4 pr-1 py-1 space-y-1 bg-gray-50/60 rounded-xl border border-gray-100">
                        {subs.map((sub) => {
                          const isSubSelected = String(subParam) === String(sub.id);
                          return (
                            <button
                              key={sub.id}
                              onClick={() => handleSelectSubcategory(cat.id, sub.id)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                isSubSelected
                                  ? 'bg-violet-100 text-[#7C3AED] font-bold'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                              }`}
                            >
                              <span className="truncate">{sub.name}</span>
                              {isSubSelected && <Check size={12} className="text-[#7C3AED] shrink-0" />}
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

          {/* Price Range */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">Price (₹)</h5>
            <div className="space-y-1.5 text-xs text-gray-600">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under-1000', label: 'Under ₹1,000' },
                { id: '1000-3000', label: '₹1,000 - ₹3,000' },
                { id: '3000-5000', label: '₹3,000 - ₹5,000' },
                { id: 'above-5000', label: 'Above ₹5,000' },
              ].map((range) => (
                <label key={range.id} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-gray-900">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={selectedPriceRange === range.id}
                    onChange={() => setSelectedPriceRange(range.id)}
                    className="accent-[#7C3AED]"
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700">Customer Rating</h5>
            <div className="space-y-1.5 text-xs text-gray-600">
              {[
                { rating: 4, label: '4★ & above' },
                { rating: 3, label: '3★ & above' },
                { rating: 0, label: 'All Ratings' },
              ].map((r) => (
                <label key={r.rating} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-gray-900">
                  <input
                    type="radio"
                    name="ratingFilter"
                    checked={selectedMinRating === r.rating}
                    onChange={() => setSelectedMinRating(r.rating)}
                    className="accent-[#7C3AED]"
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
                  <span className="text-xs text-gray-500 font-medium">
                    Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalProducts} Total Products in Database)
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
  );
};

export default ProductListingPage;

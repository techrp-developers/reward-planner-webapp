// src/modules/ecommerce/components/EcommerceCategoryTabGrid.jsx
import React, { useState, useEffect } from 'react';
import { fetchAllCategories, fetchProductsByCategory } from '../../../api/productApi';
import ProductCard from '../../../components/product/ProductCard';
import { getImageUrl } from '../../../api/client';
import { ChevronRight } from 'lucide-react';

export const EcommerceCategoryTabGrid = ({ onOpenCategoryCatalog }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(false);

  // 1. Fetch categories
  useEffect(() => {
    let isMounted = true;
    fetchAllCategories()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setCategories(list);
        if (list.length > 0) {
          setActiveCategoryId(list[0].id);
        }
      })
      .catch((err) => console.error('Failed to load categories for tab grid:', err))
      .finally(() => {
        if (isMounted) setLoadingCats(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch products for active category
  useEffect(() => {
    if (!activeCategoryId) return;
    let isMounted = true;
    setLoadingProds(true);
    fetchProductsByCategory(activeCategoryId, { limit: 12, page: 1 })
      .then((prods) => {
        if (!isMounted) return;
        setProducts(prods || []);
      })
      .catch((err) => {
        console.error(`Failed to load products for category ${activeCategoryId}:`, err);
        if (isMounted) setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoadingProds(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategoryId]);

  if (loadingCats && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-14 bg-white rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <section className="w-full space-y-5">
      {/* Category Tab Bar (Sticky / Horizontal Scroll) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            const iconUrl = cat.image ? getImageUrl(cat.image) : '/placeholder.svg';
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                type="button"
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 relative cursor-pointer ${
                  isActive
                    ? 'bg-violet-50 text-[#7C3AED] font-bold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full p-1 flex items-center justify-center transition-transform ${
                    isActive ? 'scale-110' : 'opacity-85'
                  }`}
                >
                  <img
                    src={iconUrl}
                    alt={cat.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <span className="text-xs whitespace-nowrap">{cat.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 inset-x-3 h-0.5 bg-[#7C3AED] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid for Selected Category */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <h4 className="text-base sm:text-lg font-bold text-gray-800">
            {activeCategory?.name || 'Category'} Products
          </h4>
          {activeCategory && (
            <button
              onClick={() => onOpenCategoryCatalog(activeCategory.id)}
              className="text-xs sm:text-sm font-bold text-[#7C3AED] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Explore All {activeCategory.name}</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {loadingProds ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl text-center border border-dashed border-gray-200">
            <p className="text-sm font-medium text-gray-500">
              No products available in this category at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {products.map((prod) => (
              <ProductCard key={`cat-prod-${prod.id}-${prod.variant_id || 0}`} item={prod} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(EcommerceCategoryTabGrid);

// src/modules/ecommerce/components/EcommerceCategoryTabGrid.tsx
// Ported from mobile app ProductCategoriesScreen.tsx
import React, { useState, useEffect } from 'react';
import { fetchAllCategories, fetchProductsByCategory } from '../../../api/productApi';
import ProductCard from '../../../components/product/ProductCard';
import { getImageUrl } from '../../../api/client';
import { ChevronRight } from 'lucide-react';

interface Props {
  onOpenCategoryCatalog: (categoryId: string | number) => void;
}

export const EcommerceCategoryTabGrid: React.FC<Props> = ({ onOpenCategoryCatalog }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(false);

  // 1. Fetch categories
  useEffect(() => {
    let isMounted = true;
    fetchAllCategories()
      .then((res: any) => {
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

  // 2. Fetch all products for active category (no limit restriction to 2 rows)
  useEffect(() => {
    if (!activeCategoryId) return;
    let isCancelled = false;
    setLoadingProds(true);

    const loadCategoryProducts = async () => {
      try {
        const firstBatch: any = await fetchProductsByCategory(activeCategoryId, { limit: 50, page: 1 });
        if (isCancelled) return;

        let all = Array.isArray(firstBatch) ? [...firstBatch] : [];
        setProducts(all);
        setLoadingProds(false);

        const totalPages = firstBatch?.totalPages || 1;
        if (totalPages > 1) {
          const promises = [];
          for (let p = 2; p <= totalPages; p++) {
            promises.push(fetchProductsByCategory(activeCategoryId, { limit: 50, page: p }));
          }
          const rest = await Promise.all(promises);
          if (isCancelled) return;

          rest.forEach((batch) => {
            if (Array.isArray(batch)) {
              all = all.concat(batch);
            }
          });

          // Deduplicate by ID & variant
          const seen = new Set();
          const deduped: any[] = [];
          for (const item of all) {
            const key = `${item.id}-${item.variant_id || 0}`;
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(item);
            }
          }
          setProducts(deduped);
        }
      } catch (err) {
        if (isCancelled) return;
        console.error(`Failed to load products for category ${activeCategoryId}:`, err);
        setProducts([]);
      } finally {
        if (!isCancelled) setLoadingProds(false);
      }
    };

    loadCategoryProducts();

    return () => {
      isCancelled = true;
    };
  }, [activeCategoryId]);

  if (loadingCats && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-white rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  const activeCategory = categories.find((c) => String(c.id) === String(activeCategoryId));

  return (
    <section className="w-full space-y-4">
      {/* Category Tab Bar (Horizontal Scrollable Strip matching mobile ProductCategoriesScreen.tsx) */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-1.5 sm:p-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {categories.map((cat) => {
            const isActive = String(cat.id) === String(activeCategoryId);
            const iconUrl = cat.image ? getImageUrl(cat.image) : '/placeholder.svg';
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                type="button"
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 relative cursor-pointer ${
                  isActive
                    ? 'text-[#7C3AED] font-bold'
                    : 'text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-50'
                }`}
              >
                {/* Category Thumbnail Container */}
                <div
                  className={`w-9 h-9 rounded-full p-1 flex items-center justify-center transition-transform ${
                    isActive
                      ? 'scale-110 ring-2 ring-[#7C3AED]/30 bg-purple-50'
                      : 'opacity-80 bg-gray-50'
                  }`}
                >
                  <img
                    src={iconUrl}
                    alt={cat.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as any).src = '/placeholder.svg';
                    }}
                  />
                </div>

                {/* Category Title */}
                <span className="text-xs whitespace-nowrap">{cat.name}</span>

                {/* Active Indicator Underline */}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-2 h-0.5 bg-[#7C3AED] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid for Selected Category */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base sm:text-lg font-bold text-gray-800">
              {activeCategory?.name || 'Category'} Products
            </h4>
            {products.length > 0 && (
              <span className="text-xs font-bold text-[#7C3AED] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          {activeCategory && (
            <button
              onClick={() => onOpenCategoryCatalog(activeCategory.id)}
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-[#7C3AED] flex items-center gap-0.5 cursor-pointer group"
            >
              <span>Explore All {activeCategory.name}</span>
              <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {loadingProds ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
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

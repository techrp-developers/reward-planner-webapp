// src/modules/ecommerce/components/EcommerceCategoriesGrid.jsx
import React, { useEffect, useState } from 'react';
import { fetchAllCategories } from '../../../api/productApi';
import { getImageUrl } from '../../../api/client';

export const EcommerceCategoriesGrid = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchAllCategories()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setCategories(list);
      })
      .catch((err) => console.error('Failed to load categories for grid:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading && categories.length === 0) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse" />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="space-y-3.5">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
          Categories
        </h3>
      </div>

      {/* 2-Row / Responsive Grid of Category Cards */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3.5">
        {categories.map((cat) => {
          const imageSrc = cat.image ? getImageUrl(cat.image) : '/placeholder.svg';
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group flex flex-col items-center cursor-pointer transition-all duration-200"
            >
              {/* Card Surface */}
              <div className="w-full aspect-square bg-white rounded-2xl border border-amber-200/70 hover:border-amber-400 p-2 sm:p-3 flex items-center justify-center shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <img
                  src={imageSrc}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-xs"
                  onError={(e) => {
                    e.target.src = '/placeholder.svg';
                  }}
                />
              </div>

              {/* Category Label */}
              <span className="mt-1.5 text-[11px] sm:text-xs font-semibold text-gray-700 text-center line-clamp-1 group-hover:text-[#7C3AED] transition-colors">
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(EcommerceCategoriesGrid);

// src/modules/ecommerce/components/EcommerceCategoriesGrid.tsx
import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { fetchAllCategories } from '../../../api/productApi';
import { getImageUrl } from '../../../api/client';

type Category = {
  id: number | string;
  name: string;
  image?: string;
  icon?: string;
  [key: string]: any;
};

interface Props {
  onSelectCategory: (categoryId: string | number) => void;
}

export const EcommerceCategoriesGrid: React.FC<Props> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchAllCategories()
      .then((res: any) => {
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
          <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="w-full aspect-square bg-gray-100 rounded-[22px] animate-pulse" />
              <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="space-y-3.5">
      {/* Header Row: Title on Left, View All button with Chevron on Right (Matches Mobile categories_section.tsx) */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
          Categories
        </h3>

        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-gray-700 hover:text-[#7C3AED] py-1 px-2.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group"
        >
          <span>View All</span>
          <ChevronRight
            size={16}
            className="text-gray-500 group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      </div>

      {/* Grid of Category Cards (Gradient Border + Smooth Inner Card + Centered Thumbnail + 2-Line Label) */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-4">
        {categories.map((cat) => {
          const imageSrc = cat.image ? getImageUrl(cat.image) : '/placeholder.svg';
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group flex flex-col items-center cursor-pointer transition-all duration-200 select-none"
            >
              {/* Outer Card with Gold-to-Dark Gradient Border (Matching Mobile LinearGradient ["#FACC15", "#111827"]) */}
              <div className="w-full aspect-square p-[1.5px] sm:p-[2px] rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-[#FACC15] via-[#EAB308] to-[#111827] shadow-2xs group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                <div className="w-full h-full rounded-[18px] sm:rounded-[22px] bg-white p-2 sm:p-2.5 flex items-center justify-center overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={cat.name}
                    loading="lazy"
                    className="w-[72%] h-[72%] object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-xs"
                    onError={(e) => {
                      (e.target as any).src = '/placeholder.svg';
                    }}
                  />
                </div>
              </div>

              {/* 2-Line Category Label underneath */}
              <span className="mt-2 text-[11px] sm:text-xs font-semibold text-gray-800 text-center line-clamp-2 min-h-[30px] leading-tight group-hover:text-[#7C3AED] transition-colors max-w-full px-0.5">
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

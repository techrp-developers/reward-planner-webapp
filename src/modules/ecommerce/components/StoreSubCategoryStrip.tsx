// src/modules/ecommerce/components/StoreSubCategoryStrip.jsx
// In-Page Sub Category Navigation Strip for E-Commerce Module
// Directly filters products in the e-commerce store (All Products, Electronics, Fashion, Home & Living, Deals of the Day)
// Styled to cleanly match the main Home screen header

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategoriesWithSub } from '../../../api/productApi';
import { useCart } from '../../../context/CartContext';

// Material UI Icons
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import CheckroomOutlinedIcon from '@mui/icons-material/CheckroomOutlined';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

export const StoreSubCategoryStrip = ({
  activeCategory = '',
  activeSub = '',
  isAllActive = false,
  onSelectCategory,
  onSelectSubcategory,
}) => {
  const navigate = useNavigate();
  const { totalQuantity } = useCart();
  const [categories, setCategories] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchCategoriesWithSub()
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const handleCategoryClick = (catId) => {
    setActiveMenu(null);
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else {
      navigate(catId === 'all' ? '/store?view=all' : `/store?category=${catId}`);
    }
  };

  const handleSubcategoryClick = (catId, subId) => {
    setActiveMenu(null);
    if (onSelectSubcategory) {
      onSelectSubcategory(catId, subId);
    } else {
      navigate(`/store?category=${catId}&sub=${subId}`);
    }
  };

  const isAllSelected = Boolean(isAllActive);
  const isElectronics = String(activeCategory) === '1';
  const isFashion = String(activeCategory) === '7';
  const isHome = String(activeCategory) === '4';

  return (
    <section className="w-full bg-white border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative z-30 select-none antialiased">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between text-[14px] sm:text-[14.5px] font-medium text-slate-700 h-12.5 sm:h-13 gap-2">
          {/* Scrollable Subcategories list */}
          <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 sm:gap-2.5 py-1.5 flex-1">
            {/* 1. All Products with Mega Menu */}
            <div
              className="relative h-full flex items-center shrink-0"
              onMouseEnter={() => setActiveMenu('products')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button
                type="button"
                onClick={() => handleCategoryClick('all')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13.5px] sm:text-[14.5px] transition-all cursor-pointer whitespace-nowrap ${
                  isAllSelected
                    ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-2xs'
                    : 'text-slate-700 hover:text-[#6D28D9] hover:bg-purple-50/80 font-semibold border border-transparent'
                }`}
              >
                <ShoppingBagOutlinedIcon
                  sx={{ fontSize: 18 }}
                  className={isAllSelected ? 'text-[#6D28D9]' : 'text-slate-500'}
                />
                <span>All Products</span>
                <KeyboardArrowDownIcon
                  sx={{ fontSize: 17 }}
                  className={isAllSelected ? 'text-[#6D28D9]' : 'text-slate-400'}
                />
              </button>

              {/* Products Mega-Menu Dropdown */}
              {activeMenu === 'products' && (
                <div className="hidden lg:grid absolute left-0 top-12 w-[750px] bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200/90 p-6 z-50 animate-fade-in grid-cols-3 gap-6">
                  {categories.length > 0 ? (
                    categories.slice(0, 6).map((cat) => {
                      const catId = cat.id || cat.category_id;
                      const catName = cat.name || cat.category_name;
                      const subList = cat.subcategories || cat.children || [];
                      return (
                        <div key={catId} className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleCategoryClick(String(catId))}
                            className="font-bold text-[13px] uppercase tracking-wider text-[#6D28D9] hover:text-[#5B21B6] block border-b border-slate-100 pb-1.5 transition-colors w-full text-left cursor-pointer whitespace-nowrap"
                          >
                            {catName}
                          </button>
                          <ul className="space-y-1.5 text-[13px] text-slate-600">
                            {subList.slice(0, 4).map((sub) => {
                              const subId = sub.id || sub.subcategory_id;
                              const subName = sub.name || sub.subcategory_name;
                              const isSubActive = String(activeSub) === String(subId);
                              return (
                                <li key={subId}>
                                  <button
                                    type="button"
                                    onClick={() => handleSubcategoryClick(String(catId), String(subId))}
                                    className={`hover:text-[#6D28D9] transition-colors block py-0.5 text-left w-full cursor-pointer whitespace-nowrap ${
                                      isSubActive ? 'text-[#6D28D9] font-bold underline' : ''
                                    }`}
                                  >
                                    {subName}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-center py-4 text-slate-400">
                      Loading categories...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Electronics & Gadgets */}
            <button
              type="button"
              onClick={() => handleCategoryClick('1')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13.5px] sm:text-[14.5px] transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                isElectronics
                  ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-2xs'
                  : 'text-slate-700 hover:text-[#6D28D9] hover:bg-purple-50/80 font-semibold border border-transparent'
              }`}
            >
              <SmartphoneOutlinedIcon
                sx={{ fontSize: 18 }}
                className={isElectronics ? 'text-[#6D28D9]' : 'text-purple-600'}
              />
              <span>Electronics & Gadgets</span>
            </button>

            {/* 3. Corporate Fashion */}
            <button
              type="button"
              onClick={() => handleCategoryClick('7')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13.5px] sm:text-[14.5px] transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                isFashion
                  ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-2xs'
                  : 'text-slate-700 hover:text-[#6D28D9] hover:bg-purple-50/80 font-semibold border border-transparent'
              }`}
            >
              <CheckroomOutlinedIcon
                sx={{ fontSize: 18 }}
                className={isFashion ? 'text-[#6D28D9]' : 'text-pink-600'}
              />
              <span>Corporate Fashion</span>
            </button>

            {/* 4. Home & Kitchen / Living */}
            <button
              type="button"
              onClick={() => handleCategoryClick('4')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13.5px] sm:text-[14.5px] transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                isHome
                  ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-2xs'
                  : 'text-slate-700 hover:text-[#6D28D9] hover:bg-purple-50/80 font-semibold border border-transparent'
              }`}
            >
              <WeekendOutlinedIcon
                sx={{ fontSize: 18 }}
                className={isHome ? 'text-[#6D28D9]' : 'text-indigo-600'}
              />
              <span>Home & Kitchen</span>
            </button>

            {/* Additional Product Categories dynamically if present */}
            {categories
              .filter((c) => !['1', '7', '4'].includes(String(c.id || c.category_id)))
              .slice(0, 3)
              .map((cat) => {
                const catId = String(cat.id || cat.category_id);
                const isCatActive = String(activeCategory) === catId;
                return (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => handleCategoryClick(catId)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13.5px] sm:text-[14.5px] transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                      isCatActive
                        ? 'bg-[#EDE9FE] text-[#6D28D9] font-bold border border-[#DDD6FE] shadow-2xs'
                        : 'text-slate-700 hover:text-[#6D28D9] hover:bg-purple-50/80 font-semibold border border-transparent'
                    }`}
                  >
                    <span>{cat.name || cat.category_name}</span>
                  </button>
                );
              })}
          </div>

          {/* Right Corner: Clean Shopping Cart Icon (No label, no card bg) */}
          <div className="flex items-center shrink-0 pl-1 sm:pl-2">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative p-2 rounded-full text-slate-700 hover:text-[#6D28D9] hover:bg-purple-50 transition-colors cursor-pointer flex items-center justify-center"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 22 }} />
              {totalQuantity > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#EC4899] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
                  {totalQuantity}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreSubCategoryStrip;

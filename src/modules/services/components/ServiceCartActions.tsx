import type { ServiceActionProps as ActionProps } from './serviceDetailTypes';
import BoltIcon from '@mui/icons-material/Bolt';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';


export function ServiceCartActions({ hideAddToCart, handleAddToCart, addingToCart, insuranceQuotePath, navigate, handleBuyNow, primaryCtaLabel }: ActionProps) { return               <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                {/* Outlined Add to Cart Pill Button */}
                {!hideAddToCart && (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full sm:flex-1 py-3 px-6 rounded-full border-2 border-[#1E1260] text-[#1E1260] hover:bg-[#1E1260]/5 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
                    <span>{addingToCart ? 'Adding to Cart...' : 'Add to Cart'}</span>
                  </button>
                )}

                {/* Solid Deep Navy/Purple Buy Now or Enquire Now Pill Button */}
                <button
                  type="button"
                  onClick={insuranceQuotePath ? () => navigate(insuranceQuotePath) : handleBuyNow}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-full bg-[#1E1260] hover:bg-[#150C48] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BoltIcon sx={{ fontSize: 18 }} />
                  <span>{primaryCtaLabel}</span>
                </button>
              </div>; }


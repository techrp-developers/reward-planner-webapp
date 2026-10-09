import type { ServiceActionProps as ActionProps } from './serviceDetailTypes';
import BoltIcon from '@mui/icons-material/Bolt';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';


export function ServicePricing({ price, originalPrice, savings, insuranceQuotePath, navigate, handleBuyNow, primaryCtaLabel, hideAddToCart, handleAddToCart, addingToCart }: ActionProps & { price: number; originalPrice: number; savings: number }) {
  return <>
<div className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-md space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Total Pricing:
                </span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-black text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                  {originalPrice > price && (
                    <span className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
                  )}
                  {savings > 0 && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Save ₹{savings.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 font-medium">All Government & Processing Fees Included</p>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={insuranceQuotePath ? () => navigate(insuranceQuotePath) : handleBuyNow}
                  className="w-full py-4 rounded-full bg-[#1E1260] hover:bg-[#150C48] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BoltIcon sx={{ fontSize: 18 }} />
                  <span>{primaryCtaLabel}</span>
                </button>

                {!hideAddToCart && (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full py-3.5 rounded-full border-2 border-[#1E1260] text-[#1E1260] hover:bg-[#1E1260]/5 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
                    <span>{addingToCart ? 'Adding to Cart...' : 'Add to Cart'}</span>
                  </button>
                )}
              </div>
            </div>
  </>;
}


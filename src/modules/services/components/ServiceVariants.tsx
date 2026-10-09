import type { ServiceVariant as Variant } from './serviceDetailTypes';


export function ServiceVariants({ variants, selectedVariant, setSelectedVariant }: { variants: Variant[]; selectedVariant: Variant | null; setSelectedVariant: (value: Variant) => void }) {
  return <>
{variants.length > 1 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                  Select Package / Variant:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const vPrice = Number(v.price || 0);
                    const vOld = Number(v.original_price || (vPrice * 1.3));

                    return (
                      <button
                        key={v.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between border-2 ${
                          isSelected
                            ? 'bg-[#FCF7FF] border-[#A855F7] shadow-sm shadow-purple-100 ring-2 ring-purple-100'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`text-xs font-bold truncate block ${isSelected ? 'text-[#7C3AED]' : 'text-gray-800'}`}>
                          {v.title || v.variant_name}
                        </span>
                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-gray-900">₹{vPrice.toLocaleString('en-IN')}</span>
                          {vOld > vPrice && (
                            <span className="text-[11px] text-gray-400 line-through">₹{vOld.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
  </>;
}


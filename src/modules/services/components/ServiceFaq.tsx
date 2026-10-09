import type { ServiceFaqItem as Faq } from './serviceDetailTypes';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


export function ServiceFaq({ faqList, openFaqIdx, setOpenFaqIdx }: { faqList: Faq[]; openFaqIdx: number | null; setOpenFaqIdx: (index: number | null) => void }) {
  return <>
{faqList.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                    FAQ
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs font-bold text-sm">
                    ?
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {faqList.map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div key={idx} className="py-3.5 first:pt-1">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                          className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-gray-800 hover:text-[#7C3AED] transition-colors cursor-pointer gap-3"
                        >
                          <span>{faq.question}</span>
                          <KeyboardArrowDownIcon
                            sx={{ fontSize: 18 }}
                            className={`text-gray-400 transition-transform duration-200 shrink-0 ${
                              isOpen ? 'rotate-180 text-[#7C3AED]' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <p className="text-xs text-gray-600 mt-2 pl-0.5 leading-relaxed font-normal animate-fadeIn">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
  </>;
}


import type { ServiceDocument as Document } from './serviceDetailTypes';
import React, { type ReactNode } from 'react';


export function ServiceDocuments({ documentList, renderIcon }: { documentList: Document[]; renderIcon: (kind: string, className: string) => ReactNode }) {
  return <>
<div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-black text-gray-900 tracking-tight">
                  Required Documents
                </h2>
                <span className="text-[11px] text-gray-400 font-semibold">Digital Copies Only</span>
              </div>

              {/* Progress step track above cards */}
              <div className="flex items-center justify-center gap-2 py-1">
                {documentList.map((doc, idx) => (
                  <React.Fragment key={doc.id || idx}>
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-black flex items-center justify-center">
                      {idx + 1}
                    </div>
                    {idx < documentList.length - 1 && (
                      <div className="w-12 sm:w-20 h-0.5 bg-purple-200" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Document Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {documentList.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-white border border-purple-200/70 hover:border-purple-300 shadow-2xs flex flex-col items-center text-center justify-between min-h-[110px] transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mb-2">
                      {renderIcon(doc.iconType, 'text-[#7C3AED]')}
                    </div>
                    <span className="text-xs font-bold text-gray-800 leading-snug block">
                      {doc.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
  </>;
}


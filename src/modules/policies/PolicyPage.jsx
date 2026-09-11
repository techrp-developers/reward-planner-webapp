// src/modules/policies/PolicyPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { POLICIES_DATA } from './policiesData';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';

export const PolicyPage = ({ policyId: defaultPolicyId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Determine which policy to show
  const getActiveId = () => {
    if (defaultPolicyId && POLICIES_DATA[defaultPolicyId]) return defaultPolicyId;
    if (params.policyId && POLICIES_DATA[params.policyId]) return params.policyId;

    const path = location.pathname.toLowerCase();
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('shipping')) return 'shipping';
    if (path.includes('refund')) return 'refund';
    if (path.includes('support')) return 'support';
    return 'terms';
  };

  const [activeId, setActiveId] = useState(getActiveId());
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    setActiveId(getActiveId());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, defaultPolicyId, params.policyId]);

  const policy = POLICIES_DATA[activeId] || POLICIES_DATA.terms;

  const handleAcknowledge = () => {
    setAcknowledged(true);
    setTimeout(() => {
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 px-4 lg:px-8 font-['Poppins',sans-serif]">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => (window.history.length > 2 ? navigate(-1) : navigate('/'))}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm font-semibold shadow-xs cursor-pointer transition-all hover:-translate-x-0.5"
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
            <span>Back</span>
          </button>

          <nav className="text-xs text-gray-500 flex items-center gap-1.5">
            <Link to="/" className="hover:text-[#EA4988] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-400">Policies & Governance</span>
            <span>/</span>
            <span className="text-gray-800 font-semibold">{policy.title}</span>
          </nav>
        </div>

        {/* Main Policy Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8">
          {/* Header Banner */}
          <div className="space-y-3 pb-6 border-b border-gray-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-[#EA4988] text-xs font-bold uppercase tracking-wider">
              <ShieldOutlinedIcon sx={{ fontSize: 16 }} />
              <span>{policy.headerBadge}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {policy.title}
            </h1>

            {policy.intro && (
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line pt-1">
                {policy.intro}
              </p>
            )}
          </div>

          {/* Important Disclaimer Callout */}
          {policy.disclaimer && (
            <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/80 flex items-start gap-3.5 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <InfoOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                  Important Disclaimer
                </h4>
                <p className="text-xs sm:text-sm text-amber-800 font-medium leading-relaxed">
                  {policy.disclaimer}
                </p>
              </div>
            </div>
          )}

          {/* Policy Clauses List */}
          <div className="space-y-6">
            {policy.sections.map((section) => (
              <div
                key={section.num}
                className="rounded-2xl p-5 sm:p-6 bg-[#FAFAFC] border border-gray-100 hover:border-pink-100 transition-colors space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FC8BAD] to-[#A654CD] text-white text-xs font-black flex items-center justify-center shadow-xs shrink-0">
                    {section.num}
                  </span>
                  <h3 className="text-base font-bold text-gray-900">
                    {section.title}
                  </h3>
                </div>

                {section.text && (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-10">
                    {section.text}
                  </p>
                )}

                {section.intro && (
                  <p className="text-xs sm:text-sm font-medium text-gray-700 pl-10">
                    {section.intro}
                  </p>
                )}

                {section.items && (
                  <ul className="space-y-2 pl-10">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-gray-600 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EA4988] shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.subsections && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 sm:pl-10 pt-2">
                    {section.subsections.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-2.5 hover:border-pink-200 transition-colors"
                      >
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FC8BAD] to-[#EA4988]" />
                          <span>{sub.subtitle}</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {sub.items.map((item, iIdx) => (
                            <li key={iIdx} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {section.paragraphs && (
                  <div className="space-y-2.5 pl-0 sm:pl-10 pt-1">
                    {section.paragraphs.map((para, pIdx) => (
                      <p key={pIdx} className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                )}

                {section.table && (
                  <div className="pl-0 sm:pl-10 pt-3 space-y-2">
                    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs bg-white">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 via-pink-50/30 to-purple-50/20 text-gray-900 font-bold border-b border-gray-200">
                          <tr>
                            {section.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="py-3.5 px-4 sm:px-6">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {section.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-gray-50/80 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="py-3 px-4 sm:px-6 font-medium">
                                  {cell === 'Yes' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Yes
                                    </span>
                                  ) : cell === 'No' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600">
                                      No
                                    </span>
                                  ) : (
                                    <span className={cell.includes('Yes') ? 'font-bold text-amber-800' : ''}>
                                      {cell}
                                    </span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {section.tableFootnote && (
                      <p className="text-[11px] text-gray-500 italic pl-1">
                        {section.tableFootnote}
                      </p>
                    )}
                  </div>
                )}

                {section.note && (
                  <div className="mt-2 ml-10 p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 font-medium">
                    {section.note}
                  </div>
                )}

                {section.contact && (
                  <div className="mt-3 ml-0 sm:ml-10 p-4 rounded-xl bg-white border border-gray-200/80 space-y-2 text-xs sm:text-sm">
                    {section.contact.company && (
                      <div className="flex items-center gap-2 text-gray-800">
                        <BusinessOutlinedIcon sx={{ fontSize: 18 }} className="text-[#EA4988]" />
                        <span className="font-bold">Company:</span> {section.contact.company}
                      </div>
                    )}
                    {section.contact.email && (
                      <div className="flex items-center gap-2 text-gray-800">
                        <EmailOutlinedIcon sx={{ fontSize: 18 }} className="text-[#7C3AED]" />
                        <span className="font-bold">Email:</span>{' '}
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${section.contact.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#EA4988] hover:underline font-semibold"
                        >
                          {section.contact.email}
                        </a>
                      </div>
                    )}
                    {section.contact.phone && (
                      <div className="flex items-center gap-2 text-gray-800">
                        <PhoneOutlinedIcon sx={{ fontSize: 18 }} className="text-[#10B981]" />
                        <span className="font-bold">Phone:</span>{' '}
                        <a
                          href={`tel:${section.contact.phone.replace(/[^+\d]/g, '')}`}
                          className="text-[#10B981] hover:underline font-semibold"
                        >
                          {section.contact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons at the Bottom */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => (window.history.length > 2 ? navigate(-1) : navigate('/'))}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleAcknowledge}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] text-white font-bold text-sm shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
              <span>{acknowledged ? 'Acknowledged!' : 'Okay, I Understand'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;

// src/components/home/BirthdayCelebrationModal.jsx
import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import { hasWishedColleague, recordBirthdayWish } from '../../services/celebrationService.js';

const QUICK_GREETINGS = [
  '🎂 Happy Birthday! Wishing you an amazing year ahead!',
  '🎉 Happy Birthday! Cheers to another year of great achievements!',
  '🌟 Best wishes on your special day! Stay happy and healthy!',
];

export const BirthdayCelebrationModal = ({
  isOpen,
  onClose,
  companyName = 'TechCorp Global',
  celebrants = [],
}) => {
  const [wishedMap, setWishedMap] = useState({});
  const [customMessages, setCustomMessages] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [selectedGiftCoins, setSelectedGiftCoins] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    // Check existing wishes from storage
    const initialWished = {};
    celebrants.forEach((c) => {
      if (hasWishedColleague(c.id)) {
        initialWished[c.id] = true;
      }
    });
    setWishedMap(initialWished);

    // Escape key listener
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, celebrants, onClose]);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSendWish = (colleague, greetingText) => {
    const textToSend = greetingText || customMessages[colleague.id] || QUICK_GREETINGS[0];
    recordBirthdayWish(colleague.id, textToSend);

    setWishedMap((prev) => ({ ...prev, [colleague.id]: true }));
    const coins = selectedGiftCoins[colleague.id] ? ` with ${selectedGiftCoins[colleague.id]} RP Coins!` : '!';
    showToast(`🎁 Birthday wish sent to ${colleague.name}${coins}`);
  };

  const handleSelectQuickGreeting = (colleagueId, greeting) => {
    setCustomMessages((prev) => ({ ...prev, [colleagueId]: greeting }));
  };

  const toggleGiftCoins = (colleagueId, amount = 100) => {
    setSelectedGiftCoins((prev) => ({
      ...prev,
      [colleagueId]: prev[colleagueId] === amount ? 0 : amount,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebrations-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-violet-100 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 animate-fadeIn">
            <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white p-6 sm:p-7 overflow-hidden shrink-0">
          {/* Subtle background decorative shapes */}
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10 blur-lg pointer-events-none" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shrink-0 shadow-inner">
                <CelebrationOutlinedIcon sx={{ fontSize: 28 }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/25">
                    {companyName}
                  </span>
                  <span className="text-[11px] text-white/80 font-medium">
                    {celebrants.length} {celebrants.length === 1 ? 'Celebrant' : 'Celebrants'} Today
                  </span>
                </div>
                <h2
                  id="celebrations-modal-title"
                  className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1 leading-snug"
                >
                  Birthday Wishes to your Colleagues 🎂
                </h2>
                <p className="text-xs text-violet-100 mt-0.5 font-normal">
                  Make their workday special! Send a celebratory wish and brighten their day.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-white/20"
              aria-label="Close modal"
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        {/* ── BODY (MEMBER LIST) ────────────────────────────────────────────── */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {celebrants.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                <CakeOutlinedIcon sx={{ fontSize: 32 }} />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                No Birthdays Today for {companyName}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                None of your colleagues have a birthday registered for today. Check back tomorrow for upcoming team celebrations!
              </p>
            </div>
          ) : (
            celebrants.map((colleague) => {
              const isWished = Boolean(wishedMap[colleague.id]);
              const currentMessage = customMessages[colleague.id] || '';
              const giftCoins = selectedGiftCoins[colleague.id] || 0;

              return (
                <div
                  key={colleague.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-violet-300 transition-all p-4 sm:p-5 shadow-xs flex flex-col gap-3.5"
                >
                  {/* Top Row: Colleague Info */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        {colleague.avatar ? (
                          <img
                            src={colleague.avatar}
                            alt={colleague.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-violet-100 shadow-xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 font-extrabold flex items-center justify-center text-base border-2 border-violet-200">
                            {colleague.name?.charAt(0) || 'C'}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 text-xs" title="Birthday today!">
                          🎂
                        </span>
                      </div>

                      <div className="min-w-0">
                        {/* Member Name */}
                        <h4 className="text-base font-extrabold text-gray-900 truncate leading-tight flex items-center gap-2">
                          <span>{colleague.name}</span>
                          {isWished && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                              <CheckCircleOutlinedIcon sx={{ fontSize: 12 }} />
                              Wished
                            </span>
                          )}
                        </h4>

                        {/* Member Department & Role */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-violet-50 text-[#7C3AED] border border-violet-200">
                            <BusinessOutlinedIcon sx={{ fontSize: 12 }} />
                            {colleague.department}
                          </span>
                          {colleague.role && colleague.role !== colleague.department && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">
                              <WorkOutlineOutlinedIcon sx={{ fontSize: 12 }} />
                              {colleague.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Birthday Badge */}
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-violet-700 bg-violet-100/70 px-2.5 py-1 rounded-full border border-violet-200/80 inline-block">
                        Today 🎉
                      </span>
                    </div>
                  </div>

                  {/* Quick Greeting Suggestion Chips */}
                  <div className="space-y-1.5 pt-1 border-t border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                      Quick Greetings:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_GREETINGS.map((greet, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isWished}
                          onClick={() => handleSelectQuickGreeting(colleague.id, greet)}
                          className={`text-[11px] px-2.5 py-1 rounded-xl transition-colors text-left cursor-pointer border ${
                            currentMessage === greet
                              ? 'bg-violet-600 text-white border-violet-600 font-semibold shadow-xs'
                              : 'bg-gray-50 hover:bg-violet-50 text-gray-700 hover:text-violet-800 border-gray-200'
                          } ${isWished ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {greet}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Message Input & Action Row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <input
                      type="text"
                      disabled={isWished}
                      value={currentMessage}
                      onChange={(e) =>
                        setCustomMessages((prev) => ({
                          ...prev,
                          [colleague.id]: e.target.value,
                        }))
                      }
                      placeholder={`Write a personal birthday wish for ${colleague.name.split(' ')[0]}...`}
                      className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:bg-gray-50 disabled:text-gray-400"
                    />

                    {/* Optional Gift RP Coins Toggle */}
                    <button
                      type="button"
                      disabled={isWished}
                      onClick={() => toggleGiftCoins(colleague.id, 100)}
                      className={`inline-flex items-center justify-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                        giftCoins > 0
                          ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-amber-50 hover:border-amber-200'
                      } ${isWished ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title="Gift 100 RP Coins along with your birthday wish"
                    >
                      <MonetizationOnOutlinedIcon
                        sx={{ fontSize: 16 }}
                        className={giftCoins > 0 ? 'text-amber-600' : 'text-gray-400'}
                      />
                      <span>{giftCoins > 0 ? '+100 RP Coins' : 'Gift 100 RP'}</span>
                    </button>

                    {/* Send Wish Button */}
                    <button
                      type="button"
                      disabled={isWished}
                      onClick={() => handleSendWish(colleague, currentMessage)}
                      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs ${
                        isWished
                          ? 'bg-emerald-500 text-white cursor-not-allowed opacity-90'
                          : 'bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] hover:opacity-95 active:scale-95 text-white'
                      }`}
                    >
                      {isWished ? (
                        <>
                          <CheckCircleOutlinedIcon sx={{ fontSize: 15 }} />
                          <span>Wish Sent!</span>
                        </>
                      ) : (
                        <>
                          <SendOutlinedIcon sx={{ fontSize: 14 }} />
                          <span>Send Wish 🎁</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span>
            Showing employees of <strong className="text-gray-800">{companyName}</strong> celebrating today
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default BirthdayCelebrationModal;

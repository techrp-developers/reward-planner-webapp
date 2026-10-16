import React, { useState } from 'react';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CheckIcon from '@mui/icons-material/Check';

export interface BirthdayPerson {
  id: string | number;
  name: string;
  role: string;
  avatar: string;
  isToday: boolean;
  dateStr: string;
}

const BIRTHDAY_PROFILES: BirthdayPerson[] = [
  {
    id: 'nina',
    name: 'Nina Patel',
    role: 'Finance Partner',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    isToday: true,
    dateStr: 'Birthday today',
  },
  {
    id: 'aarav',
    name: 'Aarav Mehta',
    role: 'Product Designer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    isToday: false,
    dateStr: 'Oct 18',
  },
  {
    id: 'sana',
    name: 'Sana Khan',
    role: 'Customer Success',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    isToday: false,
    dateStr: 'Oct 21',
  },
  {
    id: 'leah',
    name: 'Leah Thomas',
    role: 'Marketing Lead',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
    isToday: false,
    dateStr: 'Oct 24',
  },
  {
    id: 'vikram',
    name: 'Vikram Malhotra',
    role: 'Cloud Architect',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    isToday: false,
    dateStr: 'Oct 29',
  },
];

export default function EmployeeBirthdays() {
  const [wishedIds, setWishedIds] = useState<Set<string | number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSendWish = (person: BirthdayPerson) => {
    setWishedIds((prev) => new Set(prev).add(person.id));
    setToastMessage(
      person.isToday
        ? `Warm birthday wishes sent to ${person.name}! 🎂🎉`
        : `Early birthday greetings sent to ${person.name}! 🎈`
    );
    setTimeout(() => setToastMessage(null), 3200);
  };

  return (
    <section className="w-full mb-6 select-none" aria-label="Team Birthdays">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1C0E28] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-fadeIn border border-purple-400/20">
          <CheckIcon sx={{ fontSize: 18 }} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Selected 4th Color Set: Coral Cream · Amber Cream · Soft Blush (#FFF0ED → #FFF5E9 → #FDF1F8) */}
      <div
        className="relative rounded-[22px] sm:rounded-[24px] p-4 sm:p-5 overflow-hidden transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #FFF0ED 0%, #FFF5E9 50%, #FDF1F8 100%)',
          borderColor: '#FCE3DF',
          borderWidth: '1px',
          borderStyle: 'solid',
          boxShadow: '0 10px 30px -5px rgba(249, 115, 22, 0.08), 0 2px 8px -2px rgba(0,0,0,0.02), inset 0 1px 2px rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* Glossy Specular Light Reflection Sweep */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none rounded-[inherit]" />

        {/* Ambient Luminous Orbs */}
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'rgba(255, 240, 237, 0.75)' }}
        />
        <div
          className="absolute -bottom-14 -left-14 w-48 h-48 rounded-full blur-2xl pointer-events-none"
          style={{ background: 'rgba(253, 241, 248, 0.65)' }}
        />

        {/* Small Title Header */}
        <div className="relative z-10 flex items-center justify-between mb-3.5 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/90 border border-rose-200/80 shadow-2xs flex items-center justify-center text-[#E11D48] shrink-0">
              <CakeOutlinedIcon sx={{ fontSize: 16 }} className="text-[#E11D48]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#1C0E28] tracking-tight">
              Birthdays
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-[#E11D48] bg-white/90 px-2.5 py-0.5 rounded-full border border-rose-200/80 shadow-2xs flex items-center gap-1.5 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] animate-pulse" />
            1 Today
          </span>
        </div>

        {/* Birthday Cards Track - First Today's Birthday, Then Upcoming */}
        <div className="relative z-10 flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-1">
          {BIRTHDAY_PROFILES.map((person) => {
            const isToday = person.isToday;
            const isWished = wishedIds.has(person.id);

            return (
              <div
                key={person.id}
                className={`min-w-[260px] sm:min-w-[280px] lg:min-w-0 lg:flex-1 rounded-[18px] sm:rounded-[20px] transition-all relative flex flex-col justify-between overflow-hidden ${
                  isToday
                    ? 'bg-white border border-[#FECDD3] shadow-[0_4px_16px_-4px_rgba(244,63,94,0.10)]'
                    : 'bg-white border border-[#E2E8F0] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] hover:shadow-sm'
                }`}
              >
                {/* Today's Card Specific Top-Right Pink Blush */}
                {isToday && (
                  <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-gradient-to-br from-pink-200/55 via-rose-100/30 to-transparent pointer-events-none" />
                )}

                {/* Card Main Body */}
                {isToday ? (
                  /* TODAY'S BIRTHDAY CARD: Avatar + Info + 3D Cake (Matching Screenshot) */
                  <div className="py-3 px-3.5 sm:py-3.5 sm:px-4 flex items-center justify-between gap-2.5 relative z-10">
                    {/* Avatar with soft halo border */}
                    <div className="relative shrink-0">
                      <div className="p-[2px] rounded-full bg-gradient-to-tr from-rose-200 via-pink-100 to-rose-200 shadow-2xs">
                        <div className="p-[1.5px] rounded-full bg-white">
                          <img
                            src={person.avatar}
                            alt={person.name}
                            className="w-12 h-12 sm:w-[50px] sm:h-[50px] rounded-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Middle Info: Tag above name */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-bold tracking-wider text-[#E11D48] uppercase mb-0.5">
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} className="text-[#E11D48]" />
                        <span>BIRTHDAY TODAY</span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-[#1C0E28] tracking-tight truncate leading-tight">
                        {person.name}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-[#776B80] font-normal truncate mt-0.5">
                        {person.role}
                      </p>
                    </div>

                    {/* Right Illustration: 3D Birthday Cake with Candle & Confetti */}
                    <div className="shrink-0 relative">
                      <svg
                        width="64"
                        height="62"
                        viewBox="0 0 92 88"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="select-none pointer-events-none"
                      >
                        <defs>
                          <linearGradient id="standGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FBBF24" />
                            <stop offset="100%" stopColor="#D97706" />
                          </linearGradient>
                          <linearGradient id="cakeBody" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F472B6" />
                            <stop offset="50%" stopColor="#FDA4AF" />
                            <stop offset="100%" stopColor="#F43F5E" />
                          </linearGradient>
                          <linearGradient id="frostingCream" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FFF1F2" />
                            <stop offset="60%" stopColor="#FECDD3" />
                            <stop offset="100%" stopColor="#FDA4AF" />
                          </linearGradient>
                          <linearGradient id="candleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FB7185" />
                            <stop offset="50%" stopColor="#FFF1F2" />
                            <stop offset="100%" stopColor="#F43F5E" />
                          </linearGradient>
                          <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FEF08A" />
                            <stop offset="50%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#EA580C" />
                          </radialGradient>
                        </defs>

                        {/* Streamer Left (Yellow) */}
                        <path
                          d="M14 46 C10 44, 12 39, 16 37 C20 35, 17 30, 21 28"
                          stroke="#F59E0B"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* Streamer Right (Pink) */}
                        <path
                          d="M78 44 C82 42, 80 37, 76 35 C72 33, 75 28, 71 26"
                          stroke="#EC4899"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* Floating Pink Heart Top-Left */}
                        <path
                          d="M22 23 C22 20.5 20 18.5 17.5 18.5 C15.5 18.5 14 19.8 13.5 21 C13 19.8 11.5 18.5 9.5 18.5 C7 18.5 5 20.5 5 23 C5 26.5 10 30.5 13.5 32 C17 30.5 22 26.5 22 23 Z"
                          fill="#F472B6"
                          transform="scale(0.55) translate(22, 10)"
                        />

                        {/* 4-Point Pink Sparkle Top-Right */}
                        <path
                          d="M58 17 L59.5 21 L63.5 22.5 L59.5 24 L58 28 L56.5 24 L52.5 22.5 L56.5 21 Z"
                          fill="#F472B6"
                        />

                        {/* Confetti dots */}
                        <circle cx="75" cy="21" r="2" fill="#FBBF24" />
                        <circle cx="78" cy="46" r="1.5" fill="#F472B6" />

                        {/* Stand */}
                        <ellipse cx="48" cy="74" rx="27" ry="7" fill="url(#standGrad)" />
                        <ellipse cx="48" cy="72" rx="25" ry="6" fill="#FDE68A" />

                        {/* Cake Body */}
                        <path
                          d="M24 57 C24 57 24 68 26 70 C30 73 66 73 70 70 C72 68 72 57 72 57 Z"
                          fill="url(#cakeBody)"
                        />
                        <ellipse cx="48" cy="57" rx="24" ry="7" fill="#F43F5E" />

                        {/* Scalloped Dripping Frosting */}
                        <path
                          d="M24 53
                             C24 53, 25 61, 28 61 C31 61, 31 53, 34 53
                             C37 53, 37 63, 40 63 C43 63, 43 53, 46 53
                             C49 53, 49 64, 52 64 C55 64, 55 53, 58 53
                             C61 53, 61 62, 64 62 C67 62, 68 53, 72 53
                             C72 53, 72 46, 72 46
                             C72 46, 24 46, 24 46 Z"
                          fill="url(#frostingCream)"
                        />
                        <ellipse cx="48" cy="46" rx="24" ry="7" fill="url(#frostingCream)" />

                        {/* Frosting puffs */}
                        <circle cx="27" cy="45" r="3" fill="#FFF1F2" />
                        <circle cx="34" cy="48" r="3.2" fill="#FFF1F2" />
                        <circle cx="42" cy="50" r="3.5" fill="#FFF1F2" />
                        <circle cx="50" cy="50" r="3.5" fill="#FFF1F2" />
                        <circle cx="58" cy="48" r="3.2" fill="#FFF1F2" />
                        <circle cx="66" cy="46" r="3" fill="#FFF1F2" />

                        {/* Candle */}
                        <rect x="46" y="24" width="4" height="20" rx="2" fill="url(#candleGrad)" />
                        <path d="M46 27 L50 25 M46 32 L50 30 M46 37 L50 35 M46 42 L50 40" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
                        <line x1="48" y1="24" x2="48" y2="21" stroke="#374151" strokeWidth="1" />

                        {/* Glowing flame */}
                        <path
                          d="M48 9 C51 14 52 18 50 21 C49 22.5 47 22.5 46 21 C44 18 45 14 48 9 Z"
                          fill="url(#flameGlow)"
                        />
                        <ellipse cx="48" cy="18" rx="1.5" ry="2.5" fill="#FEF08A" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  /* UPCOMING BIRTHDAY CARD: Avatar + Info */
                  <div className="py-3 px-3.5 sm:py-3.5 sm:px-4 flex items-center gap-3 relative z-10">
                    {/* Circular Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-12 h-12 sm:w-[50px] sm:h-[50px] rounded-full object-cover border border-slate-100"
                        loading="lazy"
                      />
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-[#1C0E28] tracking-tight truncate leading-tight">
                        {person.name}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-[#776B80] font-normal truncate mt-0.5">
                        {person.role}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#64748B] font-medium mt-1">
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} className="text-[#94A3B8]" />
                        <span>{person.dateStr}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Action Section with Divider */}
                <div className="border-t border-[#F1F5F9] w-full relative z-10">
                  <button
                    type="button"
                    onClick={() => handleSendWish(person)}
                    className={`w-full py-2 px-3 flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-bold transition-colors cursor-pointer ${
                      isToday
                        ? 'text-[#E11D48] hover:text-[#BE123C]'
                        : 'text-[#7C3AED] hover:text-[#6D28D9]'
                    }`}
                    aria-label={`Send birthday wishes to ${person.name}`}
                  >
                    {isWished ? (
                      <>
                        <CheckIcon sx={{ fontSize: 15 }} className="text-emerald-500" />
                        <span className="text-emerald-600 font-bold">Wishes sent</span>
                      </>
                    ) : (
                      <>
                        <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 16 }} />
                        <span>Send wishes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

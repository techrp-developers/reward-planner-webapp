import React, { useState } from 'react';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CheckIcon from '@mui/icons-material/Check';

export interface BirthdayPerson {
  id: string | number;
  name: string;
  role: string;
  avatar: string;
  isToday: boolean;
  dateStr: string; // e.g. "Birthday today" or "Oct 18"
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

      {/* Birthday Cards Track - First Today's Birthday, Then Upcoming */}
      <div className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto no-scrollbar py-1">
        {BIRTHDAY_PROFILES.map((person) => {
          const isToday = person.isToday;
          const isWished = wishedIds.has(person.id);

          return (
            <div
              key={person.id}
              className={`min-w-[270px] sm:min-w-[280px] lg:min-w-0 lg:flex-1 rounded-[20px] transition-all relative flex flex-col justify-between ${
                isToday
                  ? 'bg-gradient-to-br from-[#FFF5F7] via-[#FFF8FA] to-[#FFF0F4] border border-[#FECDD3] shadow-[0_2px_14px_-2px_rgba(244,63,94,0.08)]'
                  : 'bg-white border border-[#E2E8F0] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-sm'
              }`}
            >
              {/* Today's Celebratory Decorative Accents */}
              {isToday && (
                <>
                  {/* Sparkle 1: Top Left */}
                  <svg
                    className="w-3 h-3 text-amber-400 absolute top-3.5 left-3.5 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>

                  {/* Sparkle 2: Lower Left near Avatar */}
                  <svg
                    className="w-2.5 h-2.5 text-amber-400 absolute bottom-14 left-4 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>

                  {/* Sparkle 3: Lower Right */}
                  <svg
                    className="w-2.5 h-2.5 text-amber-400 absolute bottom-12 right-6 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>

                  {/* Balloons Illustration in Top Right */}
                  <svg
                    width="46"
                    height="58"
                    viewBox="0 0 48 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute top-2.5 right-3 pointer-events-none select-none"
                  >
                    {/* Balloon 1: Pastel Peach */}
                    <g transform="rotate(-6 16 20)">
                      <ellipse cx="16" cy="18" rx="10" ry="13" fill="#FDBA74" fillOpacity="0.88" />
                      <polygon points="14,31 18,31 16,33" fill="#FDBA74" />
                      <ellipse cx="13" cy="14" rx="2.5" ry="5" fill="#FFFFFF" fillOpacity="0.55" transform="rotate(-20 13 14)" />
                      <path d="M16 33 Q18 42 15 52" stroke="#FDA4AF" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.65" />
                    </g>
                    {/* Balloon 2: Pastel Pink */}
                    <g transform="rotate(8 28 17)">
                      <ellipse cx="28" cy="16" rx="9" ry="12" fill="#F472B6" fillOpacity="0.88" />
                      <polygon points="26,28 30,28 28,30" fill="#F472B6" />
                      <ellipse cx="25" cy="12" rx="2" ry="4" fill="#FFFFFF" fillOpacity="0.55" transform="rotate(-20 25 12)" />
                      <path d="M28 30 Q25 40 27 50" stroke="#FDA4AF" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.65" />
                    </g>
                  </svg>
                </>
              )}

              {/* Card Top Section: Avatar + Details */}
              <div className="p-4 sm:p-5 flex items-center gap-3.5">
                {/* Circular Profile Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-xs"
                    loading="lazy"
                  />
                </div>

                {/* Profile Information */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-[#1C0E28] tracking-tight truncate leading-tight">
                    {person.name}
                  </h4>
                  <p className="text-xs text-[#64748B] truncate mt-0.5 font-normal">
                    {person.role}
                  </p>

                  {/* Badge: Birthday today / Upcoming Date */}
                  {isToday ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#FDA4AF] text-[#E11D48] text-[11px] sm:text-xs font-semibold shadow-2xs mt-1.5">
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} className="text-[#E11D48]" />
                      <span>{person.dateStr}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B] font-medium mt-1.5">
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} className="text-[#94A3B8]" />
                      <span>{person.dateStr}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Action Section with Divider */}
              <div className={`border-t ${isToday ? 'border-[#FFE4E6]' : 'border-[#F1F5F9]'}`}>
                <button
                  type="button"
                  onClick={() => handleSendWish(person)}
                  className={`w-full py-2.5 px-3 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                    isToday
                      ? 'text-[#E11D48] hover:text-[#BE123C]'
                      : 'text-[#7C3AED] hover:text-[#6D28D9]'
                  }`}
                  aria-label={`Send birthday wishes to ${person.name}`}
                >
                  {isWished ? (
                    <>
                      <CheckIcon sx={{ fontSize: 16 }} className="text-emerald-500" />
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
    </section>
  );
}

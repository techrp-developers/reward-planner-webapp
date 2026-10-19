import React, { useState, useEffect, useMemo } from 'react';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CheckIcon from '@mui/icons-material/Check';
import birthdayBgBubbles from '../../../assets/home/birthday_bg_bubbles.png';
import { useAuth } from '../../../context/AuthContext';
import { fetchCompanyBirthdays, sendBirthdayWishApi } from '../../../api/authApi';
import {
  hasWishedColleague,
  recordBirthdayWish,
  isCompanyMatch,
  isBirthdayToday,
} from '../../../services/celebrationService';
import { INITIAL_COMPANY_EMPLOYEES } from '../../../data/companyEmployeesData';

export interface BirthdayPerson {
  id: string | number;
  name: string;
  role: string;
  avatar: string;
  isToday: boolean;
  dateStr: string;
  employeeId?: string | number;
  userId?: string | number;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const formatBirthdayDate = (dob: string | Date | undefined, isToday: boolean): string => {
  if (isToday) return 'Birthday today';
  if (!dob) return 'Upcoming';

  const str = String(dob).trim();
  const match = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) {
    const m = parseInt(match[2], 10);
    const d = parseInt(match[3], 10);
    if (m >= 1 && m <= 12) {
      return `${MONTH_NAMES[m - 1]} ${d}`;
    }
  }

  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return `${MONTH_NAMES[parsed.getMonth()]} ${parsed.getDate()}`;
    }
  } catch {}

  return 'Upcoming';
};

export default function EmployeeBirthdays() {
  const { user } = useAuth();
  const [backendBirthdays, setBackendBirthdays] = useState<any[] | null>(null);
  const [wishedIds, setWishedIds] = useState<Set<string | number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch dynamic birthdays from backend API on mount
  useEffect(() => {
    let isMounted = true;
    const loadBirthdays = async () => {
      try {
        const res = await fetchCompanyBirthdays();
        if (isMounted && res) {
          const list = Array.isArray(res) ? res : (res.all || res.today || []);
          if (Array.isArray(list) && list.length > 0) {
            setBackendBirthdays(list);
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic birthdays:', err);
      }
    };

    loadBirthdays();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute the combined dynamic birthday list
  const birthdayList = useMemo<BirthdayPerson[]>(() => {
    // 1. Identify active company name
    const companyName =
      user?.company?.name ||
      user?.company_name ||
      (typeof user?.company === 'string' ? user?.company : '') ||
      user?.employeeInfo?.company ||
      user?.employer?.name ||
      'MPS Global';

    // 2. Check if backend provided dynamic birthdays (from dedicated endpoint or user session)
    const rawBackendList = backendBirthdays?.length
      ? backendBirthdays
      : (Array.isArray(user?.birthday_employees) && user.birthday_employees.length > 0
          ? user.birthday_employees
          : null);

    const dynamicList: BirthdayPerson[] = [];
    const seenIds = new Set<string | number>();

    if (rawBackendList && rawBackendList.length > 0) {
      rawBackendList.forEach((emp: any) => {
        const id = emp.id || emp.employeeId || emp.userId;
        if (!id || seenIds.has(id)) return;
        seenIds.add(id);

        const isToday = Boolean(emp.isToday ?? isBirthdayToday(emp.dob));
        const dateStr = emp.dateStr || formatBirthdayDate(emp.dob, isToday);

        dynamicList.push({
          id,
          name: emp.name || 'Valued Colleague',
          role: emp.role || emp.department || 'Team Member',
          avatar:
            emp.avatar ||
            emp.image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name || 'RP')}&background=FCE7F3&color=E11D48&bold=true`,
          isToday,
          dateStr,
          employeeId: emp.employeeId || id,
          userId: emp.userId,
        });
      });
    }

    // 3. Fallback or augment with corporate directory colleagues for current company if fewer than 2 cards
    if (dynamicList.length < 2) {
      const companyMatches = INITIAL_COMPANY_EMPLOYEES.filter((emp) =>
        isCompanyMatch(emp.company, companyName)
      );

      const fallbackPool = companyMatches.length > 0 ? companyMatches : INITIAL_COMPANY_EMPLOYEES.slice(0, 5);

      fallbackPool.forEach((emp) => {
        if (seenIds.has(emp.id)) return;
        seenIds.add(emp.id);

        const isToday = isBirthdayToday(emp.dob);
        const dateStr = formatBirthdayDate(emp.dob, isToday);

        dynamicList.push({
          id: emp.id,
          name: emp.name,
          role: emp.role || emp.department || 'Colleague',
          avatar:
            emp.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=FCE7F3&color=E11D48&bold=true`,
          isToday,
          dateStr,
          employeeId: emp.id,
        });
      });
    }

    // Sort: Today's birthdays first, then upcoming birthdays
    return dynamicList.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return 0;
    });
  }, [user, backendBirthdays]);

  // Synchronize wish states from local storage so wishes survive refreshes
  useEffect(() => {
    const wishedSet = new Set<string | number>();
    birthdayList.forEach((person) => {
      if (hasWishedColleague(person.id)) {
        wishedSet.add(person.id);
      }
    });
    setWishedIds(wishedSet);
  }, [birthdayList]);

  // Dynamic Counts
  const todayCount = useMemo(() => birthdayList.filter((p) => p.isToday).length, [birthdayList]);
  const upcomingCount = useMemo(() => birthdayList.filter((p) => !p.isToday).length, [birthdayList]);

  const handleSendWish = async (person: BirthdayPerson) => {
    setWishedIds((prev) => new Set(prev).add(person.id));
    recordBirthdayWish(person.id, person.isToday ? 'Happy Birthday!' : 'Happy Early Birthday!');

    try {
      await sendBirthdayWishApi({
        employeeId: person.employeeId || person.id,
        recipientUserId: person.userId,
        message: person.isToday
          ? `Warm birthday wishes sent to ${person.name}! 🎂🎉`
          : `Early birthday greetings sent to ${person.name}! 🎈`,
      });
    } catch (err) {
      console.warn('Could not send birthday wish via API:', err);
    }

    setToastMessage(
      person.isToday
        ? `Warm birthday wishes sent to ${person.name}! 🎂🎉`
        : `Early birthday greetings sent to ${person.name}! 🎈`
    );
    setTimeout(() => setToastMessage(null), 3200);
  };

  return (
    <section className="w-full mb-9 sm:mb-11 select-none" aria-label="Team Birthdays">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#1C0E28] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm animate-fadeIn border border-purple-400/20">
          <CheckIcon sx={{ fontSize: 18 }} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Birthday Section Background Card (Matching Uploaded Bubble Layout) */}
      <div
        className="relative rounded-[22px] sm:rounded-[24px] p-4 sm:p-5 overflow-hidden transition-all duration-300 border border-[#F3E8FF] shadow-[0_12px_36px_-6px_rgba(236,72,153,0.09),0_2px_10px_-2px_rgba(139,92,246,0.05),inset_0_1px_2px_rgba(255,255,255,0.95)]"
        style={{
          backgroundImage: `url(${birthdayBgBubbles})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Subtle Glossy Specular Sheen Sweep */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none rounded-[inherit]" />

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
            {todayCount > 0 ? `${todayCount} Today` : `${upcomingCount} Upcoming`}
          </span>
        </div>

        {/* Birthday Cards Track - First Today's Birthday, Then Upcoming */}
        <div className="relative z-10 flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar py-1">
          {birthdayList.map((person) => {
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
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=FCE7F3&color=E11D48&bold=true`;
                            }}
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
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=FCE7F3&color=E11D48&bold=true`;
                        }}
                        className="w-12 h-12 sm:w-[50px] sm:h-[50px] rounded-full object-cover border border-slate-100"
                        loading="lazy"
                      />
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0">
                      {/* Red Upcoming Label */}
                      <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-bold tracking-wider text-[#E11D48] uppercase mb-0.5">
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} className="text-[#E11D48]" />
                        <span>UPCOMING</span>
                      </div>

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

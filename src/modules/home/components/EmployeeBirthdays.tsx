import React, { useState, useEffect, useMemo } from 'react';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckIcon from '@mui/icons-material/Check';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import bdyBgCard from '../../../assets/home/birthday-banner.png';
import './EmployeeBirthdays.css';
import { useAuth } from '../../../context/AuthContext';
import { fetchCompanyBirthdays, sendBirthdayWishApi } from '../../../api/authApi';
import { resolveAvatarUrl } from '../../../api/client';
import {
  hasWishedColleague,
  recordBirthdayWish,
  isCompanyMatch,
  getCompanyFromUser,
} from '../../../services/celebrationService';
import {
  INITIAL_COMPANY_EMPLOYEES,
  findEmployeeDirectoryInfo,
  getDeterministicUpcomingDob,
} from '../../../data/companyEmployeesData';

/**
 * Confetti Crown graphic that sits directly above upcoming colleague avatars
 * matching the user's reference mockup.
 */
const ConfettiCrown: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 64 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-12 h-5 pointer-events-none select-none ${className}`}
  >
    <circle cx="8" cy="18" r="2" fill="#F43F5E" />
    <circle cx="16" cy="11" r="2.2" fill="#FBBF24" />
    <circle cx="25" cy="6" r="2" fill="#EC4899" />
    <circle cx="32" cy="4" r="2.5" fill="#8B5CF6" />
    <circle cx="39" cy="6" r="2" fill="#3B82F6" />
    <circle cx="48" cy="11" r="2.2" fill="#F59E0B" />
    <circle cx="56" cy="18" r="2" fill="#10B981" />
    <path d="M20 18 L21.5 20 L20 22 L18.5 20 Z" fill="#F472B6" />
    <path d="M44 18 L45.5 20 L44 22 L42.5 20 Z" fill="#FBBF24" />
    <path d="M31 12 L32.5 14 L31 16 L29.5 14 Z" fill="#A855F7" />
    <path d="M12 7 L14 8 L13 10 L11 9 Z" fill="#38BDF8" />
    <path d="M51 7 L53 9 L51 10 L49 8 Z" fill="#FB7185" />
  </svg>
);

/**
 * Elegant default placeholder for when no colleague has a birthday today.
 * Renders a crisp vector silhouette of a user profile with soft neutral styling.
 */
const EmptyProfileAvatar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`w-full h-full flex items-center justify-center bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] select-none ${className}`}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-[58%] h-[58%]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="7.5" r="4.2" fill="#94A3B8" />
      <path
        d="M12 13.5C8 13.5 4.8 15.9 4.8 19V20.5H19.2V19C19.2 15.9 16 13.5 12 13.5Z"
        fill="#94A3B8"
      />
    </svg>
  </div>
);

/**
 * Avatar component that renders the real photo, or gracefully falls back
 * to a styled circular badge showing the first letter of the first name.
 */
interface UserAvatarProps {
  name: string;
  avatar?: string;
  className?: string;
  isToday?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name, avatar, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const firstLetter = useMemo(() => {
    if (!name) return 'U';
    const clean = name.trim();
    const firstName = clean.split(/\s+/)[0] || clean;
    return firstName.charAt(0).toUpperCase() || 'U';
  }, [name]);

  const resolvedAvatar = useMemo(() => resolveAvatarUrl(avatar), [avatar]);
  const hasValidAvatar = Boolean(resolvedAvatar && !imgFailed);

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full ${className}`}>
      {hasValidAvatar ? (
        <img
          src={resolvedAvatar}
          alt={name}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-black bg-gradient-to-tr from-[#D946EF] via-[#EC4899] to-[#F43F5E] text-white select-none uppercase tracking-tight shadow-inner"
        >
          {firstLetter}
        </div>
      )}
    </div>
  );
};

export interface BirthdayPerson {
  id: string | number;
  name: string;
  role: string;
  avatar: string;
  isToday: boolean;
  daysUntil?: number;
  dateStr: string;
  formattedDate: string;
  dob?: string;
  department?: string;
  email?: string;
  phone?: string;
  employeeId?: string | number;
  userId?: string | number;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Parses employee personal birth date and calculates birthday status,
 * days remaining until the next birthday, and human-readable date string.
 */
const getBirthdayMeta = (dob: string | Date | undefined, dateStrHint?: string) => {
  if (!dob && !dateStrHint) {
    return {
      isToday: false,
      daysUntil: 9999,
      dateStr: 'Upcoming',
      formattedDate: '',
      month: 0,
      day: 0,
      isCurrentMonth: false,
      isUpcomingThisMonth: false,
    };
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate(); // 1-31
  const currentYear = now.getFullYear();

  let m = 0;
  let d = 0;

  if (dob instanceof Date && !isNaN(dob.getTime())) {
    m = dob.getMonth() + 1;
    d = dob.getDate();
  } else {
    const str = String(dob || dateStrHint || '').trim();

    // 1. Check YYYY-MM-DD or YYYY/MM/DD
    const ymd = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymd) {
      m = parseInt(ymd[2], 10);
      d = parseInt(ymd[3], 10);
    } else {
      // 2. Check DD-MM-YYYY or DD/MM/YYYY
      const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (dmy) {
        d = parseInt(dmy[1], 10);
        m = parseInt(dmy[2], 10);
      } else {
        // 3. Check MM-DD or MM/DD
        const mmdd = str.match(/^(\d{1,2})[-/](\d{1,2})$/);
        if (mmdd) {
          m = parseInt(mmdd[1], 10);
          d = parseInt(mmdd[2], 10);
        } else {
          // 4. Textual month names
          const monthMap: Record<string, number> = {
            jan: 1, january: 1,
            feb: 2, february: 2,
            mar: 3, march: 3,
            apr: 4, april: 4,
            may: 5,
            jun: 6, june: 6,
            jul: 7, july: 7,
            aug: 8, august: 8,
            sep: 9, september: 9,
            oct: 10, october: 10,
            nov: 11, november: 11,
            dec: 12, december: 12,
          };

          const monthNameMatch = str.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i);
          const dayMatch = str.match(/\b([1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\b/i);

          if (monthNameMatch && dayMatch) {
            m = monthMap[monthNameMatch[1].toLowerCase()] || 0;
            d = parseInt(dayMatch[1], 10);
          } else {
            try {
              const parsed = new Date(str);
              if (!isNaN(parsed.getTime())) {
                m = parsed.getMonth() + 1;
                d = parsed.getDate();
              }
            } catch {}
          }
        }
      }
    }

    if (str.includes('T')) {
      try {
        const isoParsed = new Date(str);
        if (!isNaN(isoParsed.getTime())) {
          const isoM = isoParsed.getMonth() + 1;
          const isoD = isoParsed.getDate();
          if (isoM === currentMonth && isoD === currentDay) {
            m = isoM;
            d = isoD;
          }
        }
      } catch {}
    }
  }

  if (!m || !d || m < 1 || m > 12) {
    return {
      isToday: false,
      daysUntil: 9999,
      dateStr: 'Upcoming',
      formattedDate: '',
      month: 0,
      day: 0,
      isCurrentMonth: false,
      isUpcomingThisMonth: false,
    };
  }

  const todayMidnight = new Date(currentYear, currentMonth - 1, currentDay, 0, 0, 0, 0);
  const isCurrentMonth = m === currentMonth;
  const isToday = isCurrentMonth && d === currentDay;
  const isUpcomingThisMonth = isCurrentMonth && d > currentDay;

  let nextBday = new Date(currentYear, m - 1, d, 0, 0, 0, 0);
  if (nextBday.getTime() < todayMidnight.getTime()) {
    nextBday = new Date(currentYear + 1, m - 1, d, 0, 0, 0, 0);
  }
  const diffMs = nextBday.getTime() - todayMidnight.getTime();
  const daysUntil = isToday
    ? 0
    : Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  const formattedDate = `${MONTH_NAMES[m - 1]} ${d}`;
  const dateStr = isToday ? `Today, ${formattedDate}` : formattedDate;

  return {
    isToday,
    daysUntil,
    dateStr,
    formattedDate,
    month: m,
    day: d,
    isCurrentMonth,
    isUpcomingThisMonth,
  };
};

export default function EmployeeBirthdays() {
  const { user } = useAuth();
  const [backendBirthdays, setBackendBirthdays] = useState<any[] | null>(null);
  const [backendCompanyName, setBackendCompanyName] = useState<string | null>(null);
  const [wishedIds, setWishedIds] = useState<Set<string | number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCelebrantIndex, setActiveCelebrantIndex] = useState(0);
  const [upcomingPage, setUpcomingPage] = useState(0);

  // Retrieve cached user profile from session/local storage for instant hydration
  const cachedUser = useMemo(() => {
    try {
      const stored = sessionStorage.getItem('rp_user_profile') || localStorage.getItem('rp_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const activeUser = user || cachedUser;

  const userId =
    activeUser?.userId ||
    activeUser?.user_id ||
    activeUser?.id ||
    activeUser?.customer_id ||
    '';
  const companyId =
    activeUser?.company_id ||
    activeUser?.companyId ||
    activeUser?.company?.company_id ||
    activeUser?.company?.id ||
    activeUser?.employeeInfo?.company_id ||
    '';

  // Fetch all employees of that company using userId & company_id
  useEffect(() => {
    let isMounted = true;
    const loadBirthdays = async () => {
      try {
        const targetCompanyName = getCompanyFromUser(activeUser) || '';
        const res = await fetchCompanyBirthdays({
          company_id: companyId,
          user_id: userId,
          companyId,
          userId,
          company_name: targetCompanyName,
          companyName: targetCompanyName,
        });

        if (isMounted && res) {
          const list = Array.isArray(res)
            ? res
            : (Array.isArray(res.all) && res.all.length > 0
              ? res.all
              : [...(res.today || []), ...(res.upcoming || [])]);
          if (Array.isArray(list) && list.length > 0) {
            setBackendBirthdays(list);
          }
          if (res.companyName) {
            setBackendCompanyName(res.companyName);
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
  }, [userId, companyId, activeUser]);

  // Compute the combined dynamic birthday list strictly for current user's company ONLY
  const birthdayList = useMemo<BirthdayPerson[]>(() => {
    const activeCompanyName =
      getCompanyFromUser(activeUser) ||
      backendCompanyName ||
      (activeUser ? '' : 'MPS Global');

    let candidatePool: any[] = [];

    if (backendBirthdays && backendBirthdays.length > 0) {
      backendBirthdays.forEach((b: any) => candidatePool.push({ ...b, fromLiveBackend: true }));
    }
    if (Array.isArray(activeUser?.birthday_employees) && activeUser.birthday_employees.length > 0) {
      activeUser.birthday_employees.forEach((b: any) => candidatePool.push({ ...b, fromLiveBackend: true }));
    }
    if (Array.isArray(activeUser?.today_birthdays) && activeUser.today_birthdays.length > 0) {
      activeUser.today_birthdays.forEach((b: any) => candidatePool.push({ ...b, fromLiveBackend: true, isToday: true }));
    }
    if (Array.isArray(activeUser?.upcoming_birthdays) && activeUser.upcoming_birthdays.length > 0) {
      activeUser.upcoming_birthdays.forEach((b: any) => candidatePool.push({ ...b, fromLiveBackend: true }));
    }
    if (Array.isArray(activeUser?.company?.employees) && activeUser.company.employees.length > 0) {
      activeUser.company.employees.forEach((b: any) => candidatePool.push({ ...b, fromLiveBackend: true }));
    }
    if (Array.isArray(activeUser?.company_users) && activeUser.company_users.length > 0) {
      activeUser.company_users.forEach((b: any) => candidatePool.push({ ...b, fromLiveBackend: true }));
    }
    if (Array.isArray(activeUser?.employees) && activeUser.employees.length > 0) {
      activeUser.employees.forEach((b: any) => candidatePool.push({ ...b, fromLiveBackend: true }));
    }
    if (Array.isArray(activeUser?.colleagues) && activeUser.colleagues.length > 0) {
      activeUser.colleagues.forEach((b: any) => candidatePool.push({ ...b, fromLiveBackend: true }));
    }
    if (Array.isArray(activeUser?.team) && activeUser.team.length > 0) {
      activeUser.team.forEach((b: any) => candidatePool.push({ ...b, fromLiveBackend: true }));
    }

    try {
      localStorage.removeItem('rp_custom_company_employees');
      localStorage.removeItem('rp_company_employees');
      const safeComp = (companyId || activeCompanyName || 'company').toString().replace(/[^a-z0-9]/gi, '_');
      const sessionStored = sessionStorage.getItem(`rp_company_employees_${safeComp}`);
      if (sessionStored) {
        const parsed = JSON.parse(sessionStored);
        if (Array.isArray(parsed) && parsed.length > 0) candidatePool.push(...parsed);
      }
    } catch {}

    // Only fallback to mock employees if no backend company employees were found
    if (candidatePool.length === 0) {
      const targetMatchName = activeCompanyName || 'MPS Global';
      const companyMatches = INITIAL_COMPANY_EMPLOYEES.filter((emp) =>
        isCompanyMatch(emp.company, targetMatchName)
      );
      candidatePool.push(...(companyMatches.length > 0 ? companyMatches : INITIAL_COMPANY_EMPLOYEES));
    }

    const dynamicList: BirthdayPerson[] = [];
    const seenIds = new Set<string | number>();
    const seenNames = new Set<string>();

    candidatePool.forEach((emp: any) => {
      if (!emp) return;

      const isLiveBackend = Boolean(emp.fromLiveBackend);

      if (!isLiveBackend) {
        const empCompanyId = emp.company_id || emp.companyId || emp.company?.id;
        if (companyId && empCompanyId && String(empCompanyId) !== String(companyId)) {
          return;
        }

        const empCompany =
          getCompanyFromUser(emp) ||
          (typeof emp.company === 'string' ? emp.company : emp.company?.name) ||
          emp.companyName ||
          emp.employer ||
          emp.company_name;

        if (activeCompanyName && empCompany && !isCompanyMatch(empCompany, activeCompanyName)) {
          return;
        }

        if (!empCompany && !empCompanyId && activeCompanyName) {
          return;
        }
      }

      const id = emp.id || emp.employee_id || emp.employeeId || emp.userId;
      const cleanName = (emp.name || emp.fullName || '').trim().toLowerCase().replace(/\s+/g, ' ');

      if (id && seenIds.has(id)) return;
      if (cleanName && seenNames.has(cleanName)) return;

      if (id) seenIds.add(id);
      if (cleanName) seenNames.add(cleanName);

      const dirMatch = findEmployeeDirectoryInfo(id, emp.name);

      let dob =
        emp.dob ||
        emp.date_of_birth ||
        emp.birthday ||
        emp.birth_date ||
        emp.employeeInfo?.date_of_birth ||
        dirMatch?.dob;

      if (!dob && !isLiveBackend) {
        dob = getDeterministicUpcomingDob(id || emp.name);
      }

      const meta = getBirthdayMeta(dob, emp.dateStr);

      const isToday = Boolean(
        emp.isToday === true ||
        emp.isToday === 1 ||
        emp.isToday === '1' ||
        emp.is_today === 1 ||
        emp.is_today === true ||
        meta.isToday
      );

      let daysUntil = 9999;
      if (isToday) {
        daysUntil = 0;
      } else if (typeof emp.daysUntil === 'number' && emp.daysUntil >= 0) {
        daysUntil = emp.daysUntil;
      } else if (meta.daysUntil !== 9999) {
        daysUntil = meta.daysUntil;
      }

      if (!isToday && daysUntil === 9999 && !isLiveBackend) {
        return;
      }

      const now = new Date();
      const currentMonthName = MONTH_NAMES[now.getMonth()];
      const currentDayNum = now.getDate();
      const todayFormatted = `${currentMonthName} ${currentDayNum}`;

      let formattedDate = '';
      if (emp.dateStr && emp.dateStr !== 'Upcoming' && emp.dateStr !== 'Birthday today') {
        formattedDate = emp.dateStr;
      } else if (meta.formattedDate) {
        formattedDate = meta.formattedDate;
      } else if (meta.month && meta.day) {
        formattedDate = `${MONTH_NAMES[meta.month - 1]} ${meta.day}`;
      } else if (isToday) {
        formattedDate = todayFormatted;
      } else if (emp.dateStr === 'Upcoming') {
        formattedDate = 'Upcoming';
      } else if (typeof daysUntil === 'number' && daysUntil < 365) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysUntil);
        formattedDate = `${MONTH_NAMES[targetDate.getMonth()]} ${targetDate.getDate()}`;
      } else {
        formattedDate = 'Upcoming';
      }

      const dateStr = isToday ? `Today • ${formattedDate}` : formattedDate;

      let role = emp.role || emp.designation || emp.title || dirMatch?.role || '';
      if (!role || role === 'Team Member') {
        role = dirMatch?.role || emp.department || dirMatch?.department || 'Team Member';
      }

      const department = emp.department || dirMatch?.department || '';

      const rawAvatar =
        emp.avatar ||
        emp.image ||
        emp.photo ||
        emp.userImage ||
        emp.user_image ||
        dirMatch?.avatar ||
        '';
      const cleanAvatar = resolveAvatarUrl(rawAvatar);

      dynamicList.push({
        id,
        name: emp.name || emp.fullName || dirMatch?.name || 'Colleague',
        role,
        department,
        email: emp.email || dirMatch?.email || '',
        phone: emp.phone || emp.contact || '',
        dob,
        avatar: cleanAvatar,
        isToday,
        daysUntil,
        dateStr,
        formattedDate,
        employeeId: emp.employeeId || emp.employee_id || id,
        userId: emp.userId || emp.recipient_user_id,
      });
    });

    return dynamicList.sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      const diff = (a.daysUntil ?? 9999) - (b.daysUntil ?? 9999);
      if (diff !== 0) return diff;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [activeUser, backendBirthdays, backendCompanyName, companyId]);

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

  // Partition into today celebrants and upcoming celebrants
  const todayCelebrants = useMemo(() => birthdayList.filter((p) => p.isToday), [birthdayList]);
  const upcomingCelebrants = useMemo(() => birthdayList.filter((p) => !p.isToday), [birthdayList]);

  // Active featured person: If there are today's birthdays, feature them (with carousel if > 1);
  // otherwise null so that today's birthday section displays in its empty state with profile photo
  const featuredPerson = useMemo<BirthdayPerson | null>(() => {
    if (todayCelebrants.length > 0) {
      const idx = activeCelebrantIndex % todayCelebrants.length;
      return todayCelebrants[idx] || todayCelebrants[0];
    }
    return null;
  }, [todayCelebrants, activeCelebrantIndex]);

  // Upcoming 3-column pagination
  const totalUpcomingPages = Math.max(1, Math.ceil(upcomingCelebrants.length / 3));

  const handleNextUpcoming = () => {
    setUpcomingPage((prev) => (prev + 1) % totalUpcomingPages);
  };

  const handlePrevUpcoming = () => {
    setUpcomingPage((prev) => (prev - 1 + totalUpcomingPages) % totalUpcomingPages);
  };

  const visibleUpcoming = useMemo(() => {
    const start = (upcomingPage % totalUpcomingPages) * 3;
    return upcomingCelebrants.slice(start, start + 3);
  }, [upcomingCelebrants, upcomingPage, totalUpcomingPages]);

  const handleSendWish = async (person: BirthdayPerson) => {
    if (!person) return;
    setWishedIds((prev) => new Set(prev).add(person.id));
    const wishMsg = person.isToday
      ? `Warm birthday wishes to ${person.name}! 🎂🎉`
      : `Happy early birthday to ${person.name}! 🎈`;
    recordBirthdayWish(person.id, wishMsg);

    try {
      await sendBirthdayWishApi({
        employeeId: person.employeeId || person.id,
        recipientUserId: person.userId,
        message: wishMsg,
      });
    } catch (err) {
      console.warn('Could not send birthday wish via API:', err);
    }

    setToastMessage(
      person.isToday
        ? `Birthday wishes sent to ${person.name}! 🎂🎉`
        : `Early birthday greeting sent to ${person.name}! 🎈`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (birthdayList.length === 0 && !backendBirthdays && !activeUser) return null;

  const isFeaturedWished = featuredPerson ? wishedIds.has(featuredPerson.id) : false;

  return (
    <section className="birthday-section" aria-label="Team Birthday Celebration">
      {toastMessage && <div className="birthday-toast" role="status"><CheckIcon fontSize="small" />{toastMessage}</div>}
      <div className="birthday-banner" style={{ '--birthday-art': `url(${bdyBgCard})` } as React.CSSProperties}>
        <div className="birthday-art" aria-hidden="true" />
        <div className="birthday-intro">
          <h3><span className="birthday-heading-icon"><CalendarTodayOutlinedIcon /></span>Birthdays</h3>
        </div>
        <div className="birthday-feature">
          {featuredPerson ? (
            <>
              <button
                type="button"
                className="birthday-feature-photo"
                onClick={() => handleSendWish(featuredPerson)}
                disabled={isFeaturedWished}
                aria-label={
                  isFeaturedWished
                    ? `Wishes sent to ${featuredPerson.name}`
                    : `Send birthday wishes to ${featuredPerson.name}`
                }
              >
                <UserAvatar
                  name={featuredPerson.name}
                  avatar={featuredPerson.avatar}
                  className="w-full h-full"
                  isToday={true}
                />
              </button>
              <span className="birthday-ribbon">&#9733; Today's Birthday &#9733;</span>
              <div className="birthday-feature-details">
                <h4 title={featuredPerson.name}>{featuredPerson.name}</h4>
                <p title={featuredPerson.role}>{featuredPerson.role}</p>
                {isFeaturedWished && (
                  <span className="birthday-wished">
                    <CheckIcon fontSize="inherit" /> Wishes sent
                  </span>
                )}
              </div>
              {todayCelebrants.length > 1 && (
                <button
                  type="button"
                  className="birthday-feature-next"
                  onClick={() => setActiveCelebrantIndex((index) => index + 1)}
                  aria-label="Show next featured birthday"
                >
                  <ChevronRightIcon />
                </button>
              )}
            </>
          ) : (
            <>
              <div
                className="birthday-feature-photo birthday-feature-photo--empty"
                aria-label="No birthdays today"
              >
                <EmptyProfileAvatar className="w-full h-full" />
              </div>
              <span className="birthday-ribbon">&#9733; Today's Birthday &#9733;</span>
              <div className="birthday-feature-details">
                <h4>No Birthday Today</h4>
                <p>No celebrations today</p>
              </div>
            </>
          )}
        </div>
        <div className="birthday-upcoming">
          <div className="birthday-toolbar">
            <span className="birthday-count"><i />{todayCelebrants.length} Today <span aria-hidden="true">&bull;</span> {upcomingCelebrants.length} Upcoming</span>
            <div className="birthday-navigation">
              <button type="button" onClick={handlePrevUpcoming} disabled={totalUpcomingPages <= 1} aria-label="Previous upcoming birthdays"><ChevronLeftIcon /></button>
              <button type="button" onClick={handleNextUpcoming} disabled={totalUpcomingPages <= 1} aria-label="Next upcoming birthdays"><ChevronRightIcon /></button>
            </div>
          </div>
          <h4 className="birthday-upcoming-title"><CalendarTodayOutlinedIcon />Upcoming Birthdays</h4>
          <div className="birthday-colleagues" aria-live="polite">
            {visibleUpcoming.map(colleague => (
              <button type="button" key={colleague.id} className="birthday-colleague" onClick={() => handleSendWish(colleague)} disabled={wishedIds.has(colleague.id)}
                aria-label={`${colleague.name}, ${colleague.formattedDate}${wishedIds.has(colleague.id) ? ', wishes sent' : ', send early birthday wishes'}`}>
                <div className="birthday-colleague-portrait">
                  <ConfettiCrown className="birthday-confetti" />
                  <UserAvatar name={colleague.name} avatar={colleague.avatar} className="birthday-colleague-avatar" />
                </div>
                <h5 title={colleague.name}>{colleague.name}</h5>
                <p title={colleague.role}>{colleague.role}</p>
                <span className="birthday-date"><CalendarTodayOutlinedIcon />{colleague.formattedDate}{wishedIds.has(colleague.id) && <CheckIcon />}</span>
              </button>
            ))}
            {!visibleUpcoming.length && <p className="birthday-empty">More celebrations are on the way. Stay tuned!</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

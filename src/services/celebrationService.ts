// src/services/celebrationService.js
// Service for corporate employee birthdays, company filtering, and celebrations


/**
 * Checks if a given date of birth (DOB) matches today's date (month & day)
 * Supports YYYY-MM-DD, YYYY/MM/DD, MM-DD, DD-MM, Date object, or ISO timestamp
 * @param {string|Date} dob
 * @returns {boolean}
 */
export const isBirthdayToday = (dob) => {
  if (!dob) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-indexed (1-12)
  const currentDay = now.getDate(); // 1-indexed (1-31)

  if (dob instanceof Date) {
    return dob.getMonth() + 1 === currentMonth && dob.getDate() === currentDay;
  }

  const str = String(dob).trim();

  // YYYY-MM-DD or YYYY/MM/DD (e.g. "1994-09-10" or "1994/09/10")
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    return m === currentMonth && d === currentDay;
  }

  // MM-DD or MM/DD (e.g. "09-10")
  const mmddMatch = str.match(/^(\d{1,2})[-/](\d{1,2})$/);
  if (mmddMatch) {
    const m = parseInt(mmddMatch[1], 10);
    const d = parseInt(mmddMatch[2], 10);
    return m === currentMonth && d === currentDay;
  }

  // Try standard Date.parse (e.g. ISO string "1994-09-10T12:00:00Z")
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return parsed.getMonth() + 1 === currentMonth && parsed.getDate() === currentDay;
    }
  } catch {}

  return false;
};

/**
 * Extracts and normalizes the company name from a user object or string
 * @param {object|string} user
 * @returns {string}
 */
export const getCompanyFromUser = (user: any): string => {
  if (!user) return '';
  if (typeof user === 'string' && user.trim()) return user.trim();

  if (typeof user.company === 'string' && user.company.trim()) {
    return user.company.trim();
  }
  if (user.company?.name && typeof user.company.name === 'string' && user.company.name.trim()) {
    return user.company.name.trim();
  }
  if (user.company?.company_name && typeof user.company.company_name === 'string' && user.company.company_name.trim()) {
    return user.company.company_name.trim();
  }
  if (user.company?.companyName && typeof user.company.companyName === 'string' && user.company.companyName.trim()) {
    return user.company.companyName.trim();
  }
  if (user.companyName && typeof user.companyName === 'string' && user.companyName.trim()) {
    return user.companyName.trim();
  }
  if (user.company_name && typeof user.company_name === 'string' && user.company_name.trim()) {
    return user.company_name.trim();
  }
  if (user.employer?.name && typeof user.employer.name === 'string' && user.employer.name.trim()) {
    return user.employer.name.trim();
  }
  if (user.employer && typeof user.employer === 'string' && user.employer.trim()) {
    return user.employer.trim();
  }
  if (user.organization && typeof user.organization === 'string' && user.organization.trim()) {
    return user.organization.trim();
  }
  if (user.employeeInfo?.company && typeof user.employeeInfo.company === 'string' && user.employeeInfo.company.trim()) {
    return user.employeeInfo.company.trim();
  }
  if (user.employeeInfo?.company_name && typeof user.employeeInfo.company_name === 'string' && user.employeeInfo.company_name.trim()) {
    return user.employeeInfo.company_name.trim();
  }
  if (user.employeeInfo?.companyName && typeof user.employeeInfo.companyName === 'string' && user.employeeInfo.companyName.trim()) {
    return user.employeeInfo.companyName.trim();
  }

  return '';
};

/**
 * Extracts company ID from a user or employee object
 */
export const getCompanyIdFromUser = (user: any): string | number => {
  if (!user) return '';
  return (
    user.company_id ||
    user.companyId ||
    user.company?.id ||
    user.company?.company_id ||
    user.company_user?.company_id ||
    user.employeeInfo?.company_id ||
    user.employeeInfo?.companyId ||
    user.birthday_employees?.[0]?.companyId ||
    user.birthday_employees?.[0]?.company_id ||
    user.today_birthdays?.[0]?.companyId ||
    user.today_birthdays?.[0]?.company_id ||
    user.upcoming_birthdays?.[0]?.companyId ||
    user.upcoming_birthdays?.[0]?.company_id ||
    user.company_users?.[0]?.company_id ||
    user.company_users?.[0]?.companyId ||
    ''
  );
};

/**
 * Checks whether two company names refer to the same corporate organization
 * Case-insensitive, space & punctuation normalized
 * @param {string} compA
 * @param {string} compB
 * @returns {boolean}
 */
export const isCompanyMatch = (compA, compB) => {
  if (!compA || !compB) return false;
  const rawA = String(compA).toLowerCase();
  const rawB = String(compB).toLowerCase();

  // Strip generic corporate suffixes to get core company brand name
  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/\b(private\s+limited|pvt\s+ltd|pvt|ltd|limited|llc|inc|corp|corporation|company)\b/gi, '')
      .replace(/[^a-z0-9]/g, '');

  const normA = normalize(rawA);
  const normB = normalize(rawB);
  if (!normA || !normB) return false;

  if (normA === normB) return true;

  // Specific brand aliases
  const isMpsA = normA.includes('mps') || normA.includes('pranaam');
  const isMpsB = normB.includes('mps') || normB.includes('pranaam');
  if (isMpsA && isMpsB) return true;
  if (isMpsA || isMpsB) return false;

  const isTcsA = normA.includes('tcs') || normA.includes('tataconsultancy');
  const isTcsB = normB.includes('tcs') || normB.includes('tataconsultancy');
  if (isTcsA && isTcsB) return true;
  if (isTcsA || isTcsB) return false;

  const isRpA = normA.includes('rewardplanner');
  const isRpB = normB.includes('rewardplanner');
  if (isRpA && isRpB) return true;
  if (isRpA || isRpB) return false;

  const isPpA = normA.includes('policyplanner');
  const isPpB = normB.includes('policyplanner');
  if (isPpA && isPpB) return true;
  if (isPpA || isPpB) return false;

  // Guard against generic short substrings: only match if substantial length
  if (Math.min(normA.length, normB.length) >= 6) {
    if (normA.includes(normB) || normB.includes(normA)) return true;
  }

  return false;
};

/**
 * Returns all employees of a given company who have their birthday today
 * @param {string} companyName - target company name
 * @param {Array} [userEmployees=[]] - optional live employee records from user profile or backend
 * @returns {Array} List of celebrating employees
 */
export const getTodayCelebrations = (companyName, userEmployees = []) => {
  const targetCompany = companyName || '';
  if (!targetCompany) return [];

  // Read any custom corporate employees saved in localStorage
  let cachedCustom = [];
  try {
    const raw = localStorage.getItem('rp_custom_company_employees');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) cachedCustom = parsed;
    }
  } catch {}

  const liveList = Array.isArray(userEmployees) ? userEmployees : [];

  // Combine all employee sources: live list + custom cached
  const combined = [...liveList, ...cachedCustom];

  // Filter:
  // 1. Employee belongs to target company strictly
  // 2. Employee birthday is today
  const matches = combined.filter((emp) => {
    if (!emp) return false;
    const empCompany = emp.company || emp.company_name || emp.organization || '';
    if (!isCompanyMatch(empCompany, targetCompany)) return false;

    const dob = emp.dob || emp.birthday || emp.date_of_birth;
    return isBirthdayToday(dob);
  });

  // Deduplicate by id or (name + department)
  const seen = new Set();
  const deduped = [];
  for (const emp of matches) {
    const key = emp.id || `${emp.name}-${emp.department || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push({
        id: emp.id || `emp-${Date.now()}-${Math.random()}`,
        name: emp.name || 'Valued Colleague',
        department: emp.department || emp.role || 'Corporate Member',
        role: emp.role || emp.department || 'Colleague',
        company: emp.company || targetCompany,
        avatar: emp.avatar || null,
        email: emp.email || null,
        dob: emp.dob || emp.birthday || emp.date_of_birth,
      });
    }
  }

  return deduped;
};

/**
 * Checks if current user has already sent a birthday wish to a colleague today
 * @param {string|number} employeeId
 * @returns {boolean}
 */
export const hasWishedColleague = (employeeId) => {
  if (!employeeId) return false;
  try {
    const todayKey = new Date().toISOString().slice(0, 10);
    const store = JSON.parse(localStorage.getItem('rp_sent_birthday_wishes') || '{}');
    return Boolean(store[`${todayKey}_${employeeId}`]);
  } catch {
    return false;
  }
};

/**
 * Records that a birthday wish was sent to a colleague
 * @param {string|number} employeeId
 * @param {string} [greeting='']
 */
export const recordBirthdayWish = (employeeId, greeting = '') => {
  if (!employeeId) return;
  try {
    const todayKey = new Date().toISOString().slice(0, 10);
    const store = JSON.parse(localStorage.getItem('rp_sent_birthday_wishes') || '{}');
    store[`${todayKey}_${employeeId}`] = {
      timestamp: Date.now(),
      greeting,
    };
    localStorage.setItem('rp_sent_birthday_wishes', JSON.stringify(store));
  } catch {}
};

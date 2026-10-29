// src/data/companyEmployeesData.js
// Corporate directory containing employee records per company for birthdays & celebrations

// Helper to generate a date string for today's month & day in a given birth year
export const getTodayDobString = (year = 1994) => {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

// Helper for November dates
export const getNovDobString = (day = 12, year = 1995) => {
  const d = String(day).padStart(2, '0');
  return `${year}-11-${d}`;
};

// Helper for December dates
export const getDecDobString = (day = 18, year = 1996) => {
  const d = String(day).padStart(2, '0');
  return `${year}-12-${d}`;
};

// Helper for other offsets
export const getOffsetDobString = (daysOffset = 30, year = 1995) => {
  const target = new Date();
  target.setDate(target.getDate() + daysOffset);
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

// Helper for any month & day date of birth
export const getMonthDobString = (month: number, day: number, year = 1995) => {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

export const findEmployeeDirectoryInfo = (identifier?: string | number, name?: string) => {
  if (!identifier && !name) return null;
  const cleanName = typeof name === 'string' ? name.trim().toLowerCase().replace(/\s+/g, ' ') : '';
  const cleanId = String(identifier || '').trim().toLowerCase();

  return (
    INITIAL_COMPANY_EMPLOYEES.find((emp) => {
      const empName = emp.name.trim().toLowerCase().replace(/\s+/g, ' ');
      if (cleanName && empName === cleanName) return true;
      if (cleanId && String(emp.id).toLowerCase() === cleanId) return true;
      if (cleanName && (empName.includes(cleanName) || cleanName.includes(empName))) return true;
      return false;
    }) || null
  );
};

export const getDeterministicUpcomingDob = (key?: string | number) => {
  const str = String(key || 'colleague');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const offsetDays = 2 + (positive % 45); // between 2 and 47 days in future from current date
  const target = new Date();
  target.setDate(target.getDate() + offsetDays);
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `1998-${m}-${d}`;
};

export const INITIAL_COMPANY_EMPLOYEES: Array<{
  id: string;
  name: string;
  company: string;
  department: string;
  role: string;
  dob: string;
  avatar: string;
  email: string;
}> = [
  // ── MPS Global / Maa Pranaam Pro Planner Private Limited ──
  {
    id: 'emp-mps-today',
    name: 'Monica Sylas',
    company: 'MPS Global',
    department: 'HDP Department',
    role: 'User Experience Designer',
    dob: '1994-08-15',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'monica.sylas@mpsglobal.com',
  },
  {
    id: 'emp-mps-1179',
    name: 'Anushka Kamble',
    company: 'MPS Global',
    department: 'Reception',
    role: 'Front Office Executive',
    dob: '', // Matches NULL dob in live MySQL company_users table
    avatar: '',
    email: 'anushka.pk1402@gmail.com',
  },
  {
    id: 'emp-mps-017',
    name: 'Ankita Jain',
    company: 'MPS Global',
    department: 'Chartered Accountant',
    role: 'Chartered Accountant',
    dob: '1989-09-14', // Matches live MySQL company_users table
    avatar: '',
    email: 'anki8914@gmail.com',
  },
  {
    id: 'emp-mps-077',
    name: 'Arpita Bhilare',
    company: 'MPS Global',
    department: 'Rewardsplanner',
    role: 'Data Operation Executive',
    dob: '1989-09-14', // Matches live MySQL company_users table
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    email: 'arpitabhilare5@gmail.com',
  },
  {
    id: 'emp-mps-026',
    name: 'Chaitali Wadnere',
    company: 'MPS Global',
    department: 'Fundsplanner',
    role: 'Financial Analyst',
    dob: getMonthDobString(11, 1, 1990), // Nov 1
    avatar: '',
    email: 'chaitali.wadnere11@gmail.com',
  },
  {
    id: 'emp-mps-074',
    name: 'Arya Athalye',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Semi Qualified CS',
    dob: getOffsetDobString(12, 1989), // 12 days from current date
    avatar: '',
    email: 'arya.athalye@gmail.com',
  },
  {
    id: 'emp-mps-007',
    name: 'Dipali Kadam',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Process Executive',
    dob: '2000-12-06',
    avatar: '',
    email: 'dipalidkadam6@gmail.com',
  },
  {
    id: 'emp-mps-030',
    name: 'Kiran Chilwery',
    company: 'MPS Global',
    department: 'IT',
    role: 'UI/UX Designer',
    dob: '1998-12-23',
    avatar: '',
    email: 'kirannchilwery@gmail.com',
  },
  {
    id: 'emp-mps-018',
    name: 'Jayshree Dhavade',
    company: 'MPS Global',
    department: 'Chartered Accountant',
    role: 'GST Manager',
    dob: '1998-01-01',
    avatar: '',
    email: 'davaddjayshree666@gmail.com',
  },
  {
    id: 'emp-mps-010',
    name: 'Yash Shah',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Company Secretary Intern',
    dob: '2001-01-20',
    avatar: '',
    email: 'yshah3791@gmail.com',
  },
  {
    id: 'emp-mps-032',
    name: 'Sahil Mujawar',
    company: 'MPS Global',
    department: 'IT',
    role: 'Full stack Developer',
    dob: '1997-02-23',
    avatar: 'https://cdn.rewardplanners.com/public/customers/3/profile-1780557293208-fy7idl.jpg',
    email: 'sahilmujawar225@gmail.com',
  },
  {
    id: 'emp-mps-031',
    name: 'Sakshi Chavan',
    company: 'MPS Global',
    department: 'IT',
    role: 'Software Enigneer',
    dob: '2004-02-28',
    avatar: '',
    email: 'chavansakshi685@gmail.com',
  },
  {
    id: 'emp-mps-025',
    name: 'Rishabh Choudhary',
    company: 'MPS Global',
    department: 'Chartered Accountant',
    role: 'Taxation Associate',
    dob: '1997-02-28',
    avatar: '',
    email: 'rishabhchoudhary9798@gmail.com',
  },
  {
    id: 'emp-mps-033',
    name: 'Devashish Pal',
    company: 'MPS Global',
    department: 'IT',
    role: 'Full stack Developer',
    dob: '1998-03-15',
    avatar: '',
    email: 'devashishpal15@gmail.com',
  },
  {
    id: 'emp-mps-001',
    name: 'Shubhangi Bidve',
    company: 'MPS Global',
    department: 'Admin',
    role: 'Admin Head',
    dob: '1996-03-15',
    avatar: '',
    email: 'shubhangibidve96@gmail.com',
  },
  {
    id: 'emp-mps-012',
    name: 'Vidya Awate',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Company Secreatry Executive',
    dob: '2001-03-25',
    avatar: '',
    email: 'awatevidya19@gmail.com',
  },
  {
    id: 'emp-mps-021',
    name: 'Sapna Gudewar',
    company: 'MPS Global',
    department: 'Chartered Accountant',
    role: 'Account Assistant',
    dob: '1993-04-12',
    avatar: '',
    email: 'sapnagudewar@gmail.com',
  },
  {
    id: 'emp-mps-002',
    name: 'Sandhya Jadhav',
    company: 'MPS Global',
    department: 'Admin',
    role: 'Admin',
    dob: '2001-04-20',
    avatar: '',
    email: 'jsandhya871@gmail.com',
  },
  {
    id: 'emp-mps-019',
    name: 'Nikita Kamble',
    company: 'MPS Global',
    department: 'Chartered Accountant',
    role: 'Account Assistant',
    dob: '2005-04-22',
    avatar: '',
    email: 'kamblenikita2245@gmail.com',
  },
  {
    id: 'emp-mps-004',
    name: 'Prachi Malviya',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Company Secretary',
    dob: '1999-05-25',
    avatar: '',
    email: 'prachimalviya25@gmail.com',
  },
  {
    id: 'emp-mps-023',
    name: 'Shraddha Agarwal',
    company: 'MPS Global',
    department: 'Chartered Accountant',
    role: 'Taxation Associate',
    dob: '1998-06-06',
    avatar: '',
    email: 'shraddhaagarwal6120@gmail.com',
  },
  {
    id: 'emp-mps-005',
    name: 'Jidnesh Kardile',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Semi Qualified Company Secretary',
    dob: '1986-06-08',
    avatar: '',
    email: 'jid.kardile@gmail.com',
  },
  {
    id: 'emp-mps-011',
    name: 'Mukta Madane',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Company Secretary Intern',
    dob: '2006-06-19',
    avatar: '',
    email: 'mmadane2006@gmail.com',
  },
  {
    id: 'emp-mps-035',
    name: 'Shrinivas Karur',
    company: 'MPS Global',
    department: 'Rewardsplanner',
    role: 'Technical business analyst',
    dob: '2002-06-26',
    avatar: 'https://cdn.rewardplanners.com/public/customers/2/profile-1782469870592-8d0opj.webp',
    email: 'shrinivaskarur1@gmail.com',
  },
  {
    id: 'emp-mps-020',
    name: 'Abhishek Sathe',
    company: 'MPS Global',
    department: 'Chartered Accountant',
    role: 'Account Assistant',
    dob: '2001-07-19',
    avatar: '',
    email: 'abhisheksathe2527@gmail.com',
  },
  {
    id: 'emp-mps-029',
    name: 'Pranav Shinde',
    company: 'MPS Global',
    department: 'Fundsplanner',
    role: 'Finance Intern',
    dob: '2002-07-19',
    avatar: '',
    email: 'shindepranav1907@gmail.com',
  },
  {
    id: 'emp-mps-075',
    name: 'Shreya Shelar',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Process Executive',
    dob: '2004-08-04',
    avatar: '',
    email: 'shelarshreyu5111@gmail.com',
  },
  {
    id: 'emp-mps-008',
    name: 'Ritik Khadattkar',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Process Executive',
    dob: '2000-08-28',
    avatar: '',
    email: 'ritikkhadatkar2800@gmail.com',
  },
  {
    id: 'emp-mps-072',
    name: 'Sharwari Acharya',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Secretarial Executive',
    dob: '1989-09-14',
    avatar: '',
    email: 'sharwariacharyacs@gmail.com',
  },
  {
    id: 'emp-mps-076',
    name: 'Anuja Dhadge',
    company: 'MPS Global',
    department: 'Chartered Accountant',
    role: 'Relationship Manager Intern',
    dob: '1989-09-14',
    avatar: '',
    email: 'anujadhadge@gmail.com',
  },
  {
    id: 'emp-mps-009',
    name: 'Bhavesh Rajpurohit',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Company Secretary',
    dob: '1998-09-29',
    avatar: '',
    email: 'rajpurohitb502@gmail.com',
  },
  {
    id: 'emp-mps-034',
    name: 'Harshali Chavan',
    company: 'MPS Global',
    department: 'Rewardsplanner',
    role: 'Vendor Manager',
    dob: '1999-09-30',
    avatar: 'https://cdn.rewardplanners.com/public/customers/1/profile-1781157405918-iu5hes.jpg',
    email: 'harshalichavan2022@gmail.com',
  },
  {
    id: 'emp-mps-040',
    name: 'Geeta',
    company: 'MPS Global',
    department: 'Operations',
    role: 'Operations Associate',
    dob: '2000-10-03',
    avatar: '',
    email: 'gdudgikar2@gmail.com',
  },
  {
    id: 'emp-mps-042',
    name: 'Hemant',
    company: 'MPS Global',
    department: 'Operations',
    role: 'Operations Associate',
    dob: '2000-10-03',
    avatar: '',
    email: 'hemantpawar@themps.global',
  },
  {
    id: 'emp-mps-062',
    name: 'Pradipta Rout',
    company: 'MPS Global',
    department: 'Operations',
    role: 'Operations Specialist',
    dob: '1999-11-08',
    avatar: '',
    email: 'kunmunrout77@gmail.com',
  },
  {
    id: 'emp-mps-1157',
    name: 'Manish Jadhav',
    company: 'MPS Global',
    department: 'Operations',
    role: 'Operations Associate',
    dob: '2000-11-12',
    avatar: '',
    email: 'manishjadhav068@gmail.com',
  },
  {
    id: 'emp-mps-027',
    name: 'Rohan Bhale',
    company: 'MPS Global',
    department: 'Fundsplanner',
    role: 'Finance Intern',
    dob: '2002-11-16',
    avatar: '',
    email: 'rohanbhale16@gmail.com',
  },
  {
    id: 'emp-mps-003',
    name: 'Ganga Gehlot',
    company: 'MPS Global',
    department: 'Admin',
    role: 'Relationship Manager',
    dob: '1998-11-17',
    avatar: '',
    email: 'gangagehlot17@gmail.com',
  },
  {
    id: 'emp-mps-006',
    name: 'Rutuja Chavan',
    company: 'MPS Global',
    department: 'Company Secretary',
    role: 'Process Executive',
    dob: '2001-11-20',
    avatar: '',
    email: 'rc5033719@gmail.com',
  },
  {
    id: 'emp-mps-1180',
    name: 'vasundhara ukey',
    company: 'MPS Global',
    department: 'legal',
    role: 'legal intern & CS intern',
    dob: '2002-11-22',
    avatar: '',
    email: 'ukvasundhara@gmail.com',
  },
  {
    id: 'emp-mps-022',
    name: 'Rinki Mendhekar',
    company: 'MPS Global',
    department: 'Chartered Accountant',
    role: 'Account Assistant',
    dob: '2001-11-23',
    avatar: '',
    email: 'rinkiyewalekar23@gmail.com',
  },
  {
    id: 'emp-mps-1181',
    name: 'Sakshi Abuj',
    company: 'MPS Global',
    department: 'Fundz Planners',
    role: 'Finance Intern',
    dob: '2003-11-24',
    avatar: '',
    email: 'sakshiabuj2003@gmail.com',
  },
  {
    id: 'emp-mps-015',
    name: 'Ruchita Nevase',
    company: 'MPS Global',
    department: 'Legal',
    role: 'Legal Associate',
    dob: '2000-11-28',
    avatar: '',
    email: 'ruchitanevase5555@gmail.com',
  },
  {
    id: 'emp-mps-1174',
    name: 'Prajesh kumar',
    company: 'MPS Global',
    department: 'Operations',
    role: 'Operations Associate',
    dob: '1998-11-30',
    avatar: '',
    email: 'prajeshkumar0512@gmail.com',
  },
  {
    id: 'emp-mps-1155',
    name: 'Shaikh Mahek',
    company: 'MPS Global',
    department: 'Operations',
    role: 'Operations Executive',
    dob: '2001-12-04',
    avatar: '',
    email: 'shaikhmahek1003@gmail.com',
  },
  {
    id: 'emp-mps-014',
    name: 'Tanishka Wagh',
    company: 'MPS Global',
    department: 'Legal',
    role: 'Jr. Legal Associate',
    dob: '2001-12-04',
    avatar: '',
    email: 'tanishkawagh04912@gmail.com',
  },
  {
    id: 'emp-mps-028',
    name: 'Aniket Sawant',
    company: 'MPS Global',
    department: 'Fundsplanner',
    role: 'Equity Analyst Intern',
    dob: '2001-12-08',
    avatar: '',
    email: 'aniketansawant@gmail.com',
  },
  {
    id: 'emp-mps-1182',
    name: 'Harsh Bulbule',
    company: 'MPS Global',
    department: 'CA',
    role: 'Account Assistant Intern',
    dob: '2001-12-14',
    avatar: '',
    email: 'harshbulbule118@gmail.com',
  },
  {
    id: 'emp-mps-016',
    name: 'Shridhar Bendre',
    company: 'MPS Global',
    department: 'Legal',
    role: 'Sales & Operation Executive',
    dob: '1999-12-18',
    avatar: '',
    email: 'shridharbendre05@gmail.com',
  },
  {
    id: 'emp-mps-1183',
    name: 'Dhananjay Nandu Vadnere',
    company: 'MPS Global',
    department: 'Fundz Planners',
    role: 'Financial Analyst Intern',
    dob: '2002-12-28',
    avatar: '',
    email: 'dhananjayvadnere3@gmail.com',
  },
  {
    id: 'emp-mps-024',
    name: 'Priyanka Pachnekar',
    company: 'MPS Global',
    department: 'Chartered Accountant',
    role: 'Chartered Accountant Associate',
    dob: '1992-01-05',
    avatar: '',
    email: 'pgavali01@gmail.com',
  },
  {
    id: 'emp-mps-013',
    name: 'Aboli Deo',
    company: 'MPS Global',
    department: 'Legal',
    role: 'Legal Associate',
    dob: '2000-02-13',
    avatar: '',
    email: 'abolideo2015@gmail.com',
  },

  // ── Reward Planners ──
  {
    id: 'emp-rp-001',
    name: 'Priya Sharma',
    company: 'Reward Planners',
    department: 'Engineering',
    role: 'Frontend Platform Lead',
    dob: '1994-06-15',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    email: 'priya.s@rewardplanners.com',
  },
  {
    id: 'emp-rp-002',
    name: 'Neha Kapoor',
    company: 'Reward Planners',
    department: 'Customer Success',
    role: 'Corporate Engagement Partner',
    dob: getNovDobString(10, 1995),
    avatar: '',
    email: 'neha.k@rewardplanners.com',
  },
  {
    id: 'emp-rp-003',
    name: 'Karan Mehra',
    company: 'Reward Planners',
    department: 'Finance & Treasury',
    role: 'Treasury Analyst',
    dob: getNovDobString(25, 1993),
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    email: 'karan.m@rewardplanners.com',
  },
  {
    id: 'emp-rp-004',
    name: 'Rahul Verma',
    company: 'Reward Planners',
    department: 'Sales & Ops',
    role: 'Merchant Operations Specialist',
    dob: getDecDobString(12, 1991),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'rahul.v@rewardplanners.com',
  },
  {
    id: 'emp-rp-005',
    name: 'Aarav Patel',
    company: 'Reward Planners',
    department: 'Mobile Engineering',
    role: 'Mobile Architect',
    dob: getMonthDobString(1, 16, 1993), // Jan 16
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'aarav.p@rewardplanners.com',
  },
  {
    id: 'emp-rp-006',
    name: 'Tanvi Shah',
    company: 'Reward Planners',
    department: 'Strategic Partnerships',
    role: 'Partnerships Lead',
    dob: getMonthDobString(2, 22, 1995), // Feb 22
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'tanvi.s@rewardplanners.com',
  },

  // ── Tata Consultancy Services ──
  {
    id: 'emp-tcs-001',
    name: 'Rajesh Nair',
    company: 'Tata Consultancy Services',
    department: 'Cloud Infrastructure',
    role: 'Principal Consultant',
    dob: '1987-04-10',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'rajesh.nair@tcs.com',
  },
  {
    id: 'emp-tcs-002',
    name: 'Kavita Reddy',
    company: 'Tata Consultancy Services',
    department: 'Quality Engineering',
    role: 'Test Automation Specialist',
    dob: getNovDobString(16, 1992),
    avatar: '',
    email: 'kavita.reddy@tcs.com',
  },
  {
    id: 'emp-tcs-003',
    name: 'Suresh Iyer',
    company: 'Tata Consultancy Services',
    department: 'Enterprise Applications',
    role: 'Senior Project Manager',
    dob: getDecDobString(24, 1985),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    email: 'suresh.iyer@tcs.com',
  },
  {
    id: 'emp-tcs-004',
    name: 'Meera Krishnan',
    company: 'Tata Consultancy Services',
    department: 'Digital Transformation',
    role: 'Cloud Architect',
    dob: getMonthDobString(1, 19, 1991), // Jan 19
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'meera.k@tcs.com',
  },

  // ── Policy Planner ──
  {
    id: 'emp-pp-001',
    name: 'Sakshi Nit',
    company: 'Policy Planner',
    department: 'Quality Engineering',
    role: 'Quality Assurance Lead',
    dob: '1996-09-08',
    avatar: 'https://cdn.rewardplanners.com/public/customers/10/profile-1781847143044-r3xwx8.jpg',
    email: 'sakshi.nit@policyplanner.com',
  },
  {
    id: 'emp-pp-002',
    name: 'Rohit Kulkarni',
    company: 'Policy Planner',
    department: 'Underwriting & Operations',
    role: 'Policy Operations Lead',
    dob: getNovDobString(18, 1994),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'rohit.k@policyplanner.com',
  },
  {
    id: 'emp-pp-003',
    name: 'Ananya Joshi',
    company: 'Policy Planner',
    department: 'Product Strategy',
    role: 'Senior Product Manager',
    dob: getDecDobString(15, 1993),
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    email: 'ananya.j@policyplanner.com',
  },
  {
    id: 'emp-pp-004',
    name: 'Amit Deshmukh',
    company: 'Policy Planner',
    department: 'Claims & Operations',
    role: 'Claims Specialist',
    dob: getMonthDobString(1, 22, 1994), // Jan 22
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'amit.d@policyplanner.com',
  },
  {
    id: 'emp-pp-005',
    name: 'Sneha Patil',
    company: 'Policy Planner',
    department: 'Actuarial & Risk',
    role: 'Actuarial Lead',
    dob: getMonthDobString(2, 14, 1995), // Feb 14
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'sneha.p@policyplanner.com',
  },
  {
    id: 'emp-pp-006',
    name: 'Vikram Shinde',
    company: 'Policy Planner',
    department: 'Engineering',
    role: 'Backend Architect',
    dob: getMonthDobString(3, 19, 1992), // Mar 19
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    email: 'vikram.s@policyplanner.com',
  },
];

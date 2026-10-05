// src/data/companyEmployeesData.js
// Corporate directory containing employee records per company for birthdays & celebrations

// Helper to generate a date string for today's month & day in a given birth year
export const getTodayDobString = (year = 1994) => {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

// Helper for other dates (e.g. tomorrow / next month)
export const getOffsetDobString = (daysOffset = 30, year = 1995) => {
  const target = new Date();
  target.setDate(target.getDate() + daysOffset);
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

export const INITIAL_COMPANY_EMPLOYEES = [
  // ── TechCorp Global (Default corporate tenant) ──
  {
    id: 'emp-tc-001',
    name: 'Priya Sharma',
    company: 'TechCorp Global',
    department: 'Engineering',
    role: 'Lead Cloud Architect',
    dob: getTodayDobString(1994),
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    email: 'priya.sharma@techcorp.com',
  },
  {
    id: 'emp-tc-002',
    name: 'Rahul Verma',
    company: 'TechCorp Global',
    department: 'Sales & Ops',
    role: 'Enterprise Operations Manager',
    dob: getTodayDobString(1991),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'rahul.verma@techcorp.com',
  },
  {
    id: 'emp-tc-003',
    name: 'Ananya Patel',
    company: 'TechCorp Global',
    department: 'Product Management',
    role: 'Senior Product Manager',
    dob: getOffsetDobString(14, 1996), // Birthday in 14 days
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'ananya.patel@techcorp.com',
  },
  {
    id: 'emp-tc-004',
    name: 'Vikram Malhotra',
    company: 'TechCorp Global',
    department: 'Information Security',
    role: 'Security Operations Lead',
    dob: getOffsetDobString(45, 1989), // Birthday next month
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'vikram.m@techcorp.com',
  },

  // ── Reward Planners / RewardPlanners ──
  {
    id: 'emp-rp-001',
    name: 'Priya Sharma',
    company: 'Reward Planners',
    department: 'Engineering',
    role: 'Frontend Platform Lead',
    dob: getTodayDobString(1994),
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    email: 'priya.s@rewardplanners.com',
  },
  {
    id: 'emp-rp-002',
    name: 'Rahul Verma',
    company: 'Reward Planners',
    department: 'Sales & Ops',
    role: 'Merchant Operations Specialist',
    dob: getTodayDobString(1991),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'rahul.v@rewardplanners.com',
  },
  {
    id: 'emp-rp-003',
    name: 'Neha Kapoor',
    company: 'Reward Planners',
    department: 'Customer Success',
    role: 'Corporate Engagement Partner',
    dob: getTodayDobString(1995),
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    email: 'neha.k@rewardplanners.com',
  },
  {
    id: 'emp-rp-004',
    name: 'Karan Mehra',
    company: 'Reward Planners',
    department: 'Finance & Treasury',
    role: 'Treasury Analyst',
    dob: getOffsetDobString(22, 1993),
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    email: 'karan.m@rewardplanners.com',
  },

  // ── Maa Pranaam Pro Planner Private Limited ──
  {
    id: 'emp-mp-001',
    name: 'Amitabh Sen',
    company: 'Maa Pranaam Pro Planner Private Limited',
    department: 'Legal & Compliance',
    role: 'Chief Compliance Officer',
    dob: getTodayDobString(1988),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    email: 'amitabh.sen@pranaamplanner.com',
  },
  {
    id: 'emp-mp-002',
    name: 'Sneha Roy',
    company: 'Maa Pranaam Pro Planner Private Limited',
    department: 'Human Resources',
    role: 'People & Culture Manager',
    dob: getTodayDobString(1993),
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'sneha.roy@pranaamplanner.com',
  },
  {
    id: 'emp-mp-003',
    name: 'Rohan Gupta',
    company: 'Maa Pranaam Pro Planner Private Limited',
    department: 'Operations',
    role: 'Logistics Coordinator',
    dob: getOffsetDobString(18, 1997),
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    email: 'rohan.g@pranaamplanner.com',
  },

  // ── Tata Consultancy Services ──
  {
    id: 'emp-tcs-001',
    name: 'Rajesh Nair',
    company: 'Tata Consultancy Services',
    department: 'Cloud Infrastructure',
    role: 'Principal Consultant',
    dob: getTodayDobString(1987),
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'rajesh.nair@tcs.com',
  },
  {
    id: 'emp-tcs-002',
    name: 'Kavita Reddy',
    company: 'Tata Consultancy Services',
    department: 'Quality Engineering',
    role: 'Test Automation Specialist',
    dob: getTodayDobString(1992),
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'kavita.reddy@tcs.com',
  },
  {
    id: 'emp-tcs-003',
    name: 'Suresh Iyer',
    company: 'Tata Consultancy Services',
    department: 'Enterprise Applications',
    role: 'Senior Project Manager',
    dob: getOffsetDobString(35, 1985),
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    email: 'suresh.iyer@tcs.com',
  },

  // ── Infosys ──
  {
    id: 'emp-inf-001',
    name: 'Aditi Joshi',
    company: 'Infosys',
    department: 'Digital Experience',
    role: 'UX Designer',
    dob: getTodayDobString(1995),
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    email: 'aditi.joshi@infosys.com',
  },
  {
    id: 'emp-inf-002',
    name: 'Manish Desai',
    company: 'Infosys',
    department: 'Data Analytics',
    role: 'Data Scientist',
    dob: getTodayDobString(1990),
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    email: 'manish.desai@infosys.com',
  },

  // ── Enterprise Tech Partner ──
  {
    id: 'emp-etp-001',
    name: 'Deepak Saxena',
    company: 'Enterprise Tech Partner',
    department: 'Cybersecurity',
    role: 'Security Engineer',
    dob: getTodayDobString(1992),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'deepak.s@enterprisetech.com',
  },
  {
    id: 'emp-etp-002',
    name: 'Pooja Bhatia',
    company: 'Enterprise Tech Partner',
    department: 'Sales & Partnerships',
    role: 'Alliance Manager',
    dob: getTodayDobString(1994),
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'pooja.b@enterprisetech.com',
  },
];

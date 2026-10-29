// src/modules/chat/chatData.ts
import { ChatConversation, StatusItem } from './chatTypes';

import festiveBannerImg from '../../assets/chat/festive_banner.png';
import rohitAvatar from '../../assets/chat/avatar_rohit.png';
import priyaAvatar from '../../assets/chat/avatar_priya.png';
import suhailAvatar from '../../assets/chat/avatar_suhail.png';
import apsalaAvatar from '../../assets/chat/avatar_apsala.png';
import aaditiAvatar from '../../assets/chat/avatar_aaditi.png';
import adityaAvatar from '../../assets/chat/avatar_aditya.png';
import monaliAvatar from '../../assets/chat/avatar_monali.png';
import ajayAvatar from '../../assets/chat/avatar_ajay.png';
import manishAvatar from '../../assets/chat/avatar_manish.png';
import tanishkaAvatar from '../../assets/chat/avatar_tanishka.png';

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'company-announcements',
    name: 'Company Announcements 📢',
    type: 'group',
    avatarBg: '#381E2B',
    avatarIconType: 'purple_group',
    isGroup: true,
    isAnnouncement: true,
    membersCount: 320,
    lastMessage: 'Shruti (HR): Annual Rewards Gala registration is now live! 🏆',
    lastMessageTime: '3:15 PM',
    unreadCount: 2,
    isMuted: true,
    description: 'Official Reward Planners organizational updates, announcements and policies.',
    messages: [
      {
        id: 'ca-1',
        senderId: 'hr-lead',
        senderName: 'Shruti (People Ops)',
        senderColor: '#38BDF8',
        text: 'Dear Team, Please be advised that the corporate office will be closed on Friday for the National Holiday.',
        time: '2:30 PM',
        timestamp: Date.now() - 45 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'ca-2',
        senderId: 'hr-lead',
        senderName: 'Shruti (People Ops)',
        senderColor: '#38BDF8',
        text: 'Annual Rewards Gala registration is now live! 🏆 Please confirm your attendance on the employee portal by Thursday.',
        time: '3:15 PM',
        timestamp: Date.now() - 10 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'ca-3',
        senderId: 'user',
        senderName: 'You',
        text: 'Registered! Looking forward to celebrating our yearly milestones together! 🥂',
        time: '3:18 PM',
        timestamp: Date.now() - 7 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      }
    ]
  },
  {
    id: 'engineering-squad',
    name: 'Engineering & Tech Squad',
    type: 'group',
    avatarBg: '#1E293B',
    avatarIconType: 'users',
    isGroup: true,
    membersCount: 28,
    lastMessage: 'Aarav: Auth microservice deployment successful 🚀',
    lastMessageTime: '1:45 PM',
    unreadCount: 4,
    description: 'Core platform engineering, API integrations, and code reviews.',
    messages: [
      {
        id: 'eng-1',
        senderId: 'aarav',
        senderName: 'Aarav Sharma',
        senderColor: '#00A884',
        senderAvatar: rohitAvatar,
        text: 'Morning engineers! Standup notes and sprint goals are updated on Jira.',
        time: '11:00 AM',
        timestamp: Date.now() - 240 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'eng-2',
        senderId: 'rohan',
        senderName: 'Rohan Verma',
        senderColor: '#38BDF8',
        senderAvatar: adityaAvatar,
        text: 'PR #342 for biometric token validation has been merged and deployed to staging.',
        time: '1:10 PM',
        timestamp: Date.now() - 110 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'eng-3',
        senderId: 'aarav',
        senderName: 'Aarav Sharma',
        senderColor: '#00A884',
        senderAvatar: rohitAvatar,
        text: 'Auth microservice deployment successful 🚀 All health checks and latency benchmarks green.',
        time: '1:45 PM',
        timestamp: Date.now() - 75 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'eng-4',
        senderId: 'user',
        senderName: 'You',
        text: 'Awesome work team! Testing the SSO session flow on staging right now.',
        time: '1:48 PM',
        timestamp: Date.now() - 72 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      }
    ]
  },
  {
    id: 'uiux-design-studio',
    name: 'UI/UX Design Studio',
    type: 'group',
    avatarBg: '#381E2B',
    avatarIconType: 'purple_group',
    isGroup: true,
    membersCount: 14,
    lastMessage: 'Ananya: Shared Figma link for the new Wallet UI ✨',
    lastMessageTime: '12:30 PM',
    unreadCount: 6,
    description: 'Design system, prototypes, micro-interactions, and accessibility standards.',
    messages: [
      {
        id: 'ds-1',
        senderId: 'ananya',
        senderName: 'Ananya Deshmukh',
        senderColor: '#EC4899',
        senderAvatar: aaditiAvatar,
        text: 'Hey team! Reviewing dark mode contrast tokens for the new client dashboard.',
        time: '11:45 AM',
        timestamp: Date.now() - 195 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'ds-2',
        senderId: 'ananya',
        senderName: 'Ananya Deshmukh',
        senderColor: '#EC4899',
        senderAvatar: aaditiAvatar,
        text: 'Shared Figma link for the new Wallet UI ✨ Please add your thoughts on the transaction card carousel.',
        time: '12:30 PM',
        timestamp: Date.now() - 150 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'ds-3',
        senderId: 'user',
        senderName: 'You',
        text: 'The card depth and corner radius look super clean! Matches WhatsApp desktop design language.',
        time: '12:35 PM',
        timestamp: Date.now() - 145 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      }
    ]
  },
  {
    id: 'product-strategy-growth',
    name: 'Product Strategy & Growth',
    type: 'group',
    avatarBg: '#0F382E',
    avatarIconType: 'users',
    isGroup: true,
    membersCount: 18,
    lastMessage: 'Priya: Q4 retention metrics jumped by 24% 📈',
    lastMessageTime: '11:15 AM',
    unreadCount: 1,
    description: 'Product roadmap, quarterly OKRs, and market feedback loops.',
    messages: [
      {
        id: 'prod-1',
        senderId: 'priya',
        senderName: 'Priya Patel',
        senderColor: '#F59E0B',
        senderAvatar: priyaAvatar,
        text: 'Let’s review the user retention and conversion metrics from the festive rewards rollout.',
        time: '10:40 AM',
        timestamp: Date.now() - 260 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'prod-2',
        senderId: 'priya',
        senderName: 'Priya Patel',
        senderColor: '#F59E0B',
        senderAvatar: priyaAvatar,
        text: 'Q4 retention metrics jumped by 24% 📈 Outstanding engagement on coupon redemptions!',
        time: '11:15 AM',
        timestamp: Date.now() - 225 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'prod-3',
        senderId: 'user',
        senderName: 'You',
        text: 'Incredible numbers Priya! Let’s include these charts in Friday’s leadership review.',
        time: '11:20 AM',
        timestamp: Date.now() - 220 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      }
    ]
  },
  {
    id: 'operations-fleet-desk',
    name: 'Operations & Fleet Desk',
    type: 'group',
    avatarBg: '#312E81',
    avatarIconType: 'users',
    isGroup: true,
    membersCount: 45,
    lastMessage: 'Vikram: All vendor dispatches on schedule for Mumbai hub',
    lastMessageTime: '10:50 AM',
    unreadCount: 0,
    description: 'Logistics, gift card dispatch pipelines, and inventory fulfillment.',
    messages: [
      {
        id: 'ops-1',
        senderId: 'vikram',
        senderName: 'Vikram Singhania',
        senderColor: '#3B82F6',
        senderAvatar: ajayAvatar,
        text: 'Route optimization algorithm deployed across our primary regional dispatch hubs.',
        time: '10:15 AM',
        timestamp: Date.now() - 285 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'ops-2',
        senderId: 'vikram',
        senderName: 'Vikram Singhania',
        senderColor: '#3B82F6',
        senderAvatar: ajayAvatar,
        text: 'All vendor dispatches on schedule for Mumbai hub. Consignment tracking numbers are logged in DB.',
        time: '10:50 AM',
        timestamp: Date.now() - 250 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'ops-3',
        senderId: 'user',
        senderName: 'You',
        text: 'Confirmed, real-time tracking webhook confirmed successful delivery pings.',
        time: '10:55 AM',
        timestamp: Date.now() - 245 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      }
    ]
  },
  {
    id: 'customer-success-warriors',
    name: 'Customer Success Warriors',
    type: 'group',
    avatarBg: '#064E3B',
    avatarIconType: 'users',
    isGroup: true,
    membersCount: 20,
    lastMessage: 'Kavita: Resolved 98% of priority tickets today! 💯',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    description: 'Client assistance, ticket resolution, and NPS tracking.',
    messages: [
      {
        id: 'cs-1',
        senderId: 'kavita',
        senderName: 'Kavita Reddy',
        senderColor: '#10B981',
        senderAvatar: apsalaAvatar,
        text: 'Corporate client feedback for the rewards onboarding has been overwhelmingly positive.',
        time: 'Yesterday 5:20 PM',
        timestamp: Date.now() - 22 * 3600 * 1000,
        isOutgoing: false
      },
      {
        id: 'cs-2',
        senderId: 'kavita',
        senderName: 'Kavita Reddy',
        senderColor: '#10B981',
        senderAvatar: apsalaAvatar,
        text: 'Resolved 98% of priority tickets today! 💯 CSAT score reached 4.9 out of 5.',
        time: 'Yesterday 6:05 PM',
        timestamp: Date.now() - 21 * 3600 * 1000,
        isOutgoing: false
      },
      {
        id: 'cs-3',
        senderId: 'user',
        senderName: 'You',
        text: 'Sensational performance team! Keep up the brilliant customer experience standards.',
        time: 'Yesterday 6:15 PM',
        timestamp: Date.now() - 21 * 3600 * 1000 + 10 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      }
    ]
  },
  {
    id: 'finance-claims-hub',
    name: 'Finance & Claims Hub',
    type: 'group',
    avatarBg: '#451A03',
    avatarIconType: 'purple_group',
    isGroup: true,
    membersCount: 12,
    lastMessage: 'Nikhil: Travel and meal reimbursement batch approved.',
    lastMessageTime: 'Friday',
    unreadCount: 0,
    description: 'Expense accounts, vendor invoices, tax compliance, and payroll desk.',
    messages: [
      {
        id: 'fin-1',
        senderId: 'nikhil',
        senderName: 'Nikhil Bansal',
        senderColor: '#D97706',
        text: 'Friendly reminder: Monthly expense claim submissions close by the 28th of every month.',
        time: 'Friday 3:00 PM',
        timestamp: Date.now() - 4 * 24 * 3600 * 1000,
        isOutgoing: false
      },
      {
        id: 'fin-2',
        senderId: 'nikhil',
        senderName: 'Nikhil Bansal',
        senderColor: '#D97706',
        text: 'Travel and meal reimbursement batch approved. Payouts credited to salary accounts by EOD.',
        time: 'Friday 4:30 PM',
        timestamp: Date.now() - 4 * 24 * 3600 * 1000 + 90 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'fin-3',
        senderId: 'user',
        senderName: 'You',
        text: 'Thank you Nikhil, confirmed receipt on the employee claims portal.',
        time: 'Friday 4:45 PM',
        timestamp: Date.now() - 4 * 24 * 3600 * 1000 + 105 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      }
    ]
  },
  {
    id: 'aarav-sharma',
    name: 'Aarav Sharma',
    type: 'direct',
    avatar: rohitAvatar,
    avatarIconType: 'image',
    isGroup: false,
    isOnline: true,
    lastMessage: 'Take a look at the websocket performance graph.',
    lastMessageTime: '3:20 PM',
    unreadCount: 1,
    description: 'Tech Lead • Frontend Architecture',
    messages: [
      {
        id: 'as-1',
        senderId: 'aarav',
        senderName: 'Aarav Sharma',
        senderColor: '#00A884',
        senderAvatar: rohitAvatar,
        text: 'Hey Sakshi, did you get a chance to inspect the API latency improvements?',
        time: '3:05 PM',
        timestamp: Date.now() - 20 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'as-2',
        senderId: 'user',
        senderName: 'You',
        text: 'Yes! It dropped from 240ms to 38ms after implementing indexed caching. Super responsive now!',
        time: '3:10 PM',
        timestamp: Date.now() - 15 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      },
      {
        id: 'as-3',
        senderId: 'aarav',
        senderName: 'Aarav Sharma',
        senderColor: '#00A884',
        senderAvatar: rohitAvatar,
        text: 'Fantastic! Take a look at the websocket performance graph when free.',
        time: '3:20 PM',
        timestamp: Date.now() - 5 * 60 * 1000,
        isOutgoing: false
      }
    ]
  },
  {
    id: 'priya-patel',
    name: 'Priya Patel',
    type: 'direct',
    avatar: priyaAvatar,
    avatarIconType: 'image',
    isGroup: false,
    isOnline: true,
    lastMessage: 'Can we sync for 5 mins before the client call?',
    lastMessageTime: '2:15 PM',
    unreadCount: 0,
    description: 'Principal Product Manager',
    messages: [
      {
        id: 'pp-1',
        senderId: 'priya',
        senderName: 'Priya Patel',
        senderColor: '#EC4899',
        senderAvatar: priyaAvatar,
        text: 'Hi Sakshi! The new user journey flow received glowing praise from stakeholders.',
        time: '1:55 PM',
        timestamp: Date.now() - 65 * 60 * 1000,
        isOutgoing: false
      },
      {
        id: 'pp-2',
        senderId: 'user',
        senderName: 'You',
        text: 'Delighted to hear that! The interactive prototype is completely ready for the walkthrough.',
        time: '2:05 PM',
        timestamp: Date.now() - 55 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      },
      {
        id: 'pp-3',
        senderId: 'priya',
        senderName: 'Priya Patel',
        senderColor: '#EC4899',
        senderAvatar: priyaAvatar,
        text: 'Can we sync for 5 mins before the client call?',
        time: '2:15 PM',
        timestamp: Date.now() - 45 * 60 * 1000,
        isOutgoing: false
      }
    ]
  },
  {
    id: 'ananya-deshmukh',
    name: 'Ananya Deshmukh',
    type: 'direct',
    avatar: aaditiAvatar,
    avatarIconType: 'image',
    isGroup: false,
    isOnline: false,
    lastMessage: 'Exported high-res SVG icons for the chat rail 🎨',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    description: 'Senior UI/UX Designer',
    messages: [
      {
        id: 'ad-1',
        senderId: 'ananya',
        senderName: 'Ananya Deshmukh',
        senderColor: '#F59E0B',
        senderAvatar: aaditiAvatar,
        text: 'Hi Sakshi, updated the icon strokes and padding to exactly match dark mode standards.',
        time: 'Yesterday 3:30 PM',
        timestamp: Date.now() - 25 * 3600 * 1000,
        isOutgoing: false
      },
      {
        id: 'ad-2',
        senderId: 'user',
        senderName: 'You',
        text: 'The contrast looks spot-on! They blend seamlessly with the #111B21 background.',
        time: 'Yesterday 3:45 PM',
        timestamp: Date.now() - 25 * 3600 * 1000 + 15 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      },
      {
        id: 'ad-3',
        senderId: 'ananya',
        senderName: 'Ananya Deshmukh',
        senderColor: '#F59E0B',
        senderAvatar: aaditiAvatar,
        text: 'Exported high-res SVG icons for the chat rail 🎨 Enjoy!',
        time: 'Yesterday 4:00 PM',
        timestamp: Date.now() - 25 * 3600 * 1000 + 30 * 60 * 1000,
        isOutgoing: false
      }
    ]
  },
  {
    id: 'rohan-verma',
    name: 'Rohan Verma',
    type: 'direct',
    avatar: adityaAvatar,
    avatarIconType: 'image',
    isGroup: false,
    isOnline: true,
    lastMessage: 'Docker build completed with zero vulnerabilities.',
    lastMessageTime: 'Thursday',
    unreadCount: 0,
    description: 'DevOps & Cloud Engineer',
    messages: [
      {
        id: 'rv-1',
        senderId: 'rohan',
        senderName: 'Rohan Verma',
        senderColor: '#3B82F6',
        senderAvatar: adityaAvatar,
        text: 'Setting up auto-scaling rules for the upcoming high-traffic promotion event.',
        time: 'Thursday 2:10 PM',
        timestamp: Date.now() - 5 * 24 * 3600 * 1000,
        isOutgoing: false
      },
      {
        id: 'rv-2',
        senderId: 'user',
        senderName: 'You',
        text: 'Make sure CPU threshold trigger is configured at 75% for seamless cluster elasticity.',
        time: 'Thursday 2:25 PM',
        timestamp: Date.now() - 5 * 24 * 3600 * 1000 + 15 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      },
      {
        id: 'rv-3',
        senderId: 'rohan',
        senderName: 'Rohan Verma',
        senderColor: '#3B82F6',
        senderAvatar: adityaAvatar,
        text: 'Docker build completed with zero vulnerabilities. Scaling configured and tested!',
        time: 'Thursday 2:40 PM',
        timestamp: Date.now() - 5 * 24 * 3600 * 1000 + 30 * 60 * 1000,
        isOutgoing: false
      }
    ]
  },
  {
    id: 'sneha-kulkarni',
    name: 'Sneha Kulkarni',
    type: 'direct',
    avatar: monaliAvatar,
    avatarIconType: 'image',
    isGroup: false,
    isOnline: false,
    lastMessage: 'Candidate accepted the Senior Frontend Lead offer! 🎉',
    lastMessageTime: 'Wednesday',
    unreadCount: 0,
    description: 'Talent Acquisition Partner',
    messages: [
      {
        id: 'sk-1',
        senderId: 'sneha',
        senderName: 'Sneha Kulkarni',
        senderColor: '#10B981',
        senderAvatar: monaliAvatar,
        text: 'Exciting news from the recruitment pipeline!',
        time: 'Wednesday 11:20 AM',
        timestamp: Date.now() - 6 * 24 * 3600 * 1000,
        isOutgoing: false
      },
      {
        id: 'sk-2',
        senderId: 'user',
        senderName: 'You',
        text: 'Did the candidate confirm acceptance of the formal offer letter?',
        time: 'Wednesday 11:35 AM',
        timestamp: Date.now() - 6 * 24 * 3600 * 1000 + 15 * 60 * 1000,
        isOutgoing: true,
        status: 'read'
      },
      {
        id: 'sk-3',
        senderId: 'sneha',
        senderName: 'Sneha Kulkarni',
        senderColor: '#10B981',
        senderAvatar: monaliAvatar,
        text: 'Candidate accepted the Senior Frontend Lead offer! 🎉 Scheduled onboarding for 1st of next month.',
        time: 'Wednesday 11:45 AM',
        timestamp: Date.now() - 6 * 24 * 3600 * 1000 + 25 * 60 * 1000,
        isOutgoing: false
      }
    ]
  }
];

// Status items for colleague stories
export const STATUS_ITEMS: StatusItem[] = [
  {
    id: 'st-1',
    name: 'Ananya Deshmukh',
    time: 'Today at 3:15 PM',
    avatar: aaditiAvatar,
    isViewed: false,
    storiesCount: 2,
    caption: 'Design sprint kickoff & user journey mapping 🎨'
  },
  {
    id: 'st-2',
    name: 'Aarav Sharma',
    time: 'Today at 1:40 PM',
    avatar: rohitAvatar,
    isViewed: false,
    storiesCount: 3,
    caption: 'Annual engineering hackathon demo presentations 🏆'
  },
  {
    id: 'st-3',
    name: 'Priya Patel',
    time: 'Today at 11:20 AM',
    avatar: priyaAvatar,
    isViewed: false,
    storiesCount: 1,
    caption: 'Reward Planners 3.0 Platform Live Release! 🚀'
  },
  {
    id: 'st-4',
    name: 'Rohan Verma',
    time: 'Yesterday at 7:15 PM',
    avatar: adityaAvatar,
    isViewed: true,
    storiesCount: 2,
    caption: 'Cloud infrastructure upgrade complete ☁️ Zero downtime.'
  },
  {
    id: 'st-5',
    name: 'Sneha Kulkarni',
    time: 'Yesterday at 4:30 PM',
    avatar: monaliAvatar,
    isViewed: true,
    storiesCount: 2,
    caption: 'Warm welcome to our 5 new batch joiners! 🌟'
  }
];

// Contacts for New Chat Modal / Sidebar View
export const NEW_CHAT_CONTACTS = [
  { id: 'c-you', name: 'Sakshi Chavan (You)', subtitle: 'Message yourself • Save notes & media', section: 'self', isSpecial: true },
  
  // Section A
  { id: 'c-aarav', name: 'Aarav Sharma', avatar: rohitAvatar, subtitle: 'Tech Lead • Frontend Architecture', section: 'A' },
  { id: 'c-amit', name: 'Amit Kulkarni', subtitle: 'Backend Developer • Tech Squad', section: 'A' },
  { id: 'c-ananya', name: 'Ananya Deshmukh', avatar: aaditiAvatar, subtitle: 'Senior UI/UX Designer • Creative', section: 'A' },

  // Section D
  { id: 'c-divya', name: 'Divya Nair', subtitle: 'Data & Growth Analyst • Strategy', section: 'D' },

  // Section K
  { id: 'c-kabir', name: 'Kabir Joshi', subtitle: 'QA Automation Lead • Testing', section: 'K' },
  { id: 'c-kavita', name: 'Kavita Reddy', avatar: apsalaAvatar, subtitle: 'Customer Success Manager • Support', section: 'K' },

  // Section M
  { id: 'c-manish', name: 'Manish Malhotra', avatar: manishAvatar, subtitle: 'Finance Controller • Accounts Desk', section: 'M' },
  { id: 'c-meera', name: 'Meera Iyer', subtitle: 'Brand Strategist • Marketing', section: 'M' },

  // Section N
  { id: 'c-neha', name: 'Neha Kapoor', subtitle: 'HR & People Operations Manager', section: 'N' },
  { id: 'c-nikhil', name: 'Nikhil Bansal', subtitle: 'Fullstack Engineer • Platform Core', section: 'N' },

  // Section P
  { id: 'c-pooja', name: 'Pooja Verma', subtitle: 'Frontend Developer • Mobile Web', section: 'P' },
  { id: 'c-priya', name: 'Priya Patel', avatar: priyaAvatar, subtitle: 'Principal Product Manager', section: 'P' },

  // Section R
  { id: 'c-rohan', name: 'Rohan Verma', avatar: adityaAvatar, subtitle: 'DevOps & Cloud Architect', section: 'R' },
  { id: 'c-ritu', name: 'Ritu Sen', subtitle: 'Agile Coach & Scrum Master', section: 'R' },

  // Section S
  { id: 'c-sameer', name: 'Sameer Joshi', avatar: suhailAvatar, subtitle: 'Cybersecurity Specialist • InfoSec', section: 'S' },
  { id: 'c-sneha', name: 'Sneha Kulkarni', avatar: monaliAvatar, subtitle: 'Talent Acquisition Partner', section: 'S' },

  // Section T
  { id: 'c-tanvi', name: 'Tanvi Shah', avatar: tanishkaAvatar, subtitle: 'Legal & Regulatory Counsel', section: 'T' },

  // Section V
  { id: 'c-vikram', name: 'Vikram Singhania', avatar: ajayAvatar, subtitle: 'VP of Operations & Fleet', section: 'V' }
];

// Smart auto-replies for simulation
export const SIMULATED_RESPONSES = [
  { senderName: 'Aarav Sharma', senderAvatar: rohitAvatar, senderColor: '#00A884', text: 'This looks super clean! Exactly what we needed. 🔥' },
  { senderName: 'Priya Patel', senderAvatar: priyaAvatar, senderColor: '#EC4899', text: 'Great work! Let’s share this update with the product team.' },
  { senderName: 'Ananya Deshmukh', senderAvatar: aaditiAvatar, senderColor: '#F59E0B', text: 'Love the contrast and micro-interactions! Design approved. 🎨' },
  { senderName: 'Rohan Verma', senderAvatar: adityaAvatar, senderColor: '#38BDF8', text: 'All systems operational and health checks passed smoothly! 🚀' }
];

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SparklesIcon from '@mui/icons-material/AutoAwesomeRounded';
import { notificationApi, AppNotification } from '../../api/notificationApi';
import {
  NotificationTab,
  EnrichedNotification,
  LIGHT_COLOR_PALETTES,
} from '../../components/layout/NotificationsPanel';

function formatTimeAgo(value?: string | number): string {
  if (!value) return 'Just now';
  const str = String(value);
  const normalized = str.includes('T') ? str : str.replace(' ', 'T');
  const date = new Date(normalized);
  const time = date.getTime();
  if (!Number.isFinite(time)) return 'Recently';

  const diffMs = Date.now() - time;
  if (diffMs < 0) return 'Just now';
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (sec < 60) return 'Just now';
  if (min < 60) return `${min}m ago`;
  if (hour < 24) return `${hour}h ago`;
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day}d ago`;

  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

function computeTimeHorizon(value?: string | number): 'Today' | 'Yesterday' | 'Earlier' {
  if (!value) return 'Today';
  const str = String(value);
  const normalized = str.includes('T') ? str : str.replace(' ', 'T');
  const date = new Date(normalized);
  const time = date.getTime();
  if (!Number.isFinite(time)) return 'Today';

  const now = new Date();
  if (now.toDateString() === date.toDateString()) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) return 'Yesterday';

  return 'Earlier';
}

function resolveNotificationMeta(item: AppNotification): {
  category: 'Orders' | 'Payments' | 'Rewards' | 'Reminders' | 'Updates';
  badgeLabel: string;
  to: string;
  actionLabel: string;
  IconComponent: any;
} {
  const mod = (item.module || '').toLowerCase();
  const type = (item.type || '').toLowerCase();
  const title = (item.title || '').toLowerCase();
  const actionUrl = (item.action_url || item.to || '').trim();

  // 1. Orders & E-commerce
  if (mod === 'ecommerce' || type.includes('order') || title.includes('order') || title.includes('delivery') || title.includes('dispatched')) {
    return {
      category: 'Orders',
      badgeLabel: 'Order',
      to: actionUrl || '/profile',
      actionLabel: 'View Order',
      IconComponent: ShoppingBagOutlinedIcon,
    };
  }

  // 2. Services
  if (mod === 'service' || type.includes('service') || title.includes('service') || title.includes('booking')) {
    return {
      category: 'Orders',
      badgeLabel: 'Service',
      to: actionUrl || '/services',
      actionLabel: 'View Booking',
      IconComponent: AssignmentOutlinedIcon,
    };
  }

  // 3. Payments & BBPS
  if (mod === 'bbps' || type.includes('bbps') || type.includes('bill') || title.includes('bill') || title.includes('electricity') || title.includes('recharge')) {
    return {
      category: 'Payments',
      badgeLabel: 'Payment',
      to: actionUrl || '/bbps',
      actionLabel: 'Pay / View',
      IconComponent: ReceiptLongOutlinedIcon,
    };
  }

  // 4. Rewards, Wallet & Points
  if (mod === 'rewards' || mod === 'wallet' || type.includes('reward') || type.includes('wallet') || type.includes('point') || type.includes('coin') || title.includes('point') || title.includes('cashback') || title.includes('wallet')) {
    return {
      category: 'Rewards',
      badgeLabel: 'Reward',
      to: actionUrl || (mod === 'wallet' ? '/profile' : '/rewards'),
      actionLabel: mod === 'wallet' ? 'Wallet' : 'Explore',
      IconComponent: CardGiftcardOutlinedIcon,
    };
  }

  // 5. Wellness & Fitness
  if (mod === 'wellness' || mod === 'fitness' || type.includes('fitness') || type.includes('step') || title.includes('step') || title.includes('walk') || title.includes('streak')) {
    return {
      category: 'Reminders',
      badgeLabel: 'Health',
      to: actionUrl || '/wellness',
      actionLabel: 'Wellness',
      IconComponent: FitnessCenterOutlinedIcon,
    };
  }

  // 6. Reminders & Tasks
  if (mod === 'todo' || type.includes('todo') || type.includes('reminder') || title.includes('reminder') || title.includes('task')) {
    return {
      category: 'Reminders',
      badgeLabel: 'Reminder',
      to: actionUrl || '/',
      actionLabel: 'View Task',
      IconComponent: NotificationsActiveOutlinedIcon,
    };
  }

  // Default Fallback
  return {
    category: 'Updates',
    badgeLabel: item.category || 'Update',
    to: actionUrl || '/',
    actionLabel: 'Details',
    IconComponent: NotificationsOutlinedIcon,
  };
}

const FALLBACK_SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'sample-order-dispatch',
    notification_id: 'sample-order-dispatch',
    title: 'Order #RP-9281 Out for Delivery 🚚',
    message: 'Your boAt Airdopes 141 and 2 other items are out for delivery with ExpressBees courier.',
    module: 'ecommerce',
    type: 'order_status',
    category: 'Orders',
    action_url: '/profile',
    priority: 'urgent',
    is_read: 0,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-coins-credited',
    notification_id: 'sample-coins-credited',
    title: '1,500 RP Coins Credited! 🎉',
    message: 'Congratulations on completing your monthly corporate milestone. Your RP coins are ready to redeem.',
    module: 'rewards',
    type: 'reward_payout',
    category: 'Rewards',
    action_url: '/rewards',
    priority: 'high',
    is_read: 0,
    created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-bbps-bill',
    notification_id: 'sample-bbps-bill',
    title: 'Electricity Bill Due in 3 Days ⚡',
    message: 'BESCOM invoice of ₹1,840 is due on Oct 10. Pay via BBPS to unlock 5% instant cashback.',
    module: 'bbps',
    type: 'bill_due',
    category: 'Payments',
    action_url: '/bbps',
    priority: 'normal',
    is_read: 0,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-service-confirm',
    notification_id: 'sample-service-confirm',
    title: 'AC Maintenance Confirmed ✨',
    message: 'Your deep home service is scheduled for tomorrow at 10:30 AM with verified expert Rajesh K.',
    module: 'service',
    type: 'service_booking',
    category: 'Orders',
    action_url: '/services',
    priority: 'normal',
    is_read: 1,
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-wellness-streak',
    notification_id: 'sample-wellness-streak',
    title: 'Daily 10k Steps Streak! 🏃',
    message: "You've walked 8,450 steps today. Just 1,550 steps more to claim today's wellness reward.",
    module: 'wellness',
    type: 'fitness_goal',
    category: 'Reminders',
    action_url: '/wellness',
    priority: 'normal',
    is_read: 1,
    created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sample-benefit-renewal',
    notification_id: 'sample-benefit-renewal',
    title: 'Review Corporate Benefits Policy 🛡️',
    message: 'Reminder: Check your family health coverage limit before the annual renewal cycle ends.',
    module: 'benefits',
    type: 'policy_update',
    category: 'Reminders',
    action_url: '/benefits',
    priority: 'normal',
    is_read: 1,
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NotificationTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [rawNotifications, setRawNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const backendList = await notificationApi.getNotifications(60);
      if (Array.isArray(backendList) && backendList.length > 0) {
        setRawNotifications(backendList);
      } else {
        setRawNotifications(FALLBACK_SAMPLE_NOTIFICATIONS);
      }
    } catch {
      if (rawNotifications.length === 0) {
        setRawNotifications(FALLBACK_SAMPLE_NOTIFICATIONS);
      }
    } finally {
      setIsLoading(false);
      if (manual) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, [rawNotifications.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const enrichedList = useMemo<EnrichedNotification[]>(() => {
    return rawNotifications.map((item, index) => {
      const id = item.notification_id ?? item.id ?? Math.random();
      const isRead = Boolean(item.read || item.is_read);
      const meta = resolveNotificationMeta(item);
      const createdAt = item.created_at || new Date().toISOString();
      const timeAgo = formatTimeAgo(createdAt);
      const horizon = computeTimeHorizon(createdAt);
      const palette = LIGHT_COLOR_PALETTES[index % LIGHT_COLOR_PALETTES.length];

      return {
        id,
        title: item.title,
        message: item.message,
        category: meta.category,
        badgeLabel: meta.badgeLabel,
        to: meta.to,
        actionLabel: meta.actionLabel,
        IconComponent: meta.IconComponent,
        palette,
        read: isRead,
        priority: (item.priority as any) || 'normal',
        createdAt,
        timeAgo,
        horizon,
      };
    });
  }, [rawNotifications]);

  const stats = useMemo(() => {
    const unread = enrichedList.filter((n) => !n.read).length;
    const orders = enrichedList.filter((n) => n.category === 'Orders').length;
    const rewards = enrichedList.filter((n) => n.category === 'Rewards').length;
    const payments = enrichedList.filter((n) => n.category === 'Payments').length;
    const reminders = enrichedList.filter((n) => n.category === 'Reminders').length;

    return {
      total: enrichedList.length,
      unread,
      orders,
      rewards,
      payments,
      reminders,
    };
  }, [enrichedList]);

  const filteredList = useMemo(() => {
    return enrichedList.filter((item) => {
      // Tab filter
      if (activeTab === 'Unread' && item.read) return false;
      if (activeTab === 'Orders' && item.category !== 'Orders') return false;
      if (activeTab === 'Payments' && item.category !== 'Payments') return false;
      if (activeTab === 'Rewards' && item.category !== 'Rewards') return false;
      if (activeTab === 'Reminders' && item.category !== 'Reminders') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesMsg = item.message.toLowerCase().includes(q);
        const matchesBadge = item.badgeLabel.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesBadge) return false;
      }

      return true;
    });
  }, [enrichedList, activeTab, searchQuery]);

  const grouped = useMemo(() => {
    const groups: { [key in 'Today' | 'Yesterday' | 'Earlier']?: EnrichedNotification[] } = {};
    for (const item of filteredList) {
      if (!groups[item.horizon]) {
        groups[item.horizon] = [];
      }
      groups[item.horizon]!.push(item);
    }
    return groups;
  }, [filteredList]);

  const handleMarkAsRead = async (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRawNotifications((prev) =>
      prev.map((item) => {
        const itemId = item.notification_id ?? item.id;
        return itemId === id ? { ...item, is_read: 1, read: true } : item;
      })
    );

    const num = Number(id);
    if (!isNaN(num) && num > 0) {
      try {
        await notificationApi.markAsRead(num);
      } catch (err) {
        console.warn('Error marking notification read:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (stats.unread === 0) return;
    setRawNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: 1, read: true }))
    );
    showToast('All notifications marked as read');
    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.warn('Error marking all notifications read:', err);
    }
  };

  const handleDelete = async (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRawNotifications((prev) =>
      prev.filter((item) => (item.notification_id ?? item.id) !== id)
    );
    showToast('Notification deleted');

    const num = Number(id);
    if (!isNaN(num) && num > 0) {
      try {
        await notificationApi.deleteNotification(num);
      } catch (err) {
        console.warn('Error deleting notification:', err);
      }
    }
  };

  const handleClearAllRead = () => {
    setRawNotifications((prev) => prev.filter((item) => !(item.read || item.is_read)));
    showToast('Cleared read notifications');
  };

  return (
    <div className="min-h-screen bg-[#F8F6FA] text-[#1C0E28] pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ─── Breadcrumb Bar ─── */}
      <div className="bg-white border-b border-[#E8E1EF] px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#E8E1EF] text-[#1C0E28] hover:bg-[#F8F6FA] text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer group hover:-translate-x-0.5"
              title="Back to Dashboard"
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 16 }} className="text-[#78538F] group-hover:text-[#1C0E28] transition-colors" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#776B80]">
              <Link to="/" className="hover:text-[#1C0E28] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-[#1C0E28] font-bold">Notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Toast Banner ─── */}
      {toastMessage && (
        <div className="w-full px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-[#1C0E28] text-white px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between text-xs font-semibold animate-fadeIn">
            <span className="flex items-center gap-2">
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18, color: '#A654CD' }} />
              {toastMessage}
            </span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white/70 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ─── Hero Overview Banner ─── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#1C0E28] via-[#2D163F] to-[#1C0E28] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold backdrop-blur-xs mb-3">
                <NotificationsActiveOutlinedIcon sx={{ fontSize: 16, color: '#D4B8E8' }} />
                <span>Executive Notification Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Activity & Updates Feed
              </h1>
              <p className="text-sm text-purple-200/80 mt-1 max-w-xl leading-relaxed">
                Stay updated with real-time tracking for your orders, loyalty reward points, service bookings, and scheduled bill payments.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => loadData(true)}
                className={`px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs ${
                  isRefreshing ? 'animate-pulse' : ''
                }`}
                title="Refresh notifications"
              >
                <RefreshRoundedIcon sx={{ fontSize: 18 }} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              {stats.unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white text-xs font-bold flex items-center gap-2 hover:opacity-95 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
                >
                  <DoneAllRoundedIcon sx={{ fontSize: 18 }} />
                  <span>Mark All as Read</span>
                </button>
              )}
            </div>
          </div>

          {/* ─── Metric Stat Cards ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-white/10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
              <span className="text-xs text-purple-200/70 font-medium block">Total Updates</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white mt-0.5 block">{stats.total}</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
              <span className="text-xs text-purple-200/70 font-medium block">Unread Items</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl sm:text-2xl font-extrabold text-white">{stats.unread}</span>
                {stats.unread > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
              <span className="text-xs text-purple-200/70 font-medium block">Orders & Services</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white mt-0.5 block">{stats.orders}</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
              <span className="text-xs text-purple-200/70 font-medium block">Rewards & Points</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white mt-0.5 block">{stats.rewards}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search, Tabs & Filter Toolbar ─── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-5">
        <div className="bg-white border border-[#E8E1EF] rounded-2xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {(
              [
                { id: 'All', label: 'All', count: stats.total },
                { id: 'Unread', label: 'Unread', count: stats.unread },
                { id: 'Orders', label: 'Orders & Services', count: stats.orders },
                { id: 'Payments', label: 'Payments & Bills', count: stats.payments },
                { id: 'Rewards', label: 'Rewards & Wallet', count: stats.rewards },
                { id: 'Reminders', label: 'Reminders', count: stats.reminders },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap select-none ${
                    isActive
                      ? 'bg-[#1C0E28] text-white shadow-xs'
                      : 'bg-slate-50 border border-[#E6DEEC] text-[#55435F] hover:bg-[#F3EEF7] hover:text-[#1C0E28]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : tab.id === 'Unread'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-white border border-[#E2D8E8] text-[#64748B]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Toolbar: Search & Clear Read */}
          <div className="flex items-center gap-2.5">
            {/* Live Search Input */}
            <div className="relative flex-1 md:w-64">
              <SearchRoundedIcon
                sx={{ fontSize: 18 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                type="text"
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F9F7FC] border border-[#E4DCE9] rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-[#1C0E28] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#78538F]/30 focus:bg-white transition-all"
              />
            </div>

            {/* Clear Read Button */}
            {enrichedList.some((n) => n.read) && (
              <button
                type="button"
                onClick={handleClearAllRead}
                className="text-xs font-semibold text-[#8A7A97] hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer whitespace-nowrap"
                title="Clear read notifications from view"
              >
                Clear read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Compact Notification Feed ─── */}
      <div className="w-full px-4 sm:px-6 lg:px-8 mt-5">
        {/* Shimmer Pulse Loader */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-3 border border-[#E8E1EF] shadow-xs flex items-center gap-3 animate-pulse"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                  <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredList.length === 0 ? (
          <div className="bg-white border border-[#E8E1EF] rounded-3xl p-10 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#F8F5FB] border border-[#E6DBED] flex items-center justify-center text-[#78538F] mb-3">
              <NotificationsOutlinedIcon sx={{ fontSize: 32 }} />
            </div>
            <h3 className="text-base font-extrabold text-[#1C0E28]">
              {searchQuery ? `No updates matching "${searchQuery}"` : 'No notifications in this view'}
            </h3>
            <p className="text-xs text-[#776B80] max-w-md mt-1 leading-relaxed">
              {searchQuery
                ? 'Try checking for typos or clear your search query to see other notifications.'
                : "You're completely up to date with your activities. Switch back to 'All' to review earlier notifications."}
            </p>
            {(searchQuery || activeTab !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('All');
                }}
                className="mt-4 px-4 py-2 rounded-2xl bg-[#1C0E28] text-white text-xs font-bold hover:bg-[#2D1B3E] transition-all cursor-pointer shadow-xs"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          !isLoading && (
            <div className="space-y-5">
              {(['Today', 'Yesterday', 'Earlier'] as const).map((horizon) => {
                const items = grouped[horizon];
                if (!items || items.length === 0) return null;

                return (
                  <div key={horizon} className="space-y-2.5">
                    {/* Horizon Divider */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#78538F] bg-[#F2ECF7] px-2.5 py-0.5 rounded-full border border-[#E6DBED]">
                        {horizon}
                      </span>
                      <div className="flex-1 h-px bg-[#E4DCE9]" />
                      <span className="text-xs font-semibold text-[#8A7A97]">
                        {items.length} {items.length === 1 ? 'notification' : 'notifications'}
                      </span>
                    </div>

                    {/* Full-Width Card Grid with Category Pastel Backgrounds */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {items.map((item) => {
                        const Icon = item.IconComponent;
                        const isUnread = !item.read;
                        const p = item.palette;

                        return (
                          <div
                            key={item.id}
                            data-notification-card
                            className={`group rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 transition-all duration-150 border ${p.cardBg} ${p.cardBorder} ${
                              isUnread
                                ? `${p.borderLeft} shadow-xs hover:shadow-sm`
                                : 'shadow-2xs hover:shadow-xs'
                            } flex flex-col justify-between`}
                          >
                            <div>
                              <div className="flex items-start gap-2.5">
                                {/* Compact Squircle Avatar (36px) */}
                                <div
                                  className={`w-9 h-9 rounded-xl ${p.iconBg} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                                >
                                  <Icon sx={{ fontSize: 20 }} />
                                </div>

                                <div className="flex-1 min-w-0">
                                  {/* Top Row: Title + Unread Indicator + Relative Time */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {isUnread && (
                                        <span
                                          className={`w-2 h-2 rounded-full ${p.dotColor} shrink-0 ring-2 ring-white animate-pulse`}
                                          title="Unread"
                                        />
                                      )}
                                      <h3
                                        className={`text-[14px] sm:text-[14.5px] line-clamp-1 leading-snug tracking-tight ${
                                          isUnread ? 'font-extrabold text-[#1C0E28]' : 'font-bold text-[#2D1B3E]'
                                        }`}
                                      >
                                        {item.title}
                                      </h3>
                                    </div>

                                    <span className="text-[11px] font-semibold text-[#8A7A97] flex items-center gap-0.5 shrink-0 pt-0.5">
                                      <AccessTimeRoundedIcon sx={{ fontSize: 12 }} />
                                      {item.timeAgo}
                                    </span>
                                  </div>

                                  {/* Message / Content with increased font size */}
                                  <p className="text-[12.5px] sm:text-[13px] text-[#55435F] font-medium leading-relaxed mt-1 line-clamp-1">
                                    {item.message}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Compact Action Strip */}
                            <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-black/[0.04]">
                              <Link
                                to={item.to}
                                onClick={() => {
                                  if (isUnread) handleMarkAsRead(item.id);
                                }}
                                className={`inline-flex items-center gap-1 text-[11.5px] sm:text-[12px] font-extrabold px-2.5 py-0.5 rounded-md ${p.actionBtnBg} ${p.actionBtnText} shadow-2xs transition-all duration-150`}
                              >
                                <span>{item.actionLabel}</span>
                                <ArrowForwardRoundedIcon
                                  sx={{ fontSize: 13 }}
                                  className="group-hover:translate-x-0.5 transition-transform"
                                />
                              </Link>

                              <div className="flex items-center gap-0.5">
                                {isUnread && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleMarkAsRead(item.id, e)}
                                    title="Mark as read"
                                    className="p-1 rounded-md text-[#78538F] hover:text-[#1C0E28] hover:bg-white/80 transition-all cursor-pointer"
                                  >
                                    <CheckCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => handleDelete(item.id, e)}
                                  title="Delete notification"
                                  className="p-1 rounded-md text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                >
                                  <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

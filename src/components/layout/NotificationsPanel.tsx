import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SparklesIcon from '@mui/icons-material/AutoAwesomeRounded';
import { notificationApi, AppNotification } from '../../api/notificationApi';

export type NotificationTab = 'All' | 'Unread' | 'Orders' | 'Payments' | 'Rewards' | 'Reminders';

export interface LightPalette {
  name: string;
  cardBg: string;
  cardBorder: string;
  borderLeft: string;
  iconBg: string;
  badgeBg: string;
  badgeText: string;
  actionBtnBg: string;
  actionBtnText: string;
  dotColor: string;
}

export const LIGHT_COLOR_PALETTES: LightPalette[] = [
  {
    name: 'purple',
    cardBg: 'bg-[#F3E8FF]', // Soft Lavender
    cardBorder: 'border-[#D8B4FE]',
    borderLeft: 'border-l-[4px] border-l-[#9333EA]',
    iconBg: 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]',
    badgeBg: 'bg-white/90 border border-[#D8B4FE]',
    badgeText: 'text-[#6B21A8]',
    actionBtnBg: 'bg-white/95 hover:bg-[#7C3AED]',
    actionBtnText: 'text-[#6B21A8] hover:text-white',
    dotColor: 'bg-[#9333EA]',
  },
  {
    name: 'blue',
    cardBg: 'bg-[#E0F2FE]', // Soft Sky Blue
    cardBorder: 'border-[#7DD3FC]',
    borderLeft: 'border-l-[4px] border-l-[#0284C7]',
    iconBg: 'bg-gradient-to-br from-[#0284C7] to-[#0369A1]',
    badgeBg: 'bg-white/90 border border-[#7DD3FC]',
    badgeText: 'text-[#0369A1]',
    actionBtnBg: 'bg-white/95 hover:bg-[#0284C7]',
    actionBtnText: 'text-[#0369A1] hover:text-white',
    dotColor: 'bg-[#0284C7]',
  },
  {
    name: 'green',
    cardBg: 'bg-[#DCFCE7]', // Soft Mint Green
    cardBorder: 'border-[#86EFAC]',
    borderLeft: 'border-l-[4px] border-l-[#16A34A]',
    iconBg: 'bg-gradient-to-br from-[#10B981] to-[#059669]',
    badgeBg: 'bg-white/90 border border-[#86EFAC]',
    badgeText: 'text-[#15803D]',
    actionBtnBg: 'bg-white/95 hover:bg-[#16A34A]',
    actionBtnText: 'text-[#15803D] hover:text-white',
    dotColor: 'bg-[#16A34A]',
  },
  {
    name: 'amber',
    cardBg: 'bg-[#FEF3C7]', // Soft Warm Amber
    cardBorder: 'border-[#FCD34D]',
    borderLeft: 'border-l-[4px] border-l-[#D97706]',
    iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
    badgeBg: 'bg-white/90 border border-[#FCD34D]',
    badgeText: 'text-[#B45309]',
    actionBtnBg: 'bg-white/95 hover:bg-[#D97706]',
    actionBtnText: 'text-[#B45309] hover:text-white',
    dotColor: 'bg-[#D97706]',
  },
  {
    name: 'rose',
    cardBg: 'bg-[#FFE4E6]', // Soft Light Rose
    cardBorder: 'border-[#FDA4AF]',
    borderLeft: 'border-l-[4px] border-l-[#E11D48]',
    iconBg: 'bg-gradient-to-br from-[#F43F5E] to-[#E11D48]',
    badgeBg: 'bg-white/90 border border-[#FDA4AF]',
    badgeText: 'text-[#BE123C]',
    actionBtnBg: 'bg-white/95 hover:bg-[#E11D48]',
    actionBtnText: 'text-[#BE123C] hover:text-white',
    dotColor: 'bg-[#E11D48]',
  },
  {
    name: 'indigo',
    cardBg: 'bg-[#E0E7FF]', // Soft Light Indigo
    cardBorder: 'border-[#A5B4FC]',
    borderLeft: 'border-l-[4px] border-l-[#4F46E5]',
    iconBg: 'bg-gradient-to-br from-[#6366F1] to-[#4338CA]',
    badgeBg: 'bg-white/90 border border-[#A5B4FC]',
    badgeText: 'text-[#3730A3]',
    actionBtnBg: 'bg-white/95 hover:bg-[#4F46E5]',
    actionBtnText: 'text-[#3730A3] hover:text-white',
    dotColor: 'bg-[#4F46E5]',
  },
  {
    name: 'teal',
    cardBg: 'bg-[#CCFBF1]', // Soft Light Teal
    cardBorder: 'border-[#5EEAD4]',
    borderLeft: 'border-l-[4px] border-l-[#0D9488]',
    iconBg: 'bg-gradient-to-br from-[#14B8A6] to-[#0F766E]',
    badgeBg: 'bg-white/90 border border-[#5EEAD4]',
    badgeText: 'text-[#115E59]',
    actionBtnBg: 'bg-white/95 hover:bg-[#0D9488]',
    actionBtnText: 'text-[#115E59] hover:text-white',
    dotColor: 'bg-[#0D9488]',
  },
  {
    name: 'plum',
    cardBg: 'bg-[#FCE7F3]', // Soft Light Pink Plum
    cardBorder: 'border-[#FBCFE8]',
    borderLeft: 'border-l-[4px] border-l-[#DB2777]',
    iconBg: 'bg-gradient-to-br from-[#EC4899] to-[#BE185D]',
    badgeBg: 'bg-white/90 border border-[#FBCFE8]',
    badgeText: 'text-[#9D174D]',
    actionBtnBg: 'bg-white/95 hover:bg-[#DB2777]',
    actionBtnText: 'text-[#9D174D] hover:text-white',
    dotColor: 'bg-[#DB2777]',
  },
];

export interface EnrichedNotification {
  id: string | number;
  title: string;
  message: string;
  category: 'Orders' | 'Payments' | 'Rewards' | 'Reminders' | 'Updates';
  badgeLabel: string;
  to: string;
  actionLabel: string;
  IconComponent: any;
  palette: LightPalette;
  read: boolean;
  priority?: 'urgent' | 'high' | 'normal';
  createdAt: string;
  timeAgo: string;
  horizon: 'Today' | 'Yesterday' | 'Earlier';
}

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

  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
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

const SAMPLE_NOTIFICATIONS: AppNotification[] = [
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

export default function NotificationsPanel() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>('All');
  const [rawNotifications, setRawNotifications] = useState<AppNotification[]>([]);
  const [badgeCount, setBadgeCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Sync data from backend
  const loadNotificationsData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const [backendBadge, backendList] = await Promise.all([
        notificationApi.getUnreadBadge(),
        notificationApi.getNotifications(40),
      ]);

      if (Array.isArray(backendList) && backendList.length > 0) {
        setRawNotifications(backendList);
        const unreadCount = backendList.filter((n) => !(n.read || n.is_read)).length;
        setBadgeCount(backendBadge > 0 ? backendBadge : unreadCount);
      } else {
        setRawNotifications(SAMPLE_NOTIFICATIONS);
        const unreadCount = SAMPLE_NOTIFICATIONS.filter((n) => !(n.read || n.is_read)).length;
        setBadgeCount(backendBadge > 0 ? backendBadge : unreadCount);
      }
    } catch (err) {
      console.warn('Failed to load notifications from backend:', err);
      if (rawNotifications.length === 0) {
        setRawNotifications(SAMPLE_NOTIFICATIONS);
        setBadgeCount(SAMPLE_NOTIFICATIONS.filter((n) => !(n.read || n.is_read)).length);
      }
    } finally {
      setIsLoading(false);
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, [rawNotifications.length]);

  useEffect(() => {
    loadNotificationsData();
    const interval = setInterval(() => loadNotificationsData(), 60000);
    const handleRefresh = () => loadNotificationsData();

    window.addEventListener('rp_todo_updated', handleRefresh);
    window.addEventListener('rp_notification_refresh', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('rp_todo_updated', handleRefresh);
      window.removeEventListener('rp_notification_refresh', handleRefresh);
    };
  }, [loadNotificationsData]);

  const handleOpen = () => {
    setOpen(true);
    loadNotificationsData();
  };

  // Assign different light color palettes across all notifications
  const enrichedList = useMemo<EnrichedNotification[]>(() => {
    return rawNotifications.map((item, index) => {
      const id = item.notification_id ?? item.id ?? Math.random();
      const isRead = Boolean(item.read || item.is_read);
      const meta = resolveNotificationMeta(item);
      const createdAt = item.created_at || new Date().toISOString();
      const timeAgo = formatTimeAgo(createdAt);
      const horizon = computeTimeHorizon(createdAt);

      // Rotate through different light colors so each card has its own unique light background
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

  // Tab counts
  const counts = useMemo(() => {
    const unreadCount = enrichedList.filter((n) => !n.read).length;
    const ordersCount = enrichedList.filter((n) => n.category === 'Orders').length;
    const paymentsCount = enrichedList.filter((n) => n.category === 'Payments').length;
    const rewardsCount = enrichedList.filter((n) => n.category === 'Rewards').length;
    const remindersCount = enrichedList.filter((n) => n.category === 'Reminders').length;

    return {
      all: enrichedList.length,
      unread: unreadCount,
      orders: ordersCount,
      payments: paymentsCount,
      rewards: rewardsCount,
      reminders: remindersCount,
    };
  }, [enrichedList]);

  // Filtered list based on active tab
  const filteredList = useMemo(() => {
    switch (activeTab) {
      case 'Unread':
        return enrichedList.filter((n) => !n.read);
      case 'Orders':
        return enrichedList.filter((n) => n.category === 'Orders');
      case 'Payments':
        return enrichedList.filter((n) => n.category === 'Payments');
      case 'Rewards':
        return enrichedList.filter((n) => n.category === 'Rewards');
      case 'Reminders':
        return enrichedList.filter((n) => n.category === 'Reminders');
      case 'All':
      default:
        return enrichedList;
    }
  }, [enrichedList, activeTab]);

  // Group by horizon: Today, Yesterday, Earlier
  const groupedNotifications = useMemo(() => {
    const groups: { [key in 'Today' | 'Yesterday' | 'Earlier']?: EnrichedNotification[] } = {};
    for (const item of filteredList) {
      if (!groups[item.horizon]) {
        groups[item.horizon] = [];
      }
      groups[item.horizon]!.push(item);
    }
    return groups;
  }, [filteredList]);

  // Actions
  const handleMarkAsRead = async (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRawNotifications((prev) =>
      prev.map((item) => {
        const itemId = item.notification_id ?? item.id;
        return itemId === id ? { ...item, is_read: 1, read: true } : item;
      })
    );
    setBadgeCount((prev) => Math.max(0, prev - 1));

    const numericId = Number(id);
    if (!isNaN(numericId) && numericId > 0) {
      try {
        await notificationApi.markAsRead(numericId);
      } catch (err) {
        console.warn('Error marking notification as read:', err);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (counts.unread === 0) return;
    setRawNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: 1, read: true }))
    );
    setBadgeCount(0);
    showToast('All notifications marked as read');

    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.warn('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id: string | number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = rawNotifications.find((item) => (item.notification_id ?? item.id) === id);
    const wasUnread = target && !(target.read || target.is_read);

    setRawNotifications((prev) =>
      prev.filter((item) => (item.notification_id ?? item.id) !== id)
    );
    if (wasUnread) {
      setBadgeCount((prev) => Math.max(0, prev - 1));
    }
    showToast('Notification removed');

    const numericId = Number(id);
    if (!isNaN(numericId) && numericId > 0) {
      try {
        await notificationApi.deleteNotification(numericId);
      } catch (err) {
        console.warn('Error deleting notification:', err);
      }
    }
  };

  const handleItemClick = (item: EnrichedNotification) => {
    if (!item.read) {
      handleMarkAsRead(item.id);
    }
    setOpen(false);
    navigate(item.to);
  };

  const unreadDisplay = badgeCount > 0 ? badgeCount : counts.unread;

  return (
    <>
      {/* ─── Header Bell Trigger Button ─── */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Notifications, ${unreadDisplay} unread`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? 'notifications-panel' : undefined}
        className="relative group w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white hover:bg-[#F6F2F8] border border-[#E4DCE9] hover:border-[#D1C2DC] flex items-center justify-center cursor-pointer shrink-0 text-[#1C0E28] transition-all duration-200 active:scale-95 shadow-2xs hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-[#78538F]/30"
        title="View Notifications"
      >
        <NotificationsOutlinedIcon
          className="transition-transform group-hover:scale-110 duration-200 text-[#1C0E28]"
          sx={{ fontSize: 20 }}
        />

        {unreadDisplay > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-gradient-to-r from-[#DC2626] to-[#E11D48] text-white text-[11px] font-extrabold rounded-full border-2 border-white shadow-sm shadow-rose-500/30 animate-pulse">
            {unreadDisplay > 9 ? '9+' : unreadDisplay}
          </span>
        )}
      </button>

      {/* ─── Slide-Over Notifications Drawer ─── */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(15, 7, 25, 0.45)',
              backdropFilter: 'blur(4px)',
            },
          },
          paper: {
            role: 'dialog',
            'aria-modal': true,
            'aria-labelledby': 'notifications-title',
            id: 'notifications-panel',
            sx: {
              width: { xs: '100%', sm: 460 },
              maxWidth: '100vw',
              bgcolor: '#F9F7FC',
              color: '#1C0E28',
              boxShadow: '-8px 0 32px rgba(28, 14, 40, 0.16)',
            },
          },
        }}
      >
        <div className="flex flex-col h-full bg-[#F9F7FC]">
          {/* Top Luxury Gradient Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#1C0E28] via-[#78538F] to-[#A654CD]" />

          {/* ─── Drawer Header ─── */}
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-white border-b border-[#E8E1EF] flex items-center justify-between gap-3 sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-[#F4EEF8] to-[#ECE2F3] border border-[#E4D7EC] flex items-center justify-center text-[#78538F] shadow-xs">
                <NotificationsActiveOutlinedIcon sx={{ fontSize: 19 }} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 id="notifications-title" className="text-base sm:text-lg font-extrabold text-[#1C0E28] tracking-tight">
                    Notifications
                  </h2>
                  {unreadDisplay > 0 ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {unreadDisplay} New
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <SparklesIcon sx={{ fontSize: 11 }} />
                      Up to date
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#776B80] font-medium leading-tight">
                  {unreadDisplay > 0
                    ? `${unreadDisplay} unread update${unreadDisplay === 1 ? '' : 's'}`
                    : "You're all caught up"}
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => loadNotificationsData(true)}
                title="Refresh notifications"
                aria-label="Refresh notifications"
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#1C0E28] hover:bg-[#F3EEF7] transition-all cursor-pointer ${
                  isRefreshing ? 'animate-spin text-[#78538F]' : ''
                }`}
              >
                <RefreshRoundedIcon sx={{ fontSize: 18 }} />
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close"
                aria-label="Close notifications panel"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#1C0E28] hover:bg-[#F3EEF7] transition-all cursor-pointer"
              >
                <CloseRoundedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>

          {/* ─── Feedback Toast Banner (if any) ─── */}
          {feedbackToast && (
            <div className="bg-[#1C0E28] text-white px-3.5 py-2 text-xs font-semibold flex items-center justify-between animate-fadeIn z-30">
              <span className="flex items-center gap-1.5">
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 15, color: '#A654CD' }} />
                {feedbackToast}
              </span>
              <button
                type="button"
                onClick={() => setFeedbackToast(null)}
                className="text-white/70 hover:text-white cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* ─── Category Filter Navigation Chips ─── */}
          <div className="px-3.5 py-2 bg-white/95 backdrop-blur-xs border-b border-[#E8E1EF] flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar sticky top-[61px] z-10">
            <div className="flex items-center gap-1 shrink-0">
              {(
                [
                  { id: 'All', label: 'All', count: counts.all },
                  { id: 'Unread', label: 'Unread', count: counts.unread },
                  { id: 'Orders', label: 'Orders', count: counts.orders },
                  { id: 'Payments', label: 'Payments', count: counts.payments },
                  { id: 'Rewards', label: 'Rewards', count: counts.rewards },
                  { id: 'Reminders', label: 'Reminders', count: counts.reminders },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all duration-150 cursor-pointer flex items-center gap-1 select-none ${
                      isActive
                        ? 'bg-[#1C0E28] text-white shadow-xs'
                        : 'bg-white border border-[#E2D8E8] text-[#55435F] hover:bg-[#F3EEF7] hover:text-[#1C0E28]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`text-[9.5px] px-1 py-0.1 rounded-full font-extrabold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : tab.id === 'Unread'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-[#64748B]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Mark All Read button */}
            {counts.unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="shrink-0 text-[11px] font-extrabold text-[#78538F] hover:text-[#1C0E28] flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[#F3EEF7] transition-all cursor-pointer whitespace-nowrap"
                title="Mark all notifications as read"
              >
                <DoneAllRoundedIcon sx={{ fontSize: 14 }} />
                <span>Mark Read</span>
              </button>
            )}
          </div>

          {/* ─── Compact Notification Feed Body with Diverse Light Colors ─── */}
          <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-3">
            {/* Shimmer Skeleton Loaders while initial loading */}
            {isLoading && (
              <div className="space-y-2 pt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-xl p-2.5 border border-[#E8E1EF] shadow-xs flex items-center gap-3 animate-pulse"
                  >
                    <div className="w-8.5 h-8.5 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grouped lists: Today, Yesterday, Earlier */}
            {!isLoading && (['Today', 'Yesterday', 'Earlier'] as const).map((horizon) => {
              const items = groupedNotifications[horizon];
              if (!items || items.length === 0) return null;

              return (
                <div key={horizon} className="space-y-2">
                  {/* Horizon Divider Label */}
                  <div className="flex items-center gap-2 pt-0.5 pb-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#78538F] bg-[#F1EAF6] px-2 py-0.2 rounded-full border border-[#E5DBEC]">
                      {horizon}
                    </span>
                    <div className="flex-1 h-px bg-[#E6DEEC]" />
                    <span className="text-[10px] text-[#A294AD] font-semibold">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Decreased Height, Compact Cards with Different Light Colors for ALL cards */}
                  <div className="space-y-2">
                    {items.map((item) => {
                      const Icon = item.IconComponent;
                      const isUnread = !item.read;
                      const p = item.palette;

                      return (
                        <div
                          key={item.id}
                          data-notification-card
                          onClick={() => handleItemClick(item)}
                          className={`group relative rounded-xl transition-all duration-150 cursor-pointer border ${p.cardBg} ${p.cardBorder} ${
                            isUnread
                              ? `${p.borderLeft} shadow-xs hover:shadow-sm`
                              : 'shadow-2xs hover:shadow-xs'
                          } px-3 py-2 sm:px-3.5 sm:py-2.5`}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Compact Squircle Avatar Icon (34px) */}
                            <div
                              className={`w-8.5 h-8.5 rounded-xl ${p.iconBg} text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 transition-transform group-hover:scale-105 duration-150`}
                            >
                              <Icon sx={{ fontSize: 18 }} />
                            </div>

                            {/* Center Content: Ultra-Clean Dense Layout */}
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
                                    className={`text-[13.5px] sm:text-[14px] line-clamp-1 leading-snug tracking-tight ${
                                      isUnread
                                        ? 'font-extrabold text-[#1C0E28]'
                                        : 'font-bold text-[#2D1B3E]'
                                    }`}
                                  >
                                    {item.title}
                                  </h3>
                                </div>

                                {/* Relative Time */}
                                <div className="flex items-center gap-0.5 text-[10.5px] sm:text-[11px] font-semibold text-[#8A7A97] shrink-0 pt-0.5">
                                  <AccessTimeRoundedIcon sx={{ fontSize: 11 }} />
                                  <span>{item.timeAgo}</span>
                                </div>
                              </div>

                              {/* Message: increased font size */}
                              <p className="text-[12.5px] sm:text-[13px] text-[#55435F] font-medium leading-relaxed mt-1 line-clamp-1">
                                {item.message}
                              </p>

                              {/* Bottom Micro-Action Strip */}
                              <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-black/[0.04]">
                                <span
                                  className={`inline-flex items-center gap-1 text-[11.5px] sm:text-[12px] font-extrabold px-2.5 py-0.5 rounded-md ${p.actionBtnBg} ${p.actionBtnText} shadow-2xs transition-all duration-150`}
                                >
                                  <span>{item.actionLabel}</span>
                                  <ArrowForwardRoundedIcon
                                    sx={{ fontSize: 12 }}
                                    className="transition-transform group-hover:translate-x-0.5 duration-150"
                                  />
                                </span>

                                {/* Quick Mark Read & Delete icon buttons */}
                                <div className="flex items-center gap-0.5">
                                  {isUnread && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleMarkAsRead(item.id, e)}
                                      title="Mark as read"
                                      aria-label="Mark as read"
                                      className="p-1 rounded-md text-[#78538F] hover:text-[#1C0E28] hover:bg-white/80 transition-all cursor-pointer"
                                    >
                                      <CheckCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteNotification(item.id, e)}
                                    title="Delete notification"
                                    aria-label="Delete notification"
                                    className="p-1 rounded-md text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                  >
                                    <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {!isLoading && filteredList.length === 0 && (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#E4D7EC] shadow-sm flex items-center justify-center text-[#78538F] mb-3">
                  <NotificationsOutlinedIcon sx={{ fontSize: 28 }} />
                </div>
                <h3 className="text-sm font-extrabold text-[#1C0E28]">
                  {activeTab === 'Unread' ? 'No unread notifications' : 'No notifications found'}
                </h3>
                <p className="text-[11px] text-[#776B80] max-w-xs mt-1 leading-relaxed">
                  {activeTab === 'Unread'
                    ? "You've read all your recent notifications."
                    : 'There are no notifications in this category yet.'}
                </p>
                {activeTab !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('All')}
                    className="mt-3 px-3 py-1.5 rounded-full bg-[#1C0E28] text-white text-[11px] font-bold hover:bg-[#2D1B3E] transition-all cursor-pointer shadow-xs"
                  >
                    View All Notifications
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ─── Drawer Bottom Bar ─── */}
          <div className="px-3.5 py-2.5 bg-white border-t border-[#E8E1EF] flex items-center justify-between gap-3 sticky bottom-0 z-20">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate('/notifications');
              }}
              className="flex items-center gap-1.5 text-xs font-extrabold text-[#1C0E28] hover:text-[#78538F] transition-colors cursor-pointer group"
            >
              <span>Open Full Notification Center</span>
              <LaunchRoundedIcon sx={{ fontSize: 13 }} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            <span className="text-[10.5px] font-semibold text-[#8A7A97]">
              {enrichedList.length} updates total
            </span>
          </div>
        </div>
      </Drawer>
    </>
  );
}

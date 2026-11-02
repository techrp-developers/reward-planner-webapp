// src/utils/notificationRouting.ts
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import HeadsetMicOutlinedIcon from '@mui/icons-material/HeadsetMicOutlined';
import { AppNotification } from '../api/notificationApi';

export interface NotificationMeta {
  category: 'Orders' | 'Payments' | 'Rewards' | 'Reminders' | 'Updates';
  badgeLabel: string;
  to: string;
  actionLabel: string;
  IconComponent: any;
}

export function resolveNotificationMeta(item: AppNotification): NotificationMeta {
  const mod = (item.module || '').toLowerCase();
  const type = (item.type || '').toLowerCase();
  const title = (item.title || '').toLowerCase();
  const refType = (item.reference_type || '').toLowerCase();
  const actionUrl = (item.action_url || item.to || '').trim();

  // 1. CHAT NOTIFICATIONS (Direct match on module, type, reference_type, or metadata)
  if (
    mod === 'chat' ||
    type.includes('chat') ||
    type.includes('message') ||
    refType === 'conversation' ||
    item.icon === 'message-circle' ||
    Boolean(item.metadata?.conversation_id)
  ) {
    const rawConvId =
      item.metadata?.conversation_id ||
      (refType === 'conversation' ? item.reference_id : null) ||
      (item.reference_id && item.reference_id !== 'none' ? item.reference_id : null);

    const convId = rawConvId ? String(rawConvId).trim() : null;
    const targetRoute = convId ? `/chat/${convId}` : '/chat';

    return {
      category: 'Updates',
      badgeLabel: 'Chat',
      to: targetRoute,
      actionLabel: 'Open Chat',
      IconComponent: ChatBubbleOutlineRoundedIcon,
    };
  }

  // 2. CART ABANDONMENT / PRICE DROPS / CART NOTIFICATIONS
  if (
    refType === 'cart' ||
    type.includes('cart') ||
    item.metadata?.screen === 'Cart' ||
    (mod === 'ecommerce' && (type.includes('abandon') || type.includes('price_drop')))
  ) {
    return {
      category: 'Orders',
      badgeLabel: 'Cart',
      to: '/cart',
      actionLabel: 'View Cart',
      IconComponent: ShoppingCartOutlinedIcon,
    };
  }

  // 3. ECOMMERCE ORDERS & DELIVERIES
  if (
    mod === 'ecommerce' ||
    type.includes('order') ||
    title.includes('order') ||
    title.includes('delivery') ||
    title.includes('dispatched') ||
    refType === 'order'
  ) {
    return {
      category: 'Orders',
      badgeLabel: 'Order',
      to: '/profile',
      actionLabel: 'View Order',
      IconComponent: ShoppingBagOutlinedIcon,
    };
  }

  // 4. SERVICES & INSURANCE
  if (
    mod === 'service' ||
    type.includes('service') ||
    type.includes('booking') ||
    type.includes('insurance') ||
    refType.includes('insurance') ||
    item.metadata?.screen === 'ServiceHome'
  ) {
    const isInsurance =
      type.includes('insurance') ||
      refType.includes('insurance') ||
      Boolean(item.metadata?.insurance_type);

    return {
      category: 'Orders',
      badgeLabel: isInsurance ? 'Insurance' : 'Service',
      to: isInsurance ? '/services/category/2' : '/services',
      actionLabel: isInsurance ? 'View Insurance' : 'View Service',
      IconComponent: AssignmentOutlinedIcon,
    };
  }

  // 5. PAYMENTS & BBPS BILLS
  if (
    mod === 'bbps' ||
    type.includes('bbps') ||
    type.includes('bill') ||
    title.includes('bill') ||
    title.includes('electricity') ||
    title.includes('recharge')
  ) {
    return {
      category: 'Payments',
      badgeLabel: 'BBPS',
      to: '/bbps',
      actionLabel: 'Pay Bill',
      IconComponent: ReceiptLongOutlinedIcon,
    };
  }

  // 6. REWARDS, WALLET & RP COINS
  if (
    mod === 'rewards' ||
    mod === 'wallet' ||
    type.includes('reward') ||
    type.includes('wallet') ||
    type.includes('point') ||
    type.includes('coin') ||
    title.includes('point') ||
    title.includes('cashback') ||
    title.includes('wallet')
  ) {
    const isWallet = mod === 'wallet' || type.includes('wallet') || title.includes('wallet');
    return {
      category: 'Rewards',
      badgeLabel: isWallet ? 'Wallet' : 'Reward',
      to: isWallet ? '/profile' : '/store',
      actionLabel: isWallet ? 'View Wallet' : 'Explore Rewards',
      IconComponent: isWallet ? AccountBalanceWalletOutlinedIcon : CardGiftcardOutlinedIcon,
    };
  }

  // 7. COWORKER BIRTHDAYS
  if (
    mod === 'birthday' ||
    type.includes('birthday') ||
    title.includes('birthday')
  ) {
    return {
      category: 'Updates',
      badgeLabel: 'Birthday',
      to: '/chat',
      actionLabel: 'Wish in Chat',
      IconComponent: CakeOutlinedIcon,
    };
  }

  // 8. REMINDERS & TODOS
  if (
    mod === 'todo' ||
    type.includes('todo') ||
    type.includes('reminder') ||
    title.includes('reminder') ||
    title.includes('task') ||
    item.metadata?.screen === 'TodoList'
  ) {
    return {
      category: 'Reminders',
      badgeLabel: 'Reminder',
      to: '/',
      actionLabel: 'View Task',
      IconComponent: NotificationsActiveOutlinedIcon,
    };
  }

  // 9. WELLNESS & FITNESS
  if (
    mod === 'wellness' ||
    mod === 'fitness' ||
    type.includes('fitness') ||
    type.includes('step') ||
    title.includes('step') ||
    title.includes('walk') ||
    title.includes('streak')
  ) {
    return {
      category: 'Reminders',
      badgeLabel: 'Health',
      to: '/',
      actionLabel: 'Wellness',
      IconComponent: FitnessCenterOutlinedIcon,
    };
  }

  // 10. CUSTOMER SUPPORT
  if (
    mod === 'support' ||
    type.includes('support') ||
    type.includes('ticket')
  ) {
    return {
      category: 'Updates',
      badgeLabel: 'Support',
      to: '/customer-support',
      actionLabel: 'View Ticket',
      IconComponent: HeadsetMicOutlinedIcon,
    };
  }

  // 11. PROFILE / ACCOUNT UPDATES
  if (
    type.includes('profile') ||
    refType === 'profile' ||
    item.metadata?.screen === 'Profile'
  ) {
    return {
      category: 'Updates',
      badgeLabel: 'Profile',
      to: '/profile',
      actionLabel: 'View Profile',
      IconComponent: AssignmentOutlinedIcon,
    };
  }

  // 12. GAMES & CHALLENGES
  if (
    mod === 'games' ||
    type.includes('quiz') ||
    type.includes('sudoku') ||
    type.includes('game')
  ) {
    return {
      category: 'Updates',
      badgeLabel: 'Games',
      to: '/games',
      actionLabel: 'Play Game',
      IconComponent: CardGiftcardOutlinedIcon,
    };
  }

  // 13. FALLBACK: Filter out self-referential /notifications URL
  const isValidUrl =
    actionUrl &&
    actionUrl !== '/notifications' &&
    actionUrl !== 'notifications' &&
    actionUrl !== '/';

  const destination = isValidUrl
    ? actionUrl
    : item.metadata?.screen === 'Cart'
    ? '/cart'
    : item.metadata?.screen === 'Profile'
    ? '/profile'
    : item.metadata?.screen === 'ServiceHome'
    ? '/services'
    : '/';

  return {
    category: 'Updates',
    badgeLabel: item.category || 'Update',
    to: destination,
    actionLabel: 'View Details',
    IconComponent: NotificationsOutlinedIcon,
  };
}

// src/modules/chat/chatThemes.ts
// Chat templates. Each theme's vars are set on the chat root and consumed by ChatThemes.css.
import type { CSSProperties } from 'react';

export type ChatThemeId =
  | 'classic'
  | 'obsidian_black'
  | 'pure_white'
  | 'aurora_glass'
  | 'graphite_copper'
  | 'terracotta_paper'
  | 'diwali_gold'
  | 'midnight_gold'
  | 'royal_amethyst'
  | 'emerald_luxe'
  | 'rose_champagne'
  | 'ocean_breeze';

export interface ChatTheme {
  id: ChatThemeId;
  name: string;
  description: string;
  premium: boolean;
  vars: Record<`--ct-${string}`, string>;
}

const STORAGE_KEY = 'rp_chat_theme';

export const CHAT_THEMES: ChatTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'The original light look',
    premium: false,
    // Only drives the picker preview: classic leaves the chat's own styles untouched
    vars: {
      '--ct-bg': '#F1F5F9',
      '--ct-surface': '#FFFFFF',
      '--ct-surface-2': '#F1F5F9',
      '--ct-accent': '#4F46E5',
      '--ct-text': '#0F172A',
      '--ct-text-3': '#94A3B8',
      '--ct-border': '#E2E8F0',
      '--ct-bubble-in': '#FFFFFF',
      '--ct-bubble-out': '#D9FDD3',
      '--ct-wallpaper': '#EFEAE2',
      '--ct-rail': '#B63EEE',
    },
  },
  {
    id: 'obsidian_black',
    name: 'Obsidian Black',
    description: 'Pure black with crisp white',
    premium: true,
    vars: {
      '--ct-bg': '#000000',
      '--ct-surface': '#0A0A0A',
      '--ct-surface-2': '#171717',
      '--ct-surface-3': '#262626',
      '--ct-border': '#1F1F1F',
      '--ct-border-strong': '#333333',
      '--ct-text': '#FAFAFA',
      '--ct-text-2': '#C7C7C7',
      '--ct-text-3': '#8F8F8F',
      '--ct-accent': '#FFFFFF',
      '--ct-accent-hover': '#D4D4D4',
      '--ct-on-accent': '#000000',
      '--ct-accent-soft': 'rgba(255, 255, 255, 0.12)',
      '--ct-accent-border': 'rgba(255, 255, 255, 0.35)',
      '--ct-danger': '#F87171',
      '--ct-danger-soft': 'rgba(248, 113, 113, 0.14)',
      '--ct-bubble-in': '#171717',
      '--ct-bubble-out': '#2E2E2E',
      '--ct-bubble-out-text': '#FFFFFF',
      '--ct-bubble-out-muted': '#BDBDBD',
      '--ct-wallpaper': '#000000',
      '--ct-rail': 'linear-gradient(to bottom, #000000, #000000)',
      '--ct-notice': 'rgba(255, 255, 255, 0.08)',
      '--ct-scroll': 'rgba(255, 255, 255, 0.28)',
    },
  },
  {
    id: 'pure_white',
    name: 'Pure White',
    description: 'All white, clean and minimal',
    premium: true,
    vars: {
      '--ct-bg': '#FFFFFF',
      '--ct-surface': '#FFFFFF',
      '--ct-surface-2': '#F5F5F5',
      '--ct-surface-3': '#EBEBEB',
      '--ct-border': '#E8E8E8',
      '--ct-border-strong': '#D4D4D4',
      '--ct-text': '#0A0A0A',
      '--ct-text-2': '#404040',
      '--ct-text-3': '#6B6B6B',
      '--ct-accent': '#111111',
      '--ct-accent-hover': '#333333',
      '--ct-on-accent': '#FFFFFF',
      '--ct-accent-soft': 'rgba(0, 0, 0, 0.07)',
      '--ct-accent-border': 'rgba(0, 0, 0, 0.25)',
      '--ct-danger': '#B91C1C',
      '--ct-danger-soft': 'rgba(185, 28, 28, 0.08)',
      '--ct-bubble-in': '#FFFFFF',
      '--ct-bubble-out': '#EFEFEF',
      '--ct-bubble-out-text': '#0A0A0A',
      '--ct-bubble-out-muted': '#525252',
      '--ct-wallpaper': '#FFFFFF',
      '--ct-rail': 'linear-gradient(to bottom, #FFFFFF, #FFFFFF)',
      '--ct-notice': '#F5F5F5',
      '--ct-scroll': 'rgba(0, 0, 0, 0.22)',
    },
  },
  {
    id: 'aurora_glass',
    name: 'Aurora Glass',
    description: 'Northern lights through glass',
    premium: true,
    vars: {
      '--ct-bg': '#070B1A',
      '--ct-surface': 'rgba(13, 18, 38, 0.62)',
      '--ct-surface-2': 'rgba(255, 255, 255, 0.07)',
      '--ct-surface-3': 'rgba(255, 255, 255, 0.13)',
      '--ct-surface-solid': '#10162E',
      '--ct-border': 'rgba(255, 255, 255, 0.09)',
      '--ct-border-strong': 'rgba(255, 255, 255, 0.16)',
      '--ct-text': '#F1F5FF',
      '--ct-text-2': '#C3CDE6',
      '--ct-text-3': '#98A5C6',
      '--ct-accent': '#5EEAD4',
      '--ct-accent-hover': '#99F6E4',
      '--ct-on-accent': '#042F2E',
      '--ct-accent-soft': 'rgba(94, 234, 212, 0.15)',
      '--ct-accent-border': 'rgba(94, 234, 212, 0.4)',
      '--ct-danger': '#FCA5A5',
      '--ct-danger-soft': 'rgba(252, 165, 165, 0.14)',
      '--ct-bubble-in': 'rgba(255, 255, 255, 0.1)',
      '--ct-bubble-out': 'linear-gradient(135deg, #0D9488, #7C3AED)',
      '--ct-bubble-out-text': '#FFFFFF',
      '--ct-bubble-out-muted': '#DDE3FF',
      '--ct-wallpaper':
        'radial-gradient(circle at 15% 10%, rgba(45, 212, 191, 0.32), transparent 42%), radial-gradient(circle at 88% 22%, rgba(139, 92, 246, 0.36), transparent 46%), radial-gradient(circle at 60% 100%, rgba(236, 72, 153, 0.2), transparent 45%), #070B1A',
      '--ct-rail': 'linear-gradient(to bottom, rgba(13, 18, 38, 0.55), rgba(13, 18, 38, 0.55))',
      '--ct-notice': 'rgba(94, 234, 212, 0.12)',
      '--ct-scroll': 'rgba(94, 234, 212, 0.35)',
    },
  },
  {
    id: 'graphite_copper',
    name: 'Graphite Copper',
    description: 'Charcoal with warm copper',
    premium: true,
    vars: {
      '--ct-bg': '#121110',
      '--ct-surface': '#1B1A18',
      '--ct-surface-2': '#262421',
      '--ct-surface-3': '#33302C',
      '--ct-border': '#2E2B27',
      '--ct-border-strong': '#443F39',
      '--ct-text': '#F2EDE6',
      '--ct-text-2': '#C9C1B6',
      '--ct-text-3': '#9C9388',
      '--ct-accent': '#D98A5F',
      '--ct-accent-hover': '#E8A47E',
      '--ct-on-accent': '#2A1408',
      '--ct-accent-soft': 'rgba(217, 138, 95, 0.15)',
      '--ct-accent-border': 'rgba(217, 138, 95, 0.42)',
      '--ct-danger': '#F87171',
      '--ct-danger-soft': 'rgba(248, 113, 113, 0.14)',
      '--ct-bubble-in': '#262421',
      '--ct-bubble-out': 'linear-gradient(135deg, #7A4326, #9C5B36)',
      '--ct-bubble-out-text': '#FFF6EF',
      '--ct-bubble-out-muted': '#EBCFBD',
      '--ct-wallpaper': '#121110',
      '--ct-rail': 'linear-gradient(to bottom, #0C0B0A, #0C0B0A)',
      '--ct-notice': 'rgba(217, 138, 95, 0.12)',
      '--ct-scroll': 'rgba(217, 138, 95, 0.38)',
    },
  },
  {
    id: 'terracotta_paper',
    name: 'Terracotta Paper',
    description: 'Warm cream paper and burnt clay',
    premium: true,
    vars: {
      '--ct-bg': '#F3E9DC',
      '--ct-surface': '#FBF5EC',
      '--ct-surface-2': '#F2E7D8',
      '--ct-surface-3': '#E8D9C5',
      '--ct-border': '#E6D8C4',
      '--ct-border-strong': '#D4C1A8',
      '--ct-text': '#33241A',
      '--ct-text-2': '#64503F',
      '--ct-text-3': '#7A6654',
      '--ct-accent': '#B4532A',
      '--ct-accent-hover': '#96431F',
      '--ct-on-accent': '#FFFFFF',
      '--ct-accent-soft': 'rgba(180, 83, 42, 0.11)',
      '--ct-accent-border': 'rgba(180, 83, 42, 0.32)',
      '--ct-danger': '#B91C1C',
      '--ct-danger-soft': 'rgba(185, 28, 28, 0.08)',
      '--ct-bubble-in': '#FFFDF8',
      '--ct-bubble-out': 'linear-gradient(135deg, #F2D3B8, #E8BFA0)',
      '--ct-bubble-out-text': '#33241A',
      '--ct-bubble-out-muted': '#5E4634',
      '--ct-wallpaper': '#F5ECDF',
      '--ct-rail': 'linear-gradient(to bottom, #3A2A1F, #3A2A1F)',
      '--ct-rail-text': '#FBF5EC',
      '--ct-rail-active': 'rgba(251, 245, 236, 0.18)',
      '--ct-notice': '#F6E3CC',
      '--ct-scroll': 'rgba(180, 83, 42, 0.32)',
    },
  },
  {
    // Colours sampled from the Diwali banner artwork
    id: 'diwali_gold',
    name: 'Diwali Gold',
    description: 'Festive brown and glowing gold',
    premium: true,
    vars: {
      '--ct-bg': '#4A1B08',
      '--ct-surface': '#69290F',
      '--ct-surface-2': '#7C320E',
      '--ct-surface-3': '#8F3C10',
      '--ct-border': '#7C320E',
      '--ct-border-strong': '#8F3C10',
      '--ct-text': '#FFF3D6',
      '--ct-text-2': '#F7DDB0',
      '--ct-text-3': '#E8BE86',
      '--ct-accent': '#FBA10A',
      '--ct-accent-hover': '#FDDC66',
      '--ct-on-accent': '#3A1404',
      '--ct-accent-soft': 'rgba(251, 161, 10, 0.18)',
      '--ct-accent-border': 'rgba(251, 161, 10, 0.5)',
      '--ct-danger': '#FECACA',
      '--ct-danger-soft': 'rgba(254, 202, 202, 0.14)',
      '--ct-bubble-in': '#7C320E',
      '--ct-bubble-out': 'linear-gradient(135deg, #F7930F, #FBA10A)',
      '--ct-bubble-out-text': '#3A1404',
      '--ct-bubble-out-muted': '#5A2A0A',
      '--ct-wallpaper':
        'radial-gradient(circle at 85% 12%, rgba(251, 161, 10, 0.35), transparent 40%), radial-gradient(circle at 12% 88%, rgba(253, 220, 102, 0.12), transparent 42%), #4A1B08',
      '--ct-rail': 'linear-gradient(to bottom, #3A1404, #3A1404)',
      '--ct-notice': 'rgba(251, 161, 10, 0.16)',
      '--ct-scroll': 'rgba(251, 161, 10, 0.45)',
    },
  },
  {
    id: 'midnight_gold',
    name: 'Midnight Gold',
    description: 'Deep navy with gilded accents',
    premium: true,
    vars: {
      '--ct-bg': '#0A0F1E',
      '--ct-surface': '#111829',
      '--ct-surface-2': '#1A2338',
      '--ct-surface-3': '#252F48',
      '--ct-border': '#26304A',
      '--ct-border-strong': '#33405E',
      '--ct-text': '#F4EFE2',
      '--ct-text-2': '#BFC3CF',
      '--ct-text-3': '#8791A5',
      '--ct-accent': '#D4AF37',
      '--ct-accent-hover': '#E6C455',
      '--ct-on-accent': '#1A1405',
      '--ct-accent-soft': 'rgba(212, 175, 55, 0.14)',
      '--ct-accent-border': 'rgba(212, 175, 55, 0.4)',
      '--ct-danger': '#F87171',
      '--ct-danger-soft': 'rgba(248, 113, 113, 0.14)',
      '--ct-bubble-in': '#1A2338',
      '--ct-bubble-out': 'linear-gradient(135deg, #4A3B13, #6B5519)',
      '--ct-bubble-out-text': '#FBF3DC',
      '--ct-bubble-out-muted': '#D9CBA0',
      '--ct-wallpaper':
        'radial-gradient(circle at 85% 10%, rgba(212, 175, 55, 0.16), transparent 42%), radial-gradient(circle at 10% 90%, rgba(70, 95, 170, 0.22), transparent 45%), #0A0F1E',
      '--ct-rail': 'linear-gradient(to bottom, #070B16, #070B16)',
      '--ct-notice': 'rgba(212, 175, 55, 0.14)',
      '--ct-scroll': 'rgba(212, 175, 55, 0.35)',
    },
  },
  {
    id: 'royal_amethyst',
    name: 'Royal Amethyst',
    description: 'Rich violet with a neon glow',
    premium: true,
    vars: {
      '--ct-bg': '#140B26',
      '--ct-surface': '#1C1033',
      '--ct-surface-2': '#291A48',
      '--ct-surface-3': '#38255F',
      '--ct-border': '#33235A',
      '--ct-border-strong': '#4A3378',
      '--ct-text': '#F3EEFF',
      '--ct-text-2': '#C4B8DE',
      '--ct-text-3': '#9A8DB8',
      '--ct-accent': '#C56BF5',
      '--ct-accent-hover': '#D68BF8',
      '--ct-on-accent': '#1C0B2E',
      '--ct-accent-soft': 'rgba(197, 107, 245, 0.18)',
      '--ct-accent-border': 'rgba(197, 107, 245, 0.45)',
      '--ct-danger': '#FB7185',
      '--ct-danger-soft': 'rgba(251, 113, 133, 0.15)',
      '--ct-bubble-in': '#291A48',
      '--ct-bubble-out': 'linear-gradient(135deg, #6D28D9, #A02FD8)',
      '--ct-bubble-out-text': '#FFFFFF',
      '--ct-bubble-out-muted': '#E9D5FF',
      '--ct-wallpaper':
        'radial-gradient(circle at 80% 15%, rgba(182, 62, 238, 0.24), transparent 44%), radial-gradient(circle at 15% 85%, rgba(79, 70, 229, 0.24), transparent 46%), #140B26',
      '--ct-rail': 'linear-gradient(to bottom, #0F0720, #0F0720)',
      '--ct-notice': 'rgba(197, 107, 245, 0.16)',
      '--ct-scroll': 'rgba(197, 107, 245, 0.4)',
    },
  },
  {
    id: 'emerald_luxe',
    name: 'Emerald Luxe',
    description: 'Forest green and fresh mint',
    premium: true,
    vars: {
      '--ct-bg': '#06140F',
      '--ct-surface': '#0B1F18',
      '--ct-surface-2': '#123027',
      '--ct-surface-3': '#1B4236',
      '--ct-border': '#1C3D32',
      '--ct-border-strong': '#2A5646',
      '--ct-text': '#EAF7F1',
      '--ct-text-2': '#A9CBBE',
      '--ct-text-3': '#7DA595',
      '--ct-accent': '#34D399',
      '--ct-accent-hover': '#6EE7B7',
      '--ct-on-accent': '#052016',
      '--ct-accent-soft': 'rgba(52, 211, 153, 0.14)',
      '--ct-accent-border': 'rgba(52, 211, 153, 0.4)',
      '--ct-danger': '#FCA5A5',
      '--ct-danger-soft': 'rgba(252, 165, 165, 0.13)',
      '--ct-bubble-in': '#123027',
      '--ct-bubble-out': 'linear-gradient(135deg, #0B5D45, #0F7A5A)',
      '--ct-bubble-out-text': '#F0FFF9',
      '--ct-bubble-out-muted': '#B6E8D5',
      '--ct-wallpaper':
        'radial-gradient(circle at 82% 12%, rgba(52, 211, 153, 0.16), transparent 42%), radial-gradient(circle at 12% 88%, rgba(202, 168, 74, 0.12), transparent 44%), #06140F',
      '--ct-rail': 'linear-gradient(to bottom, #04100C, #04100C)',
      '--ct-notice': 'rgba(52, 211, 153, 0.13)',
      '--ct-scroll': 'rgba(52, 211, 153, 0.35)',
    },
  },
  {
    id: 'rose_champagne',
    name: 'Rose Champagne',
    description: 'Soft blush and round bubbles',
    premium: true,
    vars: {
      '--ct-bg': '#F6E9E4',
      '--ct-surface': '#FFFAF7',
      '--ct-surface-2': '#F8ECE7',
      '--ct-surface-3': '#F0DCD5',
      '--ct-border': '#EEDDD6',
      '--ct-border-strong': '#E2C8BE',
      '--ct-text': '#3B2226',
      '--ct-text-2': '#6E4C54',
      '--ct-text-3': '#8F6E75',
      '--ct-accent': '#A8505F',
      '--ct-accent-hover': '#8E3F4E',
      '--ct-on-accent': '#FFFFFF',
      '--ct-accent-soft': 'rgba(168, 80, 95, 0.12)',
      '--ct-accent-border': 'rgba(168, 80, 95, 0.32)',
      '--ct-danger': '#B91C1C',
      '--ct-danger-soft': 'rgba(185, 28, 28, 0.09)',
      '--ct-bubble-in': '#FFFFFF',
      '--ct-bubble-out': 'linear-gradient(135deg, #F9DDD6, #F3C6BF)',
      '--ct-bubble-out-text': '#3B2226',
      '--ct-bubble-out-muted': '#6E4C54',
      '--ct-wallpaper':
        'radial-gradient(circle at 85% 12%, rgba(232, 180, 160, 0.55), transparent 44%), #F6E9E4',
      '--ct-rail': 'linear-gradient(to bottom, #7A2E3D, #7A2E3D)',
      '--ct-rail-text': '#FFF1F0',
      '--ct-rail-active': 'rgba(255, 241, 240, 0.2)',
      '--ct-rail-badge': '#FFF1F0',
      '--ct-rail-badge-text': '#7A2E3D',
      '--ct-notice': '#FBEBD8',
      '--ct-scroll': 'rgba(168, 80, 95, 0.3)',
    },
  },
  {
    id: 'ocean_breeze',
    name: 'Ocean Breeze',
    description: 'Crisp aqua and clear blue',
    premium: true,
    vars: {
      '--ct-bg': '#E3EEF6',
      '--ct-surface': '#F7FBFE',
      '--ct-surface-2': '#E9F2F8',
      '--ct-surface-3': '#D7E6F0',
      '--ct-border': '#D8E6EF',
      '--ct-border-strong': '#BFD4E2',
      '--ct-text': '#0B2A3F',
      '--ct-text-2': '#3F6176',
      '--ct-text-3': '#5F7C8E',
      '--ct-accent': '#0B6FA4',
      '--ct-accent-hover': '#085A86',
      '--ct-on-accent': '#FFFFFF',
      '--ct-accent-soft': 'rgba(11, 111, 164, 0.11)',
      '--ct-accent-border': 'rgba(11, 111, 164, 0.3)',
      '--ct-danger': '#B91C1C',
      '--ct-danger-soft': 'rgba(185, 28, 28, 0.08)',
      '--ct-bubble-in': '#FFFFFF',
      '--ct-bubble-out': 'linear-gradient(135deg, #D2ECFC, #B8E0F9)',
      '--ct-bubble-out-text': '#0B2A3F',
      '--ct-bubble-out-muted': '#3F6176',
      '--ct-wallpaper':
        'radial-gradient(circle at 85% 10%, rgba(125, 211, 252, 0.5), transparent 44%), radial-gradient(circle at 10% 90%, rgba(45, 212, 191, 0.26), transparent 46%), #E3EEF6',
      '--ct-rail': 'linear-gradient(to bottom, #0B4F78, #0B4F78)',
      '--ct-rail-text': '#EAF6FD',
      '--ct-rail-active': 'rgba(234, 246, 253, 0.2)',
      '--ct-rail-badge': '#EAF6FD',
      '--ct-rail-badge-text': '#0B4F78',
      '--ct-notice': '#DDF0FB',
      '--ct-scroll': 'rgba(11, 111, 164, 0.3)',
    },
  },
];

export const getChatTheme = (id: ChatThemeId): ChatTheme =>
  CHAT_THEMES.find((theme) => theme.id === id) ?? CHAT_THEMES[0];

export const getStoredChatThemeId = (): ChatThemeId => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (CHAT_THEMES.some((theme) => theme.id === stored)) {
      return stored as ChatThemeId;
    }
  } catch {}
  return 'classic';
};

export const storeChatThemeId = (id: ChatThemeId) => {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}
};

// Props for the chat root. Classic sets nothing, so ChatThemes.css stays inactive.
export const getChatThemeRootProps = (
  id: ChatThemeId
): { 'data-chat-theme'?: ChatThemeId; style?: CSSProperties } => {
  if (id === 'classic') return {};
  return { 'data-chat-theme': id, style: getChatTheme(id).vars as CSSProperties };
};

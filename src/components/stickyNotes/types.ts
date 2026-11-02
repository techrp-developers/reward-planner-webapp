export type StickyColorThemeId =
  | 'dark-gold'
  | 'yellow'
  | 'green'
  | 'pink'
  | 'purple'
  | 'blue'
  | 'charcoal';

export interface StickyColorTheme {
  id: StickyColorThemeId;
  name: string;
  headerBg: string;
  bodyBg: string;
  bottomBarBg: string;
  textColor: string;
  headerIconColor: string;
  toolbarIconColor: string;
  toolbarHoverBg: string;
  borderColor: string;
  accentColor: string;
  isDark: boolean;
}

export interface StickyPosition {
  x: number;
  y: number;
}

export interface StickySize {
  width: number;
  height: number;
}

export interface StickyNote {
  id: string;
  title?: string;
  contentHtml: string;
  colorTheme: StickyColorThemeId;
  position: StickyPosition;
  size: StickySize;
  isOpen: boolean;
  zIndex: number;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
}

export interface StickyNotesContextValue {
  notes: StickyNote[];
  activeNoteId: string | null;
  isPopupOpen: boolean;
  openPopup: () => void;
  closePopup: () => void;
  togglePopup: () => void;
  createNote: (options?: { colorTheme?: StickyColorThemeId; contentHtml?: string }) => StickyNote;
  updateNote: (id: string, updates: Partial<StickyNote>) => void;
  closeNote: (id: string) => void;
  openNote: (id: string) => void;
  deleteNote: (id: string) => void;
  bringToFront: (id: string) => void;
  clearAllNotes: () => void;
}

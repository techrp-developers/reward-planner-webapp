import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { StickyNote, StickyNotesContextValue, StickyColorThemeId } from './types';
import { DEFAULT_THEME } from './stickyThemes';

const STORAGE_KEY = 'rp_sticky_notes_data_v1';
const BASE_Z_INDEX = 9990;

const StickyNotesContext = createContext<StickyNotesContextValue | null>(null);

const DEFAULT_INITIAL_NOTE: StickyNote = {
  id: 'note-welcome-1',
  title: 'Quick Note',
  contentHtml: '<div><b>Welcome to Sticky Notes!</b> 📌</div><div><br></div><div>• <i>Drag the top header</i> to move this note anywhere on any page.</div><div>• Use <b>+</b> to create a new note.</div><div>• Click <b>...</b> to switch colors or manage notes.</div>',
  colorTheme: 'dark-gold',
  position: { x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 350) : 1000, y: 90 },
  size: { width: 320, height: 340 },
  isOpen: true,
  zIndex: BASE_Z_INDEX + 1,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const StickyNotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<StickyNote[]>(() => {
    if (typeof window === 'undefined') return [DEFAULT_INITIAL_NOTE];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read sticky notes from localStorage:', e);
    }
    return [DEFAULT_INITIAL_NOTE];
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    const firstOpen = notes.find(n => n.isOpen);
    return firstOpen ? firstOpen.id : null;
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save sticky notes to localStorage:', e);
    }
  }, [notes]);

  const maxZIndex = useMemo(() => {
    if (notes.length === 0) return BASE_Z_INDEX;
    return Math.max(...notes.map(n => n.zIndex || BASE_Z_INDEX), BASE_Z_INDEX);
  }, [notes]);

  const bringToFront = useCallback((id: string) => {
    setActiveNoteId(id);
    setNotes(prev =>
      prev.map(note =>
        note.id === id ? { ...note, zIndex: Math.max(note.zIndex, maxZIndex + 1) } : note
      )
    );
  }, [maxZIndex]);

  const createNote = useCallback((options?: { colorTheme?: StickyColorThemeId; contentHtml?: string }): StickyNote => {
    const newId = `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const offsetIndex = notes.length % 5;
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;

    const defaultWidth = 320;
    const defaultHeight = 340;

    const defaultX = Math.max(20, Math.min(screenW - defaultWidth - 30, screenW - defaultWidth - 40 - offsetIndex * 35));
    const defaultY = Math.max(80, Math.min(screenH - defaultHeight - 50, 100 + offsetIndex * 35));

    const newNote: StickyNote = {
      id: newId,
      contentHtml: options?.contentHtml || '',
      colorTheme: options?.colorTheme || DEFAULT_THEME,
      position: { x: defaultX, y: defaultY },
      size: { width: defaultWidth, height: defaultHeight },
      isOpen: true,
      zIndex: maxZIndex + 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newId);
    return newNote;
  }, [notes.length, maxZIndex]);

  const updateNote = useCallback((id: string, updates: Partial<StickyNote>) => {
    setNotes(prev =>
      prev.map(note => {
        if (note.id !== id) return note;
        return {
          ...note,
          ...updates,
          updatedAt: Date.now(),
        };
      })
    );
  }, []);

  const closeNote = useCallback((id: string) => {
    setNotes(prev =>
      prev.map(note => (note.id === id ? { ...note, isOpen: false } : note))
    );
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  const openNote = useCallback((id: string) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id ? { ...note, isOpen: true, zIndex: maxZIndex + 2 } : note
      )
    );
    setActiveNoteId(id);
  }, [maxZIndex]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  const clearAllNotes = useCallback(() => {
    setNotes([]);
    setActiveNoteId(null);
  }, []);

  const openPopup = useCallback(() => setIsPopupOpen(true), []);
  const closePopup = useCallback(() => setIsPopupOpen(false), []);
  const togglePopup = useCallback(() => setIsPopupOpen(prev => !prev), []);

  const value = useMemo<StickyNotesContextValue>(() => ({
    notes,
    activeNoteId,
    isPopupOpen,
    openPopup,
    closePopup,
    togglePopup,
    createNote,
    updateNote,
    closeNote,
    openNote,
    deleteNote,
    bringToFront,
    clearAllNotes,
  }), [
    notes,
    activeNoteId,
    isPopupOpen,
    openPopup,
    closePopup,
    togglePopup,
    createNote,
    updateNote,
    closeNote,
    openNote,
    deleteNote,
    bringToFront,
    clearAllNotes,
  ]);

  return (
    <StickyNotesContext.Provider value={value}>
      {children}
    </StickyNotesContext.Provider>
  );
};

export const useStickyNotes = (): StickyNotesContextValue => {
  const context = useContext(StickyNotesContext);
  if (!context) {
    throw new Error('useStickyNotes must be used within a StickyNotesProvider');
  }
  return context;
};

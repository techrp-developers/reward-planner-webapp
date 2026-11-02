import React, { useState } from 'react';
import { useStickyNotes } from './StickyNotesContext';
import { STICKY_THEMES } from './stickyThemes';
import { StickyColorThemeId } from './types';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';

interface StickyNotesPopupProps {
  onClose: () => void;
}

// Helper to strip HTML tags for snippet preview
const stripHtml = (html: string): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export const StickyNotesPopup: React.FC<StickyNotesPopupProps> = ({ onClose }) => {
  const {
    notes,
    createNote,
    openNote,
    closeNote,
    deleteNote,
    bringToFront,
  } = useStickyNotes();

  const [selectedColor, setSelectedColor] = useState<StickyColorThemeId>('dark-gold');

  const handleAddNew = (color?: StickyColorThemeId) => {
    const themeToUse = color || selectedColor;
    createNote({ colorTheme: themeToUse });
    onClose();
  };

  const handleNoteItemClick = (id: string, isOpen: boolean) => {
    if (!isOpen) {
      openNote(id);
    } else {
      bringToFront(id);
    }
    onClose();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-12 w-[340px] sm:w-[360px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(28,14,40,0.22)] border border-[#E4DCE9] p-4 text-[#1C0E28] z-[9999] animate-fadeIn select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F0EBF4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A654CD]/15 to-[#FC8BAD]/25 text-[#78538F] flex items-center justify-center">
            <EditNoteRoundedIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C0E28] leading-tight">Sticky Notes</h3>
            <p className="text-[11px] text-[#776B80]">Floating & movable anywhere</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-[#F6F2F8] flex items-center justify-center transition-colors cursor-pointer"
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </button>
      </div>

      {/* Main Action: Add New Sticky Note Button */}
      <div className="mt-3.5 space-y-2.5">
        <button
          type="button"
          onClick={() => handleAddNew()}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#78538F] to-[#A654CD] hover:from-[#67447C] hover:to-[#9345B5] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <AddRoundedIcon sx={{ fontSize: 18 }} />
          <span>Add New Sticky Note</span>
        </button>

        {/* Quick color picker for new note */}
        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-[11px] font-medium text-[#776B80]">Quick Color:</span>
          <div className="flex items-center gap-1.5">
            {(Object.keys(STICKY_THEMES) as StickyColorThemeId[]).map((themeKey) => {
              const theme = STICKY_THEMES[themeKey];
              const isSelected = selectedColor === themeKey;
              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => setSelectedColor(themeKey)}
                  title={theme.name}
                  style={{ backgroundColor: theme.headerBg }}
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer hover:scale-125 ${
                    isSelected ? 'ring-2 ring-[#78538F] ring-offset-1 scale-110' : 'border border-black/10'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Notes List Section */}
      <div className="mt-4 pt-3 border-t border-[#F0EBF4]">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-[#1C0E28]">
            Your Notes <span className="text-[#776B80] font-normal">({notes.length})</span>
          </span>
          {notes.some(n => n.isOpen) && (
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {notes.filter(n => n.isOpen).length} active on screen
            </span>
          )}
        </div>

        {/* List items scroll area */}
        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
          {notes.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#776B80]">
              <p>No sticky notes yet.</p>
              <p className="text-[11px] text-[#A654CD] mt-1">Click the button above to add one!</p>
            </div>
          ) : (
            notes.map((note) => {
              const theme = STICKY_THEMES[note.colorTheme] || STICKY_THEMES['dark-gold'];
              const previewText = stripHtml(note.contentHtml).trim() || 'Empty note...';

              return (
                <div
                  key={note.id}
                  onClick={() => handleNoteItemClick(note.id, note.isOpen)}
                  className={`group flex items-center justify-between gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                    note.isOpen
                      ? 'bg-[#FAF7FC] border-[#E4DCE9] hover:border-[#78538F]/50 shadow-2xs'
                      : 'bg-gray-50/70 border-gray-200/80 hover:bg-[#FAF7FC] opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Left Color Swatch */}
                  <div
                    style={{ backgroundColor: theme.headerBg }}
                    className="w-3.5 h-8 rounded-md shrink-0 shadow-2xs"
                  />

                  {/* Note info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1C0E28] truncate leading-tight">
                      {previewText}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#776B80]">
                        {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {note.isOpen ? (
                        <span className="text-[9.5px] font-medium text-emerald-600">On screen</span>
                      ) : (
                        <span className="text-[9.5px] text-gray-400">Hidden</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle show/hide */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (note.isOpen) {
                          closeNote(note.id);
                        } else {
                          openNote(note.id);
                        }
                      }}
                      title={note.isOpen ? 'Hide from screen' : 'Show on screen'}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-[#78538F] hover:bg-white transition-colors cursor-pointer"
                    >
                      {note.isOpen ? (
                        <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      title="Delete note"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyNotesPopup;

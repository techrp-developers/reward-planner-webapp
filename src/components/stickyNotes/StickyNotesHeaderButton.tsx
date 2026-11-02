import React, { useRef, useEffect } from 'react';
import { useStickyNotes } from './StickyNotesContext';
import NotebookPenIcon from './NotebookPenIcon';
import StickyNotesPopup from './StickyNotesPopup';

export const StickyNotesHeaderButton: React.FC = () => {
  const { isPopupOpen, togglePopup, closePopup, notes } = useStickyNotes();
  const containerRef = useRef<HTMLDivElement>(null);

  const activeNotesCount = notes.filter(n => n.isOpen).length;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closePopup();
      }
    };

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [isPopupOpen, closePopup]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        id="sticky-notes-header-button"
        type="button"
        onClick={togglePopup}
        aria-label="Sticky Notes"
        aria-haspopup="dialog"
        aria-expanded={isPopupOpen}
        title="Sticky Notes (Add & Manage)"
        className={`relative group w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border flex items-center justify-center cursor-pointer shrink-0 transition-all duration-200 active:scale-95 shadow-2xs hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-[#78538F]/30 ${
          isPopupOpen
            ? 'bg-[#F6F2F8] border-[#78538F] text-[#78538F]'
            : 'bg-white hover:bg-[#F6F2F8] border-[#E4DCE9] hover:border-[#D1C2DC] text-[#1C0E28]'
        }`}
      >
        <NotebookPenIcon
          size={20}
          className={`transition-transform duration-200 group-hover:scale-110 ${
            isPopupOpen ? 'text-[#78538F]' : 'text-[#1C0E28]'
          }`}
        />

        {/* Small badge dot if there are open active notes */}
        {activeNotesCount > 0 && (
          <span
            title={`${activeNotesCount} sticky notes active`}
            className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#EAA600] text-black font-extrabold text-[9px] shadow-xs border border-white"
          >
            {activeNotesCount}
          </span>
        )}
      </button>

      {/* Pop-up Card */}
      {isPopupOpen && <StickyNotesPopup onClose={closePopup} />}
    </div>
  );
};

export default StickyNotesHeaderButton;

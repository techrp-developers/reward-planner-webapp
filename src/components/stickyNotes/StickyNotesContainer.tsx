import React from 'react';
import { useStickyNotes } from './StickyNotesContext';
import StickyNoteCard from './StickyNoteCard';

export const StickyNotesContainer: React.FC = () => {
  const { notes } = useStickyNotes();
  const openNotes = notes.filter(n => n.isOpen);

  if (openNotes.length === 0) return null;

  return (
    <div
      aria-label="Sticky Notes Workspace"
      className="fixed inset-0 pointer-events-none z-[9980] overflow-hidden"
    >
      {openNotes.map((note) => (
        <StickyNoteCard key={note.id} note={note} />
      ))}
    </div>
  );
};

export default StickyNotesContainer;

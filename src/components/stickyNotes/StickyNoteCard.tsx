import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StickyNote, StickyColorThemeId } from './types';
import { STICKY_THEMES } from './stickyThemes';
import { useStickyNotes } from './StickyNotesContext';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import FormatUnderlinedRoundedIcon from '@mui/icons-material/FormatUnderlinedRounded';
import FormatStrikethroughRoundedIcon from '@mui/icons-material/FormatStrikethroughRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';

interface StickyNoteCardProps {
  note: StickyNote;
}

export const StickyNoteCard: React.FC<StickyNoteCardProps> = ({ note }) => {
  const { updateNote, closeNote, deleteNote, createNote, bringToFront, openPopup } = useStickyNotes();
  const theme = STICKY_THEMES[note.colorTheme] || STICKY_THEMES['dark-gold'];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [position, setPosition] = useState(note.position);
  const [size, setSize] = useState(note.size);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Active formatting state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isList, setIsList] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Sync external position changes when not dragging
  useEffect(() => {
    if (!isDragging) {
      setPosition(note.position);
    }
  }, [note.position, isDragging]);

  // Sync external size changes when not resizing
  useEffect(() => {
    if (!isResizing) {
      setSize(note.size);
    }
  }, [note.size, isResizing]);

  // Initialize editor content once or when note id changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== note.contentHtml) {
      // Only set if not currently active or if empty
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = note.contentHtml || '';
      }
    }
  }, [note.id, note.contentHtml]);

  // Close menu on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutside);
      return () => document.removeEventListener('mousedown', handleOutside);
    }
  }, [isMenuOpen]);

  // Check formatting states on selection changes
  const updateFormatStates = useCallback(() => {
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
      setIsStrikethrough(document.queryCommandState('strikeThrough'));
      setIsList(document.queryCommandState('insertUnorderedList'));
    } catch {
      // Ignore if document selection is unavailable
    }
  }, []);

  const handleEditorInput = () => {
    if (editorRef.current) {
      updateNote(note.id, { contentHtml: editorRef.current.innerHTML });
    }
    updateFormatStates();
  };

  const executeCommand = (cmd: string, val: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    try {
      document.execCommand(cmd, false, val);
      if (editorRef.current) {
        updateNote(note.id, { contentHtml: editorRef.current.innerHTML });
      }
      updateFormatStates();
    } catch (e) {
      console.warn('execCommand failed:', e);
    }
  };

  // Image Upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertImage', false, dataUrl);
        updateNote(note.id, { contentHtml: editorRef.current.innerHTML });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Dragging Implementation
  const handleHeaderPointerDown = (e: React.PointerEvent) => {
    // Only drag with primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    bringToFront(note.id);
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initX = position.x;
    const initY = position.y;

    const handlePointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startX;
      const deltaY = moveEv.clientY - startY;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      const nextX = Math.max(0, Math.min(screenW - size.width, initX + deltaX));
      const nextY = Math.max(0, Math.min(screenH - 50, initY + deltaY));

      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = (upEv: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsDragging(false);

      const deltaX = upEv.clientX - startX;
      const deltaY = upEv.clientY - startY;

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      const finalX = Math.max(0, Math.min(screenW - size.width, initX + deltaX));
      const finalY = Math.max(0, Math.min(screenH - 50, initY + deltaY));

      updateNote(note.id, { position: { x: finalX, y: finalY } });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Resizing Implementation
  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    bringToFront(note.id);
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initW = size.width;
    const initH = size.height;

    const handlePointerMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startX;
      const deltaY = moveEv.clientY - startY;

      const nextW = Math.max(260, Math.min(700, initW + deltaX));
      const nextH = Math.max(220, Math.min(800, initH + deltaY));

      setSize({ width: nextW, height: nextH });
    };

    const handlePointerUp = (upEv: PointerEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setIsResizing(false);

      const deltaX = upEv.clientX - startX;
      const deltaY = upEv.clientY - startY;

      const finalW = Math.max(260, Math.min(700, initW + deltaX));
      const finalH = Math.max(220, Math.min(800, initH + deltaY));

      updateNote(note.id, { size: { width: finalW, height: finalH } });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      ref={cardRef}
      data-sticky-note-card={note.id}
      onPointerDown={() => bringToFront(note.id)}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: note.zIndex,
        boxShadow: isDragging
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0,0,0,0.1)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.08)',
      }}
      className={`fixed top-0 left-0 flex flex-col rounded-xl overflow-hidden select-none pointer-events-auto transition-shadow ${
        isDragging ? 'opacity-95' : 'opacity-100'
      }`}
    >
      {/* Hidden file input for inserting images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* TOP HEADER BAR (Draggable handle + action buttons) */}
      <div
        data-sticky-note-header
        onPointerDown={handleHeaderPointerDown}
        style={{
          backgroundColor: theme.headerBg,
          color: theme.headerIconColor,
        }}
        className={`h-9 px-2 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing border-b border-black/10 transition-colors ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
      >
        {/* Left: Add new note button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            createNote({ colorTheme: note.colorTheme });
          }}
          title="New Note (+)"
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/15 active:scale-95 transition-all cursor-pointer"
        >
          <AddRoundedIcon sx={{ fontSize: 18 }} />
        </button>

        {/* Center: Note title or subtle drag hint */}
        <div className="flex-1 text-center font-medium text-xs opacity-70 truncate px-2 pointer-events-none">
          {note.title || 'Sticky Note'}
        </div>

        {/* Right: Menu (...) and Close (X) buttons */}
        <div className="flex items-center gap-1">
          {/* Menu button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(prev => !prev);
              }}
              title="Menu (...)"
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-black/15 active:scale-95 transition-all cursor-pointer"
            >
              <MoreHorizRoundedIcon sx={{ fontSize: 18 }} />
            </button>

            {/* Menu Dropdown Popup */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 w-56 rounded-xl bg-[#2D2D2D] text-white shadow-2xl border border-white/10 p-2.5 z-50 animate-fadeIn"
              >
                <div className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2 px-1">
                  Color Theme
                </div>

                {/* Color swatches */}
                <div className="grid grid-cols-7 gap-1.5 mb-3 px-1">
                  {(Object.keys(STICKY_THEMES) as StickyColorThemeId[]).map((themeKey) => {
                    const swatch = STICKY_THEMES[themeKey];
                    const isSelected = note.colorTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => {
                          updateNote(note.id, { colorTheme: themeKey });
                          setIsMenuOpen(false);
                        }}
                        title={swatch.name}
                        style={{ backgroundColor: swatch.headerBg }}
                        className={`w-6 h-6 rounded-full border transition-all cursor-pointer hover:scale-110 ${
                          isSelected ? 'border-white scale-110 shadow-md ring-2 ring-white/50' : 'border-black/20'
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="border-t border-white/10 my-1.5" />

                {/* Open all notes manager */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    openPopup();
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <ViewListRoundedIcon sx={{ fontSize: 16 }} />
                  <span>Notes List</span>
                </button>

                {/* Delete Note */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    deleteNote(note.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                  <span>Delete Note</span>
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeNote(note.id);
            }}
            title="Close Note"
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* NOTE BODY: Editable rich text content */}
      <div
        style={{
          backgroundColor: theme.bodyBg,
          color: theme.textColor,
        }}
        className="flex-1 p-3.5 overflow-y-auto outline-none cursor-text select-text relative"
        onClick={() => {
          if (editorRef.current && document.activeElement !== editorRef.current) {
            editorRef.current.focus();
          }
        }}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          onKeyUp={updateFormatStates}
          onMouseUp={updateFormatStates}
          data-placeholder="Take a note..."
          style={{
            minHeight: '100%',
            outline: 'none',
          }}
          className="text-sm font-normal leading-relaxed break-words whitespace-pre-wrap selection:bg-[#EAA600]/40 selection:text-white sticky-editor-content"
        />
      </div>

      {/* BOTTOM FORMATTING TOOLBAR (Exact replica of Windows Sticky Notes) */}
      <div
        style={{
          backgroundColor: theme.bottomBarBg,
          color: theme.toolbarIconColor,
          borderColor: theme.borderColor,
        }}
        className="h-10 px-2 flex items-center justify-between shrink-0 border-t select-none"
      >
        <div className="flex items-center gap-0.5">
          {/* Bold (B) */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('bold');
            }}
            title="Bold (Ctrl+B)"
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
              isBold ? 'bg-white/20 font-black text-white' : 'hover:bg-white/10'
            }`}
          >
            <FormatBoldRoundedIcon sx={{ fontSize: 18 }} />
          </button>

          {/* Italic (I) */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('italic');
            }}
            title="Italic (Ctrl+I)"
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
              isItalic ? 'bg-white/20 text-white' : 'hover:bg-white/10'
            }`}
          >
            <FormatItalicRoundedIcon sx={{ fontSize: 18 }} />
          </button>

          {/* Underline (U) */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('underline');
            }}
            title="Underline (Ctrl+U)"
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
              isUnderline ? 'bg-white/20 text-white' : 'hover:bg-white/10'
            }`}
          >
            <FormatUnderlinedRoundedIcon sx={{ fontSize: 18 }} />
          </button>

          {/* Strikethrough (ab) */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('strikeThrough');
            }}
            title="Strikethrough"
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
              isStrikethrough ? 'bg-white/20 text-white' : 'hover:bg-white/10'
            }`}
          >
            <FormatStrikethroughRoundedIcon sx={{ fontSize: 18 }} />
          </button>

          {/* Bulleted list */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand('insertUnorderedList');
            }}
            title="Bulleted List"
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
              isList ? 'bg-white/20 text-white' : 'hover:bg-white/10'
            }`}
          >
            <FormatListBulletedRoundedIcon sx={{ fontSize: 18 }} />
          </button>

          {/* Add Image */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              fileInputRef.current?.click();
            }}
            title="Add Image"
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ImageOutlinedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Resizing grip handle at bottom-right */}
        <div
          onPointerDown={handleResizePointerDown}
          title="Resize note"
          className="w-4 h-4 flex items-end justify-end cursor-nwse-resize p-0.5 opacity-40 hover:opacity-100 transition-opacity"
        >
          <svg viewBox="0 0 6 6" className="w-2.5 h-2.5 fill-current">
            <circle cx="5" cy="5" r="0.75" />
            <circle cx="2.5" cy="5" r="0.75" />
            <circle cx="5" cy="2.5" r="0.75" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StickyNoteCard;

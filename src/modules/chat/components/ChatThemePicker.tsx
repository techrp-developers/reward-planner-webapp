// src/modules/chat/components/ChatThemePicker.tsx
import React from 'react';
import { Check, Crown, Palette, X } from 'lucide-react';
import { CHAT_THEMES, ChatTheme, ChatThemeId } from '../chatThemes';

interface ChatThemePickerProps {
  activeThemeId: ChatThemeId;
  onSelectTheme: (id: ChatThemeId) => void;
  onClose: () => void;
}

// Miniature chat window drawn from the theme's own colours
const ThemePreview = ({ theme }: { theme: ChatTheme }) => {
  const vars = theme.vars;

  return (
    <div className="flex h-28 w-full overflow-hidden" style={{ background: vars['--ct-bg'] }}>
      <div className="w-3 shrink-0" style={{ background: vars['--ct-rail'] }} />
      <div
        className="w-1/3 shrink-0 p-2 space-y-1.5 border-r"
        style={{ background: vars['--ct-surface'], borderColor: vars['--ct-border'] }}
      >
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center space-x-1">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: row === 0 ? vars['--ct-accent'] : vars['--ct-surface-2'] }}
            />
            <span className="h-1 flex-1 rounded-full" style={{ background: vars['--ct-text-3'] }} />
          </div>
        ))}
      </div>
      <div className="flex-1 p-2 flex flex-col justify-end space-y-1.5" style={{ background: vars['--ct-wallpaper'] }}>
        <span className="h-3.5 w-3/5 rounded-md shadow-2xs" style={{ background: vars['--ct-bubble-in'] }} />
        <span className="h-3.5 w-3/5 rounded-md self-end shadow-2xs" style={{ background: vars['--ct-bubble-out'] }} />
        <span className="h-3.5 w-2/5 rounded-md shadow-2xs" style={{ background: vars['--ct-bubble-in'] }} />
        <div className="flex items-center space-x-1 pt-0.5">
          <span className="h-3 flex-1 rounded-full" style={{ background: vars['--ct-surface'] }} />
          <span className="w-3 h-3 rounded-full" style={{ background: vars['--ct-accent'] }} />
        </div>
      </div>
    </div>
  );
};

export const ChatThemePicker: React.FC<ChatThemePickerProps> = ({ activeThemeId, onSelectTheme, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn select-none font-['Segoe_UI',Helvetica,Arial,sans-serif]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">Chat templates</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template grid */}
        <div className="p-5 overflow-y-auto chat-custom-scroll">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {CHAT_THEMES.map((theme) => {
              const isActive = theme.id === activeThemeId;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectTheme(theme.id)}
                  aria-pressed={isActive}
                  className={`relative text-left rounded-xl overflow-hidden border-2 transition cursor-pointer hover:shadow-md ${
                    isActive ? 'border-[#4F46E5]' : 'border-[#E2E8F0]'
                  }`}
                >
                  <ThemePreview theme={theme} />

                  {theme.premium && (
                    <span className="absolute top-2 right-2 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-black/60 text-amber-100 text-[10px] font-bold">
                      <Crown className="w-3 h-3" />
                      <span>Premium</span>
                    </span>
                  )}

                  <div className="px-3 py-2.5 flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold text-[#0F172A] truncate">{theme.name}</span>
                      <span className="block text-[11.5px] text-[#64748B] truncate">{theme.description}</span>
                    </div>
                    {isActive && (
                      <span className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatThemePicker;

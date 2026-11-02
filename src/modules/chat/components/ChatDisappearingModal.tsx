import React, { useState, useEffect } from 'react';
import { X, Clock, ShieldCheck, Check } from 'lucide-react';
import { DisappearingTimer } from '../chatTypes';

interface ChatDisappearingModalProps {
  currentTimer?: DisappearingTimer;
  conversationName: string;
  isOpen: boolean;
  onClose: () => void;
  onApply: (timer: DisappearingTimer) => void;
}

const TIMER_OPTIONS: { id: DisappearingTimer; label: string; desc: string }[] = [
  { id: '24_hours', label: '24 hours', desc: 'Messages disappear 1 day after being sent' },
  { id: '7_days', label: '7 days', desc: 'Messages disappear 1 week after being sent' },
  { id: '90_days', label: '90 days', desc: 'Messages disappear ~3 months after being sent' },
  { id: 'off', label: 'Off', desc: 'Messages will stay in this chat unless deleted' },
];

export const ChatDisappearingModal: React.FC<ChatDisappearingModalProps> = ({
  currentTimer = 'off',
  conversationName,
  isOpen,
  onClose,
  onApply,
}) => {
  const [selectedTimer, setSelectedTimer] = useState<DisappearingTimer>(currentTimer);

  useEffect(() => {
    setSelectedTimer(currentTimer);
  }, [currentTimer, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onApply(selectedTimer);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn select-none font-['Segoe_UI',Helvetica,Arial,sans-serif]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#00A884] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[#0F172A]">Disappearing messages</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto chat-custom-scroll space-y-5">
          {/* Top Banner Graphic */}
          <div className="flex flex-col items-center text-center px-2">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-[#00A884] shadow-xs">
                <Clock className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-emerald-300 flex items-center justify-center text-[#00A884] shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <h4 className="text-[17px] font-semibold text-[#0F172A] mb-1.5">
              Make messages in this chat disappear
            </h4>
            <p className="text-xs text-[#54656F] leading-relaxed max-w-sm">
              For more privacy and storage, all new messages will disappear from this chat for everyone after the selected duration. Anyone in this chat can change this setting.
            </p>
          </div>

          {/* Timer Radio Options */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2 px-1">
              Message timer
            </label>

            {TIMER_OPTIONS.map((opt) => {
              const isSelected = selectedTimer === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedTimer(opt.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/60 border-[#00A884] shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        isSelected
                          ? 'border-[#00A884] bg-[#00A884]'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isSelected ? 'text-[#00A884]' : 'text-[#0F172A]'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{opt.desc}</p>
                    </div>
                  </div>

                  {opt.id !== 'off' && (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      ⏱️ {opt.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#00A884] hover:bg-[#028367] shadow-sm transition cursor-pointer flex items-center space-x-1.5"
          >
            <span>Apply to {conversationName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDisappearingModal;

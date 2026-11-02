// src/modules/chat/components/MessageStatusIcon.tsx
import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import { MessageStatus } from '../chatTypes';

interface MessageStatusIconProps {
  status?: MessageStatus;
  variant?: 'bubble' | 'sidebar';
  className?: string;
}

export const MessageStatusIcon: React.FC<MessageStatusIconProps> = ({
  status = 'sent',
  className = '',
}) => {
  // WhatsApp standard tick colors:
  // Sent / Delivered / Sending: #94A3B8 (crisp grey)
  // Read / Seen: #53BDEB (WhatsApp blue)
  switch (status) {
    case 'sending':
      return (
        <Clock
          className={`w-3.5 h-3.5 shrink-0 text-[#94A3B8] opacity-80 ${className}`}
        />
      );
    case 'sent':
      return (
        <Check
          className={`w-3.5 h-3.5 shrink-0 stroke-[2.2] text-[#94A3B8] ${className}`}
        />
      );
    case 'delivered':
      return (
        <CheckCheck
          className={`w-4 h-4 shrink-0 stroke-[2] text-[#94A3B8] ${className}`}
        />
      );
    case 'read':
      return (
        <CheckCheck
          className={`w-4 h-4 shrink-0 stroke-[2.2] text-[#53bdeb] ${className}`}
        />
      );
    default:
      return (
        <Check
          className={`w-3.5 h-3.5 shrink-0 stroke-[2] text-[#94A3B8] ${className}`}
        />
      );
  }
};

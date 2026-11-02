// src/modules/chat/components/ChatConversation.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Smile,
  Paperclip,
  Mic,
  Send,
  Users,
  Megaphone,
  Check,
  CheckCheck,
  Clock,
  Image as ImageIcon,
  FileText,
  Camera,
  X,
  Volume2,
  Loader2,
  Trash2,
  Ban,
  Download,
  Lock,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react';
import { ChatConversation, ChatMessage, MessageStatus } from '../chatTypes';
import { uploadChatImage, uploadChatDocument } from '../services/chatApi';
import { MessageStatusIcon } from './MessageStatusIcon';

const GroupIcon = ({ className = "w-5 h-5 text-[#4F46E5]" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

interface ChatConversationProps {
  conversation: ChatConversation;
  onBackMobile: () => void;
  onSendMessage: (
    text: string,
    image?: string,
    attachmentData?: { url: string; name: string; mimeType: string; type: string }
  ) => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onOpenInfo: () => void;
  onDeleteMessage?: (messageId: string) => void;
  onOpenDisappearingModal?: () => void;
  onClearMessages?: () => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '🙏', '👏', '🎂', '✨', '🌟', '💡', '🚀', '👋', '💯'];

export const ChatConversationView: React.FC<ChatConversationProps> = ({
  conversation,
  onBackMobile,
  onSendMessage,
  onAudioCall,
  onVideoCall,
  onOpenInfo,
  onDeleteMessage,
  onOpenDisappearingModal,
  onClearMessages,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Auto-scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [conversation.messages.length]);

  // Handle voice recording simulation
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRecordingVoice) {
      timer = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  const handleSend = async () => {
    if (!inputText.trim() && !previewImage && !selectedFile) return;

    if (selectedFile) {
      try {
        setIsUploading(true);
        if (selectedFile.type.startsWith('image/')) {
          const res = await uploadChatImage(selectedFile);
          onSendMessage(
            inputText.trim(),
            res?.attachment_url || previewImage || undefined,
            res
              ? {
                  url: res.attachment_url,
                  name: res.attachment_name,
                  mimeType: res.attachment_mime_type,
                  type: 'image',
                }
              : undefined
          );
        } else {
          const res = await uploadChatDocument(selectedFile);
          onSendMessage(inputText.trim(), undefined, res ? {
            url: res.attachment_url,
            name: res.attachment_name,
            mimeType: res.attachment_mime_type,
            type: 'document'
          } : undefined);
        }
      } catch (err) {
        console.warn('File upload fallback:', err);
        onSendMessage(inputText.trim(), previewImage || undefined);
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
        setPreviewImage(null);
        setInputText('');
      }
      return;
    }

    onSendMessage(inputText.trim(), previewImage || undefined);
    setInputText('');
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowAttachMenu(false);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowAttachMenu(false);
      setInputText((prev) => prev || `Document: ${file.name}`);
    }
  };

  const handleVoiceSend = () => {
    setIsRecordingVoice(false);
    onSendMessage(`🎤 Voice message (${recordSeconds}s)`);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#EFEAE2] relative overflow-hidden select-none font-['Segoe_UI',Helvetica,Arial,sans-serif]">
      
      {/* 1. Conversation Header (WhatsApp Web Light Theme Header) */}
      <header className="h-16 px-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between z-10 select-none shrink-0">
        
        {/* Left: Avatar + Title + Back */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onBackMobile}
            className="p-1.5 -ml-1 text-[#475569] hover:text-[#0F172A] rounded-full hover:bg-[#E2E8F0] transition cursor-pointer"
            aria-label="Back"
            title="Back to Chats"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <div
            onClick={onOpenInfo}
            className="flex items-center space-x-3 cursor-pointer group min-w-0"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              {conversation.avatarIconType === 'image' && conversation.avatar ? (
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-10 h-10 rounded-full object-cover group-hover:opacity-90 transition"
                />
              ) : conversation.isCommunity ? (
                <div
                  style={{ backgroundColor: conversation.avatarBg || '#059669' }}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs group-hover:opacity-90 transition"
                >
                  <Users className="w-5 h-5 text-white" />
                </div>
              ) : conversation.avatarIconType === 'purple_group' ? (
                <div
                  style={{ backgroundColor: conversation.avatarBg || '#f3e8ff' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#9333ea] group-hover:opacity-90 transition"
                >
                  <Users className="w-5 h-5" />
                </div>
              ) : (
                <div
                  style={{ backgroundColor: conversation.avatarBg || '#ffe4cc' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#733d1b] font-bold text-sm group-hover:opacity-90 transition"
                >
                  {conversation.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* WhatsApp Authentic Disappearing Messages Clock Badge on Header Avatar */}
              {conversation.disappearingTimer && conversation.disappearingTimer !== 'off' && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-white border border-[#CBD5E1] shadow-2xs flex items-center justify-center z-10"
                  title={`Disappearing messages: ${conversation.disappearingTimer.replace('_', ' ')}`}
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-[#00A884]">
                    <path d="M8 0a8 8 0 1 0 8 8A8.01 8.01 0 0 0 8 0zm0 14.5A6.5 6.5 0 1 1 14.5 8 6.51 6.51 0 0 1 8 14.5zm.75-10.25h-1.5v4.5l3.5 2.1.75-1.23-2.75-1.62z" />
                  </svg>
                </span>
              )}
            </div>

            {/* Name & Subtitle */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="text-[16px] font-medium text-[#0F172A] truncate">
                  {conversation.name}
                </h2>
                {conversation.isCommunity && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 shrink-0 leading-tight">
                    Community
                  </span>
                )}
                {/* Disappearing messages badge */}
                {conversation.disappearingTimer && conversation.disappearingTimer !== 'off' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDisappearingModal?.();
                    }}
                    title={`Disappearing messages: ${conversation.disappearingTimer.replace('_', ' ')} (Click to change)`}
                    className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-[#00A884] text-[11px] font-semibold border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer shrink-0"
                  >
                    <Clock className="w-3 h-3 stroke-[2.2]" />
                    <span>
                      {conversation.disappearingTimer === '24_hours'
                        ? '24h'
                        : conversation.disappearingTimer === '7_days'
                        ? '7d'
                        : '90d'}
                    </span>
                  </button>
                )}
              </div>
              <p className="text-xs text-[#64748B] truncate">
                {conversation.isCommunity
                  ? `Community • ${conversation.membersCount || conversation.members?.length || 1} members`
                  : conversation.isGroup
                  ? `${conversation.membersCount || conversation.members?.length || 12} members`
                  : conversation.isOnline
                  ? 'online'
                  : 'last seen recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Actions: Call buttons & 3-Dots dropdown */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 text-[#54656F] shrink-0 relative" ref={menuRef}>
          <button
            onClick={onAudioCall}
            aria-label="Audio call"
            title="Audio call"
            className="p-2 rounded-full hover:bg-slate-100 text-[#54656F] hover:text-[#0F172A] transition cursor-pointer"
          >
            <Phone className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            onClick={onVideoCall}
            aria-label="Video call"
            title="Video call"
            className="p-2 rounded-full hover:bg-slate-100 text-[#54656F] hover:text-[#0F172A] transition cursor-pointer"
          >
            <Video className="w-5 h-5 stroke-[1.8]" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="Chat options menu"
              title="More options"
              className="p-2 rounded-full hover:bg-slate-100 text-[#54656F] hover:text-[#0F172A] transition cursor-pointer"
            >
              <MoreVertical className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-11 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn text-[#0F172A] text-sm font-normal">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenInfo();
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center space-x-2.5 transition cursor-pointer"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{conversation.isGroup ? 'Group info' : 'Contact info'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenDisappearingModal?.();
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Clock className="w-4 h-4 text-[#00A884]" />
                    <span className="truncate">Disappearing messages</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#00A884] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 ml-2 shrink-0">
                    {conversation.disappearingTimer && conversation.disappearingTimer !== 'off'
                      ? conversation.disappearingTimer === '24_hours'
                        ? '24h'
                        : conversation.disappearingTimer === '7_days'
                        ? '7d'
                        : '90d'
                      : 'Off'}
                  </span>
                </button>

                <div className="h-px bg-slate-100 my-1" />

                {onClearMessages && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      if (window.confirm('Are you sure you want to clear messages in this chat?')) {
                        onClearMessages();
                      }
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center space-x-2.5 text-slate-700 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-slate-400" />
                    <span>Clear messages</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onBackMobile();
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center space-x-2.5 text-slate-700 transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-400" />
                  <span>Close chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Chat Messages Area (Authentic WhatsApp Light Doodle Wallpaper) */}
      <div className="flex-1 overflow-y-auto chat-custom-scroll p-4 md:p-6 chat-wallpaper-bg flex flex-col justify-between">
        <div className="relative z-1 space-y-3 max-w-4xl w-full mx-auto">
          
          {/* Centered Date Badge (Matching WhatsApp exact pill) */}
          <div className="flex justify-center my-2">
            <span className="bg-white/95 border border-[#E2E8F0]/80 text-[#54656F] text-[12px] font-medium px-3.5 py-1 rounded-lg tracking-wide shadow-2xs">
              Today
            </span>
          </div>

          {/* Yellow End-to-End Encryption Notice Badge (Matching WhatsApp exact amber card) */}
          <div className="flex justify-center my-3">
            <div className="bg-[#FFEECD] border border-[#F5E3B5] rounded-xl py-2 px-4 text-[#54656F] text-xs text-center max-w-md shadow-2xs flex items-center justify-center space-x-1.5 leading-relaxed">
              <Lock className="w-3.5 h-3.5 text-[#54656F] shrink-0" />
              <span>
                Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them. <span className="font-semibold text-[#111B21] cursor-pointer hover:underline">Learn more</span>
              </span>
            </div>
          </div>

          {/* Message Bubbles */}
          {conversation.messages
            .filter((msg) => !msg.expiresAt || msg.expiresAt > Date.now())
            .map((msg, index, arr) => {
              // System Notice Card (e.g. Disappearing messages announcement)
              if (msg.isSystemNotice) {
                return (
                  <div key={msg.id} className="flex justify-center my-2.5">
                    <div
                      onClick={onOpenDisappearingModal}
                      className="bg-white/95 border border-[#E2E8F0] shadow-2xs rounded-xl px-4 py-2 text-xs text-[#54656F] flex items-center space-x-2 max-w-md text-center cursor-pointer hover:bg-white hover:border-emerald-300 transition group"
                      title="Click to configure disappearing messages"
                    >
                      <Clock className="w-4 h-4 text-[#00A884] shrink-0 group-hover:scale-110 transition" />
                      <span className="leading-relaxed">
                        {msg.text}{' '}
                        <span className="text-[#00A884] font-semibold underline underline-offset-2 ml-1">
                          Tap to change
                        </span>
                      </span>
                    </div>
                  </div>
                );
              }

              const isOutgoing = msg.isOutgoing;
              const prevMsg = arr[index - 1];
              const isFirstFromSender = !prevMsg || prevMsg.senderId !== msg.senderId;
              const hasDisappearing = Boolean(
                msg.expiresAt ||
                (conversation.disappearingTimer && conversation.disappearingTimer !== 'off')
              );

              return (
                <div
                  key={msg.id}
                  className={`flex w-full ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                >
                {/* Incoming Message Container */}
                {!isOutgoing && (
                  <div className="flex items-start space-x-2 max-w-[85%] sm:max-w-[70%]">
                    {/* Sender Avatar */}
                    {isFirstFromSender ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5 shadow-2xs border border-white">
                        {msg.senderAvatar ? (
                          <img
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            style={{ backgroundColor: (msg.senderColor || '#4F46E5') + '20', color: msg.senderColor || '#4F46E5' }}
                            className="w-full h-full flex items-center justify-center font-bold text-xs"
                          >
                            {msg.senderName.charAt(0)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 shrink-0" />
                    )}

                    {/* Incoming Bubble (White) */}
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2 border border-[#E2E8F0] shadow-2xs text-[#0F172A] relative">
                      {isFirstFromSender && (
                        <p
                          style={{ color: msg.senderColor || '#4F46E5' }}
                          className="text-xs font-semibold mb-0.5 tracking-tight"
                        >
                          {msg.senderName}
                        </p>
                      )}

                      {/* Text / Deleted message */}
                      {msg.text && (
                        <p
                          className={`text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.text === 'This message was deleted'
                              ? 'italic text-[#64748B] flex items-center space-x-1.5'
                              : 'text-[#0F172A]'
                          }`}
                        >
                          {msg.text === 'This message was deleted' && (
                            <Ban className="w-3.5 h-3.5 mr-1 inline opacity-70" />
                          )}
                          <span>{msg.text}</span>
                        </p>
                      )}

                      {/* Attached Document */}
                      {msg.attachmentUrl && (
                        <a
                          href={msg.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-2.5 my-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition border border-[#CBD5E1] text-decoration-none group/doc"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#53BDEB]/20 text-[#0284c7] flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#0F172A] truncate group-hover/doc:underline">
                              {msg.attachmentName || 'Document attachment'}
                            </p>
                            <span className="text-[10px] text-[#64748B]">Click to view</span>
                          </div>
                          <Download className="w-4 h-4 text-[#64748B] group-hover/doc:text-[#0F172A] shrink-0" />
                        </a>
                      )}

                      {/* Attached Image */}
                      {msg.image && (
                        <div
                          onClick={() => setLightboxImage(msg.image || null)}
                          className="rounded-xl overflow-hidden shadow-2xs cursor-pointer hover:opacity-95 transition mt-1 mb-1 border border-[#E2E8F0]"
                        >
                          <img
                            src={msg.image}
                            alt={msg.imageCaption || 'Attached Image'}
                            className="w-full max-w-md h-auto object-cover rounded-xl"
                          />
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="flex justify-end items-center space-x-1 mt-1 text-[10px] text-[#64748B]">
                        <span>{msg.time}</span>
                        {hasDisappearing && (
                          <Clock className="w-2.5 h-2.5 text-[#54656F]/80 inline" title="Disappearing message" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Outgoing Message Container (WhatsApp Soft Mint Green Bubble #D9FDD3) */}
                {isOutgoing && (
                  <div className="group relative max-w-[85%] sm:max-w-[72%] bg-[#D9FDD3] rounded-2xl rounded-tr-sm px-3.5 py-2 border border-[#C7E9C0] shadow-2xs text-[#111B21]">
                    {/* Delete button on hover */}
                    {onDeleteMessage && msg.text !== 'This message was deleted' && (
                      <button
                        onClick={() => onDeleteMessage(msg.id)}
                        title="Delete message"
                        className="absolute -left-7 top-2 opacity-0 group-hover:opacity-100 transition p-1 rounded-full text-[#64748B] hover:text-red-500 hover:bg-white/80 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Text / Caption */}
                    {msg.text && (
                      <p
                        className={`text-sm leading-relaxed whitespace-pre-wrap mb-0.5 ${
                          msg.text === 'This message was deleted'
                            ? 'italic text-[#64748B] flex items-center space-x-1'
                            : 'text-[#0F172A]'
                        }`}
                      >
                        {msg.text === 'This message was deleted' && (
                          <Ban className="w-3.5 h-3.5 mr-1 inline opacity-70" />
                        )}
                        <span>{msg.text}</span>
                      </p>
                    )}

                    {/* Attached Document */}
                    {msg.attachmentUrl && (
                      <a
                        href={msg.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-2.5 my-1 bg-white/70 hover:bg-white rounded-xl transition border border-[#C7D2FE] text-decoration-none group/doc"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/20 text-[#4F46E5] flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#0F172A] truncate group-hover/doc:underline">
                            {msg.attachmentName || 'Document attachment'}
                          </p>
                          <span className="text-[10px] text-[#64748B]">Click to view</span>
                        </div>
                        <Download className="w-4 h-4 text-[#64748B] group-hover/doc:text-[#0F172A] shrink-0" />
                      </a>
                    )}

                    {/* Image Card */}
                    {msg.image && (
                      <div
                        onClick={() => setLightboxImage(msg.image || null)}
                        className="rounded-xl overflow-hidden shadow-2xs cursor-pointer hover:opacity-95 transition mt-1 mb-1 border border-[#C7D2FE]"
                      >
                        <img
                          src={msg.image}
                          alt={msg.imageCaption || 'Attached Image'}
                          className="w-full max-w-md h-auto object-cover rounded-xl"
                        />
                      </div>
                    )}

                    {/* Time & Blue Checkmark Status Icon */}
                    <div className="flex justify-end items-center space-x-1 mt-0.5 text-[10px] text-[#64748B]">
                      <span>{msg.time}</span>
                      {hasDisappearing && (
                        <Clock className="w-2.5 h-2.5 text-[#54656F]/80 inline" title="Disappearing message" />
                      )}
                      {msg.text !== 'This message was deleted' && (
                        <MessageStatusIcon status={msg.status} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Image Preview Bar before sending */}
      {previewImage && (
        <div className="p-3 bg-[#F1F5F9] border-t border-[#CBD5E1] flex items-center justify-between z-10 animate-fadeIn text-[#0F172A]">
          <div className="flex items-center space-x-3">
            <img
              src={previewImage}
              alt="Preview"
              className="w-14 h-14 object-cover rounded-xl border border-[#CBD5E1]"
            />
            <div>
              <p className="text-xs font-semibold text-[#0F172A]">Image attached</p>
              <p className="text-[11px] text-[#64748B]">Ready to send with your message</p>
            </div>
          </div>
          <button
            onClick={() => setPreviewImage(null)}
            className="p-1.5 text-[#475569] hover:text-red-500 rounded-full hover:bg-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 3. Bottom Input Bar (WhatsApp Light Theme with Signature Green Action Button) */}
      <footer className="p-2 sm:p-2.5 bg-[#F0F2F5] border-t border-[#E2E8F0] z-10 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center space-x-2 relative">
          
          {/* Quick Emoji Picker Popover */}
          {showEmojiPicker && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowEmojiPicker(false)} />
              <div className="absolute left-0 bottom-14 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2.5 z-40 flex flex-wrap gap-2 max-w-xs animate-fadeIn text-[#0F172A]">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setInputText((prev) => prev + emoji);
                    }}
                    className="text-xl p-1.5 hover:bg-[#F1F5F9] rounded-xl transition cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Attachment Menu Popover */}
          {showAttachMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowAttachMenu(false)} />
              <div className="absolute left-10 bottom-14 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-40 flex flex-col space-y-1 w-44 animate-fadeIn text-[#0F172A]">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-[#F1F5F9] text-[#00A884] text-xs font-semibold transition cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Photos & Videos</span>
                </button>
                <button
                  onClick={() => docInputRef.current?.click()}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-[#F1F5F9] text-[#0284c7] text-xs font-semibold transition cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Document</span>
                </button>
                <button
                  onClick={() => {
                    setShowAttachMenu(false);
                    onSendMessage("📸 Sent from Camera");
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-[#F1F5F9] text-pink-600 text-xs font-semibold transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Camera</span>
                </button>
              </div>
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={docInputRef}
            onChange={handleDocChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            className="hidden"
          />

          {/* Emoji Toggle Button (😊) */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emoji"
            className="p-2 text-[#54656F] hover:text-[#111B21] rounded-full hover:bg-black/5 transition cursor-pointer"
          >
            <Smile className="w-5 h-5 stroke-[2]" />
          </button>

          {/* Paperclip Attachment Button (📎) */}
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            title="Attach"
            className="p-2 text-[#54656F] hover:text-[#111B21] rounded-full hover:bg-black/5 transition cursor-pointer"
          >
            <Paperclip className="w-5 h-5 stroke-[2]" />
          </button>

          {/* White Capsule Message Input Field */}
          <div className="flex-1 relative">
            {isRecordingVoice ? (
              <div className="w-full h-10 px-4 rounded-full bg-red-50 border border-red-200 flex items-center justify-between text-red-600 text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span>Recording Voice Note... ({recordSeconds}s)</span>
                </div>
                <button
                  onClick={() => setIsRecordingVoice(false)}
                  className="text-gray-500 hover:text-red-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message"
                disabled={isUploading}
                className="w-full h-10 px-4 rounded-full bg-white text-sm text-[#111B21] placeholder-[#8696A0] border border-[#E2E8F0] focus:outline-none focus:border-[#00A884] focus:ring-2 focus:ring-[#00A884]/20 transition disabled:opacity-50 shadow-2xs"
              />
            )}
          </div>

          {/* WhatsApp Signature Green Action Button (#00A884) */}
          {inputText.trim() || previewImage || selectedFile ? (
            <button
              onClick={handleSend}
              disabled={isUploading}
              title="Send Message"
              className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-sm transform active:scale-95 transition cursor-pointer shrink-0 font-bold disabled:opacity-70"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <Send className="w-4.5 h-4.5 translate-x-0.5" />
              )}
            </button>
          ) : isRecordingVoice ? (
            <button
              onClick={handleVoiceSend}
              title="Send Voice Note"
              className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-sm transform active:scale-95 transition cursor-pointer shrink-0 font-bold"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecordingVoice(true)}
              title="Record voice note"
              className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-sm transform active:scale-95 transition cursor-pointer shrink-0"
            >
              <Mic className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}

        </div>
      </footer>

      {/* Lightbox Modal for Full View Images */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Full size view"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatConversationView;

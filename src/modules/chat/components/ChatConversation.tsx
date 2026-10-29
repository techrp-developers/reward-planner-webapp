// src/modules/chat/components/ChatConversation.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Smile,
  Paperclip,
  Mic,
  Send,
  Users,
  Megaphone,
  Check,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Camera,
  X,
  Volume2
} from 'lucide-react';
import { ChatConversation, ChatMessage } from '../chatTypes';

const GroupIcon = ({ className = "w-5 h-5 text-[#008069]" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

interface ChatConversationProps {
  conversation: ChatConversation;
  onBackMobile: () => void;
  onSendMessage: (text: string, image?: string) => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onOpenInfo: () => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '🙏', '👏', '🎂', '✨', '🌟', '💡', '🚀', '👋', '💯'];

export const ChatConversationView: React.FC<ChatConversationProps> = ({
  conversation,
  onBackMobile,
  onSendMessage,
  onAudioCall,
  onVideoCall,
  onOpenInfo,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSend = () => {
    if (!inputText.trim() && !previewImage) return;
    onSendMessage(inputText.trim(), previewImage || undefined);
    setInputText('');
    setPreviewImage(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
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
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
        setShowAttachMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceSend = () => {
    setIsRecordingVoice(false);
    onSendMessage(`🎤 Voice message (${recordSeconds}s)`);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0B141A] relative overflow-hidden select-none">
      
      {/* 1. Conversation Header */}
      <header className="h-16 px-4 bg-[#202C33] border-b border-[#202C33] flex items-center justify-between z-10 select-none">
        
        {/* Left: Avatar + Title + Back */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onBackMobile}
            className="p-1.5 -ml-1 text-[#8696A0] hover:text-[#E9EDEF] rounded-full hover:bg-[#2A3942] transition cursor-pointer"
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
              ) : conversation.avatarIconType === 'purple_group' ? (
                <div
                  style={{ backgroundColor: conversation.avatarBg || '#381E2B' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#E879F9] group-hover:opacity-90 transition"
                >
                  <Users className="w-5 h-5" />
                </div>
              ) : conversation.avatarIconType === 'megaphone' ? (
                <div
                  style={{ backgroundColor: conversation.avatarBg || '#0F382E' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#00A884] group-hover:opacity-90 transition"
                >
                  <Megaphone className="w-5 h-5 stroke-[1.8]" />
                </div>
              ) : (
                <div
                  style={{ backgroundColor: conversation.avatarBg || '#0F382E' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#00A884] group-hover:opacity-90 transition"
                >
                  <GroupIcon className="w-5 h-5 text-[#00A884]" />
                </div>
              )}
            </div>

            {/* Name & Subtitle */}
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[#E9EDEF] truncate group-hover:text-[#00A884] transition">
                {conversation.name}
              </h2>
              <p className="text-xs text-[#8696A0] truncate">
                {conversation.isGroup
                  ? `${conversation.membersCount || conversation.members?.length || 12} members`
                  : conversation.isOnline
                  ? 'online'
                  : 'last seen recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Audio Call, Video Call, Menu Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Audio Call */}
          <button
            onClick={onAudioCall}
            title="Audio Call"
            className="w-9 h-9 rounded-full hover:bg-[#2A3942] text-[#8696A0] hover:text-[#E9EDEF] flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <Phone className="w-4.5 h-4.5 stroke-[1.8]" />
          </button>

          {/* Video Call */}
          <button
            onClick={onVideoCall}
            title="Video Call"
            className="w-9 h-9 rounded-full hover:bg-[#2A3942] text-[#8696A0] hover:text-[#E9EDEF] flex items-center justify-center transition active:scale-95 cursor-pointer"
          >
            <Video className="w-4.5 h-4.5 stroke-[1.8]" />
          </button>

          {/* Three-dots Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              title="More options"
              className="w-9 h-9 rounded-full hover:bg-[#2A3942] text-[#8696A0] hover:text-[#E9EDEF] flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <MoreVertical className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-12 w-48 bg-[#202C33] rounded-xl shadow-2xl border border-gray-700 py-1.5 z-50 animate-fadeIn text-sm text-[#E9EDEF]">
                  <button
                    onClick={() => { setMenuOpen(false); onOpenInfo(); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#2A3942] flex items-center space-x-2 cursor-pointer"
                  >
                    <span>{conversation.isGroup ? 'Group info' : 'Contact info'}</span>
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onAudioCall(); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#2A3942] flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Voice call</span>
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onVideoCall(); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#2A3942] flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Video call</span>
                  </button>
                  <div className="h-px bg-gray-700 my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-[#2A3942] text-[#8696A0] cursor-pointer"
                  >
                    <span>Mute notifications</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </header>

      {/* 2. Chat Messages Area (Dark Wallpaper) */}
      <div className="flex-1 overflow-y-auto chat-custom-scroll p-4 md:p-6 chat-wallpaper-dark flex flex-col justify-between">
        <div className="relative z-1 space-y-3.5 max-w-4xl w-full mx-auto">
          
          {/* Centered Date Badge */}
          <div className="flex justify-center my-2">
            <span className="bg-[#182229] border border-white/5 text-[#8696A0] text-[11px] font-medium px-3 py-1 rounded-lg uppercase tracking-wide">
              Today
            </span>
          </div>

          {/* Message Bubbles */}
          {conversation.messages.map((msg, index) => {
            const isOutgoing = msg.isOutgoing;
            const prevMsg = conversation.messages[index - 1];
            const isFirstFromSender = !prevMsg || prevMsg.senderId !== msg.senderId;

            return (
              <div
                key={msg.id}
                className={`flex w-full ${isOutgoing ? 'justify-end' : 'justify-start'}`}
              >
                {/* Incoming Message Container */}
                {!isOutgoing && (
                  <div className="flex items-start space-x-2.5 max-w-[85%] sm:max-w-[70%]">
                    {/* Sender Avatar (only show on first message of cluster or always for visual clarity) */}
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
                            style={{ backgroundColor: (msg.senderColor || '#00875A') + '20', color: msg.senderColor || '#00875A' }}
                            className="w-full h-full flex items-center justify-center font-bold text-xs"
                          >
                            {msg.senderName.charAt(0)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 shrink-0" />
                    )}

                    {/* Bubble Card */}
                    <div className="bg-[#202C33] rounded-2xl px-3.5 py-2 shadow-xs border border-white/5 text-[#E9EDEF]">
                      {isFirstFromSender && (
                        <p
                          style={{ color: msg.senderColor || '#00A884' }}
                          className="text-xs font-bold mb-0.5 tracking-tight"
                        >
                          {msg.senderName}
                        </p>
                      )}

                      {/* Text */}
                      {msg.text && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      )}

                      {/* Timestamp */}
                      <div className="flex justify-end items-center space-x-1 mt-1 text-[10px] text-[#8696A0]">
                        <span>{msg.time}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Outgoing Message Container */}
                {isOutgoing && (
                  <div className="max-w-[85%] sm:max-w-[72%] bg-[#005C4B] rounded-2xl px-3.5 py-2 shadow-xs border border-white/5 text-[#E9EDEF]">
                    {/* Text / Caption */}
                    {msg.text && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap mb-1">
                        {msg.text}
                      </p>
                    )}

                    {/* Image Card (e.g. Festive Celebration banner) */}
                    {msg.image && (
                      <div
                        onClick={() => setLightboxImage(msg.image || null)}
                        className="rounded-xl overflow-hidden shadow-2xs cursor-pointer hover:opacity-95 transition mt-1 mb-1 border border-white/10"
                      >
                        <img
                          src={msg.image}
                          alt={msg.imageCaption || 'Attached Image'}
                          className="w-full max-w-md h-auto object-cover rounded-xl"
                        />
                      </div>
                    )}

                    {/* Time & Double Checkmarks */}
                    <div className="flex justify-end items-center space-x-1.5 mt-0.5 text-[10px] text-[#8696A0]">
                      <span>{msg.time}</span>
                      <CheckCheck className="w-4 h-4 text-[#53BDEB] stroke-[2.2]" />
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
        <div className="p-3 bg-[#202C33] border-t border-[#202C33] flex items-center justify-between z-10 animate-fadeIn text-[#E9EDEF]">
          <div className="flex items-center space-x-3">
            <img
              src={previewImage}
              alt="Preview"
              className="w-14 h-14 object-cover rounded-xl border border-gray-700"
            />
            <div>
              <p className="text-xs font-semibold text-[#E9EDEF]">Image attached</p>
              <p className="text-[11px] text-[#8696A0]">Ready to send with your message</p>
            </div>
          </div>
          <button
            onClick={() => setPreviewImage(null)}
            className="p-1.5 text-[#8696A0] hover:text-red-400 rounded-full hover:bg-[#2A3942] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 3. Bottom Input Bar */}
      <footer className="p-2 sm:p-3 bg-[#202C33] border-t border-[#202C33] z-10">
        <div className="max-w-4xl mx-auto flex items-center space-x-2 relative">
          
          {/* Quick Emoji Picker Popover */}
          {showEmojiPicker && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowEmojiPicker(false)} />
              <div className="absolute left-0 bottom-14 bg-[#202C33] rounded-2xl shadow-2xl border border-gray-700 p-2.5 z-40 flex flex-wrap gap-2 max-w-xs animate-fadeIn text-[#E9EDEF]">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setInputText((prev) => prev + emoji);
                    }}
                    className="text-xl p-1.5 hover:bg-[#2A3942] rounded-xl transition cursor-pointer"
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
              <div className="absolute left-10 bottom-14 bg-[#202C33] rounded-2xl shadow-2xl border border-gray-700 p-2 z-40 flex flex-col space-y-1 w-44 animate-fadeIn text-[#E9EDEF]">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-[#2A3942] text-[#00A884] text-xs font-semibold transition cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Photos & Videos</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-[#2A3942] text-[#53BDEB] text-xs font-semibold transition cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Document</span>
                </button>
                <button
                  onClick={() => {
                    setShowAttachMenu(false);
                    onSendMessage("📸 Sent from Camera");
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-[#2A3942] text-pink-400 text-xs font-semibold transition cursor-pointer"
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

          {/* Emoji Toggle Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emoji"
            className="p-2 text-[#8696A0] hover:text-[#E9EDEF] rounded-full hover:bg-[#2A3942] transition cursor-pointer"
          >
            <Smile className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* Paperclip Attachment Button */}
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            title="Attach"
            className="p-2 text-[#8696A0] hover:text-[#E9EDEF] rounded-full hover:bg-[#2A3942] transition cursor-pointer"
          >
            <Paperclip className="w-6 h-6 stroke-[1.8]" />
          </button>

          {/* Message Input Pill or Voice recording indicator */}
          <div className="flex-1 relative">
            {isRecordingVoice ? (
              <div className="w-full h-10 px-4 rounded-full bg-red-950/40 border border-red-800/60 flex items-center justify-between text-red-400 text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span>Recording Voice Note... ({recordSeconds}s)</span>
                </div>
                <button
                  onClick={() => setIsRecordingVoice(false)}
                  className="text-gray-400 hover:text-red-300 cursor-pointer"
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
                placeholder="Type a message..."
                className="w-full h-10 px-4 rounded-full bg-[#2A3942] hover:bg-[#374248] focus:bg-[#2A3942] text-sm text-[#E9EDEF] placeholder-[#8696A0] focus:outline-none focus:ring-1 focus:ring-[#00A884] transition"
              />
            )}
          </div>

          {/* Send / Mic Circular Button */}
          {inputText.trim() || previewImage ? (
            <button
              onClick={handleSend}
              title="Send Message"
              className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#009272] text-[#111B21] flex items-center justify-center shadow-md transform active:scale-95 transition cursor-pointer shrink-0 font-bold"
            >
              <Send className="w-4.5 h-4.5 translate-x-0.5" />
            </button>
          ) : isRecordingVoice ? (
            <button
              onClick={handleVoiceSend}
              title="Send Voice Note"
              className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#009272] text-[#111B21] flex items-center justify-center shadow-md transform active:scale-95 transition cursor-pointer shrink-0 font-bold"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          ) : (
            <button
              onClick={() => setIsRecordingVoice(true)}
              title="Record voice note"
              className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#009272] text-[#111B21] flex items-center justify-center shadow-md transform active:scale-95 transition cursor-pointer shrink-0 font-bold"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

        </div>
      </footer>

      {/* Lightbox Modal for Full View Images */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn"
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

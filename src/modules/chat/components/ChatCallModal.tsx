// src/modules/chat/components/ChatCallModal.tsx
import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX, Maximize2, Users } from 'lucide-react';
import { ActiveCallState } from '../chatTypes';

interface ChatCallModalProps {
  callState: ActiveCallState | null;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
}

export const ChatCallModal: React.FC<ChatCallModalProps> = ({
  callState,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!callState) {
      setSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  if (!callState) return null;

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isVideo = callState.type === 'video';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-4">
      <div className="relative w-full max-w-lg bg-[#111B21] text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-between min-h-[500px] p-6 border border-white/10">
        
        {/* Top bar info */}
        <div className="w-full flex items-center justify-between text-gray-400 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="uppercase tracking-wider font-semibold text-emerald-400">
              WhatsApp {isVideo ? 'Video' : 'Voice'} Call
            </span>
          </div>
          <span className="bg-white/10 px-2.5 py-0.5 rounded-full font-mono text-gray-200">
            {formatTime(seconds)}
          </span>
        </div>

        {/* Center content */}
        <div className="flex flex-col items-center my-auto">
          {/* Avatar with Ring Animation */}
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-[#2A3942] flex items-center justify-center ring-4 ring-emerald-500/50 shadow-2xl ring-pulse-animation">
              {callState.avatar ? (
                <img
                  src={callState.avatar}
                  alt={callState.conversationName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-14 h-14 text-emerald-400" />
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1.5 text-center">
            {callState.conversationName}
          </h2>
          <p className="text-sm text-emerald-400 font-medium">
            {seconds < 3 ? 'Ringing...' : 'Connected • End-to-end encrypted'}
          </p>

          {/* Sound wave visualizer when connected */}
          {seconds >= 3 && (
            <div className="flex items-center space-x-1 mt-4 h-6">
              <span className="w-1 bg-emerald-400 rounded-full wave-bar" />
              <span className="w-1 bg-emerald-400 rounded-full wave-bar" />
              <span className="w-1 bg-emerald-400 rounded-full wave-bar" />
              <span className="w-1 bg-emerald-400 rounded-full wave-bar" />
              <span className="w-1 bg-emerald-400 rounded-full wave-bar" />
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="w-full max-w-sm flex items-center justify-around pt-6 border-t border-white/10">
          {/* Mute button */}
          <button
            onClick={onToggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
              callState.isMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={callState.isMuted ? 'Unmute' : 'Mute'}
          >
            {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle button */}
          <button
            onClick={onToggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
              callState.isVideoOff
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={callState.isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
          >
            {callState.isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Speaker button */}
          <button
            onClick={onToggleSpeaker}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition cursor-pointer ${
              callState.isSpeakerOn
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title={callState.isSpeakerOn ? 'Speakerphone On' : 'Speakerphone Off'}
          >
            {callState.isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-[#EA4335] hover:bg-red-600 text-white flex items-center justify-center shadow-lg transform active:scale-95 transition cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ChatCallModal;

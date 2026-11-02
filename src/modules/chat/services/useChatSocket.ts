// src/modules/chat/services/useChatSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { getChatWsUrl, BackendMessage } from './chatApi';

interface UseChatSocketProps {
  onNewMessage?: (message: BackendMessage) => void;
  onMessageRead?: (data: { conversation_id: number; message_id: number; user_id: number }) => void;
  onPresenceChange?: (data: { user_id: number; online: boolean; last_seen_at?: string }) => void;
  onConversationAvailable?: (conversationId: number) => void;
  onMessageDeleted?: (data: { message_id: number; conversation_id: number }) => void;
}

export function useChatSocket({
  onNewMessage,
  onMessageRead,
  onPresenceChange,
  onConversationAvailable,
  onMessageDeleted,
}: UseChatSocketProps = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<number>>(new Set());
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectAttemptsRef = useRef(0);

  const callbacksRef = useRef({
    onNewMessage,
    onMessageRead,
    onPresenceChange,
    onConversationAvailable,
    onMessageDeleted,
  });

  useEffect(() => {
    callbacksRef.current = {
      onNewMessage,
      onMessageRead,
      onPresenceChange,
      onConversationAvailable,
      onMessageDeleted,
    };
  });

  const connect = useCallback(() => {
    // If failed repeatedly (e.g. websocket not open on live proxy), stop reconnect loop
    if (connectAttemptsRef.current >= 3) {
      return;
    }

    try {
      const url = getChatWsUrl();
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        connectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type, data } = payload;

          if (type === 'connected') {
            if (Array.isArray(data?.online_user_ids)) {
              setOnlineUserIds(new Set(data.online_user_ids.map(Number)));
            }
          } else if (type === 'presence') {
            if (data?.user_id) {
              setOnlineUserIds((prev) => {
                const next = new Set(prev);
                if (data.online) {
                  next.add(Number(data.user_id));
                } else {
                  next.delete(Number(data.user_id));
                }
                return next;
              });
              callbacksRef.current.onPresenceChange?.(data);
            }
          } else if (type === 'message:new') {
            callbacksRef.current.onNewMessage?.(data);
          } else if (type === 'message:read') {
            callbacksRef.current.onMessageRead?.(data);
          } else if (type === 'conversation:available') {
            callbacksRef.current.onConversationAvailable?.(Number(data?.conversation_id));
          } else if (type === 'message:deleted') {
            callbacksRef.current.onMessageDeleted?.(data);
          }
        } catch (e) {
          console.error('[ChatSocket] Message parse error:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        connectAttemptsRef.current += 1;
        if (connectAttemptsRef.current < 3 && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connect();
          }, 8000);
        }
      };

      ws.onerror = () => {
        try {
          ws.close();
        } catch {}
      };
    } catch {}
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendWs = useCallback((payload: Record<string, any>) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);

  const sendWsMessage = useCallback(
    (
      conversationId: number | string,
      body: string,
      options: {
        messageType?: string;
        attachmentUrl?: string;
        attachmentName?: string;
        attachmentMimeType?: string;
        clientMessageId?: string;
        replyToMessageId?: number;
      } = {}
    ) => {
      return sendWs({
        type: 'message:send',
        conversation_id: Number(conversationId),
        client_message_id: options.clientMessageId || `client-${Date.now()}`,
        message_type: options.messageType || 'text',
        body: body || '',
        attachment_url: options.attachmentUrl,
        attachment_name: options.attachmentName,
        attachment_mime_type: options.attachmentMimeType,
        reply_to_message_id: options.replyToMessageId,
      });
    },
    [sendWs]
  );

  const sendWsRead = useCallback(
    (conversationId: number | string, messageId: number | string) => {
      return sendWs({
        type: 'message:read',
        conversation_id: Number(conversationId),
        message_id: Number(messageId),
      });
    },
    [sendWs]
  );

  const sendWsTyping = useCallback(
    (conversationId: number | string, isTyping: boolean) => {
      return sendWs({
        type: isTyping ? 'typing:start' : 'typing:stop',
        conversation_id: Number(conversationId),
      });
    },
    [sendWs]
  );

  return {
    isConnected,
    onlineUserIds,
    sendWsMessage,
    sendWsRead,
    sendWsTyping,
  };
}

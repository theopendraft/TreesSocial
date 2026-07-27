import { useState, useEffect } from "react";
import { chatAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { connectSocket, getSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "file";
  isPinned?: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned: boolean;
  pinnedMessages: ChatMessage[];
  // Whether the conversation is approved (for message requests flow)
  isApproved?: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

export const useChat = (chatType?: "arcade" | "trees") => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helpers to normalize and compare IDs
  const getId = (obj: any): string => String(obj?.id || obj?._id || "");
  const normalizeChat = (c: any): Chat => ({
    id: String(c?.id || c?._id || c?.chatId || ""),
    participants: c?.participants || [],
    lastMessage: c?.lastMessage,
    unreadCount: Number(c?.unreadCount || 0),
    isPinned: !!c?.isPinned,
    pinnedMessages: c?.pinnedMessages || [],
    isApproved: typeof c?.isApproved === "boolean" ? c.isApproved : undefined,
  });

  // Load data on mount
  useEffect(() => {
    // Only load chats if user is authenticated
    if (!user) {
      return;
    }
    
    loadChats();
    const socket = connectSocket();
    const onNewMessage = (payload: any) => {
      const msg = payload?.message || payload;
      // Normalize fields
      const normalized: ChatMessage = {
        id: (msg._id || msg.id) as string,
        chatId: (msg.chatId || payload.chatId) as string,
        senderId:
          typeof msg.senderId === "object"
            ? (msg.senderId._id as string)
            : (msg.senderId as string),
        content: msg.content,
        timestamp: msg.createdAt || new Date().toISOString(),
        type: (msg.messageType as any) || "text",
        isPinned: !!msg.isPinned,
      };
      handleNewMessage(normalized);
    };
    socket.on("new_message", onNewMessage);
    // Listen for global chat read events to sync unread across hook instances
    const onChatRead = (e: any) => {
      const cid = String(e?.detail?.chatId || "");
      if (!cid) return;
      setChats((prev) =>
        prev.map((chat) =>
          getId(chat) === cid ? { ...chat, unreadCount: 0 } : chat
        )
      );
    };
    window.addEventListener("chatRead", onChatRead as EventListener);
    return () => {
      const s = getSocket();
      s.off("new_message", onNewMessage);
      window.removeEventListener("chatRead", onChatRead as EventListener);
    };
  }, [user]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await chatAPI.getChats(chatType);
      if (response.success && response.data) {
        const normalized = (response.data as any[]).map(normalizeChat);
        setChats(normalized);
        // Emit global badge update based on loaded chats
        try {
          const totalUnread = normalized.reduce(
            (sum, c) => sum + Number(c.unreadCount || 0),
            0
          );
          const chatsWithUnread = normalized.reduce(
            (sum, c) => sum + (Number(c.unreadCount || 0) > 0 ? 1 : 0),
            0
          );
          window.dispatchEvent(
            new CustomEvent("treesh:messages-badge-set", {
              detail: { total: totalUnread, chatsCount: chatsWithUnread },
            })
          );
        } catch {}
      }
    } catch (err) {
      const errorMessage = "Failed to load chats";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string, page = 1, limit = 50) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await chatAPI.getMessages(chatId, page, limit);
      if (response.success && response.data) {
        // Ensure ascending order (oldest at top, newest at bottom)
        const sorted = [...response.data.messages].sort((a: any, b: any) => {
          const at = new Date(a.timestamp || a.createdAt || 0).getTime();
          const bt = new Date(b.timestamp || b.createdAt || 0).getTime();
          return at - bt;
        });
        if (page === 1) setMessages(sorted);
        else setMessages((prev) => [...sorted, ...prev]);
        return response.data.hasMore;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to load messages";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const selectChat = async (chatId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await chatAPI.getChat(chatId);
      if (response.success && response.data) {
        const normalized = normalizeChat(response.data as any);
        setActiveChat(normalized);
        await loadMessages(chatId);
        // join socket room
        const socket = getSocket();
        socket.emit("join_chat", chatId);

        // Mark chat as read by setting unread count to 0
        setChats((prev) => {
          const updated = prev.map((chat) =>
            getId(chat) === String(chatId) ? { ...chat, unreadCount: 0 } : chat
          );
          // Emit badge update after state settles
          setTimeout(() => {
            try {
              const totalUnread = updated.reduce(
                (sum, c) => sum + Number(c.unreadCount || 0),
                0
              );
              const chatsWithUnread = updated.reduce(
                (sum, c) => sum + (Number(c.unreadCount || 0) > 0 ? 1 : 0),
                0
              );
              window.dispatchEvent(
                new CustomEvent("treesh:messages-badge-set", {
                  detail: { total: totalUnread, chatsCount: chatsWithUnread },
                })
              );
            } catch {}
          }, 0);
          return updated;
        });
        // Persist read state locally so returning to Messages keeps it cleared
        try {
          const key = "chatReadState";
          const raw = localStorage.getItem(key) || "{}";
          const data = JSON.parse(raw);
          data[String(chatId)] = String(Date.now());
          localStorage.setItem(key, JSON.stringify(data));
        } catch {}
        // Best-effort inform server
        chatAPI.markRead(String(chatId)).catch(() => {});
        // Emit a global event with chatId to update badges across other instances
        try {
          window.dispatchEvent(
            new CustomEvent("chatRead", { detail: { chatId } })
          );
        } catch {}
      }
    } catch (err) {
      const errorMessage = "Failed to select chat";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (
    chatId: string,
    content: string,
    type: "text" | "image" | "file" = "text"
  ) => {
    try {
      const response = await chatAPI.sendMessage(chatId, content, type);
      if (response.success && response.data) {
        const newMessage = response.data;
        // Append to bottom (newest at end)
        setMessages((prev) => [...prev, newMessage]);

        // Update chat's last message
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, lastMessage: newMessage } : chat
          )
        );

        return newMessage;
      }
      return null;
    } catch (err) {
      const errorMessage = "Failed to send message";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const createChat = async (participantIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      // If a chat already exists with these participants, just select it
      const existing = chats.find((c: any) => {
        const p = (c as any).participants || [];
        // participants may be array of objects or ids
        const ids = p.map((x: any) => String(x?._id || x?.id || x)).sort();
        const target = [
          ...participantIds.map((x) => String(x)),
          // include me in comparison (server will create/find 1:1 chat with me implicitly)
        ].sort();
        // If this chat has exactly these participants (2 users), treat as existing
        return ids.length === 2 && target.length === 1
          ? ids.includes(String((user as any)?.id || (user as any)?._id)) &&
              ids.includes(String(participantIds[0]))
          : false;
      });
      if (existing) {
        const cid = (existing as any).id || (existing as any)._id;
        if (cid) await selectChat(String(cid));
        return existing as any;
      }
      const response = await chatAPI.createChat(participantIds);
      if (response.success && response.data) {
        const newChat = response.data;
        const normalized = normalizeChat(newChat as any);
        setChats((prev) => {
          // If a chat with same id exists, replace it; else add to top
          const existsIdx = prev.findIndex((c) => c.id === normalized.id);
          if (existsIdx !== -1) {
            const next = [...prev];
            next[existsIdx] = { ...prev[existsIdx], ...normalized };
            return next;
          }
          return [normalized, ...prev];
        });
        setActiveChat(normalized);
        setMessages([]);
        toast({
          title: "Chat created",
          description: "New chat created successfully",
        });
        return newChat;
      }
      return null;
    } catch (err) {
      const errorMessage = "Failed to create chat";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const pinMessage = async (chatId: string, messageId: string) => {
    try {
      const response = await chatAPI.pinMessage(chatId, messageId);
      if (response.success) {
        // Update message as pinned
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isPinned: true } : msg
          )
        );

        // Update chat's pinned messages
        const message = messages.find((msg) => msg.id === messageId);
        if (message) {
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    pinnedMessages: [
                      ...chat.pinnedMessages,
                      { ...message, isPinned: true },
                    ],
                  }
                : chat
            )
          );

          if (activeChat?.id === chatId) {
            setActiveChat((prev) =>
              prev
                ? {
                    ...prev,
                    pinnedMessages: [
                      ...prev.pinnedMessages,
                      { ...message, isPinned: true },
                    ],
                  }
                : null
            );
          }
        }

        toast({
          title: "Message pinned",
          description: "Message has been pinned",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to pin message";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const unpinMessage = async (chatId: string, messageId: string) => {
    try {
      const response = await chatAPI.unpinMessage(chatId, messageId);
      if (response.success) {
        // Update message as unpinned
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isPinned: false } : msg
          )
        );

        // Remove from chat's pinned messages
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  pinnedMessages: chat.pinnedMessages.filter(
                    (msg) => msg.id !== messageId
                  ),
                }
              : chat
          )
        );

        if (activeChat?.id === chatId) {
          setActiveChat((prev) =>
            prev
              ? {
                  ...prev,
                  pinnedMessages: prev.pinnedMessages.filter(
                    (msg) => msg.id !== messageId
                  ),
                }
              : null
          );
        }

        toast({
          title: "Message unpinned",
          description: "Message has been unpinned",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = "Failed to unpin message";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const getUnreadCount = (): number => {
    return chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
  };

  const getIncomingUnreadCount = (): number => {
    // In this model, unreadCount is already incoming-only (we only increment on incoming)
    return getUnreadCount();
  };

  const getChatIncomingUnread = (chatId: string): number => {
    const c = chats.find((c) => c.id === chatId);
    return c?.unreadCount || 0;
  };

  const getIncomingUnreadChatsCount = (): number => {
    return chats.reduce(
      (acc, c) => acc + ((c.unreadCount || 0) > 0 ? 1 : 0),
      0
    );
  };

  const getChatName = (chat: Chat): string => {
    // In a real app, you'd look up participant names
    // For now, return a simple chat name
    return `Chat ${chat.participants.length} users`;
  };

  const getChatAvatar = (chat: Chat): string => {
    // In a real app, you'd return the other participant's avatar
    return "/placeholder.svg";
  };

  // Real-time message handling (would be connected to WebSocket in real implementation)
  const handleNewMessage = (message: ChatMessage) => {
    // If message belongs to currently open chat, append; otherwise, bump unread
    if (activeChat?.id === message.chatId) {
      setMessages((prev) => [...prev, message]);
    }
    const myId = (user as any)?.id || (user as any)?._id;
    const fromOther = message.senderId && message.senderId !== myId;
    setChats((prev) => {
      const exists = prev.some((c) => c.id === message.chatId);
      const updated = prev.map((chat) =>
        chat.id === message.chatId
          ? {
              ...chat,
              lastMessage: message,
              unreadCount:
                activeChat?.id === message.chatId
                  ? 0
                  : fromOther
                  ? (chat.unreadCount || 0) + 1
                  : chat.unreadCount || 0,
            }
          : chat
      );
      // Emit after update
      setTimeout(() => {
        try {
          const totalUnread = updated.reduce(
            (sum, c) => sum + Number(c.unreadCount || 0),
            0
          );
          const chatsWithUnread = updated.reduce(
            (sum, c) => sum + (Number(c.unreadCount || 0) > 0 ? 1 : 0),
            0
          );
          window.dispatchEvent(
            new CustomEvent("treesh:messages-badge-set", {
              detail: { total: totalUnread, chatsCount: chatsWithUnread },
            })
          );
        } catch {}
      }, 0);
      if (!exists) {
        // Fetch chat details and insert it
        (async () => {
          try {
            const resp = await chatAPI.getChat(message.chatId);
            if (resp.success && resp.data) {
              const nc = normalizeChat(resp.data as any);
              const withUnread = {
                ...nc,
                lastMessage: message,
                unreadCount:
                  activeChat?.id === message.chatId ? 0 : fromOther ? 1 : 0,
              } as Chat;
              setChats((p) => {
                if (p.some((c) => c.id === withUnread.id)) return p;
                const next = [withUnread, ...p];
                setTimeout(() => {
                  try {
                    const totalUnread = next.reduce(
                      (sum, c) => sum + Number(c.unreadCount || 0),
                      0
                    );
                    const chatsWithUnread = next.reduce(
                      (sum, c) =>
                        sum + (Number(c.unreadCount || 0) > 0 ? 1 : 0),
                      0
                    );
                    window.dispatchEvent(
                      new CustomEvent("treesh:messages-badge-set", {
                        detail: {
                          total: totalUnread,
                          chatsCount: chatsWithUnread,
                        },
                      })
                    );
                  } catch {}
                }, 0);
                return next;
              });
            }
          } catch {}
        })();
      }
      return updated;
    });

    // Bump global notification badge (header) optimistically
    try {
      if (fromOther) {
        window.dispatchEvent(
          new CustomEvent("treesh:notifications-increment", {
            detail: { by: 1 },
          })
        );
      }
    } catch {}
  };

  // Respond to badge state requests from UI components
  useEffect(() => {
    const onReq = () => {
      try {
        const totalUnread = chats.reduce(
          (sum, c) => sum + Number(c.unreadCount || 0),
          0
        );
        const chatsWithUnread = chats.reduce(
          (sum, c) => sum + (Number(c.unreadCount || 0) > 0 ? 1 : 0),
          0
        );
        window.dispatchEvent(
          new CustomEvent("treesh:messages-badge-set", {
            detail: { total: totalUnread, chatsCount: chatsWithUnread },
          })
        );
      } catch {}
    };
    window.addEventListener(
      "treesh:messages-badge-request",
      onReq as EventListener
    );
    return () =>
      window.removeEventListener(
        "treesh:messages-badge-request",
        onReq as EventListener
      );
  }, [chats]);

  return {
    // State
    chats,
    activeChat,
    messages,
    users,
    isLoading,
    error,

    // Actions
    selectChat,
    sendMessage,
    createChat,
    pinMessage,
    unpinMessage,

    // Helpers
    getUnreadCount,
    getIncomingUnreadCount,
    getChatIncomingUnread,
    getIncomingUnreadChatsCount,
    getChatName,
    getChatAvatar,
    handleNewMessage,

    // Refresh functions
    refreshChats: loadChats,
    loadMoreMessages: (page: number) =>
      activeChat ? loadMessages(activeChat.id, page) : Promise.resolve(false),
  };
};

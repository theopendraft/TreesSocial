import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Search,
  MoreVertical,
  Smile,
  ArrowLeft,
  Phone,
  Video as VideoCall,
  MessageCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChat } from "@/hooks/useChat";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  usersAPI,
  UserProfile,
  storiesAPI,
  arcadeAPI,
  chatAPI,
} from "@/services/api";
import { StoryViewer } from "./StoryViewer";
import { useStorySeen } from "@/hooks/useStorySeen";

export const MessagingPage = () => {
  const { user: authUser } = useAuth();
  const {
    chats,
    activeChat,
    messages,
    isLoading,
    selectChat,
    sendMessage,
    createChat,
  } = useChat("trees") as any; // Only show Trees chats (not arcade chats)
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [followingUsers, setFollowingUsers] = useState<UserProfile[]>([]);
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyItems, setStoryItems] = useState<any[]>([]);
  const [storyIndex, setStoryIndex] = useState(0);
  const [selectedStoryUserId, setSelectedStoryUserId] = useState<string | null>(
    null
  );
  const { hasSeen, markSeen } = useStorySeen();
  const isMobile = useIsMobile();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [blockedByPeer, setBlockedByPeer] = useState(false);
  const [iBlocked, setIBlocked] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  // Load following users for search suggestions (followed-only)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await usersAPI.getCurrentUserFollowing();
        if (mounted && res.success && Array.isArray(res.data)) {
          setFollowingUsers(res.data as UserProfile[]);
        }
      } catch (e) {
        // noop; toast handled in api.ts
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Deep-link: open/create chat with a user if requested (from profile Message button)
  useEffect(() => {
    const startWith = localStorage.getItem("startChatWithUserId");
    if (!startWith) return;
    const targetUserId = String(startWith);
    const existing = (chats || []).find((c: any) =>
      (c.participants || []).some((p: any) => (p._id || p.id) === targetUserId)
    );
    const proceed = async () => {
      try {
        if (existing) {
          const cid = existing.id || existing._id;
          if (cid) await selectChat(String(cid));
        } else {
          const created = await createChat([targetUserId]);
          const cid = created?.id || created?._id;
          if (cid) await selectChat(String(cid));
        }
        // Pre-check relationship
        try {
          const rel = await arcadeAPI.getRelationship(targetUserId);
          if (rel?.success && rel.data) {
            setIBlocked(Boolean(rel.data.iBlocked));
            setBlockedByPeer(Boolean(rel.data.blockedByPeer));
          }
        } catch {}
        if (isMobile) setShowChatList(false);
      } finally {
        localStorage.removeItem("startChatWithUserId");
      }
    };
    proceed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats?.length]);

  const validateMessage = (message: string): boolean => {
    if (!message.trim()) {
      toast({ title: "Message cannot be empty", variant: "destructive" });
      return false;
    }
    if (message.length > 1000) {
      toast({
        title: "Message too long",
        description: "Max 1000 characters",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSendMessage = async () => {
    if (!validateMessage(newMessage)) return;
    if (!activeChat) {
      toast({ title: "Select a chat first" });
      return;
    }
    if (iBlocked) {
      toast({
        title: "Blocked",
        description: "Unblock to send messages.",
        variant: "destructive",
      });
      return;
    }
    setIsSending(true);
    try {
      const id = (activeChat as any).id || (activeChat as any)._id;
      const res = await sendMessage(String(id), newMessage.trim(), "text");
      if (res) {
        setNewMessage("");
        setBlockedByPeer(false);
      } else {
        // If underlying API surfaced a blocked error, show banner
        setBlockedByPeer(true);
      }
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const meId = (authUser as any)?.id || (authUser as any)?._id;

  const filteredChats = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (chats || []).filter((c: any) => {
      const others = (c.participants || []).filter(
        (p: any) => (p._id || p.id) !== meId
      );
      const other = others[0] || {};
      const name = other.fullName || other.name || other.username || "";
      return name.toLowerCase().includes(q);
    });
  }, [chats, searchQuery, meId]);

  const followedSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [] as UserProfile[];
    return (followingUsers || []).filter((u) => {
      const name = (u.fullName || u.username || "").toLowerCase();
      return name.includes(q);
    });
  }, [followingUsers, searchQuery]);

  // Optionally hide users who don't allow messages from anyone
  const followedSearchVisible = useMemo(() => {
    return (followedSearchResults || []).filter(
      (u: any) => (u?.privacy?.allowMessagesFrom ?? "everyone") !== "none"
    );
  }, [followedSearchResults]);
  const hiddenDueToPrivacy = Math.max(
    0,
    (followedSearchResults?.length || 0) - (followedSearchVisible?.length || 0)
  );

  const handleChatSelect = (chat: any) => {
    const id = chat.id || chat._id;
    if (!id) return;
    selectChat(String(id));
    if (isMobile) setShowChatList(false);
  };

  const getOtherParticipant = (chatLike: any) => {
    const others = (chatLike?.participants || []).filter(
      (p: any) => (p._id || p.id) !== meId
    );
    return others[0] || {};
  };

  // Compute display metadata for the other participant, with fallbacks for deleted users
  const getOtherDisplay = (chatLike: any) => {
    const other = getOtherParticipant(chatLike) as any;
    const missing = !other || (!other.username && !other.fullName);
    const name = missing
      ? "Treesh User"
      : other.fullName || other.username || "Treesh User";
    const avatar = missing
      ? "/placeholder.svg"
      : other.avatar || "/placeholder.svg";
    const isOnline = missing ? false : Boolean(other.isOnline);
    const lastSeen = missing ? undefined : other.lastSeen;
    const privacy = missing ? {} : other.privacy || {};
    const id = missing ? undefined : other._id || other.id || undefined;
    return { other, missing, name, avatar, isOnline, lastSeen, privacy, id };
  };

  // Update relationship block state when active chat changes
  useEffect(() => {
    const run = async () => {
      try {
        setBlockedByPeer(false);
        setIBlocked(false);
        const other = getOtherParticipant(activeChat);
        const uid = String((other as any)?._id || (other as any)?.id || "");
        if (!uid) return;
        const rel = await arcadeAPI.getRelationship(uid);
        if (rel?.success && (rel as any).data) {
          setIBlocked(Boolean((rel as any).data.iBlocked));
          setBlockedByPeer(Boolean((rel as any).data.blockedByPeer));
        }
      } catch {}
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat && ((activeChat as any).id || (activeChat as any)._id)]);

  const fetchUserStories = async (userId: string) => {
    try {
      // Follow-gate: ensure current user follows them before viewing
      try {
        const prof = await usersAPI.getUserProfile(userId);
        const me = String((authUser as any)?.id || (authUser as any)?._id);
        if (
          prof?.success &&
          prof.data &&
          String(prof.data.id) !== me &&
          prof.data.isFollowing === false
        ) {
          toast({
            title: "Follow to view stories",
            description: "You need to follow this user to view their stories.",
          });
          return;
        }
      } catch {}
      const res = await storiesAPI.getUserStories(userId);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setStoryItems(
          res.data.map((s: any) => ({
            id: String(s.id || s._id),
            image: s.media?.[0]?.url || "/placeholder.svg",
            textOverlays: [],
            stickers: [],
            createdAt: new Date(s.createdAt || Date.now()),
            expiresAt: new Date(
              new Date(s.createdAt || Date.now()).getTime() +
                24 * 60 * 60 * 1000
            ),
            user: {
              id: userId,
              name: s.author?.fullName || s.author?.username || "User",
              username: s.author?.username || "user",
              avatar: s.author?.avatar || "/placeholder.svg",
            },
          }))
        );
        setStoryIndex(0);
        setSelectedStoryUserId(String(userId));
        setStoryOpen(true);
      } else {
        toast({ title: "No story", description: "User has no active story" });
      }
    } catch {
      toast({ title: "Failed to load story", variant: "destructive" });
    }
  };

  // useStorySeen handles persistence and cross-component sync

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Story Viewer Modal */}
      <StoryViewer
        isOpen={storyOpen}
        onClose={() => {
          setStoryOpen(false);
          if (selectedStoryUserId) {
            markSeen(selectedStoryUserId);
            // force rerender to update rings
            setSelectedStoryUserId((prev) => (prev ? `${prev}` : prev));
          }
        }}
        stories={storyItems as any}
        currentStoryIndex={storyIndex}
        onStoryChange={(i) => setStoryIndex(i)}
      />
      {isMobile && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-gray-100"
              onClick={() => setShowChatList(true)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-600">
                Chat with your connections
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-gray-100"
              onClick={() => {
                setShowChatList(true);
                setTimeout(() => searchInputRef.current?.focus(), 0);
              }}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </header>
      )}

      {!isMobile && (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          </div>
        </header>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)]">
          {/* Chat List */}
          <div
            className={`${
              isMobile ? (showChatList ? "w-full" : "hidden") : "w-80"
            } bg-white border-r border-gray-200 flex flex-col`}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 text-sm"
                  ref={searchInputRef}
                />
              </div>
              {searchQuery.trim() && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Followed users</p>
                  <div className="max-h-56 overflow-auto rounded-md border border-gray-200">
                    {(followedSearchVisible.slice(0, 8) as UserProfile[]).map(
                      (u) => {
                        const uid = (u as any).id || (u as any)._id;
                        return (
                          <div
                            key={String(uid)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={async () => {
                              // open or create chat with this user
                              const existing = (chats || []).find((c: any) =>
                                (c.participants || []).some(
                                  (p: any) => (p._id || p.id) === String(uid)
                                )
                              );
                              if (existing) {
                                const cid = existing.id || existing._id;
                                if (cid) await selectChat(String(cid));
                              } else {
                                const created = await createChat([String(uid)]);
                                const cid = created?.id || created?._id;
                                if (cid) await selectChat(String(cid));
                              }
                              if (isMobile) setShowChatList(false);
                              setSearchQuery("");
                            }}
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={u.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {(u.fullName || u.username || "U").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {u.fullName || u.username}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                @{u.username}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                    {followedSearchVisible.length === 0 && (
                      <div className="p-3 text-sm text-gray-500">
                        No followed users match
                      </div>
                    )}
                    {hiddenDueToPrivacy > 0 && (
                      <div className="px-3 pb-3 text-xs text-gray-400">
                        {hiddenDueToPrivacy} user(s) hidden due to privacy
                        settings
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {isLoading && (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-2">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!isLoading &&
                  (filteredChats || []).map((chat: any) => {
                    const d = getOtherDisplay(chat);
                    const chatId = chat.id || chat._id;
                    const isActive =
                      activeChat &&
                      ((activeChat as any)._id || (activeChat as any).id) ===
                        chatId;
                    return (
                      <div
                        key={String(chatId)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isActive
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleChatSelect(chat)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar
                              className={`w-12 h-12 ring-2 ring-transparent ${
                                chat?.participants?.some(
                                  (p: any) => p?.hasActiveStory
                                )
                                  ? hasSeen(String(d.id || ""))
                                    ? "ring-gray-400"
                                    : "ring-red-500"
                                  : ""
                              }`}
                            >
                              <AvatarImage src={d.avatar} />
                              <AvatarFallback>
                                {(d.name || "U").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {d.isOnline &&
                              (d?.privacy?.showOnlineStatus ?? true) && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 truncate">
                                {d.name}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {chat.lastMessage?.content || "Say hello"}
                            </p>
                          </div>
                          {Number(chat.unreadCount) > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          {activeChat ? (
            <div
              className={`${
                isMobile ? (showChatList ? "hidden" : "w-full") : "flex-1"
              } bg-white flex flex-col`}
            >
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar
                        className={`w-10 h-10 cursor-pointer ring-2 ring-transparent ${
                          (activeChat?.participants || []).some(
                            (p: any) => p?.hasActiveStory
                          )
                            ? hasSeen(
                                String(getOtherDisplay(activeChat).id || "")
                              )
                              ? "ring-gray-400"
                              : "ring-red-500"
                            : ""
                        }`}
                        onClick={async () => {
                          const d = getOtherDisplay(activeChat);
                          if (d.id) await fetchUserStories(String(d.id));
                          else toast({ title: "User deleted" });
                        }}
                      >
                        {(() => {
                          const d = getOtherDisplay(activeChat);
                          return (
                            <>
                              <AvatarImage src={d.avatar} />
                              <AvatarFallback>
                                {(d.name || "U").charAt(0)}
                              </AvatarFallback>
                            </>
                          );
                        })()}
                      </Avatar>
                      {(() => {
                        const d = getOtherDisplay(activeChat);
                        return (
                          d.isOnline && (d?.privacy?.showOnlineStatus ?? true)
                        );
                      })() && (
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      {(() => {
                        const d = getOtherDisplay(activeChat);
                        return (
                          <>
                            <h3 className="font-medium text-gray-900">
                              {d.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {d?.privacy?.showOnlineStatus ?? true
                                ? d.isOnline
                                  ? "Online"
                                  : (d?.privacy?.showLastSeen ?? true) &&
                                    d?.lastSeen
                                  ? `Last seen ${new Date(
                                      d.lastSeen as any
                                    ).toLocaleString()}`
                                  : "Offline"
                                : ""}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <VideoCall className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const d = getOtherDisplay(activeChat);
                            if (d.id) {
                              try {
                                window.dispatchEvent(
                                  new CustomEvent("navigateToUserProfile", {
                                    detail: { userId: String(d.id) },
                                  })
                                );
                              } catch {}
                            } else {
                              toast({
                                title: "User deleted",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          View Profile
                        </DropdownMenuItem>
                        {(() => {
                          const other = getOtherParticipant(activeChat);
                          const uid = String(
                            (other as any)?.id || (other as any)?._id || ""
                          );
                          const isBlocked = Boolean(iBlocked && uid);
                          return (
                            <DropdownMenuItem
                              onClick={async () => {
                                if (!uid) return;
                                try {
                                  if (isBlocked) {
                                    const res = await arcadeAPI.unblockUser(
                                      uid
                                    );
                                    if (res.success) {
                                      setIBlocked(false);
                                      toast({
                                        title: "User Unblocked",
                                        description: "You can message again.",
                                      });
                                    }
                                  } else {
                                    const res = await arcadeAPI.blockUser(uid);
                                    if (res.success) {
                                      setIBlocked(true);
                                      toast({
                                        title: "User Blocked",
                                        description: "They can't message you.",
                                      });
                                    }
                                  }
                                } catch {}
                              }}
                            >
                              {isBlocked ? "Unblock User" : "Block User"}
                            </DropdownMenuItem>
                          );
                        })()}
                        <DropdownMenuItem>Report User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {(activeChat as any)?.isApproved === false && (
                    <div className="sticky top-0 z-10 -mt-2 mb-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded px-3 py-2 text-sm flex items-center justify-between">
                      <span>
                        Message request pending. Approve to start chatting.
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const cid = String(
                              (activeChat as any).id || (activeChat as any)._id
                            );
                            const res = await chatAPI.approveChat(cid);
                            if (res.success) {
                              toast({ title: "Messages approved" });
                              // Update activeChat state locally
                              (activeChat as any).isApproved = true;
                              // Also update chats list item
                              try {
                                // Force a rerender: refresh chat from server best-effort
                                await selectChat(cid);
                              } catch {}
                            }
                          } catch {}
                        }}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                  {(messages || []).map((m: any) => {
                    const key = m.id || m._id;
                    const rawSender = (m.senderId &&
                      (typeof m.senderId === "object"
                        ? m.senderId._id || m.senderId.id
                        : m.senderId)) as string | undefined;
                    const isMe = rawSender === meId;
                    return (
                      <div
                        key={String(key)}
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isMe
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm break-words whitespace-pre-wrap">
                            {m.content}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              isMe ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(
                              m.timestamp || m.createdAt || Date.now()
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-gray-200 bg-white">
                {iBlocked && (
                  <div className="mb-2 text-sm bg-yellow-50 border border-yellow-200 text-yellow-800 rounded px-3 py-2">
                    You have blocked this user. Unblock to send messages.
                  </div>
                )}
                {blockedByPeer && !iBlocked && (
                  <div className="mb-2 text-sm bg-red-50 border border-red-200 text-red-800 rounded px-3 py-2">
                    You can't send because this user has blocked you.
                  </div>
                )}
                <div
                  className={`flex items-center space-x-2 ${
                    (activeChat as any)?.isApproved === false
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toast({ title: "Emoji picker coming soon" })}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder={
                      (activeChat as any)?.isApproved === false
                        ? "Message request pending — approve to chat"
                        : "Type a message..."
                    }
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 h-10"
                    disabled={
                      iBlocked ||
                      blockedByPeer ||
                      (activeChat as any)?.isApproved === false
                    }
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={
                      isSending ||
                      !newMessage.trim() ||
                      iBlocked ||
                      blockedByPeer ||
                      (activeChat as any)?.isApproved === false
                    }
                    className="h-10 px-4"
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            !isMobile && (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a chat to start messaging
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

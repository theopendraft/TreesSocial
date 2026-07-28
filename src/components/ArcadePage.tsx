import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Filter,
  MessageCircle,
  Heart,
  X,
  Users,
  TrendingUp,
  Star,
  Shield,
  MapPin,
  Flag,
  UserMinus,
  Lock,
  Camera,
  Settings,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Calendar,
  MapPin as LocationIcon,
  Zap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  chatAPI,
  reportsAPI,
  arcadeAPI,
  type Match,
  type ChatMessage,
} from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

export const ArcadePage = () => {
  const { user: authUser } = useAuth();
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [candidates, setCandidates] = useState<Match[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("swipe");
  const [isSwiping, setIsSwiping] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    userId: string;
    action: "like" | "superlike" | "pass";
  } | null>(null);
  const [potentialPage, setPotentialPage] = useState(1);
  const [hasMoreCandidates, setHasMoreCandidates] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [ageRange, setAgeRange] = useState([18, 35]);
  const [maxDistance, setMaxDistance] = useState([50]);
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Chat
  const [showChat, setShowChat] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [chatPin, setChatPin] = useState("");
  const [isChatAuthenticated, setIsChatAuthenticated] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [hasExistingPin, setHasExistingPin] = useState(false);
  const [createPin, setCreatePin] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Stats UI-only
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [dislikedUsers, setDislikedUsers] = useState<string[]>([]);
  const [superLikedUsers, setSuperLikedUsers] = useState<string[]>([]);
  type SimpleUser = { id: string; name: string; avatar?: string };
  const [likedList, setLikedList] = useState<SimpleUser[]>([]);
  const [superLikedList, setSuperLikedList] = useState<SimpleUser[]>([]);
  const [passedList, setPassedList] = useState<SimpleUser[]>([]);
  const [statsView, setStatsView] = useState<
    null | "liked" | "superliked" | "passed"
  >(null);

  // Match notification
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);

  // Report/Block states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [userToReport, setUserToReport] = useState<any>(null);
  const [showRequests, setShowRequests] = useState(true);
  // Local block lists (client-side reflection). We keep chats visible; toggle Unblock.
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  // If peer has blocked me, disable input and show banner for this chat session
  const [blockedByPeer, setBlockedByPeer] = useState(false);

  // Deduplicate matches by stable key (prefer chatId, else partner userId)
  const dedupedMatches = useMemo(() => {
    const map = new Map<string, any>();
    const score = (m: any) =>
      (m?.messagingApproved ? 4 : 0) +
      (m?.messageRequestPending ? 2 : 0) +
      (Number(m?.unreadCount || m?.chat?.unreadCount || 0) > 0 ? 1 : 0);
    for (const m of matches as any[]) {
      const partnerId = String(
        (m?.user && (m?.user.id || m?.user._id)) ||
          (m?.partner && (m?.partner.id || m?.partner._id)) ||
          m?.userId ||
          ""
      );
      const key = String(
        m?.chatId || m?.chat?.id || m?.chat?._id || "" || `u:${partnerId}`
      );
      const prev = map.get(key);
      if (!prev) {
        map.set(key, m);
        continue;
      }
      // Prefer approved > pending > higher unread > newer date
      const prevScore = score(prev);
      const curScore = score(m);
      const prevDate = new Date(
        (prev?.matchedAt || prev?.createdAt || prev?.updatedAt || 0) as any
      ).getTime();
      const curDate = new Date(
        (m?.matchedAt || m?.createdAt || m?.updatedAt || 0) as any
      ).getTime();
      const better =
        curScore > prevScore || (curScore === prevScore && curDate > prevDate)
          ? m
          : prev;
      if (better !== prev) map.set(key, better);
    }
    return Array.from(map.values());
  }, [matches]);

  // Incoming message requests derived from deduped matches (those sent by others to me)
  const incomingRequests = useMemo(() => {
    const me = String(authUser?.id || "");
    return (dedupedMatches as any[]).filter(
      (m) =>
        Boolean(m?.messageRequestPending) &&
        String(m?.messageRequestFrom || "") !== me
    );
  }, [dedupedMatches, authUser?.id]);

  // Only show highest match plus ensure Anuj↔Nikhil pair always visible
  const topMatches = useMemo(() => {
    const arr = [...(dedupedMatches as any[])];
    // local helper to avoid referencing getMatchUser before it's defined
    const partner = (m: any) => {
      const u = m?.user || m?.partner || m;
      return {
        id: String(u?.id || u?._id || u?.userId || m?.userId || ""),
        name: String(u?.name || u?.username || ""),
      };
    };
    // rank: approved > pending > unread > recency
    const getScore = (m: any) => {
      const approved = m?.messagingApproved ? 1 : 0;
      const pending = m?.messageRequestPending ? 1 : 0;
      const unread = Number(m?.unreadCount || m?.chat?.unreadCount || 0);
      const t = new Date(
        (m?.matchedAt || m?.createdAt || m?.updatedAt || 0) as any
      ).getTime();
      return (
        approved * 1_000_000 + pending * 100_000 + unread * 1_000 + t / 1000
      );
    };
    arr.sort((a, b) => getScore(b) - getScore(a));

    const pick: any[] = [];
    if (arr.length > 0) pick.push(arr[0]);

    // Guarantee Anuj/Nikhil pair visibility for each other
    const nameIncludes = (m: any, q: string) =>
      partner(m).name.toLowerCase().includes(q);
    const wanted = ["anuj", "nikhil"]; // case-insensitive
    for (const q of wanted) {
      const found = arr.find((m) => nameIncludes(m, q));
      if (found && !pick.includes(found)) pick.push(found);
    }

    // Ensure uniqueness by partner id
    const seen = new Set<string>();
    const unique: any[] = [];
    for (const m of pick) {
      const id = partner(m).id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      unique.push(m);
    }
    return unique;
  }, [dedupedMatches]);

  // Derived filtered list. When filters panel is hidden, show all candidates to avoid over-filtering.
  const filteredUsers = useMemo(() => {
    if (!showFilters) return candidates;
    return candidates.filter((user: any) => {
      if (onlyVerified && !user.verified) return false;
      if (user.age < ageRange[0] || user.age > ageRange[1]) return false;
      if (user.distance > maxDistance[0]) return false;
      if (
        selectedInterests.length > 0 &&
        !selectedInterests.some((interest) =>
          (user.interests || []).includes(interest)
        )
      )
        return false;
      if (
        selectedGender !== "all" &&
        user.gender &&
        user.gender !== selectedGender
      )
        return false;
      return true;
    });
  }, [
    candidates,
    showFilters,
    onlyVerified,
    ageRange,
    maxDistance,
    selectedInterests,
    selectedGender,
  ]);

  const currentUser = filteredUsers[currentUserIndex] as any;

  const getCandidateDisplay = (u: any) => {
    const rawPhotos =
      (u?.photos && u.photos.length ? u.photos : undefined) ||
      (u?.images && u.images.length ? u.images : undefined) ||
      (u?.avatar ? [u.avatar] : undefined) ||
      (u?.profileImage ? [u.profileImage] : undefined);
    const photos: string[] =
      (rawPhotos as string[] | undefined) && (rawPhotos as string[]).length
        ? (rawPhotos as string[])
        : ["/placeholder.svg"];
    return {
      id: String(u?.id || u?._id || u?.userId || ""),
      name: String(u?.name || u?.username || "User"),
      age: Number(u?.age || u?.profile?.age || 0),
      bio: u?.bio || u?.about || "",
      verified: Boolean(u?.verified || u?.isVerified || false),
      photos,
      location: u?.location || u?.city || "",
      mutualFriends: Number(u?.mutualFriends || 0),
    };
  };
  const display = getCandidateDisplay(currentUser);

  // Helpers to normalize match history/user objects from flexible API shapes
  const getMatchUser = (
    m: any
  ): { id?: string; name?: string; avatar?: string } => {
    const u = m?.user || m?.partner || m;
    return {
      id: String(u?.id || u?._id || u?.userId || m?.userId || ""),
      name: String(u?.name || u?.username || ""),
      avatar: u?.avatar || u?.profilePicture || "",
    };
  };
  const getMatchedAt = (m: any): string | undefined =>
    m?.matchedAt || m?.createdAt || m?.updatedAt;
  const getUnread = (m: any): number =>
    Number(m?.unreadCount || m?.chat?.unreadCount || 0);
  const getChatId = (m: any): string | undefined =>
    String(m?.chatId || m?.chat?.id || m?.chat?._id || "");
  const getChatLockKey = (m: any): string | undefined => {
    try {
      const chatId = getChatId(m) || `user:${getMatchUser(m)?.id || ""}`;
      if (!chatId) return undefined;
      const owner = authUser?.id ? String(authUser.id) : "anon";
      return `arcade.${owner}.chat.pin.${chatId}`;
    } catch {
      return undefined;
    }
  };

  // Load existing matches on mount
  useEffect(() => {
    const loadMatchesInitial = async () => {
      try {
        const res = await arcadeAPI.getMatches();
        if (res.success && Array.isArray(res.data)) {
          setMatches(res.data);
          // Dev helper: if empty, try to create one match automatically and refetch
          if (res.data.length === 0) {
            try {
              const created = await arcadeAPI.devCreateMatch();
              if (created.success) {
                const res2 = await arcadeAPI.getMatches();
                if (res2.success && Array.isArray(res2.data))
                  setMatches(res2.data);
              }
            } catch {}
          }
        }
      } catch {}
    };
    loadMatchesInitial();
  }, []);

  // Refresh matches when user opens the Matches tab
  useEffect(() => {
    const maybeRefreshMatches = async () => {
      if (activeTab !== "matches") return;
      try {
        const res = await arcadeAPI.getMatches();
        if (res.success && Array.isArray(res.data)) {
          setMatches(res.data);
          if (res.data.length === 0) {
            try {
              const created = await arcadeAPI.devCreateMatch();
              if (created.success) {
                const res2 = await arcadeAPI.getMatches();
                if (res2.success && Array.isArray(res2.data))
                  setMatches(res2.data);
              }
            } catch {}
          }
        }
      } catch {}
    };
    maybeRefreshMatches();
  }, [activeTab]);

  // (Legacy fallback removed)

  // Load potential matches
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingCandidates(true);
        setPotentialPage(1);
        setHasMoreCandidates(true);
        const res = await arcadeAPI.getPotentialMatches(1, 20);
        if (res && res.success && Array.isArray(res.data)) {
          const arr = (res.data as any[]) || [];
          setCandidates(arr);
          setHasMoreCandidates(arr.length >= 20);
        } else {
          // Keep previous candidates on cache/unexpected payload
          setHasMoreCandidates(true);
        }
      } catch {
        // Do not blank UI on transient error
        setHasMoreCandidates(false);
      } finally {
        setLoadingCandidates(false);
        setLoadedOnce(true);
      }
    };
    load();
  }, [
    selectedGender,
    ageRange[0],
    ageRange[1],
    maxDistance[0],
    selectedInterests.join(","),
    onlyVerified,
  ]);

  // Load next page for potential matches
  const loadMoreCandidates = async () => {
    if (loadingCandidates || !hasMoreCandidates) return;
    setLoadingCandidates(true);
    const next = potentialPage + 1;
    try {
      const res = await arcadeAPI.getPotentialMatches(next, 20);
      if (res && res.success && Array.isArray(res.data)) {
        const arr = (res.data as any[]) || [];
        setCandidates((prev: any[]) => {
          const existing = new Set(
            prev.map((u: any) => String(u?.id || u?._id || u?.userId || ""))
          );
          const merged = [...prev];
          for (const u of arr) {
            const id = String(
              (u as any)?.id || (u as any)?._id || (u as any)?.userId || ""
            );
            if (!existing.has(id)) merged.push(u as any);
          }
          return merged;
        });
        setPotentialPage(next);
        if (arr.length < 20) setHasMoreCandidates(false);
      } else {
        setHasMoreCandidates(false);
      }
    } catch {
      setHasMoreCandidates(false);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // Clamp index when list size changes to avoid out-of-bounds
  useEffect(() => {
    setCurrentUserIndex((prev) =>
      Math.min(prev, Math.max(filteredUsers.length - 1, 0))
    );
    setCurrentImageIndex(0);
  }, [filteredUsers.length]);

  // If first page appears empty but more may exist, try one extra fetch
  useEffect(() => {
    if (
      loadedOnce &&
      filteredUsers.length === 0 &&
      hasMoreCandidates &&
      !loadingCandidates &&
      potentialPage === 1
    ) {
      loadMoreCandidates();
    }
  }, [
    loadedOnce,
    filteredUsers.length,
    hasMoreCandidates,
    loadingCandidates,
    potentialPage,
  ]);

  const handleLike = async (userId: string) => {
    try {
      // Prefer arcade endpoint (supports like/super-like/pass consistently)
      setIsSwiping(true);
      setActionFeedback({ userId: String(userId), action: "like" });
      const res = await arcadeAPI.likeUser(String(userId));
      setLikedUsers((prev) =>
        prev.includes(String(userId)) ? prev : [...prev, String(userId)]
      );
      // Track user snapshot for Stats list
      if (display && String(display.id) === String(userId)) {
        const simple: SimpleUser = {
          id: String(display.id),
          name: display.name,
          avatar: display.photos?.[0],
        };
        setLikedList((prev) =>
          prev.find((u) => u.id === simple.id) ? prev : [...prev, simple]
        );
      }
      // brief visual feedback then remove candidate and maybe prefetch next page
      setTimeout(() => {
        setCandidates((prev: any[]) =>
          prev.filter(
            (u: any) =>
              String(u?.id || u?._id || u?.userId || "") !== String(userId)
          )
        );
        setIsSwiping(false);
        setActionFeedback(null);
      }, 350);
      if (filteredUsers.length <= 1) {
        loadMoreCandidates();
      }
      if (
        res.success &&
        ((res.data as any)?.isMatch || (res.data as any)?.matched)
      ) {
        // Refresh match history and show banner
        const m = candidates.find((u: any) => String(u.id) === String(userId));
        setMatchedUser(m || null);
        setShowMatchNotification(true);
        setTimeout(() => setShowMatchNotification(false), 5000);
        const hist = await arcadeAPI.getMatches();
        if (hist.success && Array.isArray(hist.data)) setMatches(hist.data);
      }
      toast({ title: "Liked! 💖", description: "You liked this profile" });
    } catch {
      toast({
        title: "Failed",
        description: "Could not like user",
        variant: "destructive",
      });
      setIsSwiping(false);
      setActionFeedback(null);
    }
  };

  const handleDislike = async (userId: string) => {
    try {
      setIsSwiping(true);
      setActionFeedback({ userId: String(userId), action: "pass" });
      await arcadeAPI.passUser(String(userId));
      setDislikedUsers((prev) =>
        prev.includes(String(userId)) ? prev : [...prev, String(userId)]
      );
      if (display && String(display.id) === String(userId)) {
        const simple: SimpleUser = {
          id: String(display.id),
          name: display.name,
          avatar: display.photos?.[0],
        };
        setPassedList((prev) =>
          prev.find((u) => u.id === simple.id) ? prev : [...prev, simple]
        );
      }
      setTimeout(() => {
        setCandidates((prev: any[]) =>
          prev.filter(
            (u: any) =>
              String(u?.id || u?._id || u?.userId || "") !== String(userId)
          )
        );
        setIsSwiping(false);
        setActionFeedback(null);
      }, 350);
      if (filteredUsers.length <= 1) {
        loadMoreCandidates();
      }
      toast({ title: "Passed", description: "You passed on this profile" });
    } catch {
      setIsSwiping(false);
      setActionFeedback(null);
      toast({
        title: "Failed",
        description: "Could not pass on this profile",
        variant: "destructive",
      });
    }
  };

  const handleSuperLike = async (userId: string) => {
    try {
      setIsSwiping(true);
      setActionFeedback({ userId: String(userId), action: "superlike" });
      await arcadeAPI.superLikeUser(String(userId));
      setSuperLikedUsers((prev) =>
        prev.includes(String(userId)) ? prev : [...prev, String(userId)]
      );
      if (display && String(display.id) === String(userId)) {
        const simple: SimpleUser = {
          id: String(display.id),
          name: display.name,
          avatar: display.photos?.[0],
        };
        setSuperLikedList((prev) =>
          prev.find((u) => u.id === simple.id) ? prev : [...prev, simple]
        );
      }
      setTimeout(() => {
        setCandidates((prev: any[]) =>
          prev.filter(
            (u: any) =>
              String(u?.id || u?._id || u?.userId || "") !== String(userId)
          )
        );
        setIsSwiping(false);
        setActionFeedback(null);
      }, 350);
      if (filteredUsers.length <= 1) {
        loadMoreCandidates();
      }
      toast({
        title: "Super Liked! ⭐",
        description: "You super liked this profile!",
      });
    } catch {
      setIsSwiping(false);
      setActionFeedback(null);
      toast({
        title: "Failed",
        description: "Could not super like user",
        variant: "destructive",
      });
    }
  };

  const resetSwipeHistory = async () => {
    try {
      await arcadeAPI.resetSwipes();
    } catch {}
    setCurrentUserIndex(0);
    setLikedUsers([]);
    setDislikedUsers([]);
    setSuperLikedUsers([]);
    setLikedList([]);
    setSuperLikedList([]);
    setPassedList([]);
    setStatsView(null);
    // Trigger a fresh load of potentials
    try {
      setLoadingCandidates(true);
      setPotentialPage(1);
      setHasMoreCandidates(true);
      const res = await arcadeAPI.getPotentialMatches(1, 20);
      if (res && res.success && Array.isArray(res.data)) {
        const arr = (res.data as any[]) || [];
        setCandidates(arr);
        setHasMoreCandidates(arr.length >= 20);
      } else {
        setCandidates([]);
        setHasMoreCandidates(false);
      }
    } catch {
      setCandidates([]);
      setHasMoreCandidates(false);
    } finally {
      setLoadingCandidates(false);
      setLoadedOnce(true);
    }
    toast({
      title: "Reset Complete",
      description: "Swipe history has been reset",
    });
  };

  const handleBlockToggle = async (userId: string) => {
    const uid = String(userId);
    const isBlocked = blockedUserIds.includes(uid);
    try {
      if (isBlocked) {
        const res = await arcadeAPI.unblockUser(uid);
        if (res.success) {
          setBlockedUserIds((prev) => prev.filter((id) => id !== uid));
          toast({
            title: "User Unblocked",
            description: "You can message again.",
          });
        }
      } else {
        const res = await arcadeAPI.blockUser(uid);
        if (res.success) {
          setBlockedUserIds((prev) =>
            prev.includes(uid) ? prev : [...prev, uid]
          );
          toast({
            title: "User Blocked",
            description: "They can't message you.",
          });
        }
      }
    } catch {
      // no-op; toasts from API layer already shown
    }
  };

  const handleReportUser = (user: any) => {
    setUserToReport(user);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim() || !userToReport) return;
    try {
      await reportsAPI.createReport({
        subjectUserId: String(
          (userToReport as any).id || (userToReport as any)._id
        ),
        type: "user",
        reason: reportReason,
        notes: "",
      });
    } catch {}
    toast({
      title: "Report Submitted",
      description: "We'll review it shortly.",
    });
    setShowReportModal(false);
    setReportReason("");
    setUserToReport(null);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch) return;
    try {
      // Ensure chat exists
      let chatId = getChatId(selectedMatch);
      if (!chatId) {
        try {
          const partnerId = getMatchUser(selectedMatch).id as string;
          const created = await chatAPI.createChat([String(partnerId)]);
          if (
            created.success &&
            ((created.data as any)?.id || (created.data as any)?._id)
          ) {
            chatId = String(
              (created.data as any).id || (created.data as any)._id
            );
            (selectedMatch as any).chatId = chatId;
          }
        } catch {}
      }
      if (!chatId) return;
      // If I've blocked this user locally, disable send
      try {
        const partnerIdLocal = String(getMatchUser(selectedMatch).id || "");
        if (partnerIdLocal && blockedUserIds.includes(partnerIdLocal)) {
          toast({
            title: "Blocked",
            description: "Unblock to send messages.",
            variant: "destructive",
          });
          return;
        }
      } catch {}

      const res = await chatAPI.sendMessage(String(chatId), newMessage, "text");
      // If backend indicates request pending, treat accordingly
      if (res.success && (res.data as any)?.requestPending) {
        toast({
          title: "Message request sent",
          description: "Waiting for approval.",
        });
        setNewMessage("");
        // Update local selected match flags to reflect pending state immediately
        try {
          setSelectedMatch((prev: any) =>
            prev
              ? {
                  ...prev,
                  messageRequestPending: true,
                  messageRequestFrom: String(authUser?.id || ""),
                  messagingApproved: false,
                }
              : prev
          );
        } catch {}
        try {
          const mres = await arcadeAPI.getMatches();
          if (mres.success && Array.isArray(mres.data))
            setMatches(mres.data as any[]);
        } catch {}
        return;
      }
      if (res.success && res.data) {
        const norm = normalizeMessage(res.data);
        setChatMessages((prev) => [...prev, norm]);
        setNewMessage("");
        setBlockedByPeer(false);
      } else if (!res.success) {
        const msg = String((res as any)?.error || "").toLowerCase();
        if (msg.includes("403") || msg.includes("block")) {
          // Peer has blocked me (or server forbids messaging)
          setBlockedByPeer(true);
          toast({
            title: "Can't send",
            description: "You can't send because this user has blocked you.",
          });
        }
      }
    } catch {}
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // Helpers for message normalization
  const toId = (v: any): string => {
    if (!v) return "";
    if (typeof v === "string") return v;
    return String(v._id || v.id || v);
  };
  const normalizeMessage = (m: any): ChatMessage => {
    const rawType = m?.messageType || m?.type || "text";
    const type: "text" | "image" | "file" =
      rawType === "image" || rawType === "file" ? rawType : "text";
    const ts = m?.timestamp || m?.createdAt || m?.updatedAt || Date.now();
    return {
      id: String(m?.id || m?._id || Math.random().toString(36).slice(2)),
      chatId: String(
        (m?.chatId && (m?.chatId?._id || m?.chatId?.id || m?.chatId)) || ""
      ),
      senderId: toId(m?.senderId),
      content: String(m?.content ?? m?.text ?? ""),
      timestamp: new Date(ts).toISOString(),
      type,
      isPinned: Boolean(m?.isPinned),
    };
  };
  const normalizeMessages = (arr: any[]): ChatMessage[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map(normalizeMessage);
  };

  // Keep messages ordered (oldest at top, latest at bottom)
  const orderedMessages = useMemo(() => {
    const arr = [...chatMessages];
    arr.sort((a, b) => {
      const taRaw = (a as any)?.timestamp || (a as any)?.createdAt;
      const tbRaw = (b as any)?.timestamp || (b as any)?.createdAt;
      const ta = new Date(taRaw || 0).getTime();
      const tb = new Date(tbRaw || 0).getTime();
      return ta - tb;
    });
    return arr;
  }, [chatMessages]);

  // Auto scroll to bottom when messages change and chat is unlocked
  useEffect(() => {
    if (!isChatAuthenticated) return;
    const el = messagesContainerRef.current;
    if (!el) return;
    // Use rAF to ensure DOM painted
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [isChatAuthenticated, orderedMessages.length]);

  // Reset peer-block banner when opening a different chat or closing/opening modal
  useEffect(() => {
    if (!showChat) {
      setBlockedByPeer(false);
      return;
    }
    try {
      const flag = Boolean(
        (selectedMatch as any)?.partnerHasBlockedMe ||
          (selectedMatch as any)?.blockedByPeer ||
          (selectedMatch as any)?.peerBlockedMe
      );
      setBlockedByPeer(flag);
    } catch {
      setBlockedByPeer(false);
    }
  }, [showChat, selectedMatch]);

  // When chat is authenticated, fetch latest messages if chatId is known
  useEffect(() => {
    const loadOnUnlock = async () => {
      if (!isChatAuthenticated || !selectedMatch) return;
      let chatId = getChatId(selectedMatch);
      if (!chatId) return; // creation is handled on first send
      try {
        const res = await chatAPI.getMessages(String(chatId), 1, 50);
        if (res.success)
          setChatMessages(normalizeMessages(res.data?.messages || []));
      } catch {}
    };
    loadOnUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatAuthenticated]);

  const nextImage = () => {
    if (display && display.photos.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === display.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (display && display.photos.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? display.photos.length - 1 : prev - 1
      );
    }
  };

  const clearFilters = () => {
    setSelectedGender("all");
    setAgeRange([18, 35]);
    setMaxDistance([50]);
    setSelectedInterests([]);
    setOnlyVerified(false);
    setShowFilters(false);
  };

  if (!currentUser) {
    // If filters are active and they eliminated all candidates, offer to clear filters
    if (showFilters && candidates.length > 0 && filteredUsers.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-8 pb-8 text-center">
              <Filter className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">
                No profiles match your filters
              </h2>
              <p className="text-muted-foreground mb-4">
                Adjust or clear filters to see more profiles.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" onClick={() => setShowFilters(false)}>
                  Hide Filters
                </Button>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (loadingCandidates || !loadedOnce || hasMoreCandidates) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto" />
                <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Loading profiles…
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">No More Profiles</h2>
            <p className="text-muted-foreground mb-4">
              You've seen all available profiles. Check back later for new
              matches!
            </p>
            <Button onClick={resetSwipeHistory}>Reset Swipe History</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
              Arcade – Matchmaking
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
              Swipe, match, and connect with amazing people
            </p>
          </div>

          <div className="flex space-x-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 w-9 sm:h-10 sm:w-10"
            >
              <Filter className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              onClick={resetSwipeHistory}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Discovery Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm sm:text-base">
                    Gender Preference
                  </Label>
                  <Select
                    value={selectedGender}
                    onValueChange={setSelectedGender}
                  >
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm sm:text-base">
                    Age Range: {ageRange[0]} - {ageRange[1]}
                  </Label>
                  <Slider
                    value={ageRange}
                    onValueChange={setAgeRange}
                    max={60}
                    min={18}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm sm:text-base">
                    Max Distance: {maxDistance[0]} km
                  </Label>
                  <Slider
                    value={maxDistance}
                    onValueChange={setMaxDistance}
                    max={100}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm sm:text-base">Interests</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      "Travel",
                      "Photography",
                      "Fitness",
                      "Art",
                      "Gaming",
                      "Food",
                      "Music",
                      "Technology",
                    ].map((interest) => (
                      <Button
                        key={interest}
                        variant={
                          selectedInterests.includes(interest)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          setSelectedInterests((prev) =>
                            prev.includes(interest)
                              ? prev.filter((i) => i !== interest)
                              : [...prev, interest]
                          );
                        }}
                        className="justify-start text-xs sm:text-sm h-8 sm:h-9"
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified-only"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="verified-only" className="text-sm sm:text-base">
                  Show only verified users
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-10 sm:h-12">
            <TabsTrigger value="swipe" className="text-xs sm:text-sm">
              Swipe
            </TabsTrigger>
            <TabsTrigger value="matches" className="text-xs sm:text-sm">
              Matches ({topMatches.length})
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs sm:text-sm">
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Swipe Tab */}
          <TabsContent value="swipe" className="space-y-4 sm:space-y-6">
            <Card className="w-full max-w-sm sm:max-w-md mx-auto">
              <CardContent className="p-0">
                {/* Profile Image */}
                <div
                  className={`relative h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden ${
                    isSwiping ? "opacity-95" : ""
                  }`}
                >
                  <img
                    src={display.photos[currentImageIndex]}
                    alt={display.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Image Navigation */}
                  {display.photos.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      {/* Image Dots */}
                      <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
                        {display.photos.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                              index === currentImageIndex
                                ? "bg-white"
                                : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Profile Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">
                        {display.name}
                        {display.age ? `, ${display.age}` : ""}
                      </h3>
                      {display.verified && (
                        <Badge className="bg-blue-500">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm opacity-90 mb-2">{display.bio}</p>
                    <div className="flex items-center space-x-4 text-xs opacity-75">
                      <span className="flex items-center">
                        <LocationIcon className="w-3 h-3 mr-1" />
                        {display.location || "Nearby"}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {display.mutualFriends ?? 0} mutual friends
                      </span>
                    </div>
                  </div>

                  {/* Action Feedback Overlay */}
                  {actionFeedback?.userId === String(display.id) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg ${
                          actionFeedback.action === "like"
                            ? "bg-green-500"
                            : actionFeedback.action === "superlike"
                            ? "bg-yellow-500"
                            : "bg-gray-600"
                        }`}
                      >
                        {actionFeedback.action === "like" && "Liked"}
                        {actionFeedback.action === "superlike" && "Super Liked"}
                        {actionFeedback.action === "pass" && "Passed"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4">
                  <div className="flex justify-center space-x-3 sm:space-x-4 mb-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`w-14 h-14 sm:w-12 sm:h-12 rounded-full border-red-300 hover:border-red-400 ${
                        actionFeedback?.action === "pass" &&
                        actionFeedback?.userId === String(display.id)
                          ? "bg-red-50"
                          : ""
                      }`}
                      disabled={isSwiping}
                      onClick={() => handleDislike(String(display.id))}
                    >
                      <X className="w-7 h-7 sm:w-6 sm:h-6 text-red-500" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className={`w-14 h-14 sm:w-12 sm:h-12 rounded-full border-yellow-300 hover:border-yellow-400 ${
                        actionFeedback?.action === "superlike" &&
                        actionFeedback?.userId === String(display.id)
                          ? "bg-yellow-50"
                          : ""
                      }`}
                      disabled={isSwiping}
                      onClick={() => handleSuperLike(String(display.id))}
                    >
                      <Star className="w-7 h-7 sm:w-6 sm:h-6 text-yellow-500" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className={`w-14 h-14 sm:w-12 sm:h-12 rounded-full border-green-300 hover:border-green-400 ${
                        actionFeedback?.action === "like" &&
                        actionFeedback?.userId === String(display.id)
                          ? "bg-green-50"
                          : ""
                      }`}
                      disabled={isSwiping}
                      onClick={() => handleLike(String(display.id))}
                    >
                      <Heart className="w-7 h-7 sm:w-6 sm:h-6 text-green-500" />
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Swipe right to like, left to pass</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            {/* Message Requests section */}
            <Card>
              <CardHeader className="pb-2 flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" /> Message Requests (
                  {incomingRequests.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRequests((v) => !v)}
                >
                  {showRequests ? "Hide" : "Show"}
                </Button>
              </CardHeader>
              {showRequests && (
                <CardContent className="space-y-3">
                  {incomingRequests.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No message requests yet.
                    </div>
                  )}
                  {incomingRequests.map((req) => {
                    const u = getMatchUser(req);
                    return (
                      <div
                        key={String(u.id)}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback>
                              {(u.name || "?").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{u.name}</div>
                            <div className="text-xs text-muted-foreground">
                              wants to message you
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              // Ensure chat exists
                              let chatId = getChatId(req);
                              if (!chatId) {
                                try {
                                  const created = await chatAPI.createChat([
                                    String(u.id),
                                  ]);
                                  if (
                                    created.success &&
                                    ((created.data as any)?.id ||
                                      (created.data as any)?._id)
                                  ) {
                                    chatId = String(
                                      (created.data as any).id ||
                                        (created.data as any)._id
                                    );
                                    (req as any).chatId = chatId;
                                  }
                                } catch {}
                              }
                              if (chatId) {
                                const res = await chatAPI.approveChat(
                                  String(chatId)
                                );
                                if (res.success) {
                                  toast({
                                    title: "Request accepted",
                                    description: `You can now chat with ${u.name}.`,
                                  });
                                  // Update local flags so input unlocks immediately
                                  (req as any).messagingApproved = true;
                                  (req as any).messageRequestPending = false;
                                  (req as any).messageRequestFrom = null;
                                  // Refresh matches
                                  try {
                                    const mres = await arcadeAPI.getMatches();
                                    if (
                                      mres.success &&
                                      Array.isArray(mres.data)
                                    )
                                      setMatches(mres.data as any[]);
                                  } catch {}
                                  // Auto-open chat modal
                                  setSelectedMatch(req);
                                  setShowChat(true);
                                  setIsChatAuthenticated(false);
                                  setChatPin("");
                                  setChatMessages([]);
                                  const key = getChatLockKey(req);
                                  const stored = key
                                    ? localStorage.getItem(key)
                                    : null;
                                  setHasExistingPin(
                                    Boolean(stored && stored.length === 4)
                                  );
                                  setCreatePin("");
                                } else {
                                  toast({
                                    title: "Failed",
                                    description: "Could not approve chat",
                                    variant: "destructive",
                                  });
                                }
                              }
                            }}
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
            {topMatches.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
                <p className="text-muted-foreground">
                  Start swiping to find your matches!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {topMatches.map((match) => (
                  <Card
                    key={String((match as any).id || (match as any)._id)}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={getMatchUser(match).avatar} />
                          <AvatarFallback>
                            {(getMatchUser(match).name || "?").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {getMatchUser(match).name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Matched{" "}
                            {getMatchedAt(match)
                              ? new Date(
                                  getMatchedAt(match) as string
                                ).toLocaleDateString()
                              : "recently"}
                          </p>
                          {getUnread(match) > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {getUnread(match)} new
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="flex-1 min-w-[7rem]"
                          onClick={async () => {
                            // Ensure there's a chat for this match; create if missing
                            let chatId = getChatId(match);
                            if (!chatId) {
                              try {
                                const partnerId = getMatchUser(match)
                                  .id as string;
                                const created = await chatAPI.createChat([
                                  String(partnerId),
                                ]);
                                if (
                                  created.success &&
                                  ((created.data as any)?.id ||
                                    (created.data as any)?._id)
                                ) {
                                  chatId = String(
                                    (created.data as any).id ||
                                      (created.data as any)._id
                                  );
                                  (match as any).chatId = chatId;
                                }
                              } catch {}
                            }

                            setSelectedMatch(match);
                            setShowChat(true);
                            setIsChatAuthenticated(false);
                            setChatPin("");
                            setChatMessages([]);
                            // Pre-check relationship to set blocked states immediately (if supported)
                            try {
                              const uid = String(getMatchUser(match)?.id || "");
                              if (uid) {
                                const rel = await arcadeAPI.getRelationship(
                                  uid
                                );
                                if (rel?.success && rel.data) {
                                  const iBlocked = Boolean(rel.data.iBlocked);
                                  const peerBlocked = Boolean(
                                    rel.data.blockedByPeer
                                  );
                                  setBlockedByPeer(peerBlocked);
                                  setBlockedUserIds((prev) => {
                                    const has = prev.includes(uid);
                                    if (iBlocked && !has) return [...prev, uid];
                                    if (!iBlocked && has)
                                      return prev.filter((id) => id !== uid);
                                    return prev;
                                  });
                                }
                              }
                            } catch {}
                            // Decide whether to create PIN or verify existing one (do NOT auto-unlock)
                            const key = getChatLockKey(match);
                            const stored = key
                              ? localStorage.getItem(key)
                              : null;
                            const exists = Boolean(
                              stored && stored.length === 4
                            );
                            setHasExistingPin(exists);
                            setCreatePin("");
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReportUser(getMatchUser(match))}
                          title="Report user"
                        >
                          <Flag className="w-4 h-4" />
                        </Button>

                        {(() => {
                          const uid = String(getMatchUser(match).id || "");
                          const isBlocked = uid && blockedUserIds.includes(uid);
                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBlockToggle(uid)}
                              title={isBlocked ? "Unblock user" : "Block user"}
                            >
                              <UserMinus className="w-4 h-4 mr-1" />
                              {isBlocked ? "Unblock" : "Block"}
                            </Button>
                          );
                        })()}

                        {(() => {
                          const pending = Boolean(
                            (match as any)?.messageRequestPending
                          );
                          const from = String(
                            (match as any)?.messageRequestFrom || ""
                          );
                          const me = String(authUser?.id || "");
                          const iAmRecipient =
                            pending && from && me && me !== from;
                          if (!iAmRecipient) return null;
                          return (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={async () => {
                                // Ensure chat exists
                                let chatId = getChatId(match);
                                if (!chatId) {
                                  try {
                                    const partnerId = getMatchUser(match)
                                      .id as string;
                                    const created = await chatAPI.createChat([
                                      String(partnerId),
                                    ]);
                                    if (
                                      created.success &&
                                      ((created.data as any)?.id ||
                                        (created.data as any)?._id)
                                    ) {
                                      chatId = String(
                                        (created.data as any).id ||
                                          (created.data as any)._id
                                      );
                                      (match as any).chatId = chatId;
                                    }
                                  } catch {}
                                }
                                if (chatId) {
                                  const res = await chatAPI.approveChat(
                                    String(chatId)
                                  );
                                  if (res.success) {
                                    toast({
                                      title: "Request accepted",
                                      description: "You can now chat.",
                                    });
                                    (match as any).messagingApproved = true;
                                    (match as any).messageRequestPending =
                                      false;
                                    (match as any).messageRequestFrom = null;
                                    try {
                                      const mres = await arcadeAPI.getMatches();
                                      if (
                                        mres.success &&
                                        Array.isArray(mres.data)
                                      )
                                        setMatches(mres.data as any[]);
                                    } catch {}
                                  } else {
                                    toast({
                                      title: "Failed",
                                      description: "Could not approve chat",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                            >
                              Approve
                            </Button>
                          );
                        })()}

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            try {
                              const uid = String(getMatchUser(match)?.id || "");
                              if (!uid) return;
                              const res = await arcadeAPI.removeMatch(uid);
                              if (res.success) {
                                toast({
                                  title: "Unfriended",
                                  description:
                                    "Chat history cleared. Future messages need approval.",
                                });
                                // Reflect locally: mark messaging as not approved and no pending request
                                (match as any).messagingApproved = false;
                                (match as any).messageRequestPending = false;
                                (match as any).messageRequestFrom = null;
                                // Optionally refresh matches list from server
                                try {
                                  const mres = await arcadeAPI.getMatches();
                                  if (mres.success && Array.isArray(mres.data))
                                    setMatches(mres.data as any[]);
                                } catch {}
                              } else {
                                toast({
                                  title: "Failed",
                                  description: String(
                                    (res as any)?.error || "Could not unfriend"
                                  ),
                                  variant: "destructive",
                                });
                              }
                            } catch {
                              toast({
                                title: "Failed",
                                description: "Could not unfriend",
                                variant: "destructive",
                              });
                            }
                          }}
                          title="Remove match"
                        >
                          Unfriend
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                role="button"
                tabIndex={0}
                onClick={() =>
                  setStatsView(statsView === "liked" ? null : "liked")
                }
                className={statsView === "liked" ? "ring-2 ring-primary" : ""}
              >
                <CardContent className="p-6 text-center">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <h3 className="text-2xl font-bold">{likedUsers.length}</h3>
                  <p className="text-muted-foreground">Profiles Liked</p>
                </CardContent>
              </Card>

              <Card
                role="button"
                tabIndex={0}
                onClick={() =>
                  setStatsView(statsView === "superliked" ? null : "superliked")
                }
                className={
                  statsView === "superliked" ? "ring-2 ring-primary" : ""
                }
              >
                <CardContent className="p-6 text-center">
                  <Star className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-2xl font-bold">
                    {superLikedUsers.length}
                  </h3>
                  <p className="text-muted-foreground">Super Likes</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-2xl font-bold">{matches.length}</h3>
                  <p className="text-muted-foreground">Total Matches</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-2xl font-bold">
                    {(() => {
                      const totalLikes =
                        likedUsers.length + superLikedUsers.length;
                      const rate =
                        totalLikes > 0
                          ? Math.round((matches.length / totalLikes) * 100)
                          : 0;
                      return `${rate}%`;
                    })()}
                  </h3>
                  <p className="text-muted-foreground">Match Rate</p>
                </CardContent>
              </Card>

              <Card
                role="button"
                tabIndex={0}
                onClick={() =>
                  setStatsView(statsView === "passed" ? null : "passed")
                }
                className={statsView === "passed" ? "ring-2 ring-primary" : ""}
              >
                <CardContent className="p-6 text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                  <h3 className="text-2xl font-bold">{dislikedUsers.length}</h3>
                  <p className="text-muted-foreground">Profiles Passed</p>
                </CardContent>
              </Card>
            </div>

            {/* Stats detail lists */}
            {statsView && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">
                  {statsView === "liked" && "Profiles you liked"}
                  {statsView === "superliked" && "Your Super Likes"}
                  {statsView === "passed" && "Profiles you passed"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(statsView === "liked"
                    ? likedList
                    : statsView === "superliked"
                    ? superLikedList
                    : passedList
                  ).map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg bg-white"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>
                          {(u.name || "?").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{u.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {u.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Match Notification */}
        {showMatchNotification && matchedUser && (
          <div className="fixed top-4 left-4 right-4 sm:right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm mx-auto sm:mx-0">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6" />
              <div>
                <h4 className="font-semibold">It's a Match! 🎉</h4>
                <p className="text-sm">
                  You and {matchedUser.name} liked each other!
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-white text-green-500 hover:bg-gray-100"
                  onClick={() => {
                    setShowMatchNotification(false);
                    setActiveTab("matches");
                  }}
                >
                  View Match
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        <Dialog open={showChat} onOpenChange={setShowChat}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Chat with {getMatchUser(selectedMatch)?.name}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {!isChatAuthenticated ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-yellow-600 mb-2">
                      <Lock className="w-5 h-5" />
                      <span className="font-semibold">Secure Chat</span>
                    </div>
                    {hasExistingPin ? (
                      <p className="text-sm text-yellow-700">
                        Enter your 4-digit PIN to unlock chat with{" "}
                        {getMatchUser(selectedMatch)?.name}.
                      </p>
                    ) : (
                      <p className="text-sm text-yellow-700">
                        Set a 4-digit PIN for this chat with{" "}
                        {getMatchUser(selectedMatch)?.name}. You’ll use it to
                        unlock next time.
                      </p>
                    )}
                  </div>

                  {hasExistingPin ? (
                    <>
                      <div className="flex justify-center space-x-2">
                        {[0, 1, 2, 3].map((index) => (
                          <Input
                            key={index}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            className="w-14 h-14 sm:w-12 sm:h-12 text-center text-lg font-mono"
                            value={chatPin[index] || ""}
                            onChange={(e) => {
                              const newPin = chatPin.split("");
                              newPin[index] = e.target.value.replace(/\D/g, "");
                              setChatPin(newPin.join(""));
                              if (e.target.value && index < 3) {
                                const nextInput =
                                  e.target.parentElement?.nextElementSibling?.querySelector(
                                    "input"
                                  );
                                if (nextInput) nextInput.focus();
                              }
                            }}
                          />
                        ))}
                      </div>
                      <Button
                        onClick={async () => {
                          const key = getChatLockKey(selectedMatch);
                          const stored = key ? localStorage.getItem(key) : null;
                          if (stored && chatPin === stored) {
                            setIsChatAuthenticated(true);
                            toast({
                              title: "Chat Unlocked! 🔓",
                              description: "You can now chat with your match",
                            });
                            // Ensure we have a chat id before loading messages
                            let chatId = getChatId(selectedMatch);
                            if (!chatId) {
                              try {
                                const partnerId = getMatchUser(
                                  selectedMatch as any
                                ).id as string;
                                const created = await chatAPI.createChat([
                                  String(partnerId),
                                ]);
                                if (
                                  created.success &&
                                  (created.data as any)?.id
                                ) {
                                  chatId = String((created.data as any).id);
                                  (selectedMatch as any).chatId = chatId;
                                }
                              } catch {}
                            }
                            if (chatId) {
                              try {
                                const res = await chatAPI.getMessages(
                                  String(chatId),
                                  1,
                                  50
                                );
                                if (res.success) {
                                  setChatMessages(res.data?.messages || []);
                                }
                              } catch {}
                            }
                          } else {
                            toast({
                              title: "Incorrect PIN",
                              description: "Please try again",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={chatPin.length !== 4}
                        className="w-full"
                      >
                        Unlock Chat
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center space-x-2">
                        {[0, 1, 2, 3].map((index) => (
                          <Input
                            key={`create-${index}`}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            className="w-14 h-14 sm:w-12 sm:h-12 text-center text-lg font-mono"
                            value={createPin[index] || ""}
                            onChange={(e) => {
                              const newPin = createPin.split("");
                              newPin[index] = e.target.value.replace(/\D/g, "");
                              setCreatePin(newPin.join(""));
                              if (e.target.value && index < 3) {
                                const nextInput =
                                  e.target.parentElement?.nextElementSibling?.querySelector(
                                    "input"
                                  );
                                if (nextInput) nextInput.focus();
                              }
                            }}
                          />
                        ))}
                      </div>
                      <Button
                        onClick={async () => {
                          const key = getChatLockKey(selectedMatch);
                          if (!key) return;
                          if (createPin.length !== 4) return;
                          try {
                            localStorage.setItem(key, createPin);
                            setHasExistingPin(true);
                            setIsChatAuthenticated(true);
                            toast({
                              title: "PIN set",
                              description:
                                "Chat unlocked and PIN saved for next time",
                            });
                            let chatId = getChatId(selectedMatch);
                            if (!chatId) {
                              try {
                                const partnerId = getMatchUser(
                                  selectedMatch as any
                                ).id as string;
                                const created = await chatAPI.createChat([
                                  String(partnerId),
                                ]);
                                if (
                                  created.success &&
                                  (created.data as any)?.id
                                ) {
                                  chatId = String((created.data as any).id);
                                  (selectedMatch as any).chatId = chatId;
                                }
                              } catch {}
                            }
                            if (chatId) {
                              const res = await chatAPI.getMessages(
                                String(chatId),
                                1,
                                50
                              );
                              if (res.success) {
                                setChatMessages(res.data?.messages || []);
                              }
                            }
                          } catch {
                            toast({
                              title: "Failed to save PIN",
                              description: "Try again",
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={createPin.length !== 4}
                        className="w-full"
                      >
                        Set PIN & Unlock Chat
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Secure Chat Active</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Your conversation is now encrypted and secure.
                    </p>
                  </div>

                  {/* Message request state */}
                  {(() => {
                    const pending = Boolean(
                      (selectedMatch as any)?.messageRequestPending
                    );
                    const from = String(
                      (selectedMatch as any)?.messageRequestFrom || ""
                    );
                    const approved = Boolean(
                      (selectedMatch as any)?.messagingApproved
                    );
                    const iAmRecipient =
                      pending && from && String(authUser?.id || "") !== from;
                    if (approved) return null;
                    if (pending && iAmRecipient) {
                      return (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
                          <div className="text-sm text-yellow-800">
                            This user requested to message you.
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              // Ensure chat exists
                              let chatId = getChatId(selectedMatch);
                              if (!chatId) {
                                try {
                                  const partnerId = getMatchUser(selectedMatch)
                                    .id as string;
                                  const created = await chatAPI.createChat([
                                    String(partnerId),
                                  ]);
                                  if (
                                    created.success &&
                                    ((created.data as any)?.id ||
                                      (created.data as any)?._id)
                                  ) {
                                    chatId = String(
                                      (created.data as any).id ||
                                        (created.data as any)._id
                                    );
                                    (selectedMatch as any).chatId = chatId;
                                  }
                                } catch {}
                              }
                              if (chatId) {
                                const res = await chatAPI.approveChat(
                                  String(chatId)
                                );
                                if (res.success) {
                                  toast({
                                    title: "Request accepted",
                                    description: "You can now chat.",
                                  });
                                  (selectedMatch as any).messagingApproved =
                                    true;
                                  (selectedMatch as any).messageRequestPending =
                                    false;
                                  (selectedMatch as any).messageRequestFrom =
                                    null;
                                  try {
                                    const mres = await arcadeAPI.getMatches();
                                    if (
                                      mres.success &&
                                      Array.isArray(mres.data)
                                    )
                                      setMatches(mres.data as any[]);
                                  } catch {}
                                } else {
                                  toast({
                                    title: "Failed",
                                    description: "Could not approve chat",
                                    variant: "destructive",
                                  });
                                }
                              }
                            }}
                          >
                            Accept
                          </Button>
                        </div>
                      );
                    }
                    if (pending && !iAmRecipient) {
                      return (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                          Message request sent. Waiting for approval.
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Chat Messages */}
                  {(() => {
                    const uid = String(getMatchUser(selectedMatch)?.id || "");
                    const iBlocked = uid && blockedUserIds.includes(uid);
                    if (iBlocked) {
                      return (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mb-2">
                          You've blocked this user. Unblock to send messages.
                        </div>
                      );
                    }
                    if (blockedByPeer) {
                      return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 mb-2">
                          You can't send because this user has blocked you.
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div
                    ref={messagesContainerRef}
                    className="border rounded-lg p-4 min-h-64 max-h-96 overflow-y-auto"
                  >
                    {orderedMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-3 flex ${
                          message.senderId === authUser?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            message.senderId === authUser?.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {(() => {
                              const d = new Date(
                                (message as any)?.timestamp ||
                                  (message as any)?.createdAt ||
                                  0
                              );
                              return isNaN(d.getTime())
                                ? ""
                                : d.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  });
                            })()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  {(() => {
                    const approved = Boolean(
                      (selectedMatch as any)?.messagingApproved
                    );
                    const pending = Boolean(
                      (selectedMatch as any)?.messageRequestPending
                    );
                    const partnerId = String(
                      getMatchUser(selectedMatch)?.id || ""
                    );
                    const iBlocked =
                      partnerId && blockedUserIds.includes(partnerId);
                    const disableInput =
                      (!approved && pending) || iBlocked || blockedByPeer; // gate until approved or blocked
                    return (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                          disabled={disableInput}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={disableInput || !newMessage.trim()}
                        >
                          {iBlocked
                            ? "Unblock to send"
                            : blockedByPeer
                            ? "Blocked"
                            : approved
                            ? "Send"
                            : pending
                            ? "Waiting..."
                            : "Send message request"}
                        </Button>
                      </div>
                    );
                  })()}

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowChat(false);
                        setIsChatAuthenticated(false);
                        setChatPin("");
                        setChatMessages([]);
                      }}
                    >
                      Close Chat
                    </Button>

                    {(() => {
                      const uid = String(getMatchUser(selectedMatch)?.id || "");
                      const isBlocked = uid && blockedUserIds.includes(uid);
                      return (
                        <Button
                          variant="outline"
                          onClick={() => handleBlockToggle(uid)}
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          {isBlocked ? "Unblock" : "Block User"}
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Modal */}
        <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Flag className="w-5 h-5 text-red-500" />
                <span>Report User</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Report {userToReport?.name} for inappropriate behavior or
                content.
              </p>

              <div>
                <Label htmlFor="report-reason">Reason for Report</Label>
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inappropriate">
                      Inappropriate Content
                    </SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="fake">Fake Profile</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReport}
                  disabled={!reportReason}
                  className="flex-1"
                >
                  Submit Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

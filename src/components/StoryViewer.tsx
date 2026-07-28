import React, { useState, useEffect, useRef } from "react";
import { storiesAPI } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  Users,
  MessageCircle,
  Share2,
  MoreVertical,
  User,
  Calendar,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: StoryData[];
  currentStoryIndex: number;
  onStoryChange: (index: number) => void;
}

interface StoryData {
  id: string;
  image: string;
  textOverlays: TextOverlay[];
  stickers: Sticker[];
  createdAt: Date;
  expiresAt: Date;
  views?: number;
  likes?: number;
  likedByMe?: boolean;
  viewers?: StoryViewer[];
  reactions?: StoryReaction[];
  user?: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
}

interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

interface StoryViewer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  viewedAt: Date;
  isFollowing: boolean;
}

interface StoryReaction {
  id: string;
  type: "like" | "heart" | "laugh" | "wow" | "sad" | "angry";
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  timestamp: Date;
}
// Note: viewers and reactions will be sourced from the currentStory when available

export const StoryViewer: React.FC<StoryViewerProps> = ({
  isOpen,
  onClose,
  stories,
  currentStoryIndex,
  onStoryChange,
}) => {
  const { user: authUser } = useAuth();
  const [currentStory, setCurrentStory] = useState<StoryData | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isPaused, setIsPaused] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [authoritativeViewers, setAuthoritativeViewers] = useState<
    StoryViewer[]
  >([]);
  const [likersSet, setLikersSet] = useState<Set<string>>(new Set());

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const storyDuration = 5000; // 5 seconds per story

  useEffect(() => {
    if (isOpen && stories.length > 0) {
      setCurrentStory(stories[currentStoryIndex]);
      setProgress(0);
      setIsPaused(false);
      // Initialize like state based on data
      const initial = stories[currentStoryIndex] as any;
      setHasLiked(Boolean(initial?.likedByMe));
      setShowInsights(false);
      setAuthoritativeViewers([]);
      startProgress();
      // Mark story as viewed
      const s = stories[currentStoryIndex];
      if (s?.id) {
        storiesAPI.viewStory(s.id).catch(() => {});
      }
    }
  }, [isOpen, currentStoryIndex, stories]);

  // If viewing own story, fetch authoritative viewers automatically so counts are correct
  useEffect(() => {
    const me = String((authUser as any)?.id || (authUser as any)?._id || "");
    const storyUserId = String(currentStory?.user?.id || "");
    const isOwner = me && storyUserId && me === storyUserId;
    const fetchViewers = async () => {
      try {
        if (isOpen && isOwner && currentStory?.id) {
          const res = await storiesAPI.getStoryViewers(currentStory.id);
          const list = Array.isArray(res?.data)
            ? (res.data as any[])
            : Array.isArray((res?.data as any)?.viewers)
            ? ((res?.data as any)?.viewers as any[])
            : [];
          if (res?.success && Array.isArray(list)) {
            const likesArr = Array.isArray((res?.data as any)?.likes)
              ? ((res?.data as any)?.likes as any[])
              : [];
            const likeIds = new Set(
              likesArr
                .map((l: any) => String(l?.user?._id || l?.user?.id || ""))
                .filter(Boolean)
            );
            const normalized = (
              list
                .map((v: any) => {
                  const node = v?.user || v;
                  const id = String(
                    node?._id || node?.id || v?._id || v?.id || ""
                  );
                  const rawUsername = node?.username || node?.handle || "";
                  if (!id || !rawUsername) return null; // require valid username
                  const name =
                    node?.name ||
                    node?.fullName ||
                    node?.displayName ||
                    rawUsername;
                  const username = rawUsername;
                  const avatar =
                    node?.avatar || node?.profileImage || "/placeholder.svg";
                  const viewedAt = new Date(
                    v?.viewedAt || v?.createdAt || Date.now()
                  );
                  const isFollowing = Boolean(
                    v?.isFollowing || node?.isFollowing
                  );
                  return {
                    id,
                    name,
                    username,
                    avatar,
                    viewedAt,
                    isFollowing,
                  } as StoryViewer;
                })
                .filter(Boolean) as StoryViewer[]
            ).filter(
              (viewer, idx, arr) =>
                arr.findIndex((x) => x.id === viewer.id) === idx
            );
            setLikersSet(likeIds);
            setAuthoritativeViewers(normalized);
          }
        }
      } catch {}
    };
    fetchViewers();
  }, [isOpen, currentStory?.id, (authUser as any)?.id]);

  useEffect(() => {
    if (currentStory) {
      updateTimeRemaining();
      const timeInterval = setInterval(updateTimeRemaining, 1000);
      return () => clearInterval(timeInterval);
    }
  }, [currentStory]);

  const startProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (!isPaused && !showInsights) {
        setProgress((prev) => {
          if (prev >= 100) {
            // Auto-advance to next story or close if it's the last one
            if (currentStoryIndex < stories.length - 1) {
              nextStory();
            } else {
              onClose();
            }
            return 0;
          }
          return prev + 100 / (storyDuration / 100);
        });
      }
    }, 100);
  };

  const updateTimeRemaining = () => {
    if (!currentStory) return;

    const now = new Date();
    const expiresAt = new Date(currentStory.expiresAt);
    const timeLeft = expiresAt.getTime() - now.getTime();

    if (timeLeft <= 0) {
      setTimeRemaining("Expired");
      return;
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m left`);
    } else {
      setTimeRemaining(`${minutes}m left`);
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      onStoryChange(currentStoryIndex + 1);
    } else {
      // Auto-close when reaching the end of stories
      onClose();
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      onStoryChange(currentStoryIndex - 1);
    }
  };

  const handleLike = async () => {
    try {
      const s = stories[currentStoryIndex];
      if (!s?.id) return;
      const res = await storiesAPI.likeStory(s.id);
      setHasLiked(Boolean(res?.data?.isLiked));
      // Notify app so previews/groups can reflect latest like status for persistence
      try {
        window.dispatchEvent(
          new CustomEvent("storyLikeToggled", {
            detail: { storyId: s.id, isLiked: Boolean(res?.data?.isLiked) },
          })
        );
      } catch {}
      toast({
        title: res?.data?.isLiked ? "Story liked!" : "Story unliked",
        description: res?.data?.isLiked
          ? "You liked this story"
          : "You unliked this story",
      });
    } catch (e) {
      // fallback UI only
      setHasLiked((v) => !v);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      startProgress();
    }
  };

  const handleInsights = async () => {
    const willOpen = !showInsights;
    setShowInsights(willOpen);
    if (!willOpen) {
      startProgress();
      return;
    }
    // When opening insights, try to fetch authoritative viewers (owner-only API)
    try {
      const s = stories[currentStoryIndex];
      if (s?.id) {
        const res = await storiesAPI.getStoryViewers(s.id);
        const list = Array.isArray(res?.data)
          ? (res.data as any[])
          : Array.isArray((res?.data as any)?.viewers)
          ? ((res?.data as any)?.viewers as any[])
          : [];
        if (res?.success && Array.isArray(list)) {
          const likesArr = Array.isArray((res?.data as any)?.likes)
            ? ((res?.data as any)?.likes as any[])
            : [];
          const likeIds = new Set(
            likesArr
              .map((l: any) => String(l?.user?._id || l?.user?.id || ""))
              .filter(Boolean)
          );
          const normalized = (
            list
              .map((v: any) => {
                const node = v?.user || v;
                const id = String(
                  node?._id || node?.id || v?._id || v?.id || ""
                );
                const rawUsername = node?.username || node?.handle || "";
                if (!id || !rawUsername) return null; // require valid username
                const name =
                  node?.name ||
                  node?.fullName ||
                  node?.displayName ||
                  rawUsername;
                const username = rawUsername;
                const avatar =
                  node?.avatar || node?.profileImage || "/placeholder.svg";
                const viewedAt = new Date(
                  v?.viewedAt || v?.createdAt || Date.now()
                );
                const isFollowing = Boolean(
                  v?.isFollowing || node?.isFollowing
                );
                return {
                  id,
                  name,
                  username,
                  avatar,
                  viewedAt,
                  isFollowing,
                } as StoryViewer;
              })
              .filter(Boolean) as StoryViewer[]
          ).filter(
            (viewer, idx, arr) =>
              arr.findIndex((x) => x.id === viewer.id) === idx
          );
          setLikersSet(likeIds);
          setAuthoritativeViewers(normalized);
        }
      }
    } catch {}
  };

  const handleClose = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    onClose();
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getReactionEmoji = (type: string): string => {
    switch (type) {
      case "like":
        return "👍";
      case "heart":
        return "❤️";
      case "laugh":
        return "😂";
      case "wow":
        return "😮";
      case "sad":
        return "😢";
      case "angry":
        return "😠";
      default:
        return "👍";
    }
  };

  if (!currentStory) return null;
  // Normalize viewers to a consistent shape to ensure names/usernames render
  const viewersRaw = (currentStory.viewers || []) as any[];
  const baseViewers: StoryViewer[] = (
    viewersRaw
      .map((v: any) => {
        // Common shapes: string id; direct user object; nested user { user: {...} }
        const node = v?.user || v;
        const id = String(node?._id || node?.id || v?._id || v?.id || "");
        const rawUsername = node?.username || node?.handle || "";
        if (!id || !rawUsername) return null; // skip entries without username
        const name =
          node?.name || node?.fullName || node?.displayName || rawUsername;
        const username = rawUsername;
        const avatar = node?.avatar || node?.profileImage || "/placeholder.svg";
        const viewedAt = new Date(v?.viewedAt || v?.createdAt || Date.now());
        const isFollowing = Boolean(v?.isFollowing || node?.isFollowing);
        return {
          id,
          name,
          username,
          avatar,
          viewedAt,
          isFollowing,
        } as StoryViewer;
      })
      .filter(Boolean) as StoryViewer[]
  ).filter(
    (viewer, idx, arr) => arr.findIndex((x) => x.id === viewer.id) === idx
  );
  const viewers: StoryViewer[] =
    authoritativeViewers.length > 0 ? authoritativeViewers : baseViewers;
  const reactions = (currentStory.reactions || []) as StoryReaction[];
  const viewsCount = viewers.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 bg-black border-0 rounded-none">
        {/* A11y: Provide required title/description for screen readers */}
        <DialogTitle className="sr-only">
          {currentStory.user?.name
            ? `${currentStory.user.name}'s story`
            : "Story viewer"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {`Posted ${formatTimeAgo(currentStory.createdAt)} • ${timeRemaining}`}
        </DialogDescription>
        <div className="relative w-full h-full flex flex-col">
          {/* Progress Bar */}
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="flex gap-1">
              {stories.map((_, index) => (
                <div
                  key={index}
                  className={`h-0.5 flex-1 rounded-full transition-all duration-100 ${
                    index === currentStoryIndex
                      ? index < currentStoryIndex
                        ? "bg-white"
                        : "bg-white/50"
                      : "bg-white/30"
                  }`}
                >
                  {index === currentStoryIndex && (
                    <div
                      className="h-full bg-white rounded-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="absolute top-12 left-4 right-4 z-10">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {currentStory.id.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {currentStory.user?.name || "Your Story"}
                  </div>
                  <div className="text-xs text-white/70 flex items-center gap-2">
                    <span>{formatTimeAgo(currentStory.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(() => {
                  const me = String(
                    (authUser as any)?.id || (authUser as any)?._id || ""
                  );
                  const isOwner =
                    me &&
                    currentStory.user?.id &&
                    me === String(currentStory.user.id);
                  return (
                    isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleInsights}
                        className="text-white hover:bg-white/20 p-2"
                        aria-label="Toggle insights"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    )
                  );
                })()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20 p-2"
                  aria-label="Close viewer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Story Image/Video */}
          <div className="flex-1 relative flex items-center justify-center bg-black">
            {currentStory.image &&
              (/\.(mp4|webm|ogg|mov|avi)$/i.test(currentStory.image) ? (
                <video
                  src={currentStory.image}
                  controls
                  className="w-full h-full object-cover"
                  style={{maxHeight: '100vh'}}
                  onClick={handlePause}
                />
              ) : (
                <img
                  src={currentStory.image}
                  alt="Story"
                  className="w-full h-full object-cover"
                  style={{maxHeight: '100vh'}}
                  onClick={handlePause}
                />
              ))}
              
            {/* Invisible touch areas for navigation */}
            <div className="absolute inset-0 flex">
              {/* Left side - previous story */}
              <div 
                className="flex-1 cursor-pointer" 
                onClick={previousStory}
              />
              {/* Right side - next story */}
              <div 
                className="flex-1 cursor-pointer" 
                onClick={nextStory}
              />
            </div>
            {/* Text Overlays */}
            {currentStory.textOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className="absolute select-none z-20"
                style={{
                  left: overlay.x,
                  top: overlay.y,
                  fontSize: overlay.fontSize,
                  color: overlay.color,
                  fontFamily: overlay.fontFamily,
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                {overlay.text}
              </div>
            ))}

            {/* Stickers */}
            {currentStory.stickers.map((sticker) => (
              <div
                key={sticker.id}
                className="absolute select-none z-20"
                style={{
                  left: sticker.x,
                  top: sticker.y,
                  fontSize: sticker.size,
                }}
              >
                {sticker.emoji}
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                    hasLiked
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-black/30 hover:bg-black/50"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`}
                  />
                </button>
                {(() => {
                  const me = String(
                    (authUser as any)?.id || (authUser as any)?._id || ""
                  );
                  const isOwner =
                    me &&
                    currentStory.user?.id &&
                    me === String(currentStory.user.id);
                  return (
                    isOwner && (
                      <button
                        onClick={handleInsights}
                        className="flex items-center gap-2 px-3 py-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                        aria-label="Show viewers"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{viewsCount}</span>
                      </button>
                    )
                  );
                })()}
              </div>

              <div className="text-xs text-white/70">
                {stories.length > 1 &&
                  `${currentStoryIndex + 1} of ${stories.length}`}
              </div>
            </div>
          </div>

          {/* Story Insights Overlay */}
          {showInsights && (
            <div className="absolute inset-0 bg-black/95 z-20 overflow-y-auto">
              <div className="p-4">
                {/* Insights Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Story Insights
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleInsights}
                    className="text-white hover:bg-white/20"
                    aria-label="Hide insights"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* Story Info */}
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={currentStory.image}
                      alt="Story"
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="text-white">
                      <div className="font-medium">Story Details</div>
                      <div className="text-sm text-white/70 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatTimeAgo(currentStory.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="text-white">
                      <div className="text-lg font-bold">{viewsCount}</div>
                      <div className="text-xs text-white/70">Views</div>
                    </div>
                    <div className="text-white">
                      <div className="text-lg font-bold">
                        {reactions.length}
                      </div>
                      <div className="text-xs text-white/70">Reactions</div>
                    </div>
                    <div className="text-white">
                      <div className="text-lg font-bold">{timeRemaining}</div>
                      <div className="text-xs text-white/70">Remaining</div>
                    </div>
                  </div>
                </div>

                {/* Viewers Section */}
                {viewers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Who Viewed ({viewers.length})
                    </h3>
                    <div className="space-y-3">
                      {viewers.map((viewer) => (
                        <div
                          key={viewer.id}
                          className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={viewer.avatar} />
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                {viewer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-white">
                              <div className="font-medium">{viewer.name}</div>
                              <div className="text-sm text-white/70">
                                @{viewer.username}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {viewer.isFollowing && (
                              <Badge variant="secondary" className="text-xs">
                                Following
                              </Badge>
                            )}
                            {likersSet.has(viewer.id) && (
                              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            )}
                            <span className="text-xs text-white/70">
                              {formatTimeAgo(viewer.viewedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reactions Section */}
                {reactions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Reactions ({reactions.length})
                    </h3>
                    <div className="space-y-3">
                      {reactions.map((reaction) => (
                        <div
                          key={reaction.id}
                          className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {getReactionEmoji(reaction.type)}
                            </div>
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={reaction.user.avatar} />
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                {reaction.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-white">
                              <div className="font-medium">
                                {reaction.user.name}
                              </div>
                              <div className="text-sm text-white/70">
                                @{reaction.user.username}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-white/70">
                            {formatTimeAgo(new Date(reaction.timestamp))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/30 text-white hover:bg-white/20"
                    onClick={() => {
                      toast({
                        title: "Share Story",
                        description: "Sharing coming soon",
                      });
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-white/30 text-white hover:bg-white/20"
                    onClick={() => {
                      toast({
                        title: "Download Story",
                        description: "Download coming soon",
                      });
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Pause Indicator */}
          {isPaused && !showInsights && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-black/70 text-white px-4 py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-medium">Story Paused</div>
                  <div className="text-sm text-white/70">Tap to resume</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

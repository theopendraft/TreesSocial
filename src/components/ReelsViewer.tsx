import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Share,
  Volume2,
  VolumeX,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { postsAPI } from "@/services/api";
import { Bookmark } from "lucide-react";

interface ReelUser {
  name?: string;
  username?: string;
  avatar?: string;
  verified?: boolean;
}

interface ReelItem {
  id: string;
  user?: ReelUser;
  video?: string;
  caption?: string;
  content?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  liked?: boolean;
  saved?: boolean;
  music?: string;
}

export const ReelsViewer = () => {
  const [currentReel, setCurrentReel] = useState(0);
  const [muted, setMuted] = useState(true);
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Array<any>>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  const normalize = (arr: any[]): ReelItem[] =>
    (arr || []).map((r: any) => {
      const mediaArray = r.media || [];
      const firstVideo =
        mediaArray.find((m: any) => m?.type === "video")?.url ||
        mediaArray[0]?.url;
      return {
        id: r.id || r._id || r.postId,
        video: r.video || r.videoUrl || firstVideo,
        caption: r.caption || r.content || "",
        content: r.content || r.caption || "",
        likes: r.likesCount || r.likes || 0,
        comments: Array.isArray(r.comments)
          ? r.comments.length
          : r.commentsCount || r.comments || 0,
        shares: r.shares || 0,
        views: r.views || 0,
        liked: r.isLiked || r.liked || false,
        saved: r.isBookmarked || r.isSaved || r.saved || false,
        user: {
          name:
            r.author?.fullName ||
            r.author?.name ||
            r.authorName ||
            r.user?.name,
          username: r.author?.username || r.user?.username || r.username,
          avatar: r.author?.avatar || r.user?.avatar || r.authorAvatar,
          verified: r.author?.isVerified || r.user?.verified || false,
        },
        music: r.music,
      };
    });

  const loadReels = useCallback(async (pageNum: number, append = true) => {
    try {
      if (!append) setLoading(true);
      const res = await postsAPI.getReels(pageNum, 10);
      if (res.success && res.data) {
        const data: any = res.data;
        // Accept multiple possible shapes from API: array | {reels} | {items} | {posts}
        const arr = Array.isArray(data)
          ? data
          : data.reels || data.items || data.posts || [];
        const mapped = normalize(arr);
        setReels((prev) => (append ? [...prev, ...mapped] : mapped));
        const has =
          typeof data.hasMore === "boolean"
            ? data.hasMore
            : typeof data.hasNextPage === "boolean"
            ? data.hasNextPage
            : Array.isArray(arr)
            ? arr.length === 10
            : false;
        setHasMore(has);
        setPage(pageNum);
      }
    } catch (e) {
      // swallow errors for now
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReels(1, false);
  }, [loadReels]);

  useEffect(() => {
    const onPostCreated = (e: any) => {
      if (e?.detail?.type === "reel") {
        loadReels(1, false);
      }
    };
    window.addEventListener("postCreated", onPostCreated);
    return () => window.removeEventListener("postCreated", onPostCreated);
  }, [loadReels]);

  const handleLike = async (index: number) => {
    // optimistic update
    let prev: ReelItem | undefined;
    setReels((prevArr) => {
      const next = [...prevArr];
      prev = { ...next[index] } as ReelItem;
      const item = { ...next[index] } as ReelItem;
      const liked = !item.liked;
      const likes = (item.likes || 0) + (liked ? 1 : -1);
      item.liked = liked;
      item.likes = Math.max(0, likes);
      next[index] = item;
      return next;
    });
    try {
      const postId = reels[index]?.id;
      if (postId) {
        const res = await postsAPI.likePost(postId);
        if (!res.success) throw new Error("like failed");
      }
    } catch (e) {
      // revert on failure
      setReels((arr) => {
        if (!prev) return arr;
        const next = [...arr];
        next[index] = prev as ReelItem;
        return next;
      });
    }
  };

  const handleScroll = (direction: "up" | "down") => {
    if (direction === "down") {
      if (currentReel < reels.length - 1) {
        setCurrentReel((i) => i + 1);
      } else if (hasMore) {
        loadReels(page + 1, true);
      }
    } else if (direction === "up" && currentReel > 0) {
      setCurrentReel((i) => i - 1);
    }
  };

  const toggleSave = async (index: number) => {
    let prev: ReelItem | undefined;
    setReels((arr) => {
      const next = [...arr];
      prev = { ...next[index] } as ReelItem;
      const item = { ...next[index] } as ReelItem;
      item.saved = !item.saved;
      next[index] = item;
      return next;
    });
    try {
      const id = reels[index]?.id;
      if (!id) return;
      // First try posts bookmark (most reels come from posts/reels feed)
      let ok = false;
      try {
        const res = await postsAPI.bookmarkPost(id);
        ok = !!res.success;
      } catch (_) {
        ok = false;
      }
      if (!ok) {
        // Fallback to reels specific endpoint
        const base =
          import.meta.env.VITE_API_BASE_URL || "https://api.inventurcubes.com/api";
        const resp = await fetch(`${base}/reels/${id}/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token") && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
          },
        });
        if (!resp.ok) throw new Error("save failed");
      }
      try {
        window.dispatchEvent(new CustomEvent("treesh:saved-updated"));
      } catch {}
    } catch (e) {
      // revert on failure
      setReels((arr) => {
        if (!prev) return arr;
        const next = [...arr];
        next[index] = prev as ReelItem;
        return next;
      });
    }
  };

  const loadComments = useCallback(async () => {
    const postId = reels[currentReel]?.id;
    if (!postId) return;
    try {
      setCommentsLoading(true);
      const res = await postsAPI.getComments(postId);
      if (res.success) {
        const data: any = res.data;
        const arr = Array.isArray(data)
          ? data
          : data.comments || data.items || [];
        setComments(arr);
      }
    } catch (_) {
      // ignore
    } finally {
      setCommentsLoading(false);
    }
  }, [reels, currentReel]);

  const submitComment = async () => {
    const postId = reels[currentReel]?.id;
    const content = newComment.trim();
    if (!postId || !content || submitting) return;
    setSubmitting(true);
    try {
      const res = await postsAPI.addComment(postId, content);
      if (res.success) {
        const item: any = res.data || (res as any).comment || null;
        if (item) setComments((prev) => [...prev, item]);
        // bump comment count on the reel
        setReels((prev) => {
          const next = [...prev];
          const r = { ...next[currentReel] } as ReelItem;
          r.comments = (r.comments || 0) + 1;
          next[currentReel] = r;
          return next;
        });
        setNewComment("");
      }
    } catch (_) {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const reel = reels[currentReel];

  // Try to auto-play when reel changes
  useEffect(() => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const attemptPlay = async () => {
      try {
        await v.play();
      } catch (err) {
        // ensure muted then retry
        try {
          v.muted = true;
          await v.play();
        } catch (_) {}
      }
    };
    attemptPlay();
  }, [reel?.id, reel?.video]);

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-white/70">
            Loading reels...
          </div>
        ) : !reel ? (
          <div className="w-full h-full flex items-center justify-center text-white/70">
            No reels yet
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            loop
            autoPlay
            muted={muted}
            playsInline
            controls={false}
            key={reel?.id || "reel-video"}
            src={reel?.video}
          />
        )}
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex">
        {/* Left side - scroll areas */}
        <div className="flex-1 flex flex-col">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => handleScroll("up")}
          />
          <div
            className="flex-1 cursor-pointer"
            onClick={() => handleScroll("down")}
          />
        </div>

        {/* Right side - actions */}
        <div className="w-16 flex flex-col justify-end items-center pb-20 space-y-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleLike(currentReel)}
            className={`h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm ${
              reel?.liked ? "text-red-500" : "text-white"
            }`}
          >
            <Heart className={`w-6 h-6 ${reel?.liked ? "fill-current" : ""}`} />
          </Button>
          <span className="text-white text-xs font-medium">
            {(reel?.likes || 0).toString()}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm text-white"
            onClick={() => {
              setShowComments(true);
              loadComments();
            }}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          <span className="text-white text-xs font-medium">
            {(reel?.comments || 0).toString()}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm text-white"
          >
            <Share className="w-6 h-6" />
          </Button>
          <span className="text-white text-xs font-medium">
            {(reel?.shares || 0).toString()}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-sm text-white"
            onClick={() => toggleSave(currentReel)}
          >
            <Bookmark
              className={`w-6 h-6 ${reel?.saved ? "fill-current" : ""}`}
            />
          </Button>

          <span className="text-white text-[10px] font-medium">
            {reel?.saved ? "Saved" : "Save"}
          </span>

          <Avatar className="w-12 h-12 border-2 border-white">
            <AvatarImage src={reel?.user?.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {(reel?.user?.name || "U").charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={reel?.user?.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {(reel?.user?.name || "U").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-white font-medium">
            @{reel?.user?.username || "user"}
          </span>
          {reel?.user?.verified && (
            <CheckCircle className="w-4 h-4 text-blue-500 fill-current" />
          )}
          <Button
            variant="outline"
            size="sm"
            className="ml-2 h-6 px-3 text-xs bg-transparent border-white text-white hover:bg-white hover:text-black"
          >
            Follow
          </Button>
        </div>
        <p className="text-white text-sm mb-2">
          {reel?.content || reel?.caption || ""}
        </p>
        {reel?.music && (
          <div className="flex items-center space-x-2">
            <span className="text-white text-xs">♪ {reel.music}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary" className="text-xs">
            {(reel?.views || 0).toLocaleString()} views
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMuted(!muted)}
            className="h-8 w-8 text-white"
          >
            {muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 right-4 flex flex-col space-y-1">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full ${
              index === currentReel ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={(o) => setShowComments(o)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-[60vh]">
            <div className="flex-1 border rounded-md mb-3 overflow-hidden">
              <ScrollArea className="h-full">
                {commentsLoading ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    Loading comments...
                  </div>
                ) : comments.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No comments yet. Be the first to comment.
                  </div>
                ) : (
                  <ul className="divide-y">
                    {comments.map((c: any) => (
                      <li
                        key={c._id}
                        className="p-3 flex items-start space-x-3"
                      >
                        <Avatar className="w-8 h-8 mt-0.5">
                          <AvatarImage
                            src={c.user?.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {(c.user?.name || c.user?.username || "U").charAt(
                              0
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {c.user?.username || c.user?.name || "User"}
                          </div>
                          <div className="text-sm text-foreground/90 whitespace-pre-wrap">
                            {c.content}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitComment();
                  }
                }}
              />
              <Button
                onClick={submitComment}
                disabled={submitting || !newComment.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Clock, Eye, Heart, Users, BarChart3 } from "lucide-react";
import { UploadModal } from "./UploadModal";
import { StoryViewer } from "./StoryViewer";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { storiesAPI } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useStorySeen } from "@/hooks/useStorySeen";
import SegmentedRing from "./SegmentedRing";

interface StoryData {
  id: string;
  image: string;
  textOverlays: TextOverlay[];
  stickers: Sticker[];
  createdAt: Date;
  expiresAt: Date;
  views?: number;
  likes?: number;
  viewers?: StoryViewer[];
  reactions?: StoryReaction[];
  user?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
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
// Note: No mock stories; we use real data from the API

export const StoryBar = () => {
  const { user: authUser } = useAuth();
  const { hasSeen, markSeen } = useStorySeen();
  const [stories, setStories] = useState<StoryData[]>([]);
  const [storyGroups, setStoryGroups] = useState<any[]>([]);
  const [userStories, setUserStories] = useState<any[]>([]);
  const [showStoryUpload, setShowStoryUpload] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [expiredStories, setExpiredStories] = useState<string[]>([]);
  const [hoveredStory, setHoveredStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewingUserStories, setIsViewingUserStories] = useState(false);
  const [selectedStoryUserId, setSelectedStoryUserId] = useState<string | null>(
    null
  );
  const isViewerOpenRef = useRef(false);
  useEffect(() => {
    isViewerOpenRef.current = showStoryViewer;
  }, [showStoryViewer]);

  // Seen state is handled by useStorySeen

  const buildPreviewFromGroups = (groups: any[]): StoryData[] => {
    return groups
      .map((group: any) => {
        const latest = group.latestStory || group.stories?.[0];
        if (!latest) return null;
        return {
          id: latest._id || latest.id,
          image: latest.media?.[0]?.url || latest.image || "/placeholder.svg",
          textOverlays:
            latest.textOverlays || latest.metadata?.textOverlays || [],
          stickers: latest.stickers || latest.metadata?.stickers || [],
          createdAt: new Date(latest.createdAt),
          expiresAt: new Date(
            latest.expiresAt ||
              new Date(latest.createdAt).getTime() + 24 * 60 * 60 * 1000
          ),
          views: Array.isArray(latest.views)
            ? latest.views.length
            : latest.views || 0,
          likes: Array.isArray(latest.likes)
            ? latest.likes.length
            : latest.likes || 0,
          viewers: latest.viewers || [],
          reactions: latest.reactions || [],
          user: {
            id: group.user?._id || group.user?.id || latest.authorId,
            name:
              group.user?.name ||
              group.user?.username ||
              latest.authorName ||
              "Unknown User",
            username: group.user?.username || latest.authorUsername || "user",
            avatar:
              group.user?.profileImage ||
              group.user?.avatar ||
              latest.authorAvatar ||
              "/placeholder.svg",
          },
        } as StoryData;
      })
      .filter(Boolean) as StoryData[];
  };

  // Fetch stories from followed users
  useEffect(() => {
    const fetchFollowedUsersStories = async () => {
      if (!authUser?.id) return;

      try {
        setIsLoading(true);
        const response = await storiesAPI.getStories();
        console.log("Stories API response:", response); // Debug log
        if (response.success && response.data) {
          // Backend returns an object with { storyGroups, userStories }
          const payload: any = response.data;
          const groups: any[] = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.storyGroups)
            ? payload.storyGroups
            : [];

          setStoryGroups(groups);
          const previews = buildPreviewFromGroups(groups);
          console.log("Converted story groups to preview list:", previews);
          setStories(previews);
        }
      } catch (error) {
        console.error("Error fetching followed users' stories:", error);
        // Use empty array as fallback instead of showing mock data
        setStories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowedUsersStories();
  }, [authUser?.id]);

  // Fetch user's own stories
  useEffect(() => {
    const fetchUserStories = async () => {
      if (!authUser?.id) return;

      try {
        setIsLoading(true);
        const response = await storiesAPI.getUserStories();
        if (response.success && response.data) {
          setUserStories(response.data);
        }
      } catch (error) {
        console.error("Error fetching user stories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStories();
  }, [authUser?.id]);

  // Listen for story creation and follow events
  useEffect(() => {
    const handleStoryCreated = async () => {
      console.log("Story created event received, refreshing user stories...");
      try {
        const response = await storiesAPI.getUserStories();
        if (response.success && response.data) {
          setUserStories(response.data);
        }
      } catch (error) {
        console.error("Error refreshing user stories:", error);
      }
    };

    const handleUserFollowed = async () => {
      console.log("User followed event received, refreshing stories feed...");
      try {
        const response = await storiesAPI.getStories();
        if (response.success && response.data) {
          const payload: any = response.data;
          const groups: any[] = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.storyGroups)
            ? payload.storyGroups
            : [];
          setStoryGroups(groups);
          const previews = buildPreviewFromGroups(groups);
          setStories(previews);
        }
      } catch (error) {
        console.error("Error refreshing stories after follow:", error);
      }
    };

    const onPostCreated = async (e: any) => {
      const type = e?.detail?.type;
      if (type !== "story") return;
      await handleStoryCreated();
    };

    window.addEventListener("storyCreated", handleStoryCreated);
    window.addEventListener("postCreated", onPostCreated as EventListener);
    window.addEventListener("userFollowed", handleUserFollowed);

    // Persist like state across reopen by updating cached storyGroups when like toggles
    const onStoryLikeToggled = (e: any) => {
      const storyId = e?.detail?.storyId;
      const isLiked = Boolean(e?.detail?.isLiked);
      const me = String(authUser?.id || (authUser as any)?._id || "");
      if (!storyId || !me) return;

      setStoryGroups((prev) => {
        const next = (prev || []).map((g: any) => {
          if (!Array.isArray(g?.stories)) return g;
          const stories = g.stories.map((s: any) => {
            if ((s?._id || s?.id)?.toString?.() !== storyId.toString())
              return s;
            // Normalize likes array
            const likesArr: any[] = Array.isArray(s.likes) ? [...s.likes] : [];
            const idx = likesArr.findIndex((l) => {
              const uid =
                l?.userId?._id ||
                l?.userId?.id ||
                l?.userId ||
                l?.user?.id ||
                l?.user?._id;
              return uid?.toString?.() === me;
            });
            if (isLiked && idx === -1) {
              likesArr.push({ userId: me });
            } else if (!isLiked && idx !== -1) {
              likesArr.splice(idx, 1);
            }
            return { ...s, likes: likesArr };
          });
          return { ...g, stories };
        });
        // Update current UI state: if viewer is open, update in-view stories likedByMe only; else refresh previews
        if (isViewerOpenRef.current) {
          setStories((prevStories) =>
            (prevStories || []).map((st: any) =>
              (st?.id || st?._id)?.toString?.() === storyId.toString()
                ? { ...st, likedByMe: isLiked }
                : st
            )
          );
        } else {
          const previews = buildPreviewFromGroups(next);
          setStories(previews);
        }
        return next;
      });
    };
    window.addEventListener(
      "storyLikeToggled",
      onStoryLikeToggled as EventListener
    );

    return () => {
      window.removeEventListener("storyCreated", handleStoryCreated);
      window.removeEventListener("postCreated", onPostCreated as EventListener);
      window.removeEventListener("userFollowed", handleUserFollowed);
      window.removeEventListener(
        "storyLikeToggled",
        onStoryLikeToggled as EventListener
      );
    };
  }, []);

  // Check if user has active stories (not expired)
  const hasActiveStories = userStories.some((story) => {
    const expiresAt = new Date(story.expiresAt || story.createdAt);
    const now = new Date();
    // Stories expire after 24 hours
    const expiryTime = new Date(story.createdAt);
    expiryTime.setHours(expiryTime.getHours() + 24);
    return now < expiryTime;
  });

  // Get the latest active story for preview
  const latestUserStory = userStories
    .filter((story) => {
      const expiryTime = new Date(story.createdAt);
      expiryTime.setHours(expiryTime.getHours() + 24);
      return new Date() < expiryTime;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

  const handleUserStoryClick = () => {
    if (hasActiveStories && latestUserStory) {
      // Convert user stories to StoryData format for the viewer
      const me = String((authUser as any)?.id || (authUser as any)?._id || "");
      const convertedStories = userStories.map((story) => ({
        id: story._id || story.id,
        image: story.media?.[0]?.url || story.image || "/placeholder.svg",
        textOverlays: story.textOverlays || story.metadata?.textOverlays || [],
        stickers: story.stickers || story.metadata?.stickers || [],
        createdAt: new Date(story.createdAt),
        expiresAt: new Date(
          story.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000)
        ),
        views: Array.isArray(story.views)
          ? story.views.length
          : story.views || 0,
        likes: Array.isArray(story.likes)
          ? story.likes.length
          : story.likes || 0,
        likedByMe: Array.isArray(story.likes)
          ? story.likes.some((l: any) => {
              const uid =
                l?.userId?._id ||
                l?.userId?.id ||
                l?.userId ||
                l?.user?.id ||
                l?.user?._id;
              return uid?.toString?.() === me || String(uid) === me;
            })
          : false,
        viewers: story.viewers || [],
        reactions: story.reactions || [],
        user: {
          id: String((authUser as any)?.id || (authUser as any)?._id || ""),
          name: (authUser as any)?.name || (authUser as any)?.username || "You",
          username: (authUser as any)?.username || "you",
          avatar:
            (authUser as any)?.avatar ||
            (authUser as any)?.profileImage ||
            "/placeholder.svg",
        },
      }));

      // Set converted stories and open viewer
      setStories(convertedStories);
      setCurrentStoryIndex(0);
      setIsViewingUserStories(true);
      setSelectedStoryUserId(String(authUser?.id));
      setShowStoryViewer(true);
    } else {
      // Open story upload
      setShowStoryUpload(true);
    }
  };

  // Check for expired stories every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const expired = stories
        .filter((story) => new Date(story.expiresAt) <= now)
        .map((story) => story.id);

      if (expired.length > 0) {
        setExpiredStories((prev) => [...prev, ...expired]);
        setStories((prev) =>
          prev.filter((story) => !expired.includes(story.id))
        );
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [stories]);

  const handleStorySave = async () => {
    // No-op: UploadModal handles upload; we refresh via events below
  };

  const handleStoryClick = (index: number) => {
    // Open selected user's full story sequence; resolve group by user id for safety
    const preview = stories[index];
    const group =
      storyGroups.find((g: any) => {
        const gid = g.user?._id || g.user?.id;
        return (
          gid &&
          preview?.user?.id &&
          gid.toString() === preview.user.id.toString()
        );
      }) || storyGroups[index];
    if (!group || !Array.isArray(group.stories)) return;

    const me = String(authUser?.id || "");
    const converted = group.stories
      .sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .map((story: any) => ({
        id: story._id || story.id,
        image: story.media?.[0]?.url || story.image || "/placeholder.svg",
        textOverlays: story.textOverlays || story.metadata?.textOverlays || [],
        stickers: story.stickers || story.metadata?.stickers || [],
        createdAt: new Date(story.createdAt),
        expiresAt: new Date(
          story.expiresAt ||
            new Date(new Date(story.createdAt).getTime() + 24 * 60 * 60 * 1000)
        ),
        views: Array.isArray(story.views)
          ? story.views.length
          : story.views || 0,
        likes: Array.isArray(story.likes)
          ? story.likes.length
          : story.likes || 0,
        likedByMe: Array.isArray(story.likes)
          ? story.likes.some((l: any) => {
              const uid =
                l?.userId?._id ||
                l?.userId?.id ||
                l?.userId ||
                l?.user?.id ||
                l?.user?._id;
              return uid?.toString?.() === me || String(uid) === me;
            })
          : false,
        viewers: story.viewers || [],
        reactions: story.reactions || [],
        user: {
          id: group.user?._id || group.user?.id,
          name: group.user?.name || group.user?.username || "Unknown User",
          username: group.user?.username || "user",
          avatar:
            group.user?.profileImage ||
            group.user?.avatar ||
            "/placeholder.svg",
        },
      }));

    setStories(converted);
    setCurrentStoryIndex(0);
    setIsViewingUserStories(false);
    setSelectedStoryUserId(
      String(preview?.user?.id || group.user?._id || group.user?.id)
    );
    setShowStoryViewer(true);
  };

  const handleStoryChange = (index: number) => {
    setCurrentStoryIndex(index);
  };

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();

    if (timeLeft <= 0) return "Expired";

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getProgressPercentage = (expiresAt: Date): number => {
    const now = new Date();
    const createdAt = new Date(expiresAt.getTime() - 24 * 60 * 60 * 1000);
    const totalDuration = expiresAt.getTime() - createdAt.getTime();
    const elapsed = now.getTime() - createdAt.getTime();

    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
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

  return (
    <TooltipProvider>
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
          {/* User's Story Button - Create or View */}
          <div className="flex flex-col items-center gap-2 min-w-[70px] sm:min-w-[80px] flex-shrink-0">
            {hasActiveStories && latestUserStory ? (
              // Show user's story with red ring (like Instagram)
              <button
                onClick={handleUserStoryClick}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full hover:scale-105 transition-transform"
              >
                {/* Segmented ring overlay */}
                <div className="absolute inset-0 -m-[2px] flex items-center justify-center">
                  {(() => {
                    const cnt = (userStories || []).filter((s) => {
                      const expiryTime = new Date(s.createdAt);
                      expiryTime.setHours(expiryTime.getHours() + 24);
                      return new Date() < expiryTime;
                    }).length;
                    const seen = hasSeen(String(authUser?.id));
                    return (
                      <SegmentedRing
                        segments={Math.max(1, cnt)}
                        color={seen ? "#9ca3af" : "#ef4444"}
                        size={64}
                        strokeWidth={3}
                        gapRatio={0.06}
                      />
                    );
                  })()}
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img
                      src={
                        latestUserStory.media?.[0]?.url ||
                        latestUserStory.image ||
                        authUser?.avatar ||
                        "/placeholder.svg"
                      }
                      alt="Your Story"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </button>
            ) : (
              // Show create story button
              <button
                onClick={handleUserStoryClick}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center relative"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mb-2">
                  <img
                    src={authUser?.avatar || "/placeholder.svg"}
                    alt="Your profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </button>
            )}
            <span className="text-xs text-gray-600 text-center">
              {hasActiveStories ? "Your Story" : "Create Story"}
            </span>
          </div>

          {/* Existing Stories */}
          {stories.map((story, index) => {
            const timeRemaining = getTimeRemaining(story.expiresAt);
            const progress = getProgressPercentage(story.expiresAt);
            const isExpired = timeRemaining === "Expired";
            const group = storyGroups.find((g: any) => {
              const gid = g.user?._id || g.user?.id;
              return (
                gid &&
                story.user?.id &&
                gid.toString() === story.user.id.toString()
              );
            });
            const hasUnseen = (() => {
              const me = String(authUser?.id || "");
              if (group && Array.isArray(group.stories)) {
                // Unseen if any story for this author isn't seen by me on server
                const anyUnseen = group.stories.some((s: any) => {
                  const viewers: any[] = s.viewers || [];
                  return !hasSeen(String(story.user?.id), {
                    serverViewers: viewers,
                    currentUserId: me,
                  });
                });
                return anyUnseen;
              }
              return !hasSeen(String(story.user?.id));
            })();

            return (
              <Tooltip key={story.id}>
                <TooltipTrigger asChild>
                  <div
                    className="flex flex-col items-center gap-2 min-w-[70px] sm:min-w-[80px] flex-shrink-0"
                    onMouseEnter={() => setHoveredStory(story.id)}
                    onMouseLeave={() => setHoveredStory(null)}
                  >
                    <div className="relative group">
                      {/* Story Circle with Segmented Ring */}
                      <div
                        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full cursor-pointer hover:scale-105 transition-transform"
                        role="button"
                        tabIndex={0}
                        onClick={() => handleStoryClick(index)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleStoryClick(index);
                          }
                        }}
                      >
                        {/* Segmented ring overlay */}
                        <div className="absolute inset-0 -m-[2px] flex items-center justify-center pointer-events-none">
                          {(() => {
                            const count = group?.stories?.length || 1;
                            return (
                              <SegmentedRing
                                segments={Math.max(1, count)}
                                color={hasUnseen ? "#ef4444" : "#9ca3af"}
                                size={64}
                                strokeWidth={3}
                                gapRatio={0.06}
                              />
                            );
                          })()}
                        </div>
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1">
                          <div className="w-full h-full rounded-full overflow-hidden relative">
                            <img
                              src={story.image}
                              alt="Story"
                              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                            />

                            {/* Progress Ring - Only visible on hover */}
                            {hoveredStory === story.id && (
                              <div className="absolute inset-0 rounded-full">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle
                                    cx="50%"
                                    cy="50%"
                                    r="25"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="transparent"
                                    className="text-primary/30"
                                  />
                                  <circle
                                    cx="50%"
                                    cy="50%"
                                    r="25"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="transparent"
                                    className="text-primary"
                                    strokeDasharray={`${2 * Math.PI * 25}`}
                                    strokeDashoffset={`${
                                      2 * Math.PI * 25 * (1 - progress / 100)
                                    }`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </div>
                            )}

                            {/* Hover Overlay - Only show views count for the owner (author) */}
                            {(() => {
                              const me = String((authUser as any)?.id || "");
                              const isOwner =
                                me &&
                                story.user?.id &&
                                me.toString() === story.user.id.toString();
                              return hoveredStory === story.id && isOwner;
                            })() && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="text-center text-white">
                                  <div className="text-lg font-bold">
                                    {story.views || 0}
                                  </div>
                                  <div className="text-xs">views</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-gray-600 text-center max-w-[70px] truncate">
                      {story.user?.name || "Unknown"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Story Preview</span>
                      <Badge variant="secondary" className="text-xs">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Click to view
                      </Badge>
                    </div>

                    {(() => {
                      const me = String((authUser as any)?.id || "");
                      const isOwner =
                        me &&
                        story.user?.id &&
                        me.toString() === story.user.id.toString();
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {isOwner ? (
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-500" />
                                <span>{story.views || 0} views</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-500" />
                                <span>View story</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span>
                                {story.reactions?.length || 0} reactions
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Posted {formatTimeAgo(story.createdAt)}
                            </div>
                            {isOwner && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {story.viewers?.length || 0} viewers
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}

                    <div className="text-xs text-gray-400 pt-1 border-t border-gray-200">
                      Click the story to see full insights and viewer list
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Expired Stories Info */}
          {expiredStories.length > 0 && (
            <div className="flex flex-col items-center gap-2 min-w-[70px] sm:min-w-[80px] flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </div>
              <span className="text-xs text-gray-500 text-center">
                {expiredStories.length} expired
              </span>
            </div>
          )}
        </div>

        {/* Story Upload Modal - unified with global + → Add Story */}
        <UploadModal
          isOpen={showStoryUpload}
          onClose={() => setShowStoryUpload(false)}
          type="story"
        />

        {/* Story Viewer Modal */}
        <StoryViewer
          isOpen={showStoryViewer}
          onClose={() => {
            setShowStoryViewer(false);
            // Restore preview list from groups when closing
            const previews = buildPreviewFromGroups(storyGroups);
            setStories(previews);
            setIsViewingUserStories(false);
            if (selectedStoryUserId) {
              markSeen(String(selectedStoryUserId));
              // Force a light refresh by toggling selected id to prompt ring re-evaluation
              setSelectedStoryUserId((prev) => (prev ? `${prev}` : prev));
            }
          }}
          stories={stories}
          currentStoryIndex={currentStoryIndex}
          onStoryChange={handleStoryChange}
        />
      </div>
    </TooltipProvider>
  );
};

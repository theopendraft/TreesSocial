import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Grid3X3,
  Play,
  User,
  MapPin,
  Globe,
  Lock,
  UserPlus,
  UserMinus,
  Settings,
  Bookmark,
} from "lucide-react";
import {
  usersAPI,
  postsAPI,
  notificationsAPI,
  UserProfile,
  storiesAPI,
} from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PostDetail } from "./PostDetail";
import { useStorySeen } from "@/hooks/useStorySeen";
import { StoryViewer } from "./StoryViewer";
import SegmentedRing from "./SegmentedRing";

interface UserProfilePageProps {
  userId: string;
  onBack: () => void;
  onFollowAction?: () => void;
}

interface PostData {
  id: string;
  image: string;
  type: "post" | "reel";
  likes: number;
  comments?: number;
  liked?: boolean;
  saved?: boolean;
}

export const UserProfilePage = ({
  userId,
  onBack,
  onFollowAction,
}: UserProfilePageProps) => {
  const { user: currentUser, updateUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [requested, setRequested] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [storyItems, setStoryItems] = useState<any[]>([]);
  const [storyIndex, setStoryIndex] = useState(0);
  const { hasSeen, markSeen } = useStorySeen();
  const [profileUnavailable, setProfileUnavailable] = useState<string | null>(
    null
  );

  const toggleSave = async (postId: string) => {
    // optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p))
    );
    try {
      const res = await postsAPI.bookmarkPost(postId);
      if (!res.success) throw new Error("bookmark failed");
      try {
        window.dispatchEvent(new CustomEvent("treesh:saved-updated"));
      } catch {}
      toast({
        title: (res.data as any)?.message || "Saved updated",
        description: "Saved content has been updated",
      });
    } catch (e) {
      // revert on failure
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p))
      );
      toast({
        title: "Error",
        description: "Failed to update saved state",
        variant: "destructive",
      });
    }
  };

  // Reflect like/comment changes broadcasted from PostDetail
  useEffect(() => {
    const handler = (e: any) => {
      const { postId, isLiked, likesCount } = e.detail || {};
      if (!postId) return;
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likes: typeof likesCount === "number" ? likesCount : p.likes,
                liked: typeof isLiked === "boolean" ? isLiked : p.liked,
              }
            : p
        )
      );
    };
    window.addEventListener("treesh:post-updated", handler as any);
    return () =>
      window.removeEventListener("treesh:post-updated", handler as any);
  }, []);

  const handleMessageClick = () => {
    if (!user) return;
    // Deep link to messages: let MessagingPage pick this up and open/create chat.
    // Allow message requests when not following if privacy allows (button is hidden only when allowMessagesFrom === 'none').
    try {
      const uid = (user as any).id || (user as any)._id || userId;
      localStorage.setItem("startChatWithUserId", String(uid));
      // Use global navigation event consumed by MainApp
      window.dispatchEvent(
        new CustomEvent("treesh:navigate", { detail: { tab: "messages" } })
      );
    } catch {
      // No-op
    }
  };

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await usersAPI.getUserProfile(userId);
        console.log("User profile API response:", response); // Debug log
        if (response.success && response.data) {
          console.log("User data:", response.data); // Debug log
          setUser(response.data);
          setIsFollowing(response.data.isFollowing || false);
          setRequested((response.data as any).requested || false);
          setFollowerCount(response.data.followerCount || 0);
          setFollowingCount(response.data.followingCount || 0);
          setProfileUnavailable(null);
        } else {
          const msg = String(response.error || "");
          if (
            msg.includes("PROFILE_VIEWS_DISABLED") ||
            msg.includes("not available") ||
            msg.includes("403")
          ) {
            setProfileUnavailable("This profile is not available right now.");
          } else {
            toast({
              title: "Error",
              description: response.error || "Failed to load user profile",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Fetch user posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await postsAPI.getUserPosts(userId);
        if (response.success && response.data) {
          const data: any = response.data as any;
          const userPosts = Array.isArray(data)
            ? data
            : Array.isArray(data?.posts)
            ? data.posts
            : [];
          const transformedPosts: PostData[] = userPosts.map((post: any) => {
            const postType = post.type === "reel" ? "reel" : "post";
            const mediaArr = Array.isArray(post.media) ? post.media : [];
            const firstImage = mediaArr.find(
              (m: any) => m?.type === "image"
            )?.url;
            const videoThumb =
              post.videoThumbnail ||
              mediaArr.find((m: any) => m?.type === "video")?.thumbnail;
            const fallbackImage =
              post.image ||
              firstImage ||
              mediaArr[0]?.url ||
              "/placeholder.svg";

            return {
              id: post.id || post._id,
              image:
                postType === "post"
                  ? fallbackImage
                  : videoThumb || firstImage || "/placeholder.svg",
              type: postType,
              likes: Array.isArray(post.likes)
                ? post.likes.length
                : post.likes || 0,
              comments: Array.isArray(post.comments) ? post.comments.length : 0,
              liked: !!post.isLiked,
              saved: !!post.isBookmarked,
            };
          });
          setPosts(transformedPosts);
        }
      } catch (error: any) {
        console.error("Error fetching user posts:", error);
        const msg = error?.message || "";
        if (
          (msg && msg.includes("private")) ||
          (user && (user as any).privacy?.profileVisibility === "private")
        ) {
          // Treat as private - UI will show private notice below when not following
          setPosts([]);
        }
      }
    };

    if (userId && user) {
      fetchUserPosts();
    }
  }, [userId, user]);

  const handleFollow = async () => {
    if (!user || followLoading) return;

    setFollowLoading(true);
    try {
      const response = await usersAPI.followUser(userId);
      if (response.success && response.data) {
        setIsFollowing(response.data.following);
        setRequested(!!response.data.requested);
        setFollowerCount(response.data.followerCount);

        // Update current user's following count
        if (
          currentUser &&
          response.data.currentUserFollowingCount !== undefined
        ) {
          updateUser({
            followingCount: response.data.currentUserFollowingCount,
          });
        } else if (currentUser) {
          // If backend doesn't provide the count, manually update it
          const currentFollowingCount = currentUser.followingCount || 0;
          const newFollowingCount = response.data.following
            ? currentFollowingCount + 1
            : currentFollowingCount - 1;
          updateUser({
            followingCount: Math.max(0, newFollowingCount),
          });
        }

        // Emit custom event to refresh stories when following someone new
        if (response.data.following) {
          window.dispatchEvent(
            new CustomEvent("userFollowed", {
              detail: {
                userId,
                userName: user.fullName || user.username || "Unknown User",
              },
            })
          );

          // Create follow notification for the followed user
          try {
            await notificationsAPI.createFollowNotification(userId);
          } catch (notificationError) {
            console.error(
              "Failed to create follow notification:",
              notificationError
            );
            // Don't show error to user as this is not critical
          }
        }

        toast({
          title: response.data.following
            ? "Following"
            : response.data.requested
            ? "Request sent"
            : "Unfollowed",
          description: response.data.following
            ? `You are now following ${
                user.fullName || user.username || "this user"
              }`
            : response.data.requested
            ? `Follow request sent to ${
                user.fullName || user.username || "this user"
              }`
            : `You unfollowed ${user.fullName || user.username || "this user"}`,
        });

        // Refresh notification count in parent component
        onFollowAction?.();

        // Dispatch follow update event to refresh profile page
        window.dispatchEvent(new CustomEvent("followUpdate"));
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update follow status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!user || followLoading) return;
    setFollowLoading(true);
    try {
      const response = await usersAPI.cancelFollowRequest(userId);
      if (response.success) {
        setRequested(false);
        toast({ title: "Request canceled" });
      }
    } catch (e) {
      toast({ title: "Failed to cancel request", variant: "destructive" });
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostClick = (post: PostData) => {
    // Open PostDetail modal similar to ProfilePage
    const detailPost = {
      id: post.id,
      image: post.image,
      type: post.type,
      likes: post.likes,
      caption: "",
      user: {
        name: user?.fullName || user?.username || "User",
        username: user?.username || "user",
        avatar: user?.avatar || "/placeholder.svg",
        verified: false,
      },
      timestamp: new Date().toISOString(),
      location: user?.location,
      comments: [],
      liked: post.liked,
      saved: post.saved,
    };
    setSelectedPost(detailPost);
    setShowPostDetail(true);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-8 w-24 bg-gray-200 rounded mb-6"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileUnavailable) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6 bg-white rounded-lg border">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Profile not available
          </h2>
          <p className="text-gray-500 mb-4">{profileUnavailable}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            User not found
          </h2>
          <p className="text-gray-500 mb-4">
            The user you're looking for doesn't exist.
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  const openUserStories = async () => {
    if (!isFollowing) {
      toast({
        title: "Follow to view stories",
        description: "You need to follow this user to view their stories.",
      });
      return;
    }
    try {
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
              name: user?.fullName || user?.username || "User",
              username: user?.username || "user",
              avatar: user?.avatar || "/placeholder.svg",
            },
            viewers: s.viewers || [],
          }))
        );
        setStoryIndex(0);
        setShowStoryViewer(true);
      } else {
        toast({ title: "No story", description: "User has no active story" });
      }
    } catch {
      toast({ title: "Failed to load story", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="font-semibold">
                  {user.username || user.fullName || "Unknown User"}
                </h1>
                <p className="text-sm text-gray-500">{posts.length} posts</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white px-4 py-6">
          <div className="flex items-start gap-6">
            {/* Profile Picture with story ring if applicable */}
            <button
              type="button"
              onClick={openUserStories}
              className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full"
              aria-label="Open stories"
            >
              <div className="absolute inset-0 -m-[2px] flex items-center justify-center pointer-events-none">
                <SegmentedRing
                  segments={Math.max(1, (user as any)?.storyCount || 1)}
                  color={hasSeen(userId) ? "#9ca3af" : "#ef4444"}
                  size={128}
                  strokeWidth={4}
                  gapRatio={0.06}
                />
              </div>
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white p-[4px]">
                <Avatar className="w-full h-full">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl sm:text-3xl bg-gray-200">
                    {user.fullName?.charAt(0) ||
                      user.username?.charAt(0) ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </button>

            {/* Profile Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl font-bold">
                  {user.fullName || user.username || "Unknown User"}
                </h2>
                {user.isStreamer && (
                  <Badge className="bg-blue-500 text-white">
                    Verified Creator
                  </Badge>
                )}
              </div>
              {/* Presence / Last Seen (privacy-gated) */}
              {(() => {
                const p = (user as any)?.privacy || {};
                const showOnline = p.showOnlineStatus ?? true;
                const showLastSeen = p.showLastSeen ?? true;
                const isOnline = (user as any)?.isOnline;
                const lastSeen = (user as any)?.lastSeen;
                if (!showOnline && !showLastSeen) return null;
                return (
                  <p className="text-sm text-gray-500 mb-2">
                    {showOnline && isOnline
                      ? "Online"
                      : showLastSeen && lastSeen
                      ? `Last seen ${new Date(lastSeen).toLocaleString()}`
                      : null}
                  </p>
                );
              })()}

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <div className="font-semibold">{posts.length}</div>
                  <div className="text-sm text-gray-500">posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">
                    {followerCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">followers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">
                    {followingCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">following</div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && <p className="text-sm mb-3">{user.bio}</p>}

              {/* Location and Website */}
              <div className="space-y-1">
                {user.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Globe className="w-4 h-4" />
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-2 mt-4">
                  {requested ? (
                    <Button
                      onClick={handleCancelRequest}
                      disabled={followLoading}
                      variant="outline"
                      className="bg-gray-100 text-gray-700"
                    >
                      {followLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      Requested
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={
                        isFollowing
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : ""
                      }
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {followLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      ) : isFollowing ? (
                        <UserMinus className="w-4 h-4 mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                  {(user as any)?.privacy?.allowMessagesFrom !== "none" && (
                    <Button variant="outline" onClick={handleMessageClick}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {(user as any)?.privacy?.allowMessagesFrom ===
                        "friends" && !isFollowing
                        ? "Message Request"
                        : "Message"}
                    </Button>
                  )}
                </div>
              )}

              {isOwnProfile && (
                <Button variant="outline" className="mt-4">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-center border-b rounded-none bg-transparent">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="reels" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Reels
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-0">
              {!isFollowing &&
              (user as any)?.privacy?.profileVisibility === "private" ? (
                <div className="text-center py-12">
                  <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    This account is private
                  </h3>
                  <p className="text-gray-500">
                    {requested
                      ? "Your follow request is pending."
                      : "Follow to see their photos and videos."}
                  </p>
                </div>
              ) : posts.filter((post) => post.type === "post").length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {posts
                    .filter((post) => post.type === "post")
                    .map((post) => (
                      <div
                        key={post.id}
                        className="aspect-square relative group cursor-pointer"
                        onClick={() => handlePostClick(post)}
                      >
                        <img
                          src={post.image}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Heart className="w-5 h-5" fill="white" />
                              <span className="font-semibold">
                                {post.likes}
                              </span>
                            </div>
                            {post.comments !== undefined && (
                              <div className="flex items-center gap-1">
                                <MessageCircle
                                  className="w-5 h-5"
                                  fill="white"
                                />
                                <span className="font-semibold">
                                  {post.comments}
                                </span>
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSave(post.id);
                              }}
                              className="ml-2 text-white hover:text-white/80"
                              title={post.saved ? "Unsave" : "Save"}
                            >
                              <Bookmark
                                className={`w-5 h-5 ${
                                  post.saved ? "fill-current" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Grid3X3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-500">
                    {isOwnProfile
                      ? "Share your first post!"
                      : `${
                          user.fullName || user.username || "This user"
                        } hasn't posted anything yet.`}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reels" className="mt-0">
              {!isFollowing &&
              (user as any)?.privacy?.profileVisibility === "private" ? (
                <div className="text-center py-12">
                  <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    This account is private
                  </h3>
                  <p className="text-gray-500">
                    {requested
                      ? "Your follow request is pending."
                      : "Follow to see their reels."}
                  </p>
                </div>
              ) : posts.filter((post) => post.type === "reel").length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {posts
                    .filter((post) => post.type === "reel")
                    .map((post) => (
                      <div
                        key={post.id}
                        className="aspect-square relative group cursor-pointer"
                        onClick={() => handlePostClick(post)}
                      >
                        <img
                          src={post.image}
                          alt="Reel"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Play className="w-4 h-4 text-white" fill="white" />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Heart className="w-5 h-5" fill="white" />
                              <span className="font-semibold">
                                {post.likes}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSave(post.id);
                              }}
                              className="ml-2 text-white hover:text-white/80"
                              title={post.saved ? "Unsave" : "Save"}
                            >
                              <Bookmark
                                className={`w-5 h-5 ${
                                  post.saved ? "fill-current" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No reels yet
                  </h3>
                  <p className="text-gray-500">
                    {isOwnProfile
                      ? "Create your first reel!"
                      : `${
                          user.fullName || user.username || "This user"
                        } hasn't shared any reels yet.`}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedPost && (
        <PostDetail
          isOpen={showPostDetail}
          onClose={() => setShowPostDetail(false)}
          post={selectedPost}
        />
      )}

      {/* Story Viewer */}
      <StoryViewer
        isOpen={showStoryViewer}
        onClose={() => {
          setShowStoryViewer(false);
          markSeen(userId);
        }}
        stories={storyItems as any}
        currentStoryIndex={storyIndex}
        onStoryChange={(i) => setStoryIndex(i)}
      />
    </div>
  );
};

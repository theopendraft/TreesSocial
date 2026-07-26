import { useState, useEffect, useCallback, useRef } from "react";
import { FeedPost } from "./FeedPost";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { postsAPI, type Post } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface FeedPostData {
  id: string;
  user: { name: string; username: string; avatar: string; verified: boolean };
  content: string;
  image?: string;
  video?: string;
  media?: string;
  mediaType?: 'image' | 'video';
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  saved: boolean;
  type: "post" | "psa";
}

interface InfiniteScrollFeedProps {
  onReport?: (type: "post", targetId: string, targetName?: string) => void;
}

// Convert API Post to FeedPost format
const convertApiPostToFeedPost = (apiPost: any): FeedPostData => {
  // Support both backend shapes used in posts routes
  const user = apiPost.user || {
    name: apiPost.authorName,
    username: apiPost.authorName,
    avatar: apiPost.authorAvatar,
    verified: apiPost.verified || false,
  };
  const image =
    apiPost.image ||
    (Array.isArray(apiPost.images) ? apiPost.images[0] : undefined);
  const video = apiPost.video || apiPost.videoUrl;
  const media = apiPost.media;
  const mediaType = apiPost.mediaType || (video ? 'video' : image ? 'image' : undefined);
  
  return {
    id: apiPost.id || apiPost._id || Math.random().toString(),
    user: {
      name: user?.name || "Unknown User",
      username: user?.username || "unknown",
      avatar: user?.avatar || "/placeholder.svg",
      verified: !!user?.verified,
    },
    content: apiPost.content || "",
    image,
    video,
    media,
    mediaType,
    timestamp:
      apiPost.createdAt || apiPost.timestamp || new Date().toISOString(),
    likes:
      typeof apiPost.likes === "number"
        ? apiPost.likes
        : Array.isArray(apiPost.likes)
        ? apiPost.likes.length
        : 0,
    comments:
      typeof apiPost.comments === "number"
        ? apiPost.comments
        : Array.isArray(apiPost.comments)
        ? apiPost.comments.length
        : 0,
    shares:
      typeof apiPost.shares === "number"
        ? apiPost.shares
        : Array.isArray(apiPost.shares)
        ? apiPost.shares.length
        : 0,
    liked: !!apiPost.isLiked,
    saved: !!apiPost.isBookmarked,
    type: "post",
  };
};

export const InfiniteScrollFeed = ({ onReport }: InfiniteScrollFeedProps) => {
  const [posts, setPosts] = useState<FeedPostData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const observer = useRef<IntersectionObserver>();
  const lastPostRef = useRef<HTMLDivElement>(null);

  // Load initial posts
  useEffect(() => {
    loadPosts(1, true);
  }, []);

  // Load posts function using real API
  const loadPosts = useCallback(
    async (pageNum: number, isInitial = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const response = await postsAPI.getFeed(pageNum, 10);
        console.log("Posts API response:", response); // Debug log

        if (response.success && response.data) {
          // Handle different response structures
          const postsArray = response.data.posts || response.data || [];
          console.log("Posts array:", postsArray); // Debug log
          const filtered = Array.isArray(postsArray)
            ? postsArray.filter((p: any) => (p.type || "post") !== "reel")
            : [];
          const convertedPosts = Array.isArray(filtered)
            ? filtered.map(convertApiPostToFeedPost)
            : [];

          if (isInitial) {
            setPosts(convertedPosts);
          } else {
            setPosts((prev) => [...prev, ...convertedPosts]);
          }

          setPage(pageNum);
          // Check hasMore based on response structure
          const hasMorePosts =
            response.data.hasMore !== undefined
              ? response.data.hasMore
              : Array.isArray(postsArray)
              ? postsArray.length === 10
              : false;
          setHasMore(hasMorePosts);
        } else {
          // Handle case where API returns success but no data
          console.log("No data in posts response");
          if (isInitial) {
            setPosts([]);
          }
          setHasMore(false);
        }
      } catch (err) {
        console.error("Posts API error:", err);

        // Fallback to mock data if API fails
        if (isInitial) {
          const mockPosts: FeedPostData[] = [
            {
              id: "mock-1",
              user: {
                name: "Demo User",
                username: "demo_user",
                avatar: "/placeholder.svg",
                verified: false,
              },
              content:
                "Welcome to the social platform! This is a demo post while we connect to the backend.",
              timestamp: "2h ago",
              likes: 42,
              comments: 8,
              shares: 3,
              liked: false,
              saved: false,
              type: "post",
            },
          ];
          setPosts(mockPosts);
          setHasMore(false);
        }
        setError("Using demo data while connecting to backend...");
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // Load more posts when scrolling
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(page + 1);
    }
  }, [loading, hasMore, page, loadPosts]);

  // Refresh feed
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts(1, true);
    setRefreshing(false);
  };

  // Listen for userFollowed events to refresh feed
  useEffect(() => {
    const handleUserFollowed = () => {
      // Refresh the feed when user follows someone to show their posts
      loadPosts(1, true);
    };

    window.addEventListener("userFollowed", handleUserFollowed);

    return () => {
      window.removeEventListener("userFollowed", handleUserFollowed);
    };
  }, [loadPosts]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });

    if (lastPostRef.current) {
      observer.current.observe(lastPostRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [loading, hasMore, loadMore]);

  // Handle post interactions
  const handlePostUpdate = (postId: string, updates: Partial<FeedPostData>) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, ...updates } : post))
    );
  };

  if (error && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => loadPosts(0, true)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="mb-4"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh Feed
        </Button>
      </div>

      {/* Posts */}
      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastPostRef : null}
        >
          <FeedPost post={post} onReport={onReport} />
        </div>
      ))}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading more posts...</p>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-1 bg-gray-300 mx-auto mb-4 rounded-full" />
          <p className="text-muted-foreground">
            You've reached the end of your feed
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Check back later for more content!
          </p>
        </div>
      )}

      {/* Error State */}
      {error && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

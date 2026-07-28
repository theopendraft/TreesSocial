import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Grid3X3,
  Bookmark,
  Filter,
  FolderOpen,
  Calendar,
  Heart,
  MessageCircle,
} from "lucide-react";
import { postsAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { PostDetail } from "./PostDetail";

interface SavedPost {
  id: string;
  image: string;
  type: "post" | "reel";
  caption: string;
  savedAt: Date;
  category?: string;
  tags?: string[];
  video?: string | null;
  user?: {
    name?: string;
    username?: string;
    avatar?: string;
    verified?: boolean;
  };
  likes?: number;
  commentsCount?: number;
}

// Removed mock data; will fetch real saved posts & reels

const categories = [
  "All",
  "Nature",
  "Fitness",
  "Lifestyle",
  "Travel",
  "Food",
  "Art",
  "Technology",
];

export const SavedPosts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const openDetail = (post: SavedPost) => {
    const detail = {
      id: post.id,
      image: post.image,
      video: post.video,
      type: post.type,
      likes: post.likes || 0,
      caption: post.caption || "",
      user: {
        name: post.user?.name || post.user?.username || "User",
        username: post.user?.username || "user",
        avatar: post.user?.avatar || "/placeholder.svg",
        verified: !!post.user?.verified,
      },
      timestamp: new Date(post.savedAt).toISOString(),
      location: undefined,
      comments: [],
      liked: false,
      saved: true,
    };
    setSelected(detail);
    setShowDetail(true);
  };

  const load = async () => {
    setLoading(true);
    try {
      // Fetch saved posts
      const postsRes = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "https://api.inventurcubes.com/api"
        }/posts/saved`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token") && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
          },
        }
      );
      const postsJson = await postsRes
        .json()
        .catch(() => ({ data: { posts: [] } }));
      const posts: any[] = postsJson?.data?.posts || postsJson?.posts || [];

      // Fetch saved reels
      const reelsRes = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "https://api.inventurcubes.com/api"
        }/reels/saved`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token") && {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }),
          },
        }
      );
      const reelsJson = await reelsRes
        .json()
        .catch(() => ({ data: { reels: [] } }));
      const reels: any[] = reelsJson?.data?.reels || reelsJson?.reels || [];

      // Normalize into SavedPost[]
      const normalized: SavedPost[] = [
        ...posts.map((p: any) => ({
          id: p.id || p._id,
          image: p.image || p.videoThumbnail || "/placeholder.svg",
          type: (p.type === "reel" ? "reel" : "post") as "post" | "reel",
          caption: p.content || "",
          savedAt: new Date(p.createdAt || Date.now()),
          category: p.category || "General",
          tags: p.tags || [],
          video: p.video || null,
          user: p.user || undefined,
          likes: typeof p.likes === "number" ? p.likes : p.likes?.length ?? 0,
          commentsCount: Array.isArray(p.comments)
            ? p.comments.length
            : p.comments || 0,
        })),
        ...reels.map((r: any) => ({
          id: r.id || r._id,
          image: r.videoThumbnail || "/placeholder.svg",
          type: "reel" as const,
          caption: r.content || r.caption || "",
          savedAt: new Date(r.createdAt || Date.now()),
          category: r.category || "Reels",
          tags: r.tags || [],
          video: r.video || r.videoUrl || null,
          user: r.user || undefined,
          likes: typeof r.likes === "number" ? r.likes : r.likes?.length ?? 0,
          commentsCount: Array.isArray(r.comments)
            ? r.comments.length
            : r.comments || 0,
        })),
      ];

      // Sort newest first
      normalized.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
      setSavedPosts(normalized);
    } catch (_) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    load();
    // subscribe to saved updates
    const handler = () => load();
    window.addEventListener("treesh:saved-updated", handler);
    return () => window.removeEventListener("treesh:saved-updated", handler);
  }, []);

  const filteredPosts = savedPosts.filter((post) => {
    const matchesSearch =
      post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRemoveSaved = async (postId: string) => {
    const item = savedPosts.find((p) => p.id === postId);
    if (!item) return;
    try {
      if (item.type === "post") {
        const res = await postsAPI.bookmarkPost(postId);
        if (!res.success) throw new Error("Failed to unsave post");
      } else {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "https://api.inventurcubes.com/api"
          }/reels/${postId}/save`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(localStorage.getItem("token") && {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }),
            },
          }
        );
        if (!response.ok) throw new Error("Failed to unsave reel");
      }
      setSavedPosts((prev) => prev.filter((post) => post.id !== postId));
      toast({ title: "Removed", description: "Item removed from saved" });
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message || "Failed to remove",
        variant: "destructive",
      });
    }
  };

  const formatSavedTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return "Just now";
    }
  };

  if (!loading && savedPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bookmark className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No saved posts yet</h3>
        <p className="text-muted-foreground mb-4">
          Posts you save will appear here for easy access
        </p>
        <Button variant="outline">
          <Bookmark className="w-4 h-4 mr-2" />
          Start Saving Posts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Saved Posts</h2>
          <p className="text-muted-foreground">
            {savedPosts.length} saved{" "}
            {savedPosts.length === 1 ? "post" : "posts"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search saved posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Posts Grid/List */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          Loading saved content...
        </div>
      )}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-muted-foreground">No posts found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-3 gap-4" : "space-y-4"
          }
        >
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`group relative ${
                viewMode === "grid"
                  ? "aspect-square"
                  : "flex items-center gap-4 p-4 border rounded-lg"
              } cursor-pointer`}
              onClick={() => openDetail(post)}
            >
              {/* Image */}
              <div
                className={`relative overflow-hidden rounded-lg ${
                  viewMode === "grid" ? "w-full h-full" : "w-20 h-20"
                }`}
              >
                <img
                  src={post.image}
                  alt="Saved post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />

                {/* Post Type Badge */}
                {post.type === "reel" && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-blue-500 text-white text-xs">
                      <span className="mr-1">▶</span> Reel
                    </Badge>
                  </div>
                )}

                {/* Category Badge */}
                {post.category && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSaved(post.id);
                        }}
                        className="bg-white/20 hover:bg-white/30 border-white text-white"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content (List View) */}
              {viewMode === "list" && (
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {post.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatSavedTime(post.savedAt)}
                    </span>
                  </div>

                  <p className="font-medium mb-2">{post.caption}</p>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          onClick={() => {
                            const detail = {
                              id: post.id,
                              image: post.image,
                              video: post.video,
                              type: post.type,
                              likes: post.likes || 0,
                              caption: post.caption || "",
                              user: {
                                name:
                                  post.user?.name ||
                                  post.user?.username ||
                                  "User",
                                username: post.user?.username || "user",
                                avatar: post.user?.avatar || "/placeholder.svg",
                                verified: !!post.user?.verified,
                              },
                              timestamp: new Date(post.savedAt).toISOString(),
                              location: undefined,
                              comments: [],
                              liked: false,
                              saved: true,
                            };
                            setSelected(detail);
                            setShowDetail(true);
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Caption (Grid View) */}
              {viewMode === "grid" && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-sm truncate">{post.caption}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/70 text-xs">
                      {formatSavedTime(post.savedAt)}
                    </span>
                    {post.category && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-white/20 text-white border-0"
                      >
                        {post.category}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-3">Saved Posts Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {savedPosts.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Saved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {savedPosts.filter((p) => p.type === "post").length}
            </div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {savedPosts.filter((p) => p.type === "reel").length}
            </div>
            <div className="text-sm text-muted-foreground">Reels</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {new Set(savedPosts.map((p) => p.category)).size}
            </div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
        </div>
      </div>
      {/* Post/Reel Detail Modal */}
      {selected && (
        <PostDetail
          isOpen={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelected(null);
          }}
          post={selected}
        />
      )}
    </div>
  );
};

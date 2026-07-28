import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  User,
  Hash,
  Image,
  Video,
  Users,
  TrendingUp,
} from "lucide-react";
import { usersAPI, UserProfile, storiesAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useStorySeen } from "@/hooks/useStorySeen";
import { StoryViewer } from "./StoryViewer";
import SegmentedRing from "./SegmentedRing";
import { useAuth } from "@/hooks/useAuth";

interface SearchResult {
  id: string;
  type: "user" | "post" | "hashtag" | "reel";
  title: string;
  subtitle: string;
  avatar?: string;
  image?: string;
  verified?: boolean;
  followers?: number;
  likes?: number;
  hashtag?: string;
  postCount?: number;
}

const mockSearchResults: SearchResult[] = [
  // Users
  {
    id: "1",
    type: "user",
    title: "Alice Johnson",
    subtitle: "@alice • Digital Creator",
    avatar: "/placeholder.svg",
    verified: true,
    followers: 12500,
  },
  {
    id: "2",
    type: "user",
    title: "Bob Smith",
    subtitle: "@bob • Fitness Enthusiast",
    avatar: "/placeholder.svg",
    verified: false,
    followers: 3400,
  },
  // Posts
  {
    id: "3",
    type: "post",
    title: "Beautiful sunset today! 🌅",
    subtitle: "Posted by @alice • 2h ago",
    image: "/placeholder.svg",
    likes: 234,
  },
  {
    id: "4",
    type: "post",
    title: "New recipe alert! 👨‍🍳",
    subtitle: "Posted by @chefmaster • 4h ago",
    image: "/placeholder.svg",
    likes: 156,
  },
  // Hashtags
  {
    id: "5",
    type: "hashtag",
    title: "#sunset",
    subtitle: "12.5K posts",
    hashtag: "sunset",
    postCount: 12500,
  },
  {
    id: "6",
    type: "hashtag",
    title: "#fitness",
    subtitle: "8.9K posts",
    hashtag: "fitness",
    postCount: 8900,
  },
  // Reels
  {
    id: "7",
    type: "reel",
    title: "Quick workout routine 💪",
    subtitle: "By @bob • 1.2K views",
    image: "/placeholder.svg",
    likes: 89,
  },
];

interface EnhancedSearchProps {
  onUserSelect?: (userId: string) => void;
}

export const EnhancedSearch = ({ onUserSelect }: EnhancedSearchProps) => {
  const { user: authUser } = useAuth();
  const { hasSeen, markSeen } = useStorySeen();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyItems, setStoryItems] = useState<any[]>([]);
  const [storyIndex, setStoryIndex] = useState(0);
  const [selectedStoryUserId, setSelectedStoryUserId] = useState<string | null>(
    null
  );
  const [hasStoryMap, setHasStoryMap] = useState<Record<string, boolean>>({});
  const [storyCountMap, setStoryCountMap] = useState<Record<string, number>>(
    {}
  );

  const openUserStories = async (userId: string) => {
    try {
      // Follow-gate: fetch profile to check isFollowing (skip if it's me later)
      try {
        const prof = await usersAPI.getUserProfile(userId);
        if (
          prof?.success &&
          prof.data &&
          prof.data.id !== undefined &&
          String((authUser as any)?.id || (authUser as any)?._id) !==
            String(prof.data.id) &&
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
      const hasAny =
        res.success && Array.isArray(res.data) && res.data.length > 0;
      setHasStoryMap((m) => ({ ...m, [userId]: Boolean(hasAny) }));
      if (hasAny) {
        setStoryCountMap((m) => ({ ...m, [userId]: res.data.length }));
      }
      if (hasAny) {
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

  // Search users from backend
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await usersAPI.searchUsers(query);
      console.log("User search API response:", response); // Debug log
      if (response.success && response.data) {
        console.log("Users data:", response.data); // Debug log
        setUsers(Array.isArray(response.data) ? response.data : []);
      } else {
        setUsers([]);
        if (response.error) {
          toast({
            title: "Search Error",
            description: response.error,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      // Provide demo users as fallback
      const demoUsers = [
        {
          id: "demo-1",
          username: "demo_user",
          fullName: "Demo User",
          email: "demo@example.com",
          avatar: "/placeholder.svg",
          isStreamer: false,
        },
      ];
      setUsers(demoUsers);
      toast({
        title: "Using Demo Data",
        description: "Showing demo results while connecting to backend",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and search results
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    // Simulate search delay
    setTimeout(() => {
      let filtered = mockSearchResults.filter((result) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          result.title.toLowerCase().includes(query) ||
          result.subtitle.toLowerCase().includes(query);

        if (filterType === "all") return matchesQuery;
        return result.type === filterType && matchesQuery;
      });

      // Sort results
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "relevance":
            return 0; // Keep original order for relevance
          case "popularity":
            return (
              (b.followers || b.likes || 0) - (a.followers || a.likes || 0)
            );
          case "recent":
            return 0; // Would sort by timestamp in real app
          default:
            return 0;
        }
      });

      setResults(filtered);
      setLoading(false);
    }, 500);
  }, [searchQuery, filterType, sortBy]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4 text-blue-500" />;
      case "post":
        return <Image className="w-4 h-4 text-green-500" />;
      case "hashtag":
        return <Hash className="w-4 h-4 text-purple-500" />;
      case "reel":
        return <Video className="w-4 h-4 text-red-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderUserResult = (user: UserProfile) => {
    return (
      <Card
        key={user.id}
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onUserSelect?.(user.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openUserStories(user.id);
              }}
              className="relative w-12 h-12 rounded-full"
            >
              <div className="absolute inset-0 -m-[2px] flex items-center justify-center pointer-events-none">
                {(() => {
                  const hasStory = hasStoryMap[user.id] === true;
                  const segs = storyCountMap[user.id] || 1;
                  const color = hasStory
                    ? hasSeen(user.id)
                      ? "#9ca3af"
                      : "#ef4444"
                    : "#e5e7eb";
                  return (
                    <SegmentedRing
                      segments={Math.max(1, segs)}
                      color={color}
                      size={48}
                      strokeWidth={3}
                      gapRatio={0.06}
                    />
                  );
                })()}
              </div>
              <div className="w-12 h-12 rounded-full bg-white p-[2px]">
                <Avatar className="w-full h-full">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {user.fullName?.charAt(0) ||
                      user.username?.charAt(0) ||
                      "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">
                  {user.fullName || user.username || "Unknown User"}
                </h3>
                {user.isStreamer && (
                  <Badge className="bg-blue-500 text-white text-xs">✓</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                @{user.username || "unknown"}
              </p>
              {user.bio && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {user.bio}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUserSelect?.(user.id);
              }}
            >
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSearchResult = (result: SearchResult) => {
    switch (result.type) {
      case "user":
        return (
          <Card
            key={result.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={result.avatar} />
                  <AvatarFallback>{result.title.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{result.title}</h3>
                    {result.verified && (
                      <Badge className="bg-blue-500 text-white text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.subtitle}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {result.followers?.toLocaleString()} followers
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "post":
        return (
          <Card
            key={result.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={result.image}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium line-clamp-2">{result.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.subtitle}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {result.likes?.toLocaleString()} likes
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "hashtag":
        return (
          <Card
            key={result.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Hash className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-purple-600">
                      {result.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {result.subtitle}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "reel":
        return (
          <Card
            key={result.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={result.image}
                    alt="Reel"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium line-clamp-2">{result.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.subtitle}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {result.likes?.toLocaleString()} likes
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-3 sm:p-6">
      {/* Story Viewer for quick view from search */}
      <StoryViewer
        isOpen={storyOpen}
        onClose={() => {
          setStoryOpen(false);
          if (selectedStoryUserId) markSeen(selectedStoryUserId);
        }}
        stories={storyItems as any}
        currentStoryIndex={storyIndex}
        onStoryChange={(i) => setStoryIndex(i)}
      />
      <div className="max-w-4xl mx-auto">
        {/* Search Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Search</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users, posts, hashtags, reels..."
              className="pl-10 font-inter text-base sm:text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Search Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="post">Posts</SelectItem>
              <SelectItem value="hashtag">Hashtags</SelectItem>
              <SelectItem value="reel">Reels</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  All ({users.length + results.length})
                </TabsTrigger>
                <TabsTrigger value="users" className="text-xs sm:text-sm">
                  Users ({users.length})
                </TabsTrigger>
                <TabsTrigger value="posts" className="text-xs sm:text-sm">
                  Posts ({results.filter((r) => r.type === "post").length})
                </TabsTrigger>
                <TabsTrigger value="hashtags" className="text-xs sm:text-sm">
                  Hashtags ({results.filter((r) => r.type === "hashtag").length}
                  )
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Searching...</p>
                  </div>
                ) : users?.length > 0 || results?.length > 0 ? (
                  <div className="space-y-4">
                    {users?.map(renderUserResult) || []}
                    {results?.map(renderSearchResult) || []}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No results found for "{searchQuery}"
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try different keywords or check your spelling
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Start typing to search for users...
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Searching users...</p>
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-4">{users.map(renderUserResult)}</div>
                ) : searchQuery ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No users found for "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Search for users by name or username
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="posts" className="mt-6">
                <div className="space-y-4">
                  {results
                    .filter((r) => r.type === "post")
                    .map(renderSearchResult)}
                </div>
              </TabsContent>

              <TabsContent value="hashtags" className="mt-6">
                <div className="space-y-4">
                  {results
                    .filter((r) => r.type === "hashtag")
                    .map(renderSearchResult)}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Search Suggestions */}
        {!searchQuery && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">Start searching</h3>
            <p className="text-muted-foreground mb-6">
              Search for users, posts, hashtags, and reels
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
              <div className="text-center p-3 sm:p-4 rounded-lg bg-gray-50">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Users</p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-gray-50">
                <Image className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Posts</p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-gray-50">
                <Hash className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Hashtags</p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-gray-50">
                <Video className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-medium">Reels</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

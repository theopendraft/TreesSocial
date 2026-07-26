import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  ThumbsUp,
  Smile,
  Flag,
  Copy,
  Link,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { postsAPI } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { usePosts } from "@/hooks/usePosts";

interface PostDetailProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostData;
}

interface PostData {
  id: string;
  image: string;
  video?: string;
  type: "post" | "reel";
  likes: number;
  caption: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  timestamp: string;
  location?: string;
  comments: Comment[];
  // Optional flags passed from parent lists
  liked?: boolean;
  saved?: boolean;
}

interface Comment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  text: string;
  timestamp: string;
  likes: number;
}

export const PostDetail: React.FC<PostDetailProps> = ({
  isOpen,
  onClose,
  post,
}) => {
  const { user: authUser } = useAuth();
  const { deletePost } = usePosts();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(post.likes || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);

  useEffect(() => {
    // Initialize from given post; backend doesn't expose GET /posts/:id
    const incoming = Array.isArray(post.comments) ? post.comments : [];
    const normalized: Comment[] = incoming.map((c: any) => ({
      id: c?.id || c?._id || String(Math.random()),
      user: {
        name:
          c?.user?.name ||
          c?.author?.name ||
          // If backend only supplies userId, map current user's id to their name; else generic
          (typeof c?.userId === "string"
            ? c.userId === authUser?.id
              ? authUser?.fullName || authUser?.username || "You"
              : "User"
            : "User"),
        username:
          c?.user?.username ||
          c?.author?.username ||
          // If commenter is the current user, show their username; otherwise leave blank to avoid showing IDs
          (typeof c?.userId === "string" && c.userId === authUser?.id
            ? authUser?.username || "you"
            : ""),
        avatar: c?.user?.avatar || c?.author?.avatar || "/placeholder.svg",
        verified: !!(c?.user?.verified || c?.author?.verified),
      },
      text: c?.text || c?.content || "",
      timestamp:
        c?.timestamp || new Date(c?.createdAt || Date.now()).toISOString(),
      likes: Array.isArray(c?.likes) ? c.likes.length : c?.likes || 0,
    }));
    setComments(normalized);
    setLikesCount(typeof post.likes === "number" ? post.likes : 0);
    // Initialize liked/saved from parent if provided (persistent)
    const initialLiked =
      Boolean((post as any)?.liked) || Boolean((post as any)?.isLiked);
    const initialSaved =
      Boolean((post as any)?.saved) || Boolean((post as any)?.isBookmarked);
    setIsLiked(initialLiked);
    setIsSaved(initialSaved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, post.id]);

  // Fetch latest post details on open to ensure persistence across reopen
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await postsAPI.getPost(post.id);
        if (res.success && (res.data as any) && !cancelled) {
          const data: any = res.data;
          // Comments from backend may be array of objects with user field
          const latestComments: Comment[] = Array.isArray(
            (data as any).comments
          )
            ? (data as any).comments.map((c: any) => ({
                id: c?._id || c?.id || String(Math.random()),
                user: {
                  name: c?.user?.name || c?.user?.username || "User",
                  username: c?.user?.username || "",
                  avatar: c?.user?.avatar || "/placeholder.svg",
                  verified: !!c?.user?.verified,
                },
                text: c?.content || c?.text || "",
                timestamp: new Date(c?.createdAt || Date.now()).toISOString(),
                likes:
                  typeof c?.likes === "number"
                    ? c.likes
                    : Array.isArray(c?.likes)
                    ? c.likes.length
                    : 0,
              }))
            : [];
          setComments(latestComments);
          if (typeof data.likes === "number") setLikesCount(data.likes);
          if (typeof (data as any).isLiked === "boolean")
            setIsLiked((data as any).isLiked);
          if (typeof (data as any).isBookmarked === "boolean")
            setIsSaved((data as any).isBookmarked);
        }
      } catch (e) {
        // ignore fetch errors, keep existing state
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, post.id]);

  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      const res = await postsAPI.likePost(post.id);
      if (!res.success) throw new Error("like failed");
      const liked = (res.data as any)?.liked;
      const count = (res.data as any)?.likesCount;
      if (typeof liked === "boolean") setIsLiked(liked);
      if (typeof count === "number") setLikesCount(count);
      try {
        window.dispatchEvent(
          new CustomEvent("treesh:post-updated", {
            detail: { postId: post.id, isLiked: liked, likesCount: count },
          })
        );
      } catch {}
    } catch (e) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast({
      title: "Link copied!",
      description: "Post link has been copied to clipboard",
    });
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const text = commentText.trim();
    setCommentText("");
    try {
      const res = await postsAPI.addComment(post.id, text);
      if (!res.success) throw new Error("comment failed");
      setComments((prev) => [
        {
          id: (res.data as any)?._id || Date.now().toString(),
          user: {
            name: authUser?.username || "you",
            username: authUser?.username || "you",
            avatar: "/placeholder.svg",
            verified: false,
          },
          text,
          timestamp: "Just now",
          likes: 0,
        },
        ...prev,
      ]);
      toast({
        title: "Comment added!",
        description: "Your comment has been posted successfully",
      });
      try {
        window.dispatchEvent(
          new CustomEvent("treesh:post-updated", {
            detail: { postId: post.id, commentsDelta: 1 },
          })
        );
      } catch {}
    } catch (e) {
      setCommentText(text);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    const prev = isSaved;
    setIsSaved(!prev);
    try {
      const res = await postsAPI.bookmarkPost(post.id);
      if (!res.success) throw new Error("bookmark failed");
      const isBookmarked = (res.data as any)?.isBookmarked;
      if (typeof isBookmarked === "boolean") setIsSaved(isBookmarked);
      try {
        window.dispatchEvent(new CustomEvent("treesh:saved-updated"));
      } catch {}
      toast({
        title:
          (res.data as any)?.message || (prev ? "Post unsaved" : "Post saved!"),
        description: prev ? "Post removed from saved" : "Post added to saved",
      });
    } catch (e) {
      setIsSaved(prev);
      toast({
        title: "Error",
        description: "Failed to update saved state",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = post.image;
    link.download = `post-${post.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started!",
      description: "Post image is being downloaded",
    });
  };

  const handleReport = () => {
    toast({
      title: "Post reported",
      description: "Thank you for helping keep our community safe",
    });
    setShowMoreOptions(false);
  };

  const handleDelete = async () => {
    if (!authUser) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to delete posts",
        variant: "destructive",
      });
      return;
    }

    if (!(post.user?.username === authUser?.username || 
          post.user?.name === authUser?.fullName)) {
      toast({
        title: "Permission denied", 
        description: "You can only delete your own posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await deletePost(post.id);
      
      if (success) {
        toast({
          title: "Success",
          description: "Post deleted successfully",
        });
        
        // Emit post deleted event
        window.dispatchEvent(new CustomEvent("postDeleted", { 
          detail: { postId: post.id } 
        }));
        
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
    setShowMoreOptions(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Post details</DialogTitle>
          <DialogDescription>
            View and interact with the post.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row h-full">
          {/* Media Section */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <div className="relative">
              {post.video ? (
                <video
                  src={post.video}
                  className="w-full h-[600px] object-cover bg-black"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-[600px] object-cover"
                />
              )}

              {/* Post Type Badge */}
              {post.type === "reel" && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-blue-500 text-white">
                    <span className="mr-1">▶</span> Reel
                  </Badge>
                </div>
              )}

              {/* More Options Button */}
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/20 hover:bg-black/40 text-white"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>

                {/* More Options Menu */}
                {showMoreOptions && (
                  <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                    <button
                      onClick={handleShare}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={handleReport}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                    {/* Only show delete option for user's own posts */}
                    {(post.user?.username === authUser?.username || 
                      post.user?.name === authUser?.fullName) && (
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600 border-t"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 max-w-md border-l flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={post.user?.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {post.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {post.user?.name || "User"}
                      </span>
                      {Boolean(post.user?.verified) && (
                        <Badge className="bg-blue-500 text-xs">✓</Badge>
                      )}
                    </div>
                    {post.location && (
                      <p className="text-sm text-muted-foreground">
                        {post.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="p-4 border-b">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {post.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {post.user?.name || "User"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {post.caption}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {post.timestamp}
                  </p>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No comments yet</p>
                  <p className="text-xs">Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage
                        src={comment.user?.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {comment.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {comment.user?.name || "User"}
                        </span>
                        {Boolean(comment.user?.verified) && (
                          <Badge className="bg-blue-500 text-xs">✓</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {comment.text || ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{comment.timestamp || ""}</span>
                        <button className="hover:text-foreground">Like</button>
                        <button className="hover:text-foreground">Reply</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${
                      isLiked ? "text-red-500" : "text-foreground"
                    }`}
                  >
                    <Heart
                      className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`}
                    />
                    <span className="text-sm">{likesCount}</span>
                  </button>

                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm">{comments.length}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  className={`hover:opacity-80 transition-opacity ${
                    isSaved ? "text-blue-500" : "text-foreground"
                  }`}
                >
                  <Bookmark
                    className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`}
                  />
                </button>
              </div>

              {/* Add Comment */}
              <div className="flex items-center gap-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && handleComment()}
                />
                <Button
                  size="sm"
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

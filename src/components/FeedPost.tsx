import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  Flag,
  Send,
  AlertCircle,
  Eye,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { postsAPI } from "@/services/api";

interface Comment {
  id: string;
  user: { name: string; username: string; avatar: string };
  content: string;
  timestamp: string;
  likes: number;
}

interface Post {
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
  views?: number;
}

interface FeedPostProps {
  post: Post;
  onReport?: (type: "post", targetId: string, targetName?: string) => void;
}

export const FeedPost = ({ post, onReport }: FeedPostProps) => {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]); // start empty, no mock
  const [commentCount, setCommentCount] = useState<number>(post.comments || 0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Skipping initial fetch of comments as GET /posts/:id is not supported by backend.
  // We display count from feed item and update locally when user adds comments.

  const validateComment = (comment: string): boolean => {
    if (!comment.trim()) {
      setCommentError("Comment cannot be empty");
      return false;
    }
    if (comment.length < 2) {
      setCommentError("Comment must be at least 2 characters long");
      return false;
    }
    if (comment.length > 500) {
      setCommentError("Comment cannot exceed 500 characters");
      return false;
    }
    setCommentError("");
    return true;
  };

  const handleLike = async () => {
    // optimistic toggle
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await postsAPI.likePost(post.id);
      if (!res.success) {
        // revert on failure
        setLiked(prevLiked);
        setLikesCount(prevCount);
        toast({
          title: "Error",
          description: "Failed to like post",
          variant: "destructive",
        });
      } else if (typeof (res.data as any)?.likesCount === "number") {
        setLikesCount((res.data as any).likesCount);
      }
    } catch (e) {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    const prev = saved;
    setSaved(!prev);
    try {
      const res = await postsAPI.bookmarkPost(post.id);
      if (!res.success) throw new Error("bookmark failed");
      const isBookmarked = (res.data as any)?.isBookmarked;
      if (typeof isBookmarked === "boolean") {
        setSaved(isBookmarked);
      }
      // Notify Saved view to refresh immediately
      try {
        window.dispatchEvent(new CustomEvent("treesh:saved-updated"));
      } catch {}
      toast({
        title:
          (res.data as any)?.message || (prev ? "Post unsaved" : "Post saved!"),
        description: prev
          ? "Post removed from saved items"
          : "Post added to saved items",
      });
    } catch (e) {
      setSaved(prev);
      toast({
        title: "Error",
        description: "Failed to update saved state",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${post.user.name}`,
        text: post.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${post.content} - Shared from Treesh`);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to clipboard",
      });
    }
  };

  const handleReport = () => {
    if (onReport) onReport("post", post.id, post.user.name);
    else
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe",
      });
  };

  const handleAddComment = async () => {
    if (!validateComment(newComment)) return;
    setIsSubmitting(true);

    const content = newComment.trim();
    setNewComment("");

    try {
      const res = await postsAPI.addComment(post.id, content);
      if (res.success && res.data) {
        // Append minimal comment; backend returns the new comment doc
        setComments((prev) => [
          {
            id: (res.data as any)._id || Date.now().toString(),
            user: { name: "You", username: "you", avatar: "/placeholder.svg" },
            content,
            timestamp: "Just now",
            likes: 0,
          },
          ...prev,
        ]);
        setCommentCount((c) => (typeof c === "number" ? c + 1 : 1));
        toast({
          title: "Comment added!",
          description: "Your comment has been posted successfully",
        });
      } else {
        throw new Error((res as any).error || "Failed to post comment");
      }
    } catch (error) {
      setNewComment(content); // restore text to input for retry
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentLike = (commentId: string) => {
    // Placeholder for comment-like API (not implemented yet)
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast({
      title: "Link copied!",
      description: "Post link has been copied to clipboard",
    });
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Card
      className={`${
        post.type === "psa" ? "border-orange-200 bg-orange-50" : ""
      }`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Avatar className="cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium cursor-pointer hover:text-primary transition-colors truncate">
                  {post.user.name}
                </span>
                {post.user.verified && (
                  <Badge className="bg-blue-500 text-white text-xs flex-shrink-0">
                    ✓
                  </Badge>
                )}
                {post.type === "psa" && (
                  <Badge className="bg-orange-500 text-white text-xs flex-shrink-0">
                    PSA
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors truncate">
                @{post.user.username} • {post.timestamp}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleReport} className="text-red-600">
                <Flag className="w-4 h-4 mr-2" />
                Report Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyLink}>
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem>Share to...</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mb-3">{post.content}</p>

        {/* Render media (image or video) */}
        {(post.image || post.video || post.media) && (
          <div className="mb-3 rounded-lg overflow-hidden relative">
            {(post.mediaType === 'video' || post.video || (post.media && !post.image)) ? (
              <>
                <video
                  ref={videoRef}
                  src={post.video || post.media}
                  className="w-full h-auto max-h-[500px] object-contain bg-black"
                  playsInline
                  autoPlay
                  loop
                  muted={isMuted}
                >
                  Your browser does not support the video tag.
                </video>
                {/* Mute/Unmute Button */}
                <button
                  onClick={toggleMute}
                  className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </>
            ) : (
              <img
                src={post.image || post.media}
                alt="Post content"
                className="w-full h-auto"
              />
            )}
          </div>
        )}

        {/* PSA Special Styling */}
        {post.type === "psa" && (
          <div className="mb-3 p-3 bg-orange-100 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Public Service Announcement
              </span>
            </div>
            <p className="text-sm text-orange-700">
              This is an important message from the platform administration.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`${
                liked ? "text-red-500" : "text-muted-foreground"
              } hover:bg-red-50 transition-colors h-9 px-2 sm:px-3`}
            >
              <Heart
                className={`w-4 h-4 mr-1 ${liked ? "fill-current" : ""}`}
              />
              <span className="hidden sm:inline">{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-colors h-9 px-2 sm:px-3"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{commentCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:bg-green-50 hover:text-green-600 transition-colors h-9 px-2 sm:px-3"
              onClick={handleShare}
            >
              <Share className="w-4 h-4 mr-1" />
              {post.shares}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className={`${
              saved ? "text-blue-500" : "text-muted-foreground"
            } hover:bg-blue-50 transition-colors h-9 px-2 sm:px-3`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback className="text-xs">
                      {comment.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm cursor-pointer hover:text-primary transition-colors">
                          {comment.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {comment.timestamp}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 px-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={() => handleCommentLike(comment.id)}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        {comment.likes}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    if (commentError) setCommentError("");
                  }}
                  onKeyPress={handleKeyPress}
                  className={`flex-1 ${
                    commentError ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  maxLength={500}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="min-w-[80px]"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {commentError && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{commentError}</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground text-right">
                {newComment.length}/500 characters
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

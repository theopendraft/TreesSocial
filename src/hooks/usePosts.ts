import { useState, useEffect } from "react";
import { postsAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  images?: string[];
  videos?: string[];
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  type: "post" | "reel" | "story";
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Load posts on mount
  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async (pageNum = 1, reset = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await postsAPI.getFeed(pageNum, 10);

      if (response.success && response.data) {
        // Add defensive checks for the data structure
        const posts = Array.isArray(response.data.posts) 
          ? response.data.posts 
          : Array.isArray(response.data) 
          ? response.data 
          : [];
          
        const hasMore = response.data.hasMore !== undefined 
          ? response.data.hasMore 
          : false;

        if (reset) {
          setPosts(posts);
        } else {
          setPosts((prev) => [...prev, ...posts]);
        }
        setHasMore(hasMore);
        setPage(pageNum);
      } else {
        // Handle case where response is not successful
        console.warn('Failed to load feed:', response);
        setError('Failed to load posts');
      }
    } catch (err) {
      console.error('Error loading feed:', err);
      const errorMessage = "Failed to load posts";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || isLoading) return;
    await loadFeed(page + 1, false);
  };

  const refreshFeed = async () => {
    await loadFeed(1, true);
  };

  const createPost = async (content: string, files?: File[]) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("content", content);
      formData.append("type", "post");

      if (files) {
        files.forEach((file, index) => {
          if (file.type.startsWith("image/")) {
            formData.append("images", file);
          } else if (file.type.startsWith("video/")) {
            formData.append("videos", file);
          }
        });
      }

      const response = await postsAPI.createPost(formData);

      if (response.success && response.data) {
        setPosts((prev) => [response.data, ...prev]);
        toast({
          title: "Success",
          description: "Post created successfully",
        });
        return response.data;
      }
      return null;
    } catch (err) {
      const errorMessage = "Failed to create post";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const likePost = async (postId: string) => {
    try {
      const response = await postsAPI.likePost(postId);

      if (response.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  isLiked: !post.isLiked,
                  likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                }
              : post
          )
        );
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const bookmarkPost = async (postId: string) => {
    try {
      const response = await postsAPI.bookmarkPost(postId);

      if (response.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? { ...post, isBookmarked: !post.isBookmarked }
              : post
          )
        );

        const post = posts.find((p) => p.id === postId);
        if (post) {
          if (!post.isBookmarked) {
            setSavedPosts((prev) => [{ ...post, isBookmarked: true }, ...prev]);
            toast({
              title: "Success",
              description: "Post saved",
            });
          } else {
            setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
            toast({
              title: "Success",
              description: "Post removed from saved",
            });
          }
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to bookmark post",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting to delete post:", postId);
      
      const response = await postsAPI.deletePost(postId);
      console.log("Delete response:", response);

      if (response.success) {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        setSavedPosts((prev) => prev.filter((post) => post.id !== postId));
        toast({
          title: "Success",
          description: "Post deleted successfully",
        });
        return true;
      } else {
        // Handle specific error cases
        let errorMessage = response.error || "Failed to delete post";
        console.error("Delete failed:", response);
        
        toast({
          title: "Delete Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error("Delete post error:", err);
      
      toast({
        title: "Error",
        description: "Network error occurred while deleting post",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sharePost = async (postId: string, platform?: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      // Update share count optimistically
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, shares: p.shares + 1 } : p))
      );

      if (navigator.share && !platform) {
        await navigator.share({
          title: `Post by ${post.authorName}`,
          text: post.content,
          url: `${window.location.origin}/post/${postId}`,
        });
      } else {
        // Fallback: copy to clipboard
        const shareUrl = `${window.location.origin}/post/${postId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Success",
          description: "Link copied to clipboard",
        });
      }
    } catch (err) {
      // Revert share count
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, shares: Math.max(0, p.shares - 1) } : p
        )
      );

      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive",
      });
    }
  };

  const getPostById = async (postId: string) => {
    try {
      const response = await postsAPI.getPost(postId);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load post",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    // State
    posts,
    savedPosts,
    isLoading,
    error,
    hasMore,

    // Actions
    createPost,
    likePost,
    bookmarkPost,
    deletePost,
    sharePost,
    getPostById,

    // Pagination
    loadMorePosts,
    refreshFeed,
  };
};

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, X, ChevronLeft, ChevronRight, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  bio?: string;
  followers?: number;
  location?: string;
}

interface PostMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  duration?: number;
}

interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  media: PostMedia[];
  hashtags: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  location?: string;
  category?: string;
}

interface PostSwipeCardProps {
  post: Post;
  onSwipe: (direction: 'left' | 'right') => void;
  onMatch?: (post: Post) => void;
}

export const PostSwipeCard = ({ post, onSwipe, onMatch }: PostSwipeCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % post.media.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + post.media.length) % post.media.length);
  };

  const handleLike = () => {
    setIsLiked(true);
    toast({
      title: 'Post liked!',
      description: `You liked ${post.author.name}'s post. If they like your posts too, it's a match!`
    });
    onSwipe('right');
  };

  const handleDislike = () => {
    toast({
      title: 'Post passed',
      description: 'Post passed. Finding more content for you...'
    });
    onSwipe('left');
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? 'Post unsaved' : 'Post saved',
      description: isSaved ? 'Post removed from your saved items' : 'Post added to your saved items'
    });
  };

  const handleShare = () => {
    toast({
      title: 'Share feature',
      description: 'Share functionality coming soon!'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Card className="overflow-hidden relative max-w-md mx-auto shadow-lg">
        {/* Media Section */}
        <div className="relative">
          {post.media[currentImageIndex]?.type === 'video' ? (
            <video
              src={post.media[currentImageIndex].url}
              className="w-full h-96 object-cover"
              poster={post.media[currentImageIndex].thumbnail}
              controls
            />
          ) : (
            <img
              src={post.media[currentImageIndex]?.url || '/placeholder.svg'}
              alt={post.content}
              className="w-full h-96 object-cover"
            />
          )}
          
          {/* Navigation Arrows for Multiple Media */}
          {post.media.length > 1 && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 p-0"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 p-0"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {/* Media Indicators */}
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {post.media.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Action Buttons Overlay */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/80 hover:bg-white rounded-full w-8 h-8 p-0"
              onClick={handleSave}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/80 hover:bg-white rounded-full w-8 h-8 p-0"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Content Section */}
        <CardContent className="p-4">
          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm">{post.author.name}</h3>
                {post.author.verified && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    ✓
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>@{post.author.username}</span>
                {post.author.followers && (
                  <span>• {post.author.followers.toLocaleString()} followers</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Post Content */}
          <p className="text-sm mb-3 line-clamp-3">{post.content}</p>
          
          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.hashtags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Post Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center space-x-4">
              <span>{post.likes.toLocaleString()} likes</span>
              <span>{post.comments.toLocaleString()} comments</span>
              <span>{post.shares.toLocaleString()} shares</span>
            </div>
            <span>{formatTimestamp(post.timestamp)}</span>
          </div>
          
          {/* Location */}
          {post.location && (
            <div className="text-xs text-muted-foreground mb-3">
              📍 {post.location}
            </div>
          )}
          
          {/* Category */}
          {post.category && (
            <Badge variant="secondary" className="text-xs">
              {post.category}
            </Badge>
          )}
        </CardContent>
      </Card>
      
      {/* Swipe Action Buttons */}
      <div className="flex justify-center space-x-6 mt-6">
        <Button
          size="lg"
          variant="outline"
          className="rounded-full w-16 h-16 border-red-500 hover:bg-red-50 hover:border-red-600"
          onClick={handleDislike}
        >
          <X className="w-6 h-6 text-red-500" />
        </Button>
        
        <Button
          size="lg"
          className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
          onClick={handleLike}
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>
    </>
  );
};

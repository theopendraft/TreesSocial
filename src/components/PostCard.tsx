import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  platform: 'twitter' | 'instagram' | 'facebook';
}

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter': return 'bg-blue-400';
      case 'instagram': return 'bg-gradient-to-r from-pink-500 to-purple-600';
      case 'facebook': return 'bg-blue-600';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="mb-6 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.avatar} alt={post.author} />
              <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900 font-inter">{post.author}</p>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getPlatformColor(post.platform)}`} />
                <span className="text-sm text-gray-500 font-inter">{post.timestamp}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-800 mb-4 leading-relaxed font-inter">{post.content}</p>
        
        {post.image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 font-inter ${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 font-inter">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-500 hover:text-green-500 font-inter">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
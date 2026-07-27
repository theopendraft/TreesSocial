import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, UserPlus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MatchedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  bio?: string;
  followers?: number;
  location?: string;
  commonInterests?: string[];
}

interface MatchNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: MatchedUser;
  onSendMessage: (userId: string) => void;
  onFollow: (userId: string) => void;
}

export const MatchNotification = ({ 
  isOpen, 
  onClose, 
  matchedUser, 
  onSendMessage, 
  onFollow 
}: MatchNotificationProps) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow(matchedUser.id);
    toast({
      title: isFollowing ? 'Unfollowed' : 'Followed!',
      description: isFollowing 
        ? `You unfollowed ${matchedUser.name}` 
        : `You're now following ${matchedUser.name}`
    });
  };

  const handleSendMessage = () => {
    onSendMessage(matchedUser.id);
    onClose();
    toast({
      title: 'Message sent!',
      description: `Opening chat with ${matchedUser.name}`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center space-x-2 text-2xl font-bold text-green-600">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <span>It's a Match!</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          {/* Match Animation */}
          <div className="relative mb-6">
            <div className="flex justify-center space-x-4">
              <Avatar className="w-20 h-20 border-4 border-green-500">
                <AvatarImage src="/placeholder.svg" alt="You" />
                <AvatarFallback className="text-lg">You</AvatarFallback>
              </Avatar>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white fill-current" />
                </div>
              </div>
              
              <Avatar className="w-20 h-20 border-4 border-green-500">
                <AvatarImage src={matchedUser.avatar} alt={matchedUser.name} />
                <AvatarFallback className="text-lg">{matchedUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          {/* Matched User Info */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
              {matchedUser.name}
              {matchedUser.verified && (
                <Badge variant="secondary" className="ml-2 text-xs px-1 py-0">
                  ✓
                </Badge>
              )}
            </h3>
            <p className="text-muted-foreground mb-2">@{matchedUser.username}</p>
            {matchedUser.bio && (
              <p className="text-sm text-muted-foreground mb-3">{matchedUser.bio}</p>
            )}
            {matchedUser.followers && (
              <p className="text-sm text-muted-foreground">
                {matchedUser.followers.toLocaleString()} followers
              </p>
            )}
          </div>
          
          {/* Common Interests */}
          {matchedUser.commonInterests && matchedUser.commonInterests.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">You both like:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {matchedUser.commonInterests.map((interest) => (
                  <Badge key={interest} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleSendMessage}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleFollow}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="w-full"
            >
              Keep Browsing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
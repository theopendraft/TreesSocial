import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  MessageCircle, 
  UserPlus, 
  Calendar, 
  MapPin, 
  Heart,
  Users,
  Clock
} from 'lucide-react';
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
  matchedAt: string;
  lastInteraction?: string;
  isOnline: boolean;
  mutualFriends?: number;
}

interface MatchHistoryProps {
  onStartChat: (userId: string) => void;
  onFollow: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

const mockMatches: MatchedUser[] = [
  {
    id: '1',
    name: 'Emma Wilson',
    username: 'emma_wilson',
    avatar: '/placeholder.svg',
    verified: true,
    bio: 'Love traveling and photography 📸',
    followers: 1250,
    location: 'New York, NY',
    commonInterests: ['Travel', 'Photography', 'Coffee'],
    matchedAt: '2024-01-15T10:30:00Z',
    lastInteraction: '2024-01-20T14:20:00Z',
    isOnline: true,
    mutualFriends: 3
  },
  {
    id: '2',
    name: 'Alex Chen',
    username: 'alex_chen',
    avatar: '/placeholder.svg',
    verified: false,
    bio: 'Fitness enthusiast and dog lover 🐕',
    followers: 890,
    location: 'Los Angeles, CA',
    commonInterests: ['Fitness', 'Dogs', 'Hiking'],
    matchedAt: '2024-01-10T16:45:00Z',
    lastInteraction: '2024-01-18T09:15:00Z',
    isOnline: false,
    mutualFriends: 1
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    username: 'sarah_j',
    avatar: '/placeholder.svg',
    verified: true,
    bio: 'Artist and coffee lover ☕',
    followers: 2100,
    location: 'Chicago, IL',
    commonInterests: ['Art', 'Coffee', 'Music'],
    matchedAt: '2024-01-05T12:20:00Z',
    lastInteraction: '2024-01-12T11:30:00Z',
    isOnline: true,
    mutualFriends: 5
  },
  {
    id: '4',
    name: 'Mike Rodriguez',
    username: 'mike_rod',
    avatar: '/placeholder.svg',
    verified: false,
    bio: 'Gamer and tech enthusiast 🎮',
    followers: 750,
    location: 'Austin, TX',
    commonInterests: ['Gaming', 'Technology', 'Movies'],
    matchedAt: '2024-01-01T08:15:00Z',
    lastInteraction: '2024-01-08T15:45:00Z',
    isOnline: false,
    mutualFriends: 2
  }
];

export const MatchHistory = ({ onStartChat, onFollow, onViewProfile }: MatchHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredMatches = mockMatches.filter(match => {
    const matchesSearch = match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'online' && match.isOnline) ||
                         (statusFilter === 'recent' && new Date(match.lastInteraction || match.matchedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesStatus;
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastInteraction || b.matchedAt).getTime() - new Date(a.lastInteraction || a.matchedAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'mutual':
        return (b.mutualFriends || 0) - (a.mutualFriends || 0);
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleFollow = (userId: string) => {
    onFollow(userId);
    toast({
      title: 'Followed!',
      description: 'User added to your following list'
    });
  };

  const handleStartChat = (userId: string) => {
    onStartChat(userId);
    toast({
      title: 'Chat opened!',
      description: 'Starting conversation...'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-primary mb-2">Match History</h1>
        <p className="text-muted-foreground">
          You have {mockMatches.length} matches. Start conversations and build connections!
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search matches by name, username, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Matches</SelectItem>
            <SelectItem value="online">Online Now</SelectItem>
            <SelectItem value="recent">Recent Activity</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="mutual">Most Mutual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold">{mockMatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Online Now</p>
                <p className="text-2xl font-bold">{mockMatches.filter(m => m.isOnline).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Chats</p>
                <p className="text-2xl font-bold">{mockMatches.filter(m => m.lastInteraction).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {mockMatches.filter(m => new Date(m.matchedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedMatches.map((match) => (
          <Card key={match.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={match.avatar} alt={match.name} />
                      <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {match.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-sm">{match.name}</h3>
                      {match.verified && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">@{match.username}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatDate(match.matchedAt)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {match.bio && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{match.bio}</p>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                {match.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{match.location}</span>
                  </div>
                )}
                {match.followers && (
                  <span>{match.followers.toLocaleString()} followers</span>
                )}
              </div>
              
              {match.commonInterests && match.commonInterests.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Common interests:</p>
                  <div className="flex flex-wrap gap-1">
                    {match.commonInterests.slice(0, 3).map((interest) => (
                      <Badge key={interest} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {match.commonInterests.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{match.commonInterests.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {match.mutualFriends && (
                <p className="text-xs text-muted-foreground mb-3">
                  {match.mutualFriends} mutual friend{match.mutualFriends !== 1 ? 's' : ''}
                </p>
              )}
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleStartChat(match.id)}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFollow(match.id)}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedMatches.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No matches found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find more matches.
          </p>
        </div>
      )}
    </div>
  );
};

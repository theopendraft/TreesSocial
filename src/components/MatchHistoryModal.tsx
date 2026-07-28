import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Heart, X, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Match {
  id: string;
  user: {
    name: string;
    avatar: string;
    age: number;
  };
  timestamp: string;
  status: 'matched' | 'chatting' | 'unmatched';
  chatStarted: boolean;
}

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (matchId: string) => void;
}

const mockMatches: Match[] = [
  {
    id: '1',
    user: { name: 'Sarah Johnson', avatar: '/placeholder.svg', age: 25 },
    timestamp: '2h ago',
    status: 'matched',
    chatStarted: false
  },
  {
    id: '2',
    user: { name: 'Mike Davis', avatar: '/placeholder.svg', age: 28 },
    timestamp: '1d ago',
    status: 'chatting',
    chatStarted: true
  },
  {
    id: '3',
    user: { name: 'Emma Wilson', avatar: '/placeholder.svg', age: 24 },
    timestamp: '3d ago',
    status: 'unmatched',
    chatStarted: false
  }
];

const mockLikedUsers = [
  { id: '1', name: 'Alex Chen', avatar: '/placeholder.svg', age: 26, timestamp: '1h ago' },
  { id: '2', name: 'Lisa Park', avatar: '/placeholder.svg', age: 23, timestamp: '4h ago' },
  { id: '3', name: 'James Wilson', avatar: '/placeholder.svg', age: 29, timestamp: '1d ago' }
];

export const MatchHistoryModal = ({ isOpen, onClose, onStartChat }: MatchHistoryModalProps) => {
  const [activeTab, setActiveTab] = useState('matches');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'matched':
        return <Badge className="bg-green-100 text-green-800">New Match</Badge>;
      case 'chatting':
        return <Badge className="bg-blue-100 text-blue-800">Chatting</Badge>;
      case 'unmatched':
        return <Badge variant="secondary">Unmatched</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Match History</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="liked">Liked</TabsTrigger>
            <TabsTrigger value="passed">Passed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matches" className="space-y-4 max-h-96 overflow-y-auto">
            {mockMatches.map((match) => (
              <Card key={match.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={match.user.avatar} />
                        <AvatarFallback>{match.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{match.user.name}, {match.user.age}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{match.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(match.status)}
                      {match.status === 'matched' && (
                        <Button
                          size="sm"
                          onClick={() => onStartChat(match.id)}
                          className="text-xs"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Say Hi
                        </Button>
                      )}
                      {match.status === 'chatting' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStartChat(match.id)}
                          className="text-xs"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Continue
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="liked" className="space-y-4 max-h-96 overflow-y-auto">
            {mockLikedUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.name}, {user.age}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span>Liked {user.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant="outline">Waiting</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="passed" className="space-y-4 max-h-96 overflow-y-auto">
            <div className="text-center text-muted-foreground py-8">
              <X className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No passed users to show</p>
              <p className="text-sm">Users you've passed on won't appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
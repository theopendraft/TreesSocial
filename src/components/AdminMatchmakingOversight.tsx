import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Ban, Eye, Flag, MessageCircle, Users, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const mockMatchLogs = [
  {
    id: '1',
    user1: { name: 'John Doe', avatar: '/placeholder.svg', id: 'u1' },
    user2: { name: 'Jane Smith', avatar: '/placeholder.svg', id: 'u2' },
    timestamp: '2024-01-15 14:30',
    status: 'active',
    chatStarted: true,
    messagesCount: 15
  },
  {
    id: '2',
    user1: { name: 'Mike Johnson', avatar: '/placeholder.svg', id: 'u3' },
    user2: { name: 'Sarah Wilson', avatar: '/placeholder.svg', id: 'u4' },
    timestamp: '2024-01-15 12:15',
    status: 'unmatched',
    chatStarted: false,
    messagesCount: 0
  }
];

const mockFlaggedChats = [
  {
    id: '1',
    matchId: 'm1',
    reporter: { name: 'Jane Smith', id: 'u2' },
    reported: { name: 'John Doe', id: 'u1' },
    reason: 'Inappropriate content',
    timestamp: '2024-01-15 16:45',
    status: 'pending',
    severity: 'high'
  },
  {
    id: '2',
    matchId: 'm2',
    reporter: { name: 'Emma Davis', id: 'u5' },
    reported: { name: 'Alex Brown', id: 'u6' },
    reason: 'Harassment',
    timestamp: '2024-01-15 11:20',
    status: 'reviewed',
    severity: 'medium'
  }
];

export const AdminMatchmakingOversight = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);

  const handleSuspendUser = (userId: string, userName: string) => {
    toast({
      title: 'User suspended',
      description: `${userName} has been suspended from matchmaking`
    });
  };

  const handleBanUser = (userId: string, userName: string) => {
    toast({
      title: 'User banned',
      description: `${userName} has been permanently banned`
    });
  };

  const handleViewChat = (match: any) => {
    setSelectedMatch(match);
    setShowChatDialog(true);
  };

  const handleResolveFlaggedChat = (reportId: string, action: 'dismiss' | 'warn' | 'suspend') => {
    toast({
      title: 'Report resolved',
      description: `Report has been ${action === 'dismiss' ? 'dismissed' : action === 'warn' ? 'resolved with warning' : 'resolved with suspension'}`
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Matchmaking Oversight</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Chats</p>
                <p className="text-2xl font-bold">567</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flag className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Flagged Chats</p>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Ban className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Suspended Users</p>
                <p className="text-2xl font-bold">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="matches" className="w-full">
        <TabsList>
          <TabsTrigger value="matches">Match Logs</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Conversations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Users</TableHead>
                    <TableHead>Match Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMatchLogs.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={match.user1.avatar} />
                            <AvatarFallback>{match.user1.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{match.user1.name}</span>
                          <Heart className="w-4 h-4 text-red-500" />
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={match.user2.avatar} />
                            <AvatarFallback>{match.user2.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{match.user2.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{match.timestamp}</TableCell>
                      <TableCell>
                        <Badge variant={match.status === 'active' ? 'default' : 'secondary'}>
                          {match.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{match.messagesCount}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewChat(match)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSuspendUser(match.user1.id, match.user1.name)}
                          >
                            <Ban className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="flagged">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reported User</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockFlaggedChats.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{report.reporter.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.reporter.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{report.reported.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.reported.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{report.reason}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(report.severity)}>
                          {report.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{report.timestamp}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveFlaggedChat(report.id, 'dismiss')}
                          >
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveFlaggedChat(report.id, 'warn')}
                          >
                            Warn
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleResolveFlaggedChat(report.id, 'suspend')}
                          >
                            Suspend
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Chat messages would be displayed here for review</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
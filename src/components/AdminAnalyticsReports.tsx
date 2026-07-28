import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, MessageCircle, Heart, Download, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const mockEngagementData = {
  daily: { posts: 1250, likes: 8500, comments: 2100, shares: 450 },
  weekly: { posts: 8750, likes: 59500, comments: 14700, shares: 3150 },
  monthly: { posts: 37500, likes: 255000, comments: 63000, shares: 13500 }
};

const mockTopUsers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: '/placeholder.svg',
    followers: 15420,
    posts: 245,
    engagement: 8.5,
    loginTime: '4h 32m'
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: '/placeholder.svg',
    followers: 12890,
    posts: 189,
    engagement: 7.8,
    loginTime: '3h 45m'
  }
];

const mockTopCreators = [
  {
    id: '1',
    name: 'Alex Wilson',
    avatar: '/placeholder.svg',
    totalEngagement: 125000,
    posts: 89,
    avgLikes: 1405,
    avgComments: 234
  },
  {
    id: '2',
    name: 'Lisa Park',
    avatar: '/placeholder.svg',
    totalEngagement: 98500,
    posts: 67,
    avgLikes: 1470,
    avgComments: 198
  }
];

const mockLoginStats = {
  totalUsers: 45230,
  activeToday: 12450,
  activeWeek: 28900,
  avgSessionTime: '2h 15m',
  peakHours: '7-9 PM'
};

export const AdminAnalyticsReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  const handleExportReport = (type: string) => {
    toast({
      title: 'Export started',
      description: `${type} report is being generated and will be downloaded shortly`
    });
  };

  const getEngagementData = () => {
    return mockEngagementData[selectedPeriod as keyof typeof mockEngagementData];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExportReport('analytics')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Posts</p>
                <p className="text-2xl font-bold">{getEngagementData().posts.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Likes</p>
                <p className="text-2xl font-bold">{getEngagementData().likes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Comments</p>
                <p className="text-2xl font-bold">{getEngagementData().comments.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Shares</p>
                <p className="text-2xl font-bold">{getEngagementData().shares.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Most Active Users</TabsTrigger>
          <TabsTrigger value="creators">Top Creators</TabsTrigger>
          <TabsTrigger value="login">Login Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Most Active Users</CardTitle>
                <Button variant="outline" onClick={() => handleExportReport('active-users')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Followers</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Engagement Rate</TableHead>
                    <TableHead>Daily Login Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTopUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.followers.toLocaleString()}</TableCell>
                      <TableCell>{user.posts}</TableCell>
                      <TableCell>{user.engagement}%</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-sm">{user.loginTime}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="creators">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Top 10 Creators by Engagement</CardTitle>
                <Button variant="outline" onClick={() => handleExportReport('top-creators')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Total Engagement</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Avg Likes</TableHead>
                    <TableHead>Avg Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTopCreators.map((creator, index) => (
                    <TableRow key={creator.id}>
                      <TableCell>
                        <Badge variant={index === 0 ? 'default' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={creator.avatar} />
                            <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{creator.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{creator.totalEngagement.toLocaleString()}</TableCell>
                      <TableCell>{creator.posts}</TableCell>
                      <TableCell>{creator.avgLikes.toLocaleString()}</TableCell>
                      <TableCell>{creator.avgComments}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Registered Users</span>
                <span className="font-bold">{mockLoginStats.totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Today</span>
                <span className="font-bold">{mockLoginStats.activeToday.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active This Week</span>
                <span className="font-bold">{mockLoginStats.activeWeek.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Session Time</span>
                <span className="font-bold">{mockLoginStats.avgSessionTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peak Hours</span>
                <span className="font-bold">{mockLoginStats.peakHours}</span>
              </div>
              <Button className="w-full" onClick={() => handleExportReport('login-stats')}>
                <Download className="w-4 h-4 mr-2" />
                Export Login Statistics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
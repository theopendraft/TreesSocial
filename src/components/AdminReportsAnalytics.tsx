import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Users, Heart, MessageCircle, Share, Eye, Calendar } from 'lucide-react';

const mockTopContent = [
  {
    id: '1',
    user: 'Alice Johnson',
    username: 'alice',
    content: 'Beautiful sunset photography',
    type: 'post',
    likes: 12500,
    comments: 340,
    shares: 89,
    views: 25000
  },
  {
    id: '2',
    user: 'Bob Smith',
    username: 'bob',
    content: 'Cooking tutorial - Italian pasta',
    type: 'reel',
    likes: 8900,
    comments: 234,
    shares: 156,
    views: 45000
  }
];

const mockTopUsers = [
  {
    id: '1',
    name: 'Alice Johnson',
    username: 'alice',
    followers: 125000,
    posts: 456,
    engagement: 8.5,
    growth: 12.3
  },
  {
    id: '2',
    name: 'Bob Smith',
    username: 'bob',
    followers: 89000,
    posts: 234,
    engagement: 7.2,
    growth: 8.7
  }
];

const mockEngagementData = {
  totalLikes: 2500000,
  totalComments: 450000,
  totalShares: 125000,
  totalViews: 12500000,
  avgEngagementRate: 6.8,
  topHashtags: ['#nature', '#food', '#fitness', '#travel', '#music']
};

interface AdminReportsAnalyticsProps {
  section: 'top-content' | 'top-users' | 'engagement-overview';
}

export const AdminReportsAnalytics = ({ section }: AdminReportsAnalyticsProps) => {
  const renderTopContent = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Top Content</span>
          <Select defaultValue="week">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead>Shares</TableHead>
              <TableHead>Views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTopContent.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{item.user[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{item.user}</p>
                      <p className="text-sm text-muted-foreground">@{item.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{item.content}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>{item.likes.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span>{item.comments.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Share className="w-4 h-4 text-green-500" />
                    <span>{item.shares.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span>{item.views.toLocaleString()}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderTopUsers = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Top Users</span>
          <Select defaultValue="followers">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="followers">By Followers</SelectItem>
              <SelectItem value="engagement">By Engagement</SelectItem>
              <SelectItem value="growth">By Growth</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
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
              <TableHead>Growth Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTopUsers.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{user.followers.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>{user.posts}</TableCell>
                <TableCell>
                  <Badge variant="default">{user.engagement}%</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">+{user.growth}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderEngagementOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEngagementData.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEngagementData.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEngagementData.totalShares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEngagementData.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center py-8">
              {mockEngagementData.avgEngagementRate}%
            </div>
            <p className="text-center text-muted-foreground">Across all content types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Hashtags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockEngagementData.topHashtags.map((hashtag, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {hashtag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  switch (section) {
    case 'top-content':
      return renderTopContent();
    case 'top-users':
      return renderTopUsers();
    case 'engagement-overview':
      return renderEngagementOverview();
    default:
      return renderEngagementOverview();
  }
};
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2,
  Shield,
  Video,
  Heart,
  Bell,
  Settings,
  Globe,
  Megaphone,
  Flag,
  Eye,
  EyeOff,
  Play,
  Pause,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Activity,
  Lock,
  Unlock,
  Zap,
  Target,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown,
  Users as UsersIcon,
  Crown,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminPanelProps {
  onClose: () => void;
}

// Mock data for admin panel
const mockUsers = [
  { id: '1', name: 'Emma Wilson', email: 'emma@example.com', status: 'active', role: 'user', joinDate: '2024-01-15', lastActive: '2 hours ago' },
  { id: '2', name: 'Alex Chen', email: 'alex@example.com', status: 'active', role: 'creator', joinDate: '2024-01-10', lastActive: '1 day ago' },
  { id: '3', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'suspended', role: 'user', joinDate: '2023-12-20', lastActive: '1 week ago' },
  { id: '4', name: 'Mike Rodriguez', email: 'mike@example.com', status: 'active', role: 'creator', joinDate: '2023-12-15', lastActive: '3 hours ago' },
  { id: '5', name: 'Jessica Kim', email: 'jessica@example.com', status: 'active', role: 'user', joinDate: '2024-01-05', lastActive: '5 hours ago' }
];

const mockPosts = [
  { id: '1', author: 'Emma Wilson', content: 'Amazing sunset today!', platform: 'instagram', status: 'published', createdAt: '2024-01-19', reports: 0 },
  { id: '2', author: 'Alex Chen', content: 'New fitness routine!', platform: 'twitter', status: 'published', createdAt: '2024-01-18', reports: 1 },
  { id: '3', author: 'Sarah Johnson', content: 'Art creation process', platform: 'facebook', status: 'pending', createdAt: '2024-01-17', reports: 0 },
  { id: '4', author: 'Mike Rodriguez', content: 'Tech review', platform: 'youtube', status: 'published', createdAt: '2024-01-16', reports: 2 }
];

const mockStreams = [
  { id: '1', streamer: 'Emma Wilson', title: 'Gaming Stream', category: 'Gaming', status: 'live', viewers: 1250, duration: '2h 15m' },
  { id: '2', streamer: 'Alex Chen', title: 'Fitness Workout', category: 'Fitness', status: 'scheduled', viewers: 0, duration: '0m' },
  { id: '3', streamer: 'Mike Rodriguez', title: 'Tech Talk', category: 'Technology', status: 'ended', viewers: 890, duration: '1h 45m' }
];

const mockReports = [
  { id: '1', reporter: 'User123', reportedUser: 'Sarah Johnson', reason: 'Inappropriate content', status: 'pending', createdAt: '2024-01-19' },
  { id: '2', reporter: 'User456', reportedUser: 'Mike Rodriguez', reason: 'Spam', status: 'investigating', createdAt: '2024-01-18' },
  { id: '3', reporter: 'User789', reportedUser: 'Alex Chen', reason: 'Harassment', status: 'resolved', createdAt: '2024-01-17' }
];

const mockAnalytics = {
  totalUsers: 15678,
  activeUsers: 8923,
  totalPosts: 45678,
  totalStreams: 1234,
  engagementRate: 8.2,
  growthRate: 12.5,
  topCategories: ['Gaming', 'Fitness', 'Technology', 'Art', 'Music'],
  userGrowth: [1200, 1350, 1420, 1580, 1670, 1780, 1890, 2010, 2150, 2280, 2410, 2560]
};

const AdminPanelEnhanced = ({ onClose }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newPost, setNewPost] = useState({ content: '', platform: '', image: '' });
  const [newPSA, setNewPSA] = useState({ title: '', content: '', priority: 'normal' });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPSAModal, setShowPSAModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleCreatePost = () => {
    if (!newPost.content || !newPost.platform) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Post Created",
      description: "New post has been created successfully",
    });
    setNewPost({ content: '', platform: '', image: '' });
  };

  const handleCreatePSA = () => {
    if (!newPSA.title || !newPSA.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "PSA Created",
      description: "New PSA has been created and sent to all users",
    });
    setNewPSA({ title: '', content: '', priority: 'normal' });
    setShowPSAModal(false);
  };

  const handleUserAction = (userId: string, action: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case 'suspend':
        toast({
          title: "User Suspended",
          description: `${user.name} has been suspended`,
        });
        break;
      case 'activate':
        toast({
          title: "User Activated",
          description: `${user.name} has been activated`,
        });
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
          toast({
            title: "User Deleted",
            description: `${user.name} has been deleted`,
          });
        }
        break;
    }
  };

  const handleStreamAction = (streamId: string, action: string) => {
    const stream = mockStreams.find(s => s.id === streamId);
    if (!stream) return;

    switch (action) {
      case 'pause':
        toast({
          title: "Stream Paused",
          description: `${stream.title} has been paused`,
        });
        break;
      case 'resume':
        toast({
          title: "Stream Resumed",
          description: `${stream.title} has been resumed`,
        });
        break;
      case 'terminate':
        if (confirm(`Are you sure you want to terminate ${stream.title}?`)) {
          toast({
            title: "Stream Terminated",
            description: `${stream.title} has been terminated`,
          });
        }
        break;
    }
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-offwhite rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-dark">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.svg" 
              alt="Treesh" 
              className="w-8 h-8 object-contain"
            />
            <h2 className="text-2xl font-bold text-white font-treesh">Admin Panel</h2>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
            ×
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="streams">Streams</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="psa">PSA</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{mockAnalytics.totalUsers.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-500">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">{mockAnalytics.activeUsers.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-full bg-green-500">
                        <UserCheck className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Posts</p>
                        <p className="text-2xl font-bold text-gray-900">{mockAnalytics.totalPosts.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-500">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Engagement Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{mockAnalytics.engagementRate}%</p>
                      </div>
                      <div className="p-3 rounded-full bg-orange-500">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockPosts.slice(0, 5).map((post) => (
                        <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{post.author}</p>
                            <p className="text-sm text-gray-600 truncate">{post.content}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                              {post.status}
                            </Badge>
                            <span className="text-xs text-gray-500">{post.platform}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Live Streams</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockStreams.filter(s => s.status === 'live').map((stream) => (
                        <div key={stream.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{stream.title}</p>
                            <p className="text-sm text-gray-600">{stream.streamer} • {stream.category}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="destructive">LIVE</Badge>
                            <span className="text-sm text-gray-600">{stream.viewers} viewers</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>User Management</span>
                    <Button onClick={() => setShowUserModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4 mb-4">
                    <div className="flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                                {user.status}
                              </Badge>
                              <Badge variant="outline">{user.role}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                          >
                            {user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Content Moderation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{post.author}</p>
                          <p className="text-sm text-gray-600">{post.content}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                              {post.status}
                            </Badge>
                            <span className="text-xs text-gray-500">{post.platform}</span>
                            {post.reports > 0 && (
                              <Badge variant="destructive">{post.reports} reports</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                          <Button variant="outline" size="sm">
                            <Ban className="h-4 w-4 mr-2" />
                            Flag
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Streams Tab */}
            <TabsContent value="streams" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="h-5 w-5" />
                    <span>Livestream Controls</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockStreams.map((stream) => (
                      <div key={stream.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{stream.title}</p>
                          <p className="text-sm text-gray-600">{stream.streamer} • {stream.category}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={stream.status === 'live' ? 'destructive' : stream.status === 'scheduled' ? 'default' : 'secondary'}>
                              {stream.status}
                            </Badge>
                            {stream.status === 'live' && (
                              <span className="text-sm text-gray-600">{stream.viewers} viewers</span>
                            )}
                            <span className="text-sm text-gray-600">{stream.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {stream.status === 'live' ? (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleStreamAction(stream.id, 'pause')}>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleStreamAction(stream.id, 'terminate')}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Terminate
                              </Button>
                            </>
                          ) : stream.status === 'scheduled' ? (
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Flag className="h-5 w-5" />
                    <span>User Reports</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">Reported: {report.reportedUser}</p>
                          <p className="text-sm text-gray-600">By: {report.reporter}</p>
                          <p className="text-sm text-gray-600">Reason: {report.reason}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={report.status === 'pending' ? 'secondary' : report.status === 'investigating' ? 'default' : 'outline'}>
                              {report.status}
                            </Badge>
                            <span className="text-xs text-gray-500">{report.createdAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Investigate
                          </Button>
                          <Button variant="outline" size="sm">
                            <Ban className="h-4 w-4 mr-2" />
                            Take Action
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* PSA Tab */}
            <TabsContent value="psa" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Megaphone className="h-5 w-5" />
                    <span>PSA Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setShowPSAModal(true)} className="mb-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New PSA
                  </Button>
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">System Maintenance</h4>
                        <Badge variant="default">High Priority</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Scheduled maintenance on January 25th, 2024 from 2:00 AM to 4:00 AM EST.</p>
                      <p className="text-xs text-gray-500 mt-2">Sent to all users • 2 hours ago</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">New Features Available</h4>
                        <Badge variant="secondary">Normal Priority</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Check out our new subscription tiers and enhanced chat features!</p>
                      <p className="text-xs text-gray-500 mt-2">Sent to all users • 1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>User Growth</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">+{mockAnalytics.growthRate}%</p>
                      <p className="text-sm text-gray-600">This month</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Top Categories</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockAnalytics.topCategories.map((category, index) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm">{category}</span>
                          <Badge variant="outline">{Math.floor(Math.random() * 1000) + 100}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart className="h-5 w-5" />
                      <span>Engagement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{mockAnalytics.engagementRate}%</p>
                      <p className="text-sm text-gray-600">Average engagement rate</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Download Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                      <Download className="h-6 w-6 mb-2" />
                      <span className="text-sm">User Report</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                      <Download className="h-6 w-6 mb-2" />
                      <span className="text-sm">Content Report</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                      <Download className="h-6 w-6 mb-2" />
                      <span className="text-sm">Stream Report</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
                      <Download className="h-6 w-6 mb-2" />
                      <span className="text-sm">Analytics Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Admin Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4">Security Settings</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Two-Factor Authentication</span>
                          <Button variant="outline" size="sm">
                            <Lock className="h-4 w-4 mr-2" />
                            Enable
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Session Timeout</span>
                          <Select defaultValue="30">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 min</SelectItem>
                              <SelectItem value="30">30 min</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-4">Notification Settings</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Email Notifications</span>
                          <Button variant="outline" size="sm">
                            <Bell className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Push Notifications</span>
                          <Button variant="outline" size="sm">
                            <Bell className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Full Name" />
            <Input placeholder="Email" type="email" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="creator">Creator</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowUserModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">Add User</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PSA Modal */}
      <Dialog open={showPSAModal} onOpenChange={setShowPSAModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New PSA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="PSA Title"
              value={newPSA.title}
              onChange={(e) => setNewPSA({...newPSA, title: e.target.value})}
            />
            <Textarea
              placeholder="PSA Content"
              value={newPSA.content}
              onChange={(e) => setNewPSA({...newPSA, content: e.target.value})}
              className="min-h-[100px]"
            />
            <Select value={newPSA.priority} onValueChange={(value) => setNewPSA({...newPSA, priority: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="normal">Normal Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowPSAModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreatePSA} className="flex-1">Create PSA</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanelEnhanced;

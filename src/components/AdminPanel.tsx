import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, MessageSquare, TrendingUp, Plus, Edit, Trash2, Shield, Eye } from 'lucide-react';
import { useState } from 'react';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [newPost, setNewPost] = useState({ content: '', platform: '', image: '' });
  const [users, setUsers] = useState([
    { id: 1, name: 'Emma Wilson', email: 'emma@example.com', status: 'active', role: 'user' },
    { id: 2, name: 'Alex Chen', email: 'alex@example.com', status: 'active', role: 'creator' },
    { id: 3, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'suspended', role: 'user' },
    { id: 4, name: 'Mike Rodriguez', email: 'mike@example.com', status: 'active', role: 'creator' }
  ]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState('all');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('7d');
  
  const stats = [
    { label: 'Total Posts', value: '1,234', icon: MessageSquare, color: 'bg-primary' },
    { label: 'Active Users', value: '5,678', icon: Users, color: 'bg-accent' },
    { label: 'Engagement Rate', value: '8.2%', icon: TrendingUp, color: 'bg-primary-dark' },
    { label: 'Analytics', value: '92%', icon: BarChart3, color: 'bg-primary' },
  ];

  const recentPosts = [
    { id: 1, author: 'John Doe', content: 'Amazing sunset today!', platform: 'instagram', status: 'published' },
    { id: 2, author: 'Jane Smith', content: 'New product launch coming soon...', platform: 'twitter', status: 'scheduled' },
    { id: 3, author: 'Mike Johnson', content: 'Thanks for all the support!', platform: 'facebook', status: 'draft' },
  ];

  const handleCreatePost = () => {
    if (!newPost.content || !newPost.platform) {
      alert('Please fill in all required fields');
      return;
    }
    console.log('Creating post:', newPost);
    setNewPost({ content: '', platform: '', image: '' });
    alert('Post created successfully!');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesFilter = userFilterStatus === 'all' || user.status === userFilterStatus;
    return matchesSearch && matchesFilter && user.status !== 'deleted';
  });

  const handleUserAction = (userId: number, action: string) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'suspend':
            return { ...user, status: 'suspended' };
          case 'activate':
            return { ...user, status: 'active' };
          case 'delete':
            return { ...user, status: 'deleted' };
          default:
            return user;
        }
      }
      return user;
    }));
    
    const actionText = action === 'suspend' ? 'suspended' : action === 'activate' ? 'activated' : 'deleted';
    alert(`User ${actionText} successfully!`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-dark">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.svg" 
              alt="Treesh" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="w-8 h-8 rounded-full flex items-center justify-center hidden overflow-hidden">
              <img src="/logo.svg" alt="Treesh Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-white font-treesh">Admin Panel</h2>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
            ×
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="dashboard" className="font-opensans">Dashboard</TabsTrigger>
              <TabsTrigger value="posts" className="font-opensans">Posts</TabsTrigger>
              <TabsTrigger value="users" className="font-opensans">Users</TabsTrigger>
              <TabsTrigger value="analytics" className="font-opensans">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 font-opensans">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 font-opensans">{stat.value}</p>
                          </div>
                          <div className={`p-3 rounded-full ${stat.color}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="font-treesh">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 font-opensans">{post.author}</p>
                          <p className="text-sm text-gray-600 truncate font-opensans">{post.content}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                          <span className="text-xs text-gray-500 font-opensans">{post.platform}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="posts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Create New Post</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    className="min-h-[100px]"
                  />
                  <div className="flex space-x-4">
                    <Select value={newPost.platform} onValueChange={(value) => setNewPost({...newPost, platform: value})}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Image URL (optional)"
                      value={newPost.image}
                      onChange={(e) => setNewPost({...newPost, image: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                  <Button onClick={handleCreatePost} className="w-full">
                    Create Post
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{post.author}</p>
                          <p className="text-sm text-gray-600 truncate">{post.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{post.platform}</p>
                        </div>
                                                  <div className="flex items-center space-x-2">
                            <Badge variant={post.status === 'published' ? 'default' : post.status === 'scheduled' ? 'secondary' : 'outline'}>
                              {post.status}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => alert(`Editing post: ${post.content.substring(0, 30)}...`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => alert(`Viewing post: ${post.content.substring(0, 30)}...`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this post?')) {
                                  alert('Post deleted successfully!');
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-4 mb-4">
                      <Input 
                        placeholder="Search users..." 
                        className="flex-1"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                      />
                      <Select value={userFilterStatus} onValueChange={setUserFilterStatus}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">{user.name.charAt(0)}</span>
                            </div>
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
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'delete')}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Analytics Overview</h3>
                <Select value={analyticsPeriod} onValueChange={setAnalyticsPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Posts</p>
                        <p className="text-2xl font-bold text-gray-900">1,234</p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-500">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">5,678</p>
                      </div>
                      <div className="p-3 rounded-full bg-green-500">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Engagement Rate</p>
                        <p className="text-2xl font-bold text-gray-900">8.2%</p>
                      </div>
                      <div className="p-3 rounded-full bg-orange-500">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Growth Rate</p>
                        <p className="text-2xl font-bold text-gray-900">+12.5%</p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-500">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { category: 'Gaming', posts: 456, engagement: '9.2%' },
                      { category: 'Fitness', posts: 234, engagement: '8.7%' },
                      { category: 'Technology', posts: 189, engagement: '7.9%' },
                      { category: 'Art', posts: 156, engagement: '8.1%' },
                      { category: 'Music', posts: 123, engagement: '7.5%' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{item.category}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">{item.posts} posts</span>
                          <span className="text-sm text-gray-600">{item.engagement} engagement</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Ban, UserCheck, Search, Filter, Edit, Shield } from 'lucide-react';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  status: 'active' | 'blocked' | 'suspended';
  posts: number;
  followers: number;
  joinedAt: string;
  lastActive: string;
  avatar: string;
  role: string;
  joinedDate: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    username: 'alice',
    email: 'alice@example.com',
    status: 'active',
    posts: 45,
    followers: 1234,
    joinedAt: '2023-01-15',
    lastActive: '2024-01-20',
    avatar: '/placeholder.svg',
    role: 'Admin',
    joinedDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Bob Smith',
    username: 'bob',
    email: 'bob@example.com',
    status: 'blocked',
    posts: 23,
    followers: 567,
    joinedAt: '2023-03-22',
    lastActive: '2024-01-18',
    avatar: '/placeholder.svg',
    role: 'User',
    joinedDate: '2023-03-22'
  },
  {
    id: '3',
    name: 'Carol Davis',
    username: 'carol',
    email: 'carol@example.com',
    status: 'suspended',
    posts: 78,
    followers: 2341,
    joinedAt: '2022-11-08',
    lastActive: '2024-01-19',
    avatar: '/placeholder.svg',
    role: 'User',
    joinedDate: '2022-11-08'
  }
];

const mockActivityLogs = [
  {
    id: '1',
    user: 'Alice Johnson',
    action: 'Posted new content',
    timestamp: '2024-01-20 14:30',
    details: 'Uploaded a new photo'
  },
  {
    id: '2',
    user: 'Bob Smith',
    action: 'Account blocked',
    timestamp: '2024-01-20 10:15',
    details: 'Violated community guidelines'
  }
];

interface AdminUserManagementProps {
  section: 'all-users' | 'blocked-users' | 'activity-logs';
}

export const AdminUserManagement = ({ section }: AdminUserManagementProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'blocked': return 'destructive';
      case 'suspended': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-treesh">User Management</h2>
        <p className="text-gray-600 mt-2">Manage user accounts, permissions, and access</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">User</TableHead>
                  <TableHead className="min-w-[150px]">Status</TableHead>
                  <TableHead className="min-w-[120px]">Role</TableHead>
                  <TableHead className="min-w-[120px]">Joined</TableHead>
                  <TableHead className="min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{user.joinedDate}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary hover:text-primary-dark hover:bg-primary/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-accent hover:text-accent-dark hover:bg-accent/10">
                          <Shield className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
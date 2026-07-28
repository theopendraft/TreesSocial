import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const mockAdminUsers = [
  {
    id: '1',
    name: 'John Admin',
    email: 'john@admin.com',
    role: 'full',
    avatar: '/placeholder.svg',
    lastActive: '2024-01-15 14:30',
    status: 'active'
  },
  {
    id: '2',
    name: 'Jane Moderator',
    email: 'jane@admin.com',
    role: 'moderator',
    avatar: '/placeholder.svg',
    lastActive: '2024-01-15 12:15',
    status: 'active'
  }
];

const mockActivityLogs = [
  {
    id: '1',
    admin: 'John Admin',
    action: 'User suspended',
    target: 'user_123',
    timestamp: '2024-01-15 14:30',
    details: 'Suspended user for inappropriate content'
  },
  {
    id: '2',
    admin: 'Jane Moderator',
    action: 'Post removed',
    target: 'post_456',
    timestamp: '2024-01-15 13:15',
    details: 'Removed post violating community guidelines'
  }
];

export const AdminSettings = () => {
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'view-only' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Admin added successfully', description: `${newAdmin.name} has been added as ${newAdmin.role}` });
    setShowAddAdminDialog(false);
    setNewAdmin({ name: '', email: '', role: 'view-only' });
  };

  const handleDeleteAdmin = (adminId: string, adminName: string) => {
    toast({ title: 'Admin removed', description: `${adminName} has been removed from admin access` });
  };

  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    
    if (passwordData.new !== passwordData.confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Password changed successfully' });
    setShowPasswordDialog(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'full':
        return <Badge className="bg-red-100 text-red-800">Full Access</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-100 text-blue-800">Moderator</Badge>;
      case 'view-only':
        return <Badge className="bg-gray-100 text-gray-800">View Only</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Settings</h2>
      </div>

      <Tabs defaultValue="admins" className="w-full">
        <TabsList>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Admin Users</CardTitle>
                <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Admin</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={newAdmin.name}
                          onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                          placeholder="Enter admin name"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view-only">View Only</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="full">Full Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleAddAdmin} className="flex-1">Add Admin</Button>
                        <Button variant="outline" onClick={() => setShowAddAdminDialog(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAdminUsers.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={admin.avatar} />
                            <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{admin.name}</p>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(admin.role)}</TableCell>
                      <TableCell className="text-sm">{admin.lastActive}</TableCell>
                      <TableCell>
                        <Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>
                          {admin.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                          >
                            <Trash2 className="w-3 h-3" />
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
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Change Password</h3>
                  <p className="text-sm text-muted-foreground">Update your admin password</p>
                </div>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Current Password</Label>
                        <Input
                          type="password"
                          value={passwordData.current}
                          onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>New Password</Label>
                        <Input
                          type="password"
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Confirm New Password</Label>
                        <Input
                          type="password"
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleChangePassword} className="flex-1">Update Password</Button>
                        <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive security alerts via email</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Admin Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockActivityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.admin}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.target}</TableCell>
                      <TableCell className="text-sm">{log.timestamp}</TableCell>
                      <TableCell className="text-sm">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
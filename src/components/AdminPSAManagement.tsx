import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Eye, Edit, Trash2, Plus, Megaphone, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PSA {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'warning' | 'info' | 'urgent';
  status: 'draft' | 'scheduled' | 'active' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledFor?: Date;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
  views: number;
  impressions: number;
  clicks: number;
  targetAudience: 'all' | 'verified' | 'premium' | 'specific';
  tags: string[];
}

const mockPSAs: PSA[] = [
  {
    id: '1',
    title: 'New Community Guidelines',
    content: '🚨 IMPORTANT: New community guidelines are now in effect. Please review and ensure compliance.',
    type: 'warning',
    status: 'active',
    priority: 'high',
    createdAt: new Date('2024-01-15'),
    createdBy: 'Admin User',
    views: 15420,
    impressions: 25000,
    clicks: 3200,
    targetAudience: 'all',
    tags: ['guidelines', 'community', 'rules']
  },
  {
    id: '2',
    title: 'Platform Maintenance Notice',
    content: '🔧 Scheduled maintenance on January 20th from 2-4 AM EST. Service may be temporarily unavailable.',
    type: 'info',
    status: 'scheduled',
    priority: 'medium',
    scheduledFor: new Date('2024-01-20T02:00:00'),
    expiresAt: new Date('2024-01-20T04:00:00'),
    createdAt: new Date('2024-01-14'),
    createdBy: 'System Admin',
    views: 0,
    impressions: 0,
    clicks: 0,
    targetAudience: 'all',
    tags: ['maintenance', 'scheduled', 'system']
  },
  {
    id: '3',
    title: 'Premium Features Launch',
    content: '🎉 New premium features are now available! Upgrade your account to unlock exclusive content.',
    type: 'announcement',
    status: 'active',
    priority: 'medium',
    createdAt: new Date('2024-01-10'),
    createdBy: 'Product Team',
    views: 8900,
    impressions: 15000,
    clicks: 2100,
    targetAudience: 'premium',
    tags: ['premium', 'features', 'launch']
  }
];

export const AdminPSAManagement = () => {
  const [psas, setPSAs] = useState<PSA[]>(mockPSAs);
  const [selectedPSA, setSelectedPSA] = useState<PSA | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const [newPSA, setNewPSA] = useState({
    title: '',
    content: '',
    type: 'announcement' as PSA['type'],
    priority: 'medium' as PSA['priority'],
    targetAudience: 'all' as PSA['targetAudience'],
    scheduledFor: '',
    expiresAt: '',
    tags: ''
  });

  const handleCreatePSA = () => {
    if (!newPSA.title || !newPSA.content) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const psa: PSA = {
      id: Date.now().toString(),
      title: newPSA.title,
      content: newPSA.content,
      type: newPSA.type,
      status: newPSA.scheduledFor ? 'scheduled' : 'draft',
      priority: newPSA.priority,
      scheduledFor: newPSA.scheduledFor ? new Date(newPSA.scheduledFor) : undefined,
      expiresAt: newPSA.expiresAt ? new Date(newPSA.expiresAt) : undefined,
      createdAt: new Date(),
      createdBy: 'Current Admin',
      views: 0,
      impressions: 0,
      clicks: 0,
      targetAudience: newPSA.targetAudience,
      tags: newPSA.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    setPSAs([psa, ...psas]);
    setIsCreateModalOpen(false);
    setNewPSA({
      title: '',
      content: '',
      type: 'announcement',
      priority: 'medium',
      targetAudience: 'all',
      scheduledFor: '',
      expiresAt: '',
      tags: ''
    });

    toast({
      title: 'Success',
      description: 'PSA created successfully'
    });
  };

  const handleEditPSA = () => {
    if (!selectedPSA) return;

    const updatedPSAs = psas.map(psa =>
      psa.id === selectedPSA.id
        ? { ...psa, ...newPSA }
        : psa
    );

    setPSAs(updatedPSAs);
    setIsEditModalOpen(false);
    setSelectedPSA(null);

    toast({
      title: 'Success',
      description: 'PSA updated successfully'
    });
  };

  const handleDeletePSA = (psaId: string) => {
    setPSAs(psas.filter(psa => psa.id !== psaId));
    toast({
      title: 'Success',
      description: 'PSA deleted successfully'
    });
  };

  const handleStatusChange = (psaId: string, newStatus: PSA['status']) => {
    setPSAs(psas.map(psa =>
      psa.id === psaId ? { ...psa, status: newStatus } : psa
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'warning': return <Megaphone className="w-4 h-4 text-orange-500" />;
      case 'announcement': return <Megaphone className="w-4 h-4 text-blue-500" />;
      case 'info': return <Megaphone className="w-4 h-4 text-green-500" />;
      default: return <Megaphone className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredPSAs = psas.filter(psa => {
    switch (activeTab) {
      case 'active': return psa.status === 'active';
      case 'scheduled': return psa.status === 'scheduled';
      case 'draft': return psa.status === 'draft';
      case 'expired': return psa.status === 'expired';
      default: return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PSA Management</h1>
          <p className="text-muted-foreground">Manage public service announcements and platform notifications</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="w-4 h-4 mr-2" />
              Create PSA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New PSA</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newPSA.title}
                  onChange={(e) => setNewPSA({ ...newPSA, title: e.target.value })}
                  placeholder="Enter PSA title"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={newPSA.content}
                  onChange={(e) => setNewPSA({ ...newPSA, content: e.target.value })}
                  placeholder="Enter PSA content"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newPSA.type} onValueChange={(value: PSA['type']) => setNewPSA({ ...newPSA, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newPSA.priority} onValueChange={(value: PSA['priority']) => setNewPSA({ ...newPSA, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={newPSA.targetAudience} onValueChange={(value: PSA['targetAudience']) => setNewPSA({ ...newPSA, targetAudience: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified Users</SelectItem>
                    <SelectItem value="premium">Premium Users</SelectItem>
                    <SelectItem value="specific">Specific Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledFor">Schedule For (Optional)</Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={newPSA.scheduledFor}
                    onChange={(e) => setNewPSA({ ...newPSA, scheduledFor: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={newPSA.expiresAt}
                    onChange={(e) => setNewPSA({ ...newPSA, expiresAt: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newPSA.tags}
                  onChange={(e) => setNewPSA({ ...newPSA, tags: e.target.value })}
                  placeholder="guidelines, community, rules"
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleCreatePSA} className="flex-1">
                  Create PSA
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Megaphone className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total PSAs</p>
                <p className="text-2xl font-bold">{psas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {psas.reduce((sum, psa) => sum + psa.views, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active PSAs</p>
                <p className="text-2xl font-bold">
                  {psas.filter(psa => psa.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">
                  {psas.filter(psa => psa.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PSA List */}
      <Card>
        <CardHeader>
          <CardTitle>PSA List</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({psas.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({psas.filter(p => p.status === 'active').length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({psas.filter(p => p.status === 'scheduled').length})</TabsTrigger>
              <TabsTrigger value="draft">Draft ({psas.filter(p => p.status === 'draft').length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({psas.filter(p => p.status === 'expired').length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="space-y-4">
                {filteredPSAs.map((psa) => (
                  <Card key={psa.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getTypeIcon(psa.type)}
                            <h3 className="font-semibold">{psa.title}</h3>
                            <Badge className={getStatusColor(psa.status)}>
                              {psa.status}
                            </Badge>
                            <Badge className={getPriorityColor(psa.priority)}>
                              {psa.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{psa.content}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Created: {psa.createdAt.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>Target: {psa.targetAudience}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{psa.views.toLocaleString()} views</span>
                            </div>
                          </div>
                          
                          {psa.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {psa.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPSA(psa);
                              setNewPSA({
                                title: psa.title,
                                content: psa.content,
                                type: psa.type,
                                priority: psa.priority,
                                targetAudience: psa.targetAudience,
                                scheduledFor: psa.scheduledFor?.toISOString().slice(0, 16) || '',
                                expiresAt: psa.expiresAt?.toISOString().slice(0, 16) || '',
                                tags: psa.tags.join(', ')
                              });
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePSA(psa.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Status Actions */}
                      <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                        <span className="text-sm text-muted-foreground">Quick Actions:</span>
                        {psa.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(psa.id, 'active')}
                          >
                            Activate
                          </Button>
                        )}
                        {psa.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(psa.id, 'draft')}
                          >
                            Deactivate
                          </Button>
                        )}
                        {psa.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(psa.id, 'active')}
                          >
                            Activate Now
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit PSA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={newPSA.title}
                onChange={(e) => setNewPSA({ ...newPSA, title: e.target.value })}
                placeholder="Enter PSA title"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                value={newPSA.content}
                onChange={(e) => setNewPSA({ ...newPSA, content: e.target.value })}
                placeholder="Enter PSA content"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select value={newPSA.type} onValueChange={(value: PSA['type']) => setNewPSA({ ...newPSA, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Information</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={newPSA.priority} onValueChange={(value: PSA['priority']) => setNewPSA({ ...newPSA, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleEditPSA} className="flex-1">
                Update PSA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
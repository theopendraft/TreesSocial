import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Bell, Users, Eye, Trash2, CheckCircle } from 'lucide-react';

const mockNotificationLogs = [
  {
    id: '1',
    title: 'New Feature Update',
    content: 'We have added new video filters to enhance your content creation experience.',
    type: 'feature',
    sentTo: 'all',
    sentAt: '2024-01-20 15:30',
    status: 'delivered',
    recipients: 12500,
    openRate: 68.5
  },
  {
    id: '2',
    title: 'Maintenance Notice',
    content: 'Scheduled maintenance will occur tomorrow from 2-4 AM.',
    type: 'maintenance',
    sentTo: 'all',
    sentAt: '2024-01-19 10:15',
    status: 'delivered',
    recipients: 12500,
    openRate: 45.2
  },
  {
    id: '3',
    title: 'Community Guidelines Update',
    content: 'Please review our updated community guidelines.',
    type: 'policy',
    sentTo: 'active',
    sentAt: '2024-01-18 14:20',
    status: 'delivered',
    recipients: 8900,
    openRate: 72.3
  }
];

const notificationTypes = [
  { value: 'general', label: 'General', icon: Bell },
  { value: 'feature', label: 'Feature Update', icon: CheckCircle },
  { value: 'maintenance', label: 'Maintenance', icon: Users },
  { value: 'policy', label: 'Policy Update', icon: Eye }
];

interface AdminNotificationsProps {
  section: 'send-notification' | 'notification-logs';
}

export const AdminNotifications = ({ section }: AdminNotificationsProps) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'policy': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSendNotification = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Send New Notification</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notif-title">Notification Title</Label>
                <Input id="notif-title" placeholder="Enter notification title" />
              </div>
              <div>
                <Label htmlFor="notif-type">Notification Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notif-content">Notification Content</Label>
              <Textarea 
                id="notif-content" 
                placeholder="Enter notification content" 
                rows={4}
              />
            </div>

            <div>
              <Label>Target Audience</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="all-users" defaultChecked />
                  <Label htmlFor="all-users">All Users (12,500)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="active-users" />
                  <Label htmlFor="active-users">Active Users Only (8,900)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="premium-users" />
                  <Label htmlFor="premium-users">Premium Users (1,200)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="new-users" />
                  <Label htmlFor="new-users">New Users (Last 30 days) (450)</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="schedule-date">Schedule Date (Optional)</Label>
                <Input id="schedule-date" type="datetime-local" />
              </div>
              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button>
                <Send className="w-4 h-4 mr-2" />
                Send Now
              </Button>
              <Button variant="outline">
                Save as Draft
              </Button>
              <Button variant="outline">
                Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationLogs = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Notification History</span>
          <div className="flex items-center space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="policy">Policy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Open Rate</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockNotificationLogs.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell className="font-medium">{notification.title}</TableCell>
                <TableCell>
                  <Badge className={getTypeBadgeColor(notification.type)}>
                    {notification.type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{notification.content}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{notification.recipients.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>{notification.sentAt}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(notification.status)}>
                    {notification.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-green-600 font-medium">{notification.openRate}%</span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" title="View Details">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  switch (section) {
    case 'send-notification':
      return renderSendNotification();
    case 'notification-logs':
      return renderNotificationLogs();
    default:
      return renderSendNotification();
  }
};
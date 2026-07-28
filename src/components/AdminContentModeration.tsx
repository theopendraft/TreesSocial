import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Trash2, Eye, AlertTriangle, Search, Filter } from 'lucide-react';

interface ContentItem {
  id: string;
  user: string;
  username: string;
  content: string;
  type: 'post' | 'reel' | 'story';
  reports: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reportReasons: string[];
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    user: 'Alice Johnson',
    username: 'alice',
    content: 'Beautiful sunset today! #nature #photography',
    type: 'post',
    reports: 0,
    status: 'approved',
    createdAt: '2024-01-20 14:30',
    reportReasons: []
  },
  {
    id: '2',
    user: 'Bob Smith',
    username: 'bob',
    content: 'This is some controversial content that might violate guidelines...',
    type: 'post',
    reports: 5,
    status: 'pending',
    createdAt: '2024-01-20 12:15',
    reportReasons: ['Inappropriate content', 'Spam', 'Harassment']
  },
  {
    id: '3',
    user: 'Carol Davis',
    username: 'carol',
    content: 'Check out my latest dance video!',
    type: 'reel',
    reports: 1,
    status: 'pending',
    createdAt: '2024-01-20 10:45',
    reportReasons: ['Copyright violation']
  }
];

const mockReportedContent = [
  {
    id: '1',
    reportedBy: 'User123',
    content: 'Inappropriate post content',
    reason: 'Hate speech',
    timestamp: '2024-01-20 15:30',
    status: 'pending'
  },
  {
    id: '2',
    reportedBy: 'User456',
    content: 'Spam reel about fake products',
    reason: 'Spam',
    timestamp: '2024-01-20 14:20',
    status: 'resolved'
  }
];

interface AdminContentModerationProps {
  section: 'review-posts' | 'review-reels' | 'review-stories' | 'reported-content';
}

export const AdminContentModeration = ({ section }: AdminContentModerationProps) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getContentByType = (type: string) => {
    return mockContent.filter(item => item.type === type || type === 'all');
  };

  const renderContentTable = (content: ContentItem[]) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {section === 'review-posts' ? 'Review Posts' :
             section === 'review-reels' ? 'Review Reels' :
             section === 'review-stories' ? 'Review Stories' : 'Content Moderation'}
          </span>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search content..." className="pl-8 w-64" />
            </div>
            <Select>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reports</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
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
                <TableCell className="max-w-xs">
                  <p className="truncate">{item.content}</p>
                  {item.reportReasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.reportReasons.map((reason, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {item.reports > 0 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <Badge variant={item.reports > 0 ? 'destructive' : 'secondary'}>
                      {item.reports} reports
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.createdAt}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" title="View Content">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" title="Approve">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" title="Reject">
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

  const renderReportedContent = () => (
    <Card>
      <CardHeader>
        <CardTitle>Reported Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reported By</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReportedContent.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.reportedBy}</TableCell>
                <TableCell className="max-w-xs truncate">{report.content}</TableCell>
                <TableCell>
                  <Badge variant="outline">{report.reason}</Badge>
                </TableCell>
                <TableCell>{report.timestamp}</TableCell>
                <TableCell>
                  <Badge variant={report.status === 'resolved' ? 'default' : 'secondary'}>
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <CheckCircle className="w-4 h-4" />
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

  if (section === 'reported-content') {
    return renderReportedContent();
  }

  const contentType = section === 'review-posts' ? 'post' :
                     section === 'review-reels' ? 'reel' :
                     section === 'review-stories' ? 'story' : 'all';

  const filteredContent = getContentByType(contentType);

  return renderContentTable(filteredContent);
};
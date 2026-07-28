import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Eye, Users, Calendar, Plus, Edit, Trash2 } from 'lucide-react';

interface LiveStream {
  id: string;
  streamer: string;
  username: string;
  title: string;
  category: string;
  viewers: number;
  status: 'live' | 'scheduled' | 'ended';
  startTime: string;
  duration?: string;
}

const mockLiveStreams: LiveStream[] = [
  {
    id: '1',
    streamer: 'Alice Johnson',
    username: 'alice',
    title: 'Cooking with Alice - Italian Pasta',
    category: 'Cooking',
    viewers: 1234,
    status: 'live',
    startTime: '2024-01-20 14:30'
  },
  {
    id: '2',
    streamer: 'Bob Smith',
    username: 'bob',
    title: 'Gaming Session - Latest RPG',
    category: 'Gaming',
    viewers: 567,
    status: 'live',
    startTime: '2024-01-20 13:15'
  },
  {
    id: '3',
    streamer: 'Carol Davis',
    username: 'carol',
    title: 'Fitness Morning Routine',
    category: 'Fitness',
    viewers: 0,
    status: 'scheduled',
    startTime: '2024-01-21 08:00'
  }
];

const mockCategories = [
  { id: '1', name: 'Gaming', streamCount: 45, color: '#FF6B6B' },
  { id: '2', name: 'Cooking', streamCount: 23, color: '#4ECDC4' },
  { id: '3', name: 'Fitness', streamCount: 18, color: '#45B7D1' },
  { id: '4', name: 'Music', streamCount: 31, color: '#96CEB4' },
  { id: '5', name: 'Education', streamCount: 12, color: '#FFEAA7' }
];

interface AdminLivestreamControlsProps {
  section: 'live-streams' | 'scheduled-streams' | 'stream-categories';
}

export const AdminLivestreamControls = ({ section }: AdminLivestreamControlsProps) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'live': return 'default';
      case 'scheduled': return 'secondary';
      case 'ended': return 'outline';
      default: return 'outline';
    }
  };

  const renderLiveStreams = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Streams</span>
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-red-500">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              {mockLiveStreams.filter(s => s.status === 'live').length} Live
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Streamer</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Viewers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLiveStreams.filter(stream => stream.status === 'live').map((stream) => (
              <TableRow key={stream.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{stream.streamer[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{stream.streamer}</p>
                      <p className="text-sm text-muted-foreground">@{stream.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{stream.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{stream.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{stream.viewers.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(stream.status)}>
                    {stream.status === 'live' && <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />}
                    {stream.status}
                  </Badge>
                </TableCell>
                <TableCell>{stream.startTime}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" title="View Stream">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" title="End Stream">
                      <Square className="w-4 h-4" />
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

  const renderScheduledStreams = () => (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Streams</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Streamer</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Scheduled Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLiveStreams.filter(stream => stream.status === 'scheduled').map((stream) => (
              <TableRow key={stream.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{stream.streamer[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{stream.streamer}</p>
                      <p className="text-sm text-muted-foreground">@{stream.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{stream.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{stream.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{stream.startTime}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(stream.status)}>
                    {stream.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" title="Edit Schedule">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" title="Cancel">
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

  const renderStreamCategories = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Add New Category</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input id="category-name" placeholder="Enter category name" />
            </div>
            <div>
              <Label htmlFor="category-color">Category Color</Label>
              <Input id="category-color" type="color" defaultValue="#FF6B6B" />
            </div>
          </div>
          <Button className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stream Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCategories.map((category) => (
              <Card key={category.id} className="border-2" style={{ borderColor: category.color }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.streamCount} streams
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (section) {
    case 'live-streams':
      return renderLiveStreams();
    case 'scheduled-streams':
      return renderScheduledStreams();
    case 'stream-categories':
      return renderStreamCategories();
    default:
      return renderLiveStreams();
  }
};
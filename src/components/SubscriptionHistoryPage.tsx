import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Gem, Zap, Search, Filter, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Download, Eye } from 'lucide-react';

interface SubscriptionHistory {
  id: string;
  streamerName: string;
  streamerAvatar: string;
  planName: string;
  tier: 'gold' | 'diamond' | 'chrome' | 'custom';
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenew: boolean;
  features: string[];
  icon: React.ComponentType;
  color: string;
}

const mockSubscriptionHistory: SubscriptionHistory[] = [
  {
    id: '1',
    streamerName: 'Gaming Pro',
    streamerAvatar: '/placeholder.svg',
    planName: 'Diamond Tier',
    tier: 'diamond',
    price: 16.99,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'active',
    autoRenew: true,
    features: ['Premium emotes', 'Animated badge', 'Priority chat', 'Exclusive streams', 'Direct messaging'],
    icon: Gem,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    streamerName: 'Music Artist',
    streamerAvatar: '/placeholder.svg',
    planName: 'Gold Tier',
    tier: 'gold',
    price: 9.99,
    startDate: '2023-12-01',
    endDate: '2024-01-01',
    status: 'expired',
    autoRenew: false,
    features: ['Basic emotes', 'Standard badge', 'Exclusive content access', 'Priority chat'],
    icon: Crown,
    color: 'bg-yellow-400'
  },
  {
    id: '3',
    streamerName: 'Chef Master',
    streamerAvatar: '/placeholder.svg',
    planName: 'Chrome Tier',
    tier: 'chrome',
    price: 39.99,
    startDate: '2024-01-01',
    endDate: '2024-02-01',
    status: 'cancelled',
    autoRenew: false,
    features: ['All previous features', 'Custom emotes', 'VIP badge', 'Direct messaging', 'Early access', 'Chrome-exclusive content'],
    icon: Zap,
    color: 'bg-purple-500'
  },
  {
    id: '4',
    streamerName: 'Fitness Coach',
    streamerAvatar: '/placeholder.svg',
    planName: 'VIP Plus',
    tier: 'custom',
    price: 24.99,
    startDate: '2024-02-01',
    endDate: '2024-03-01',
    status: 'pending',
    autoRenew: true,
    features: ['Custom workout plans', '1-on-1 sessions', 'Exclusive content', 'Priority support'],
    icon: Crown,
    color: 'bg-red-500'
  }
];

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

const statusIcons = {
  active: CheckCircle,
  expired: Clock,
  cancelled: XCircle,
  pending: AlertCircle
};

export const SubscriptionHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const filteredHistory = mockSubscriptionHistory.filter(subscription => {
    const matchesSearch = subscription.streamerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.planName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: keyof typeof statusIcons) => {
    const Icon = statusIcons[status];
    return <Icon className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDownloadInvoice = (subscription: SubscriptionHistory) => {
    // Simulate invoice download
    console.log('Downloading invoice for:', subscription.id);
    // In a real app, this would trigger a file download
  };

  const handleViewDetails = (subscription: SubscriptionHistory) => {
    // Simulate viewing subscription details
    console.log('Viewing details for:', subscription.id);
    // In a real app, this would open a detailed view modal
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary font-treesh mb-4">
            Subscription History
          </h1>
          <p className="text-lg text-muted-foreground font-opensans max-w-2xl">
            View your subscription history, manage active subscriptions, and track your spending across all creators.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-opensans">Active</p>
                  <p className="text-2xl font-bold font-treesh">
                    {mockSubscriptionHistory.filter(s => s.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-opensans">Total Spent</p>
                  <p className="text-2xl font-bold font-treesh">
                    ${mockSubscriptionHistory.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-opensans">Creators</p>
                  <p className="text-2xl font-bold font-treesh">
                    {new Set(mockSubscriptionHistory.map(s => s.streamerName)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-opensans">Pending</p>
                  <p className="text-2xl font-bold font-treesh">
                    {mockSubscriptionHistory.filter(s => s.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search subscriptions</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by creator name or plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Label htmlFor="status-filter">Status:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription History Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({filteredHistory.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({filteredHistory.filter(s => s.status === 'active').length})</TabsTrigger>
            <TabsTrigger value="expired">Expired ({filteredHistory.filter(s => s.status === 'expired').length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({filteredHistory.filter(s => s.status === 'cancelled').length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredHistory.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground font-opensans">No subscriptions found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredHistory.map((subscription) => {
                const Icon = subscription.icon;
                const daysRemaining = getDaysRemaining(subscription.endDate);
                
                return (
                  <Card key={subscription.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Left side - Creator and Plan Info */}
                        <div className="flex items-start space-x-4">
                          <div className={`w-8 h-8 ${subscription.color} rounded-full flex items-center justify-center`}>
                            {Icon && typeof Icon === 'function' ? <Icon /> : null}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold font-treesh">{subscription.streamerName}</h3>
                              <Badge className={`${statusColors[subscription.status]} border`}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(subscription.status)}
                                  <span className="capitalize">{subscription.status}</span>
                                </div>
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground font-opensans">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Started: {formatDate(subscription.startDate)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Ends: {formatDate(subscription.endDate)}</span>
                              </span>
                            </div>
                            {subscription.status === 'active' && daysRemaining > 0 && (
                              <p className="text-sm text-blue-600 font-medium">
                                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right side - Plan Details and Actions */}
                        <div className="flex flex-col lg:items-end space-y-3">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary font-treesh">
                              ${subscription.price}<span className="text-sm text-gray-500">/month</span>
                            </p>
                            <p className="text-sm text-muted-foreground font-opensans">{subscription.planName}</p>
                            {subscription.autoRenew && (
                              <Badge variant="secondary" className="mt-1">
                                Auto-renewal
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(subscription)}
                              className="font-opensans"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInvoice(subscription)}
                              className="font-opensans"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Invoice
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 font-opensans">Included Features:</h4>
                        <div className="flex flex-wrap gap-2">
                          {subscription.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs font-opensans">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-treesh">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2 font-opensans">Total Subscriptions</h4>
                <p className="text-2xl font-bold text-primary font-treesh">{mockSubscriptionHistory.length}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2 font-opensans">Monthly Spending</h4>
                <p className="text-2xl font-bold text-primary font-treesh">
                  ${mockSubscriptionHistory.filter(s => s.status === 'active').reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2 font-opensans">Active Creators</h4>
                <p className="text-2xl font-bold text-primary font-treesh">
                  {new Set(mockSubscriptionHistory.filter(s => s.status === 'active').map(s => s.streamerName)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

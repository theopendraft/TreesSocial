import { AdminUserManagement } from './AdminUserManagement';
import { AdminContentModeration } from './AdminContentModeration';
import { AdminLivestreamControls } from './AdminLivestreamControls';
import { AdminPSAManagement } from './AdminPSAManagement';
import { AdminReportsAnalytics } from './AdminReportsAnalytics';
import { AdminNotifications } from './AdminNotifications';
import { AdminMatchmakingOversight } from './AdminMatchmakingOversight';
import { AdminSettings } from './AdminSettings';
import { AdminAnalyticsReports } from './AdminAnalyticsReports';
import { AdminStaticWebsiteManagement } from './AdminStaticWebsiteManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Video, Heart, TrendingUp, Bell, BarChart3, Megaphone, Image, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

interface AdminContentProps {
  activeSection: string;
}

const DashboardOverview = () => {
  const isMobile = useIsMobile();

  const metrics = [
    {
      title: 'Total Users',
      value: '45,231',
      change: '+20.1% from last month',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      title: 'Active Users',
      value: '12,543',
      change: '+8.2% from last month',
      icon: Users,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20'
    },
    {
      title: 'Total Posts',
      value: '89,432',
      change: '+12.5% from last month',
      icon: TrendingUp,
      color: 'text-primary-dark',
      bgColor: 'bg-primary-dark/10',
      borderColor: 'border-primary-dark/20'
    },
    {
      title: 'Live Streams',
      value: '156',
      change: '+3.1% from last month',
      icon: Video,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      title: 'Total Stories',
      value: '23,891',
      change: '+18.7% from last month',
      icon: Bell,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20'
    },
    {
      title: 'Total Reels',
      value: '45,672',
      change: '+25.3% from last month',
      icon: Video,
      color: 'text-primary-dark',
      bgColor: 'bg-primary-dark/10',
      borderColor: 'border-primary-dark/20'
    },
    {
      title: 'Active Matches',
      value: '1,234',
      change: '+15.3% from last month',
      icon: Heart,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      title: 'Reports Pending',
      value: '23',
      change: '-5.2% from last month',
      icon: Shield,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-treesh">Dashboard Overview</h2>
        <p className="text-gray-600 mt-2">Monitor your platform's performance and key metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="group hover:scale-105 transition-transform duration-200 cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:scale-105 group cursor-pointer transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Add User</h4>
                  <p className="text-sm text-gray-600">Create new user account</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 group cursor-pointer transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Moderate Content</h4>
                  <p className="text-sm text-gray-600">Review flagged content</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:scale-105 group cursor-pointer transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-dark/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <BarChart3 className="h-6 w-6 text-primary-dark" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">View Analytics</h4>
                  <p className="text-sm text-gray-600">Check platform stats</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { description: 'New user registration: john_doe', time: '2 minutes ago', type: 'User', icon: <Users className="h-5 w-5" /> },
                { description: 'Content flagged for review', time: '15 minutes ago', type: 'Content', icon: <Shield className="h-5 w-5" /> },
                { description: 'Live stream started: Gaming Session', time: '1 hour ago', type: 'Stream', icon: <Video className="h-5 w-5" /> },
                { description: 'New match created', time: '2 hours ago', type: 'Match', icon: <Heart className="h-5 w-5" /> }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const AdminContent = ({ activeSection }: AdminContentProps) => {
  switch (activeSection) {
    case 'dashboard':
      return <DashboardOverview />;
    case 'all-users':
    case 'blocked-users':
    case 'activity-logs':
      return <AdminUserManagement />;
    case 'review-posts':
    case 'review-reels':
    case 'review-stories':
    case 'reported-content':
      return <AdminContentModeration />;
    case 'match-logs':
    case 'flagged-conversations':
      return <AdminMatchmakingOversight />;
    case 'live-streams':
    case 'scheduled-streams':
    case 'stream-categories':
      return <AdminLivestreamControls />;
    case 'push-announcement':
    case 'past-psas':
      return <AdminPSAManagement />;
    case 'engagement-trends':
    case 'top-users':
    case 'top-creators':
    case 'login-stats':
      return <AdminAnalyticsReports />;
    case 'send-notification':
    case 'notification-logs':
      return <AdminNotifications />;
    case 'admin-users':
    case 'security':
    case 'activity-logs-admin':
      return <AdminSettings />;
    case 'homepage-content':
    case 'seo-settings':
    case 'banners-management':
      return <AdminStaticWebsiteManagement />;
    default:
      return <DashboardOverview />;
  }
};
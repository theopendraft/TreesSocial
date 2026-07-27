import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Gem, Zap, CheckCircle, Clock, AlertTriangle, Settings, Calendar, CreditCard, Users, Star, Lock, Unlock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ActiveSubscription {
  id: string;
  streamerName: string;
  streamerAvatar: string;
  planName: string;
  tier: 'gold' | 'diamond' | 'chrome' | 'custom';
  price: number;
  startDate: string;
  nextBilling: string;
  autoRenew: boolean;
  features: string[];
  icon: React.ComponentType;
  color: string;
  status: 'active' | 'pending_expiry' | 'cancelled';
}

const mockActiveSubscriptions: ActiveSubscription[] = [
  {
    id: '1',
    streamerName: 'Gaming Pro',
    streamerAvatar: '/placeholder.svg',
    planName: 'Diamond Tier',
    tier: 'diamond',
    price: 16.99,
    startDate: '2024-01-15',
    nextBilling: '2024-02-15',
    autoRenew: true,
    features: ['Premium emotes', 'Animated badge', 'Priority chat', 'Exclusive streams', 'Direct messaging'],
    icon: Gem,
    color: 'bg-blue-500',
    status: 'active'
  },
  {
    id: '2',
    streamerName: 'Fitness Coach',
    streamerAvatar: '/placeholder.svg',
    planName: 'Chrome Tier',
    tier: 'chrome',
    price: 39.99,
    startDate: '2024-02-01',
    nextBilling: '2024-03-01',
    autoRenew: true,
    features: ['All premium features', 'Custom workout plans', '1-on-1 sessions', 'Chrome-exclusive content', 'Priority support'],
    icon: Zap,
    color: 'bg-purple-500',
    status: 'active'
  }
];

const mockExclusiveContent = [
  {
    id: '1',
    title: 'Behind the Scenes - Gaming Setup',
    description: 'Exclusive look at my gaming rig and setup process',
    isLocked: false,
    streamer: 'Gaming Pro',
    tier: 'diamond'
  },
  {
    id: '2',
    title: 'Advanced Workout Routines',
    description: 'Premium workout plans only for Chrome subscribers',
    isLocked: true,
    streamer: 'Fitness Coach',
    tier: 'chrome'
  },
  {
    id: '3',
    title: 'Exclusive Music Covers',
    description: 'Unreleased covers and original compositions',
    isLocked: true,
    streamer: 'Music Artist',
    tier: 'gold'
  }
];

export const StreamerSubscriptionStatus = () => {
  const [autoRenewSettings, setAutoRenewSettings] = useState<Record<string, boolean>>({});
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  // Initialize auto-renew settings
  useEffect(() => {
    const settings: Record<string, boolean> = {};
    mockActiveSubscriptions.forEach(sub => {
      settings[sub.id] = sub.autoRenew;
    });
    setAutoRenewSettings(settings);
  }, []);

  const handleAutoRenewToggle = (subscriptionId: string, enabled: boolean) => {
    setAutoRenewSettings(prev => ({
      ...prev,
      [subscriptionId]: enabled
    }));
    
    toast({
      title: enabled ? "Auto-renewal enabled" : "Auto-renewal disabled",
      description: `Your subscription will ${enabled ? 'automatically renew' : 'not renew'} on the next billing date.`,
    });
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setIsCancelling(subscriptionId);
    try {
      // Simulate cancellation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Subscription cancelled",
        description: "Your subscription will remain active until the next billing date.",
      });
      setShowCancelDialog(null);
    } catch (error) {
      toast({
        title: "Cancellation failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(null);
    }
  };

  const getDaysUntilRenewal = (nextBilling: string) => {
    const next = new Date(nextBilling);
    const now = new Date();
    const diffTime = next.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getProgressValue = (nextBilling: string) => {
    const daysRemaining = getDaysUntilRenewal(nextBilling);
    return Math.max(0, (30 - daysRemaining) / 30 * 100);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'gold':
        return Crown;
      case 'diamond':
        return Gem;
      case 'chrome':
        return Zap;
      default:
        return Star;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary font-treesh mb-4">
            My Subscriptions
          </h1>
          <p className="text-lg text-muted-foreground font-opensans max-w-2xl">
            Manage your active subscriptions, view exclusive content, and control your subscription settings.
          </p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Subscriptions</TabsTrigger>
            <TabsTrigger value="exclusive">Exclusive Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Active Subscriptions Tab */}
          <TabsContent value="active" className="space-y-6">
            {mockActiveSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Active Subscriptions</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any active subscriptions at the moment.
                  </p>
                  <Button className="bg-primary hover:bg-primary-dark text-white">
                    Discover Creators
                  </Button>
                </CardContent>
              </Card>
            ) : (
              mockActiveSubscriptions.map((subscription) => {
                const Icon = subscription.icon;
                const TierIcon = getTierIcon(subscription.tier);
                const daysUntilRenewal = getDaysUntilRenewal(subscription.nextBilling);
                const progressValue = getProgressValue(subscription.nextBilling);
                
                return (
                  <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 ${subscription.color} rounded-full flex items-center justify-center`}>
                            {Icon && typeof Icon === 'function' ? <Icon /> : null}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-xl font-semibold font-treesh">{subscription.streamerName}</h3>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Active
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <TierIcon className="w-5 h-5 text-primary" />
                              <span className="text-lg font-medium font-opensans">{subscription.planName}</span>
                              <span className="text-2xl font-bold text-primary">
                                ${subscription.price}<span className="text-sm text-gray-500">/month</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCancelDialog(subscription.id)}
                            className="font-opensans"
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Billing Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium font-opensans">Time until renewal</span>
                          <span className="text-sm font-medium font-opensans">{daysUntilRenewal} days</span>
                        </div>
                        <Progress value={progressValue} className="h-2" />
                        <p className="text-xs text-muted-foreground font-opensans">
                          Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="font-medium mb-3 font-opensans">Included Features:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {subscription.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm font-opensans">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Auto-renewal Settings */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium font-opensans">Auto-renewal</p>
                          <p className="text-sm text-muted-foreground font-opensans">
                            Automatically renew your subscription each month
                          </p>
                        </div>
                        <Switch
                          checked={autoRenewSettings[subscription.id] || false}
                          onCheckedChange={(enabled) => handleAutoRenewToggle(subscription.id, enabled)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Exclusive Content Tab */}
          <TabsContent value="exclusive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Exclusive Content</span>
                </CardTitle>
                <CardDescription>
                  Access exclusive content from creators you're subscribed to.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockExclusiveContent.map((content) => (
                    <Card key={content.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base font-treesh">{content.title}</CardTitle>
                            <CardDescription className="text-sm font-opensans">
                              {content.description}
                            </CardDescription>
                          </div>
                          {content.isLocked ? (
                            <Lock className="w-5 h-5 text-red-500 flex-shrink-0" />
                          ) : (
                            <Unlock className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {content.streamer}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {content.tier}
                          </Badge>
                        </div>
                        <Button 
                          className="w-full mt-3" 
                          variant={content.isLocked ? "outline" : "default"}
                          disabled={content.isLocked}
                        >
                          {content.isLocked ? 'Locked' : 'View Content'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Subscription Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your subscription preferences and notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium font-opensans">Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium font-opensans">Renewal reminders</p>
                        <p className="text-sm text-muted-foreground font-opensans">
                          Get notified before your subscription renews
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium font-opensans">New exclusive content</p>
                        <p className="text-sm text-muted-foreground font-opensans">
                          Notify when creators add new exclusive content
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium font-opensans">Payment confirmations</p>
                        <p className="text-sm text-muted-foreground font-opensans">
                          Receive payment confirmation emails
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium font-opensans">Privacy</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium font-opensans">Show subscriber badge</p>
                        <p className="text-sm text-muted-foreground font-opensans">
                          Display your subscriber status to creators
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium font-opensans">Allow creator analytics</p>
                        <p className="text-sm text-muted-foreground font-opensans">
                          Help creators understand their audience
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Billing Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium font-opensans">Billing</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium font-opensans">Default payment method</p>
                        <p className="text-sm text-muted-foreground font-opensans">
                          Credit Card ending in ****1234
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <CreditCard className="w-4 h-4 mr-1" />
                        Change
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium font-opensans">Billing address</p>
                        <p className="text-sm text-muted-foreground font-opensans">
                          123 Main St, City, State 12345
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-1" />
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cancel Subscription Dialogs */}
        {mockActiveSubscriptions.map((subscription) => (
          <Dialog 
            key={subscription.id} 
            open={showCancelDialog === subscription.id} 
            onOpenChange={(open) => !open && setShowCancelDialog(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-treesh">Cancel Subscription</DialogTitle>
                <DialogDescription className="font-opensans">
                  Are you sure you want to cancel your {subscription.planName} subscription to {subscription.streamerName}? 
                  You'll continue to have access until {new Date(subscription.nextBilling).toLocaleDateString()}.
                </DialogDescription>
              </DialogHeader>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(null)}
                  className="flex-1 font-opensans"
                >
                  Keep Subscription
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleCancelSubscription(subscription.id)}
                  disabled={isCancelling === subscription.id}
                  className="flex-1 font-opensans"
                >
                  {isCancelling === subscription.id ? 'Cancelling...' : 'Cancel Subscription'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

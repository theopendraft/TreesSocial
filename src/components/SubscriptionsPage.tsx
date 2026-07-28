import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Crown,
  Star,
  Heart,
  Users,
  Calendar,
  CreditCard,
  Gift,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Shield,
  Lock,
  Unlock,
  Star as StarIcon,
  Heart as HeartIcon,
  Crown as CrownIcon,
  Gift as GiftIcon,
  CreditCard as PaymentIcon,
  Users as SubscribersIcon,
  TrendingUp,
  Bell,
  Clock,
  Check,
  X,
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data for subscription tiers
const subscriptionTiers = [
  {
    id: "gold",
    name: "Gold Tier",
    price: 9.99,
    color: "bg-yellow-500",
    icon: Star,
    features: [
      "Access to exclusive streams",
      "Gold subscriber badge",
      "Custom emotes (5)",
      "Priority chat access",
      "Exclusive content library",
      "Ad-free experience",
    ],
    popular: false,
    subscribers: 1247,
    revenue: 12450.53,
  },
  {
    id: "diamond",
    name: "Diamond Tier",
    price: 16.99,
    color: "bg-red-500",
    icon: Heart,
    features: [
      "All Gold features",
      "Diamond subscriber badge",
      "Custom emotes (10)",
      "VIP chat access",
      "Exclusive merchandise",
      "Direct messaging with streamer",
      "Early access to content",
      "Special event invitations",
    ],
    popular: true,
    subscribers: 856,
    revenue: 14542.44,
  },
  {
    id: "chrome",
    name: "Chrome Tier",
    price: 39.99,
    color: "bg-blue-500",
    icon: Crown,
    features: [
      "All Diamond features",
      "Chrome subscriber badge",
      "Custom emotes (20)",
      "Ultimate VIP status",
      "Personal shoutouts",
      "Exclusive meet & greet",
      "Custom channel rewards",
      "Priority support",
      "Behind-the-scenes content",
    ],
    popular: false,
    subscribers: 234,
    revenue: 9357.66,
  },
];

// Mock data for active subscriptions
const mockActiveSubscriptions = [
  {
    id: "1",
    streamer: {
      id: "1",
      name: "Emma Wilson",
      username: "emma_gaming",
      avatar: "/placeholder.svg",
      verified: true,
      followers: 125000,
      isLive: true,
      category: "Gaming",
    },
    tier: "diamond",
    price: 16.99,
    status: "active",
    startDate: "2024-01-15T00:00:00Z",
    nextBilling: "2024-02-15T00:00:00Z",
    autoRenew: true,
    benefits: [
      "Diamond subscriber badge",
      "Custom emotes (10)",
      "VIP chat access",
      "Exclusive merchandise",
    ],
  },
  {
    id: "2",
    streamer: {
      id: "2",
      name: "Alex Chen",
      username: "alex_fitness",
      avatar: "/placeholder.svg",
      verified: true,
      followers: 89000,
      isLive: false,
      category: "Fitness",
    },
    tier: "gold",
    price: 9.99,
    status: "active",
    startDate: "2024-01-10T00:00:00Z",
    nextBilling: "2024-02-10T00:00:00Z",
    autoRenew: true,
    benefits: [
      "Gold subscriber badge",
      "Custom emotes (5)",
      "Priority chat access",
      "Exclusive content library",
    ],
  },
];

// Mock data for subscription history
const mockSubscriptionHistory = [
  {
    id: "1",
    streamer: {
      name: "Sarah Johnson",
      username: "sarah_art",
      avatar: "/placeholder.svg",
    },
    tier: "chrome",
    price: 39.99,
    status: "expired",
    startDate: "2023-11-01T00:00:00Z",
    endDate: "2024-01-01T00:00:00Z",
    cancelledAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    streamer: {
      name: "Mike Rodriguez",
      username: "mike_tech",
      avatar: "/placeholder.svg",
    },
    tier: "diamond",
    price: 16.99,
    status: "cancelled",
    startDate: "2023-12-01T00:00:00Z",
    endDate: "2024-01-01T00:00:00Z",
    cancelledAt: "2024-01-01T00:00:00Z",
  },
];

// Mock data for streamer discovery
const mockStreamerDiscovery = [
  {
    id: "1",
    name: "Jessica Kim",
    username: "jessica_food",
    avatar: "/placeholder.svg",
    verified: true,
    followers: 156000,
    isLive: true,
    category: "Food & Cooking",
    description: "Professional chef sharing cooking tips and recipes",
    subscriptionTiers: ["gold", "diamond"],
    topTier: "diamond",
    subscriberCount: 2340,
    rating: 4.8,
  },
  {
    id: "2",
    name: "David Park",
    username: "david_music",
    avatar: "/placeholder.svg",
    verified: true,
    followers: 203000,
    isLive: false,
    category: "Music",
    description: "Pianist and music producer creating original compositions",
    subscriptionTiers: ["gold", "diamond", "chrome"],
    topTier: "chrome",
    subscriberCount: 1890,
    rating: 4.9,
  },
  {
    id: "3",
    name: "Lisa Wang",
    username: "lisa_travel",
    avatar: "/placeholder.svg",
    verified: false,
    followers: 67000,
    isLive: true,
    category: "Travel",
    description: "Adventure traveler exploring the world",
    subscriptionTiers: ["gold"],
    topTier: "gold",
    subscriberCount: 890,
    rating: 4.6,
  },
];

export const SubscriptionsPage = () => {
  const [activeTab, setActiveTab] = useState("discover");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedStreamer, setSelectedStreamer] = useState<any>(null);
  const [selectedTier, setSelectedTier] = useState("");
  const [giftQuantity, setGiftQuantity] = useState(1);
  const [giftRecipients, setGiftRecipients] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [autoRenew, setAutoRenew] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  // Use mock data
  const activeSubscriptions = mockActiveSubscriptions;
  const subscriptionHistory = mockSubscriptionHistory;
  const streamerDiscovery = mockStreamerDiscovery;

  const handleSubscribe = (streamer: any, tier: string) => {
    setSelectedStreamer(streamer);
    setSelectedTier(tier);
    setShowSubscriptionModal(true);
  };

  const handleGiftSubscription = (streamer: any) => {
    setSelectedStreamer(streamer);
    setShowGiftModal(true);
  };

  const handleManageSubscription = (subscription: any) => {
    setSelectedStreamer(subscription.streamer);
    setSelectedTier(subscription.tier);
    setShowManageModal(true);
  };

  const confirmSubscription = () => {
    if (!selectedStreamer || !selectedTier) return;

    const tier = subscriptionTiers.find((t) => t.id === selectedTier);
    if (!tier) return;

    toast({
      title: "Subscription Successful! 🎉",
      description: `You are now subscribed to ${selectedStreamer.name} at ${tier.name} tier!`,
    });

    setShowSubscriptionModal(false);
    setSelectedStreamer(null);
    setSelectedTier("");
  };

  const confirmGiftSubscription = () => {
    if (!selectedStreamer || giftQuantity < 1) return;

    const tier = subscriptionTiers.find((t) => t.id === selectedTier);
    if (!tier) return;

    toast({
      title: "Gift Subscriptions Sent! 🎁",
      description: `Successfully sent ${giftQuantity} ${tier.name} subscriptions to ${selectedStreamer.name}!`,
    });

    setShowGiftModal(false);
    setSelectedStreamer(null);
    setSelectedTier("");
    setGiftQuantity(1);
  };

  const cancelSubscription = (subscriptionId: string) => {
    if (
      confirm(
        "Are you sure you want to cancel this subscription? You will lose access to perks at the end of the current billing period."
      )
    ) {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will end at the next billing cycle.",
      });
    }
  };

  const toggleAutoRenew = (subscriptionId: string) => {
    toast({
      title: "Auto-renewal Updated",
      description: "Your auto-renewal preference has been updated.",
    });
  };

  const filteredStreamers = streamerDiscovery.filter(
    (streamer) =>
      streamer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      streamer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      streamer.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedStreamers = [...filteredStreamers].sort((a, b) => {
    switch (sortBy) {
      case "popularity":
        return b.followers - a.followers;
      case "subscribers":
        return b.subscriberCount - a.subscriberCount;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const renderDiscover = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Discover Amazing Streamers</h2>
        <p className="text-muted-foreground">
          Support your favorite creators and unlock exclusive content
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search streamers by name, username, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Sort by Popularity</SelectItem>
            <SelectItem value="subscribers">Sort by Subscribers</SelectItem>
            <SelectItem value="rating">Sort by Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscription Tiers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {subscriptionTiers.map((tier) => (
          <Card
            key={tier.id}
            className={`relative ${
              tier.popular ? "ring-2 ring-primary" : ""
            } h-full flex flex-col`}
          >
            {tier.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <div
                className={`w-16 h-16 rounded-full ${tier.color} flex items-center justify-center mx-auto mb-4`}
              >
                <tier.icon className="w-8 h-8 text-white" />
              </div>
              <CardTitle>{tier.name}</CardTitle>
              <div className="text-3xl font-bold">
                ${tier.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="text-center text-sm text-muted-foreground mb-4">
                <p>{tier.subscribers.toLocaleString()} active subscribers</p>
                <p>${tier.revenue.toLocaleString()} monthly revenue</p>
              </div>
              <Button className="w-full mt-auto bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.01] transition-all">
                <Zap className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Streamer Discovery Grid removed as requested */}

      {/* Gift Subscriptions Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5" />
            <span>Gift Subscriptions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Surprise your friends with a subscription to their favorite
            streamer! Gift subscriptions include all the same perks and
            benefits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptionTiers.map((tier) => (
              <div key={tier.id} className="text-center p-4 border rounded-lg">
                <tier.icon
                  className={`w-8 h-8 mx-auto mb-2 ${tier.color.replace(
                    "bg-",
                    "text-"
                  )}`}
                />
                <h4 className="font-semibold">{tier.name}</h4>
                <p className="text-2xl font-bold text-primary">${tier.price}</p>
                <p className="text-sm text-muted-foreground">per month</p>
                <Button className="mt-3 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.01] transition-all">
                  <Zap className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Subscription History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                No Subscription History
              </h3>
              <p>
                Your subscription history will appear here once you start
                subscribing to streamers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptionHistory.map((subscription) => (
                <div key={subscription.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={subscription.streamer.avatar} />
                        <AvatarFallback>
                          {subscription.streamer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">
                          {subscription.streamer.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          @{subscription.streamer.username}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {subscription.tier === "gold" && (
                          <Star className="w-5 h-5 text-yellow-500" />
                        )}
                        {subscription.tier === "diamond" && (
                          <Heart className="w-5 h-5 text-red-500" />
                        )}
                        {subscription.tier === "chrome" && (
                          <Crown className="w-5 h-5 text-blue-500" />
                        )}
                        <Badge variant="outline">
                          {subscription.tier.charAt(0).toUpperCase() +
                            subscription.tier.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold">
                        ${subscription.price}/month
                      </p>
                      <Badge
                        variant={
                          subscription.status === "expired"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {subscription.status.charAt(0).toUpperCase() +
                          subscription.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <p className="font-medium">
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ended:</span>
                      <p className="font-medium">
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">
                        {Math.ceil(
                          (new Date(subscription.endDate).getTime() -
                            new Date(subscription.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Billing section removed as requested

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900">Subscriptions</h1>
            <p className="text-sm text-gray-600">
              Manage your streaming subscriptions
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-gray-100"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-gray-100"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                <Crown className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Active Subscriptions</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">$45.97</div>
              <div className="text-sm text-gray-600">Monthly Spending</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Total Streamers</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
                <Gift className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <div className="text-sm text-gray-600">Gifts Sent</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs (Overview and Billing removed) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10 sm:h-12 mb-4 sm:mb-6">
            <TabsTrigger value="discover" className="text-xs sm:text-sm">
              Discover
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              History
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {renderDiscover()}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {renderHistory()}
          </TabsContent>
        </Tabs>

        {/* Subscription Modal */}
        <Dialog
          open={showSubscriptionModal}
          onOpenChange={setShowSubscriptionModal}
        >
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>Subscribe to {selectedStreamer?.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {selectedTier && (
                <div className="text-center p-4 border rounded-lg">
                  <div
                    className={`w-16 h-16 rounded-full mx-auto mb-4 ${
                      selectedTier === "gold"
                        ? "bg-yellow-500"
                        : selectedTier === "diamond"
                        ? "bg-red-500"
                        : "bg-blue-500"
                    } flex items-center justify-center`}
                  >
                    {selectedTier === "gold" && (
                      <Star className="w-8 h-8 text-white" />
                    )}
                    {selectedTier === "diamond" && (
                      <Heart className="w-8 h-8 text-white" />
                    )}
                    {selectedTier === "chrome" && (
                      <Crown className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold">
                    {subscriptionTiers.find((t) => t.id === selectedTier)?.name}
                  </h3>
                  <p className="text-3xl font-bold text-primary">
                    $
                    {
                      subscriptionTiers.find((t) => t.id === selectedTier)
                        ?.price
                    }
                    /month
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Payment Method:</span>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-renew"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="auto-renew">Auto-renew subscription</Label>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSubscriptionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={confirmSubscription} className="flex-1">
                  Subscribe Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Gift Subscription Modal */}
        <Dialog open={showGiftModal} onOpenChange={setShowGiftModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Gift Subscription to {selectedStreamer?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Select Tier</Label>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionTiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.name} - ${tier.price}/month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={giftQuantity}
                  onChange={(e) =>
                    setGiftQuantity(parseInt(e.target.value) || 1)
                  }
                />
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedTier && (
                <div className="text-center p-4 border rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Total Cost:</p>
                  <p className="text-2xl font-bold text-primary">
                    $
                    {(subscriptionTiers.find((t) => t.id === selectedTier)
                      ?.price || 0) * giftQuantity}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {giftQuantity} x{" "}
                    {subscriptionTiers.find((t) => t.id === selectedTier)?.name}{" "}
                    subscription{giftQuantity > 1 ? "s" : ""}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowGiftModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmGiftSubscription}
                  disabled={!selectedTier}
                  className="flex-1"
                >
                  Send Gift
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manage Subscription Modal */}
        <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Subscription</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Current Plan</h3>
                <p className="text-2xl font-bold text-primary">
                  ${subscriptionTiers.find((t) => t.id === selectedTier)?.price}
                  /month
                </p>
                <p className="text-sm text-muted-foreground">
                  {subscriptionTiers.find((t) => t.id === selectedTier)?.name}{" "}
                  Tier
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Auto-renewal:</span>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>Payment method:</span>
                  <Button variant="outline" size="sm">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>Billing cycle:</span>
                  <span className="text-sm text-muted-foreground">Monthly</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowManageModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button variant="destructive" className="flex-1">
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

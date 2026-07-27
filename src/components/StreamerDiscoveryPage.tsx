import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StreamerSubscriptionModal } from './StreamerSubscriptionModal';
import { Crown, Gem, Zap, Star, Search, Users, TrendingUp, Filter } from 'lucide-react';

interface Streamer {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followers: number;
  category: string;
  description: string;
  isLive: boolean;
  subscriptionTiers: SubscriptionTier[];
  totalSubscribers: number;
  rating: number;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  color: string;
  icon: React.ComponentType;
  features: string[];
  isCustom: boolean;
}

const mockStreamers: Streamer[] = [
  {
    id: '1',
    name: 'Gaming Pro',
    username: 'gamingpro',
    avatar: '/placeholder.svg',
    verified: true,
    followers: 125000,
    category: 'Gaming',
    description: 'Professional gamer and streamer. Join for epic gameplay and exclusive content!',
    isLive: true,
    totalSubscribers: 2340,
    rating: 4.8,
    subscriptionTiers: [
      {
        id: 'tier1',
        name: 'Tier 1',
        price: 4.99,
        color: 'bg-yellow-400',
        icon: Crown,
        features: ['Basic emotes', 'Standard badge', 'Exclusive content access'],
        isCustom: false
      },
      {
        id: 'tier2',
        name: 'Tier 2',
        price: 9.99,
        color: 'bg-blue-500',
        icon: Gem,
        features: ['Premium emotes', 'Animated badge', 'Priority chat', 'Exclusive streams'],
        isCustom: false
      },
      {
        id: 'tier3',
        name: 'Tier 3',
        price: 19.99,
        color: 'bg-purple-500',
        icon: Zap,
        features: ['All previous features', 'Custom emotes', 'VIP badge', 'Direct messaging', 'Early access'],
        isCustom: false
      }
    ]
  },
  {
    id: '2',
    name: 'Music Artist',
    username: 'musiclive',
    avatar: '/placeholder.svg',
    verified: false,
    followers: 89000,
    category: 'Music',
    description: 'Live music performances and exclusive behind-the-scenes content.',
    isLive: false,
    totalSubscribers: 1560,
    rating: 4.6,
    subscriptionTiers: [
      {
        id: 'tier1',
        name: 'Tier 1',
        price: 4.99,
        color: 'bg-yellow-400',
        icon: Crown,
        features: ['Basic emotes', 'Standard badge', 'Exclusive content access'],
        isCustom: false
      },
      {
        id: 'tier2',
        name: 'Tier 2',
        price: 9.99,
        color: 'bg-blue-500',
        icon: Gem,
        features: ['Premium emotes', 'Animated badge', 'Priority chat', 'Exclusive streams'],
        isCustom: false
      }
    ]
  },
  {
    id: '3',
    name: 'Chef Master',
    username: 'chefmaster',
    avatar: '/placeholder.svg',
    verified: true,
    followers: 210000,
    category: 'Lifestyle',
    description: 'Master chef sharing cooking secrets and exclusive recipes.',
    isLive: true,
    totalSubscribers: 3420,
    rating: 4.9,
    subscriptionTiers: [
      {
        id: 'tier1',
        name: 'Tier 1',
        price: 4.99,
        color: 'bg-yellow-400',
        icon: Crown,
        features: ['Basic emotes', 'Standard badge', 'Exclusive content access'],
        isCustom: false
      },
      {
        id: 'tier2',
        name: 'Tier 2',
        price: 9.99,
        color: 'bg-blue-500',
        icon: Gem,
        features: ['Premium emotes', 'Animated badge', 'Priority chat', 'Exclusive streams'],
        isCustom: false
      },
      {
        id: 'custom',
        name: 'VIP Chef',
        price: 29.99,
        color: 'bg-red-500',
        icon: Star,
        features: ['All previous features', '1-on-1 cooking sessions', 'Custom recipes', 'Early access to new content'],
        isCustom: true
      }
    ]
  }
];

const categories = ['All', 'Gaming', 'Music', 'Lifestyle', 'Education', 'Sports', 'Art', 'Technology'];

export const StreamerDiscoveryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const filteredStreamers = mockStreamers.filter(streamer => {
    const matchesSearch = streamer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         streamer.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || streamer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubscribe = (streamer: Streamer) => {
    setSelectedStreamer(streamer);
    setShowSubscriptionModal(true);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'tier1':
        return Crown;
      case 'tier2':
        return Gem;
      case 'tier3':
        return Zap;
      default:
        return Star;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary font-treesh mb-4">
            Discover Amazing Creators
          </h1>
          <p className="text-lg text-muted-foreground font-opensans max-w-2xl mx-auto">
            Find your favorite streamers and unlock exclusive content with subscription plans.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search creators by name or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streamers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreamers.map((streamer) => (
            <Card key={streamer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={streamer.avatar} />
                      <AvatarFallback>{streamer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold font-treesh">{streamer.name}</h3>
                        {streamer.verified && (
                          <Badge className="bg-blue-500 text-white text-xs">✓</Badge>
                        )}
                        {streamer.isLive && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full mr-1" />
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-opensans">@{streamer.username}</p>
                      <Badge variant="outline" className="text-xs">{streamer.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground font-opensans">{streamer.description}</p>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{formatNumber(streamer.followers)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span>{formatNumber(streamer.totalSubscribers)}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>{streamer.rating}</span>
                  </div>
                </div>

                {/* Subscription Tiers Preview */}
                <div>
                  <h4 className="text-sm font-medium mb-2 font-opensans">Subscription Plans:</h4>
                  <div className="flex flex-wrap gap-2">
                    {streamer.subscriptionTiers.slice(0, 3).map((tier) => {
                      const Icon = getTierIcon(tier.id);
                      return (
                        <Badge key={tier.id} variant="outline" className="text-xs">
                          <Icon className="w-3 h-3 mr-1" />
                          {tier.name} - ${tier.price}
                        </Badge>
                      );
                    })}
                    {streamer.subscriptionTiers.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{streamer.subscriptionTiers.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Subscribe Button */}
                <Button 
                  onClick={() => handleSubscribe(streamer)}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-opensans"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredStreamers.length === 0 && (
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No creators found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or category filter.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Subscription Modal */}
        {selectedStreamer && (
          <StreamerSubscriptionModal
            isOpen={showSubscriptionModal}
            onClose={() => {
              setShowSubscriptionModal(false);
              setSelectedStreamer(null);
            }}
            streamerName={selectedStreamer.name}
            streamerId={selectedStreamer.id}
            tiers={selectedStreamer.subscriptionTiers}
          />
        )}
      </div>
    </div>
  );
};

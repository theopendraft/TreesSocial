import { useState } from 'react';
import PostCard from './PostCard';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MainContentProps {
  activeTab: string;
}

const MainContent = ({ activeTab }: MainContentProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const samplePosts = [
    {
      id: '1',
      author: 'Sarah Johnson',
      avatar: '/placeholder.svg',
      content: 'Just launched our new product! So excited to share this journey with everyone. The team has worked incredibly hard to make this happen. 🚀',
      image: '/placeholder.svg',
      likes: 142,
      comments: 23,
      timestamp: '2 hours ago',
      platform: 'twitter' as const
    },
    {
      id: '2',
      author: 'Mike Chen',
      avatar: '/placeholder.svg',
      content: 'Beautiful sunset from my office window today. Sometimes you need to pause and appreciate the simple things in life. Nature never fails to amaze me.',
      likes: 89,
      comments: 12,
      timestamp: '4 hours ago',
      platform: 'instagram' as const
    },
    {
      id: '3',
      author: 'Emily Rodriguez',
      avatar: '/placeholder.svg',
      content: 'Excited to announce that our team won the hackathon! 48 hours of coding, debugging, and lots of coffee. Grateful for my amazing teammates.',
      image: '/placeholder.svg',
      likes: 256,
      comments: 45,
      timestamp: '6 hours ago',
      platform: 'facebook' as const
    },
    {
      id: '4',
      author: 'David Kim',
      avatar: '/placeholder.svg',
      content: 'Pro tip: Always backup your code before making major changes. Learned this the hard way today, but thankfully git saved the day! 💻',
      likes: 78,
      comments: 18,
      timestamp: '8 hours ago',
      platform: 'twitter' as const
    },
    {
      id: '5',
      author: 'Lisa Wang',
      avatar: '/placeholder.svg',
      content: 'Morning workout complete! Starting the day with some endorphins always sets the right tone. What\'s your favorite way to start the morning?',
      likes: 134,
      comments: 31,
      timestamp: '10 hours ago',
      platform: 'instagram' as const
    }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'home': return 'Home Feed';
      case 'trending': return 'Trending Posts';
      case 'following': return 'Following';
      case 'hashtags': return 'Popular Hashtags';
      case 'saved': return 'Saved Posts';
      default: return 'Social Stream';
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-treesh">{getTabTitle(activeTab)}</h2>
            <p className="text-gray-600 mt-1 font-inter">Stay connected with the latest updates</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 font-inter"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 font-inter"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {samplePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline" className="px-8 font-inter">
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
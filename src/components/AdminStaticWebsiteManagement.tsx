import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Globe, Upload, Tag, Smartphone, Save, Edit, Trash2 } from 'lucide-react';

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

interface BannerData {
  id: string;
  title: string;
  image: string;
  link: string;
  active: boolean;
}

const mockSEOData: SEOData = {
  title: 'SocialStream - Connect, Share, Stream',
  description: 'Join the ultimate social media platform for streaming, matching, and connecting with friends.',
  keywords: 'social media, streaming, matchmaking, chat, reels',
  ogImage: '/placeholder.svg'
};

const mockBanners: BannerData[] = [
  { id: '1', title: 'Download iOS App', image: '/placeholder.svg', link: 'https://apps.apple.com', active: true },
  { id: '2', title: 'Download Android App', image: '/placeholder.svg', link: 'https://play.google.com', active: true },
  { id: '3', title: 'Summer Promotion', image: '/placeholder.svg', link: '/promo', active: false }
];

export const AdminStaticWebsiteManagement = () => {
  const [seoData, setSeoData] = useState<SEOData>(mockSEOData);
  const [banners, setBanners] = useState<BannerData[]>(mockBanners);
  const [homeContent, setHomeContent] = useState('Welcome to SocialStream - the ultimate social platform!');
  const [appStoreLinks, setAppStoreLinks] = useState({
    ios: 'https://apps.apple.com/app/socialstream',
    android: 'https://play.google.com/store/apps/details?id=com.socialstream'
  });

  const handleSEOUpdate = () => {
    toast({ title: 'SEO settings updated', description: 'Search engine optimization settings have been saved.' });
  };

  const handleContentUpdate = () => {
    toast({ title: 'Homepage content updated', description: 'The homepage content has been successfully updated.' });
  };

  const handleBannerToggle = (id: string) => {
    setBanners(banners.map(banner => 
      banner.id === id ? { ...banner, active: !banner.active } : banner
    ));
    toast({ title: 'Banner updated', description: 'Banner status has been changed.' });
  };

  const handleAppStoreUpdate = () => {
    toast({ title: 'App store links updated', description: 'Download links have been saved.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6" />
          Static Website Management
        </h2>
      </div>

      <Tabs defaultValue="homepage" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="app-links">App Links</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Homepage Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="home-content">Main Content</Label>
                <Textarea
                  id="home-content"
                  value={homeContent}
                  onChange={(e) => setHomeContent(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleContentUpdate} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Update Homepage Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                SEO Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo-title">Page Title</Label>
                <Input
                  id="seo-title"
                  value={seoData.title}
                  onChange={(e) => setSeoData({...seoData, title: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="seo-description">Meta Description</Label>
                <Textarea
                  id="seo-description"
                  value={seoData.description}
                  onChange={(e) => setSeoData({...seoData, description: e.target.value})}
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="seo-keywords">Keywords</Label>
                <Input
                  id="seo-keywords"
                  value={seoData.keywords}
                  onChange={(e) => setSeoData({...seoData, keywords: e.target.value})}
                  className="mt-2"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div>
                <Label htmlFor="og-image">Open Graph Image URL</Label>
                <Input
                  id="og-image"
                  value={seoData.ogImage}
                  onChange={(e) => setSeoData({...seoData, ogImage: e.target.value})}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleSEOUpdate} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Update SEO Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Banner Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img src={banner.image} alt={banner.title} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <h4 className="font-medium">{banner.title}</h4>
                        <p className="text-sm text-muted-foreground">{banner.link}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={banner.active ? 'default' : 'secondary'}>
                        {banner.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBannerToggle(banner.id)}
                      >
                        {banner.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app-links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                App Store Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ios-link">iOS App Store Link</Label>
                <Input
                  id="ios-link"
                  value={appStoreLinks.ios}
                  onChange={(e) => setAppStoreLinks({...appStoreLinks, ios: e.target.value})}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="android-link">Google Play Store Link</Label>
                <Input
                  id="android-link"
                  value={appStoreLinks.android}
                  onChange={(e) => setAppStoreLinks({...appStoreLinks, android: e.target.value})}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleAppStoreUpdate} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Update App Store Links
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
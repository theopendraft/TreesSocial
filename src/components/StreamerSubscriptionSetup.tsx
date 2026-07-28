import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Crown, Gem, Zap, CheckCircle, Clock, AlertCircle, Settings, DollarSign, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  color: string;
  icon: React.ComponentType;
  features: string[];
  isCustom: boolean;
}

interface StreamerPerks {
  emotes: File[];
  badgeIcons: File[];
  exclusiveContent: string;
}

const predefinedTiers: SubscriptionTier[] = [
  {
    id: 'gold',
    name: 'Gold Tier',
    price: 9.99,
    color: 'bg-yellow-400',
    icon: Crown,
    features: ['Basic emotes', 'Standard badge', 'Exclusive content access', 'Priority chat'],
    isCustom: false
  },
  {
    id: 'diamond',
    name: 'Diamond Tier',
    price: 16.99,
    color: 'bg-blue-500',
    icon: Gem,
    features: ['Premium emotes', 'Animated badge', 'Priority chat', 'Exclusive streams', 'Direct messaging'],
    isCustom: false
  },
  {
    id: 'chrome',
    name: 'Chrome Tier',
    price: 39.99,
    color: 'bg-purple-500',
    icon: Zap,
    features: ['All previous features', 'Custom emotes', 'VIP badge', 'Direct messaging', 'Early access', 'Chrome-exclusive content'],
    isCustom: false
  }
];

export const StreamerSubscriptionSetup = () => {
  const [adminStatus, setAdminStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [tiers, setTiers] = useState<SubscriptionTier[]>([...predefinedTiers]);
  const [perks, setPerks] = useState<StreamerPerks>({
    emotes: [],
    badgeIcons: [],
    exclusiveContent: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomTierModal, setShowCustomTierModal] = useState(false);
  const [customTier, setCustomTier] = useState<Partial<SubscriptionTier>>({});

  const handleFileUpload = (type: 'emotes' | 'badgeIcons', files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setPerks(prev => ({
        ...prev,
        [type]: [...prev[type], ...fileArray]
      }));
      toast({
        title: "Files uploaded successfully",
        description: `${fileArray.length} ${type === 'emotes' ? 'emote' : 'badge'} file(s) added.`,
      });
    }
  };

  const handleCustomTierSubmit = () => {
    if (customTier.name && customTier.price) {
      const newTier: SubscriptionTier = {
        id: `custom-${Date.now()}`,
        name: customTier.name,
        price: customTier.price,
        color: customTier.color || 'bg-gray-500',
        icon: Crown,
        features: customTier.features || [],
        isCustom: true
      };
      setTiers(prev => [...prev, newTier]);
      setCustomTier({});
      setShowCustomTierModal(false);
      toast({
        title: "Custom tier added",
        description: `${newTier.name} tier has been added to your subscription plans.`,
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Setup submitted successfully!",
        description: "Your subscription setup has been submitted for admin review.",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    switch (adminStatus) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (adminStatus) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary font-treesh mb-4">
            Streamer Subscription Setup
          </h1>
          <p className="text-lg text-muted-foreground font-opensans max-w-2xl mx-auto">
            Set up your subscription plans and perks to monetize your content and engage with your audience.
          </p>
        </div>

        {/* Admin Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Admin Approval Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="font-medium">
                {adminStatus === 'approved' ? 'Approved' : 
                 adminStatus === 'rejected' ? 'Rejected' : 'Pending Review'}
              </span>
            </div>
            {adminStatus === 'pending' && (
              <p className="text-sm text-muted-foreground mt-2">
                Your subscription setup is currently under review. You'll be notified once approved.
              </p>
            )}
            {adminStatus === 'rejected' && (
              <p className="text-sm text-muted-foreground mt-2">
                Your setup was rejected. Please review the feedback and resubmit.
              </p>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="tiers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tiers">Pricing Tiers</TabsTrigger>
            <TabsTrigger value="perks">Perks & Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="tiers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subscription Tiers</CardTitle>
                    <CardDescription>
                      Set up your pricing tiers. You can use predefined tiers or create custom ones.
                    </CardDescription>
                  </div>
                  <Dialog open={showCustomTierModal} onOpenChange={setShowCustomTierModal}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary-dark text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom Tier
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Custom Tier</DialogTitle>
                        <DialogDescription>
                          Add a custom subscription tier with your own pricing and features.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="tierName">Tier Name</Label>
                          <Input
                            id="tierName"
                            placeholder="e.g., VIP, Premium Plus"
                            value={customTier.name || ''}
                            onChange={(e) => setCustomTier(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tierPrice">Price (USD)</Label>
                          <Input
                            id="tierPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="9.99"
                            value={customTier.price || ''}
                            onChange={(e) => setCustomTier(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tierFeatures">Features (one per line)</Label>
                          <Textarea
                            id="tierFeatures"
                            placeholder="Exclusive content access&#10;Priority support&#10;Custom badge"
                            value={customTier.features?.join('\n') || ''}
                            onChange={(e) => setCustomTier(prev => ({ 
                              ...prev, 
                              features: e.target.value.split('\n').filter(f => f.trim()) 
                            }))}
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setShowCustomTierModal(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCustomTierSubmit} className="bg-primary hover:bg-primary-dark">
                          Add Tier
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tiers.map((tier) => {
                    const Icon = tier.icon;
                    return (
                      <Card key={tier.id} className="relative">
                        {tier.isCustom && (
                          <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white">
                            Custom
                          </Badge>
                        )}
                        <CardHeader className="text-center pb-2">
                          <div className={`w-12 h-12 ${tier.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                          {Icon && typeof Icon === 'function' ? <Icon /> : null}
                          </div>
                          <CardTitle className="text-lg">{tier.name}</CardTitle>
                          <div className="text-2xl font-bold text-primary">
                            ${tier.price}<span className="text-sm text-gray-500">/month</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {tier.features.map((feature, index) => (
                              <li key={index} className="flex items-center space-x-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Perks & Content</CardTitle>
                <CardDescription>
                  Upload emotes, badge icons, and describe your exclusive content for subscribers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Emotes Upload */}
                <div>
                  <Label htmlFor="emotes">Upload Emotes</Label>
                  <div className="mt-2">
                    <Input
                      id="emotes"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload('emotes', e.target.files)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload custom emotes for your subscribers (PNG, JPG, GIF)
                    </p>
                  </div>
                  {perks.emotes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {perks.emotes.map((file, index) => (
                        <Badge key={index} variant="secondary">
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Badge Icons Upload */}
                <div>
                  <Label htmlFor="badges">Upload Badge Icons</Label>
                  <div className="mt-2">
                    <Input
                      id="badges"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload('badgeIcons', e.target.files)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload badge icons for different subscription tiers (PNG, JPG, SVG)
                    </p>
                  </div>
                  {perks.badgeIcons.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {perks.badgeIcons.map((file, index) => (
                        <Badge key={index} variant="secondary">
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exclusive Content Description */}
                <div>
                  <Label htmlFor="exclusiveContent">Exclusive Content Description</Label>
                  <Textarea
                    id="exclusiveContent"
                    placeholder="Describe what exclusive content your subscribers will get access to..."
                    value={perks.exclusiveContent}
                    onChange={(e) => setPerks(prev => ({ ...prev, exclusiveContent: e.target.value }))}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    This will be displayed to potential subscribers
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview Your Subscription Plans</CardTitle>
                <CardDescription>
                  This is how your subscription plans will appear to viewers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tiers.map((tier) => {
                    const Icon = tier.icon;
                    return (
                      <Card key={tier.id} className="border-2 border-gray-200 hover:border-primary transition-colors">
                        <CardHeader className="text-center">
                          <div className={`w-16 h-16 ${tier.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                            {Icon && typeof Icon === 'function' ? <Icon /> : null}
                          </div>
                          <CardTitle className="text-xl">{tier.name}</CardTitle>
                          <div className="text-3xl font-bold text-primary">
                            ${tier.price}<span className="text-sm text-gray-500">/month</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {tier.features.map((feature, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Button className="w-full mt-6 bg-primary hover:bg-primary-dark text-white">
                            Subscribe
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || adminStatus === 'approved'}
            size="lg"
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

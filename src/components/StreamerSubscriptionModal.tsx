import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Gem, Zap, Gift, Check, CreditCard, Wallet, Globe, Users } from 'lucide-react';
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

interface StreamerSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamerName: string;
  streamerId: string;
  tiers: SubscriptionTier[];
}

const mockTiers: SubscriptionTier[] = [
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

const giftQuantities = [1, 5, 10, 20];

const mockRegions = [
  { code: 'US', name: 'United States', currency: 'USD', multiplier: 1.0 },
  { code: 'EU', name: 'European Union', currency: 'EUR', multiplier: 0.85 },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP', multiplier: 0.73 },
  { code: 'IN', name: 'India', currency: 'INR', multiplier: 82.5 },
  { code: 'JP', name: 'Japan', currency: 'JPY', multiplier: 150.0 }
];

export const StreamerSubscriptionModal = ({ 
  isOpen, 
  onClose, 
  streamerName, 
  streamerId, 
  tiers = mockTiers 
}: StreamerSubscriptionModalProps) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isGifting, setIsGifting] = useState(false);
  const [giftQuantity, setGiftQuantity] = useState(1);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(mockRegions[0]);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubscribe = async () => {
    if (!selectedTier) return;
    
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowConfirmation(true);
      toast({
        title: "Subscription successful! 🎉",
        description: `You are now subscribed to ${streamerName}'s ${selectedTier.name} tier.`,
      });
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGift = async () => {
    if (!selectedTier || !giftRecipient) {
      toast({
        title: "Missing information",
        description: "Please select a tier and enter recipient details.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate gift processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowConfirmation(true);
      toast({
        title: "Gift sent successfully! 🎁",
        description: `${giftQuantity} ${selectedTier.name} subscription(s) sent to ${giftRecipient}.`,
      });
    } catch (error) {
      toast({
        title: "Gift failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatePrice = (basePrice: number) => {
    return (basePrice * selectedRegion.multiplier).toFixed(2);
  };

  const getTotalPrice = () => {
    if (!selectedTier) return 0;
    return parseFloat(calculatePrice(selectedTier.price)) * giftQuantity;
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'card':
        return CreditCard;
      case 'wallet':
        return Wallet;
      default:
        return CreditCard;
    }
  };

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md text-center">
          <div className="py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Subscription Active!</h3>
            <p className="text-muted-foreground mb-6">
              {isGifting 
                ? `You've successfully gifted ${giftQuantity} ${selectedTier?.name} subscription(s) to ${giftRecipient}!`
                : `You're now subscribed to ${streamerName}'s ${selectedTier?.name} tier.`
              }
            </p>
            <Button onClick={onClose} className="w-full bg-primary hover:bg-primary-dark">
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary font-treesh">
            Subscribe to {streamerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant={!isGifting ? "default" : "outline"}
              onClick={() => setIsGifting(false)}
              className={!isGifting ? "bg-primary hover:bg-primary-dark text-white font-inter" : ""}
            >
              Subscribe
            </Button>
            <Button
              variant={isGifting ? "default" : "outline"}
              onClick={() => setIsGifting(true)}
              className={isGifting ? "bg-primary hover:bg-primary-dark text-white font-inter" : ""}
            >
              <Gift className="w-4 h-4 mr-2" />
              Gift Subscription
            </Button>
          </div>

          {/* Region Selection */}
          <div className="flex items-center space-x-4">
            <Label className="font-medium">Region:</Label>
            <Select value={selectedRegion.code} onValueChange={(value) => {
              const region = mockRegions.find(r => r.code === value);
              if (region) setSelectedRegion(region);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockRegions.map((region) => (
                  <SelectItem key={region.code} value={region.code}>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>{region.name} ({region.currency})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subscription Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isSelected = selectedTier?.id === tier.id;
              return (
                <Card
                  key={tier.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? `ring-2 ring-primary` : ''
                  }`}
                  onClick={() => setSelectedTier(tier)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-2">
                      <div className={`w-12 h-12 ${tier.color} rounded-full flex items-center justify-center`}>
                        {Icon && typeof Icon === 'function' ? <Icon /> : null}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-inter">{tier.name}</CardTitle>
                    <div className="text-2xl font-bold text-primary">
                      {selectedRegion.currency === 'USD' ? '$' : selectedRegion.currency === 'EUR' ? '€' : 
                       selectedRegion.currency === 'GBP' ? '£' : selectedRegion.currency === 'INR' ? '₹' : '¥'}
                      {calculatePrice(tier.price)}
                      <span className="text-sm text-gray-500">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Gift Options */}
          {isGifting && (
            <div className="space-y-4">
              <div>
                <Label className="font-medium">Gift Quantity</Label>
                <div className="flex space-x-2 mt-2">
                  {giftQuantities.map((count) => (
                    <Button
                      key={count}
                      variant={giftQuantity === count ? "default" : "outline"}
                      onClick={() => setGiftQuantity(count)}
                      className={giftQuantity === count ? "bg-primary hover:bg-primary-dark text-white font-inter" : ""}
                    >
                      {count} {count === 1 ? 'Gift' : 'Gifts'}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="recipient">Recipient</Label>
                <Input
                  id="recipient"
                  placeholder="Enter username or email"
                  value={giftRecipient}
                  onChange={(e) => setGiftRecipient(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="space-y-3">
            <Label className="font-medium">Payment Method</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
                { id: 'wallet', name: 'Digital Wallet', icon: Wallet }
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <div
                    key={method.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment === method.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{method.name}</span>
                    <div className={`w-4 h-4 rounded-full border-2 ml-auto ${
                      selectedPayment === method.id 
                        ? 'border-primary bg-primary' 
                        : 'border-gray-300'
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total and Action */}
          {selectedTier && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-primary">
                    {selectedRegion.currency === 'USD' ? '$' : selectedRegion.currency === 'EUR' ? '€' : 
                     selectedRegion.currency === 'GBP' ? '£' : selectedRegion.currency === 'INR' ? '₹' : '¥'}
                    {getTotalPrice()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isGifting 
                    ? `${giftQuantity} × ${selectedTier.name} subscription(s)`
                    : `${selectedTier.name} subscription for 1 month`
                  }
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={isGifting ? handleGift : handleSubscribe}
                  disabled={isProcessing || (isGifting && !giftRecipient)}
                  className="bg-primary hover:bg-primary-dark text-white px-8 font-inter"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : isGifting ? (
                    `Gift ${giftQuantity} Subscription${giftQuantity > 1 ? 's' : ''}`
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>• Auto-renewal with cancel option in profile settings</p>
            <p>• 100% of earnings go to creators (0% platform fee)</p>
            <p>• Secure payment processing</p>
            {isGifting && (
              <p>• Gift subscriptions are non-refundable</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

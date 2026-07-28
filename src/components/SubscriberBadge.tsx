import { Badge } from '@/components/ui/badge';
import { Crown, Gem, Zap, Star } from 'lucide-react';

interface SubscriberBadgeProps {
  tier: 'gold' | 'diamond' | 'chrome' | 'custom' | 'tier1' | 'tier2' | 'tier3';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showIcon?: boolean;
  className?: string;
}

const tierConfig: Record<string, { icon: any; color: string; text: string }> = {
  gold: {
    icon: Crown,
    color: 'bg-yellow-400 text-yellow-900',
    text: 'Gold'
  },
  diamond: {
    icon: Gem,
    color: 'bg-blue-500 text-white',
    text: 'Diamond'
  },
  chrome: {
    icon: Zap,
    color: 'bg-purple-500 text-white',
    text: 'Chrome'
  },
  tier1: {
    icon: Star,
    color: 'bg-gray-400 text-white',
    text: 'Tier 1'
  },
  tier2: {
    icon: Star,
    color: 'bg-blue-500 text-white',
    text: 'Tier 2'
  },
  tier3: {
    icon: Crown,
    color: 'bg-purple-500 text-white',
    text: 'Tier 3'
  },
  custom: {
    icon: Star,
    color: 'bg-red-500 text-white',
    text: 'VIP'
  }
};

export const SubscriberBadge = ({ 
  tier, 
  size = 'md', 
  showText = false, 
  className = '' 
}: SubscriberBadgeProps) => {
  const config = tierConfig[tier];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm',
    lg: 'w-6 h-6 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge 
      className={`${config.color} ${sizeClasses[size]} flex items-center space-x-1 ${className}`}
      variant="default"
    >
      <Icon className={iconSizes[size]} />
      {showText && <span>{config.text}</span>}
    </Badge>
  );
};

// Compact version for inline use (e.g., in chat)
export const InlineSubscriberBadge = ({ tier, size = 'sm' }: Omit<SubscriberBadgeProps, 'showText' | 'className'>) => {
  const config = tierConfig[tier];
  const Icon = config.icon;

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Icon 
      className={`${iconSizes[size]} ${config.color.replace('bg-', 'text-').replace(' text-', '')} inline-block`} 
      title={config.text}
    />
  );
};

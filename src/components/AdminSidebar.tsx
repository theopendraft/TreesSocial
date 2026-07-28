import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Home,
  Users,
  Shield,
  Video,
  Megaphone,
  BarChart3,
  Bell,
  ChevronDown,
  Menu,
  X,
  Heart,
  Settings,
  Globe
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    hasSubmenu: false
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    hasSubmenu: true,
    submenu: [
      { id: 'all-users', label: 'All Users' },
      { id: 'blocked-users', label: 'Blocked Users' },
      { id: 'activity-logs', label: 'Activity Logs' }
    ]
  },
  {
    id: 'moderation',
    label: 'Content Moderation',
    icon: Shield,
    hasSubmenu: true,
    submenu: [
      { id: 'review-posts', label: 'Review Posts' },
      { id: 'review-reels', label: 'Review Reels' },
      { id: 'review-stories', label: 'Review Stories' },
      { id: 'reported-content', label: 'Reported Content' }
    ]
  },
  {
    id: 'matchmaking',
    label: 'Matchmaking Oversight',
    icon: Heart,
    hasSubmenu: true,
    submenu: [
      { id: 'match-logs', label: 'Match Logs' },
      { id: 'flagged-conversations', label: 'Flagged Conversations' }
    ]
  },
  {
    id: 'livestream',
    label: 'Livestream Controls',
    icon: Video,
    hasSubmenu: true,
    submenu: [
      { id: 'live-streams', label: 'Live Streams' },
      { id: 'scheduled-streams', label: 'Scheduled Streams' },
      { id: 'stream-categories', label: 'Stream Categories' }
    ]
  },
  {
    id: 'psa',
    label: 'PSA Management',
    icon: Megaphone,
    hasSubmenu: true,
    submenu: [
      { id: 'push-announcement', label: 'Push Announcement' },
      { id: 'past-psas', label: 'View Past PSAs' }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    icon: BarChart3,
    hasSubmenu: true,
    submenu: [
      { id: 'engagement-trends', label: 'Engagement Trends' },
      { id: 'top-users', label: 'Top Users' },
      { id: 'top-creators', label: 'Top Creators' },
      { id: 'login-stats', label: 'Login Statistics' }
    ]
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    hasSubmenu: true,
    submenu: [
      { id: 'send-notification', label: 'Send Notification' },
      { id: 'notification-logs', label: 'Notification Logs' }
    ]
  },
  {
    id: 'settings',
    label: 'Admin Settings',
    icon: Settings,
    hasSubmenu: true,
    submenu: [
      { id: 'admin-users', label: 'Admin Users' },
      { id: 'security', label: 'Security' },
      { id: 'activity-logs-admin', label: 'Activity Logs' }
    ]
  },
  {
    id: 'website',
    label: 'Static Website Management',
    icon: Globe,
    hasSubmenu: true,
    submenu: [
      { id: 'homepage-content', label: 'Homepage Content' },
      { id: 'seo-settings', label: 'SEO Settings' },
      { id: 'banners-management', label: 'Banners & Links' }
    ]
  }
];

export const AdminSidebar = ({ activeSection, onSectionChange, isMobile = false, onClose }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>(['dashboard']);

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleItemClick = (id: string, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      toggleSubmenu(id);
    } else {
      onSectionChange(id);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-accent/20 bg-gradient-to-r from-primary to-primary-dark">
        <div className="flex items-center justify-between">
          {(!collapsed || isMobile) && (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
                <img 
                  src="/logo.svg" 
                  alt="Treesh" 
                  className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-white font-treesh">Admin Panel</h2>
            </div>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-3 sm:py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id || 
              (item.submenu && item.submenu.some(sub => activeSection === sub.id));
            const isOpen = openSubmenus.includes(item.id);
            
            return (
              <div key={item.id}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start h-10 sm:h-11 font-inter text-sm sm:text-base",
                          collapsed && !isMobile && "px-2",
                          isActive && "bg-primary text-white hover:bg-primary-dark shadow-md",
                          !isActive && "hover:bg-accent/50 text-gray-700 hover:text-gray-900"
                        )}
                        onClick={() => handleItemClick(item.id, item.hasSubmenu)}
                      >
                        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", (!collapsed || isMobile) && "mr-2 sm:mr-3")} />
                        {(!collapsed || isMobile) && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.hasSubmenu && (
                              <ChevronDown className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isOpen && "rotate-180"
                              )} />
                            )}
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    {collapsed && !isMobile && (
                      <TooltipContent side="right" className="bg-gray-900 text-white">
                        <p>{item.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                
                {/* Submenu */}
                {item.hasSubmenu && (!collapsed || isMobile) && (
                  <Collapsible open={isOpen}>
                    <CollapsibleContent className="ml-3 sm:ml-4 mt-1 space-y-1">
                      {item.submenu?.map((subItem) => (
                        <Button
                          key={subItem.id}
                          variant={activeSection === subItem.id ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "w-full justify-start h-8 sm:h-9 text-xs sm:text-sm font-inter",
                            activeSection === subItem.id && "bg-accent text-white hover:bg-accent/90 shadow-sm",
                            activeSection !== subItem.id && "hover:bg-accent/30 text-gray-600 hover:text-gray-800"
                          )}
                          onClick={() => onSectionChange(subItem.id)}
                        >
                          <span className="ml-2 sm:ml-3">{subItem.label}</span>
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-accent/20 bg-gray-50">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
            <span className="text-white text-xs sm:text-sm font-bold">A</span>
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">Full Access</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // For mobile, always show full sidebar
  if (isMobile) {
    return <SidebarContent />;
  }

  // Desktop sidebar with collapse functionality
  return (
    <aside className={cn(
      "hidden lg:flex flex-col bg-white border-r border-accent/20 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <SidebarContent />
    </aside>
  );
};
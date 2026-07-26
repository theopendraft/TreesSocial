import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, TrendingUp, Users, Hash, Bookmark, Settings, X, Crown, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ isOpen, onClose, activeTab, onTabChange }: SidebarProps) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'following', label: 'Following', icon: Users },
    { id: 'hashtags', label: 'Hashtags', icon: Hash },
    { id: 'saved', label: 'Saved Posts', icon: Bookmark },
    { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:shadow-none md:border-r md:border-accent/20",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-accent/20 md:hidden">
          <h2 className="text-lg font-semibold text-gray-900 font-inter">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start space-x-3 h-12 font-inter",
                    activeTab === item.id 
                      ? "bg-primary hover:bg-primary-dark text-white" 
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose();
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              );
            })}
            
            <div className="pt-4 mt-4 border-t border-accent/20">
              <Button
                variant="ghost"
                className="w-full justify-start space-x-3 h-12 hover:bg-gray-100 text-gray-700 font-inter"
                onClick={() => onTabChange('manage-subscription')}
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Manage Subscription</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start space-x-3 h-12 hover:bg-gray-100 text-gray-700 font-inter"
              >
                <Gift className="h-5 w-5" />
                <span className="font-medium">Gift Subscription</span>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default Sidebar;
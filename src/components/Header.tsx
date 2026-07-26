import { Button } from '@/components/ui/button';
import { Menu, User, Settings } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  showAdminButton?: boolean;
  onAdminClick?: () => void;
}

const Header = ({ onMenuClick, showAdminButton = false, onAdminClick }: HeaderProps) => {
  return (
    <header className="bg-primary shadow-lg border-b border-primary-dark/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden text-white hover:bg-white/20"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/logo.svg" 
                  alt="Treesh" 
                  className="w-8 h-8 text-white"
                />
              </div>
              <h1 className="text-xl font-bold text-white font-treesh">
                Treesh
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {showAdminButton && (
              <Button
                onClick={onAdminClick}
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center space-x-2 text-white border-white hover:bg-white hover:text-primary font-inter"
              >
                <Settings className="h-4 w-4" />
                <span>Admin Panel</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
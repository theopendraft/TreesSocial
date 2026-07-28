import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminSidebar } from './AdminSidebar';
import { AdminContent } from './AdminContent';
import { Menu, X, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard = ({ onClose }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 z-50 shadow-xl transform transition-transform duration-300 ease-in-out">
          <AdminSidebar 
            activeSection={activeSection} 
            onSectionChange={(section) => {
              setActiveSection(section);
              setMobileSidebarOpen(false);
            }}
            isMobile={true}
            onClose={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          isMobile={false}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
        {isMobile && (
          <header className="lg:hidden bg-primary text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">A</span>
                </div>
                <h1 className="text-lg font-semibold">Admin Panel</h1>
              </div>
            </div>
            <div className="text-sm opacity-90">
              {activeSection}
            </div>
          </header>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <header className="hidden lg:block bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">A</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold font-treesh">Admin Panel</h1>
                  <p className="text-white/80 text-sm">Manage your Treesh platform</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Current Section</div>
                <div className="text-lg font-semibold">{activeSection}</div>
              </div>
            </div>
          </header>
        )}

        {/* Back Button */}
        <div className="px-4 py-3 lg:px-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center space-x-2 text-primary border-primary hover:bg-primary hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* Main Content */}
        <main className="px-4 pb-6 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <AdminContent activeSection={activeSection} />
          </div>
        </main>
      </div>
    </div>
  );
};
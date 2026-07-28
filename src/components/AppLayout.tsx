import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import AdminPanel from './AdminPanel';

const AppLayout = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const [activeTab, setActiveTab] = useState('home');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleAdminClick = () => {
    setShowAdminPanel(true);
  };

  const handleCloseAdmin = () => {
    setShowAdminPanel(false);
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <Header 
        onMenuClick={toggleSidebar}
        showAdminButton={true}
        onAdminClick={handleAdminClick}
      />
      
      <div className="flex">
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar 
            isOpen={true}
            onClose={() => {}}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
        
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={toggleSidebar}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        <MainContent activeTab={activeTab} />
      </div>
      
      {showAdminPanel && (
        <AdminPanel onClose={handleCloseAdmin} />
      )}
    </div>
  );
};

export default AppLayout;
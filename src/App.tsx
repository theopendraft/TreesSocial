import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/useAuth.tsx';
import { MainApp } from './components/MainApp';
import { AdminDashboard } from './components/AdminDashboard';
import { MaintenanceMode } from './components/MaintenanceMode';

const queryClient = new QueryClient();

const App = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Set to true to enable maintenance mode
  const isMaintenanceMode = true;

  useEffect(() => {
    // Prevent hydration mismatch
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return null;
  }

  // Show maintenance mode if enabled
  if (isMaintenanceMode) {
    return <MaintenanceMode />;
  }

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    showAdmin ? (
                      <AdminDashboard onClose={() => setShowAdmin(false)} />
                    ) : (
                      <MainApp />
                    )
                  } 
                />
                <Route 
                  path="/admin" 
                  element={<AdminDashboard onClose={() => setShowAdmin(false)} />} 
                />
                <Route 
                  path="*" 
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-primary mb-4 font-treesh">404</h1>
                        <p className="text-muted-foreground font-inter">Page not found</p>
                      </div>
                    </div>
                  } 
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
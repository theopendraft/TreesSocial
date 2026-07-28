import { Construction } from 'lucide-react';

export const MaintenanceMode = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <Construction className="w-20 h-20 text-indigo-600 animate-pulse" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Under Maintenance
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          This website is temporarily down due to unclear payment of the developer.
        </p>
        
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-lg">
          <p className="text-gray-700 text-base md:text-lg">
            For more information about this, please reach out to the developer who created this website.
          </p>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          Thank you for your patience
        </div>
      </div>
    </div>
  );
};

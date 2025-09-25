import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Tables from './pages/Tables';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Staff from './pages/Staff';
import { initializeData } from './services/apiService';
import { Coffee, LayoutGrid, ClipboardList, BarChart3, Users, LucideProps, Menu, ChefHat } from 'lucide-react';
import type { Page } from './types';

const pageComponents: { [key in Page]: React.ComponentType } = {
  dashboard: Dashboard,
  pos: POS,
  tables: Tables,
  inventory: Inventory,
  reports: Reports,
  staff: Staff,
};

const pageIcons: { [key in Page]: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> } = {
  dashboard: LayoutGrid,
  pos: Coffee,
  tables: ClipboardList,
  inventory: ClipboardList,
  reports: BarChart3,
  staff: Users
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeData();
      } catch (error) {
        console.error("Failed to initialize database:", error);
        // Here you could show an error message to the user
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const CurrentPageComponent = pageComponents[currentPage];

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-800"></div>
            <p className="mt-4 text-gray-600">Conectando ao banco de dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        pageIcons={pageIcons} 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
         <header className="bg-white shadow-sm md:hidden flex items-center justify-between p-4 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-900" aria-label="Open menu">
            <Menu size={24} />
          </button>
           <div className="flex items-center">
            <ChefHat className="h-6 w-6 text-amber-800" />
            <h1 className="text-lg font-bold ml-2 text-amber-900">Café Flora</h1>
          </div>
          <div className="w-6"></div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <CurrentPageComponent />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Tables from './pages/Tables';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Staff from './pages/Staff';
import { initializeData } from './services/apiService';
import { Coffee, LayoutGrid, ClipboardList, BarChart3, Users, LucideProps } from 'lucide-react';
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

  useEffect(() => {
    initializeData();
  }, []);

  const CurrentPageComponent = pageComponents[currentPage];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} pageIcons={pageIcons} />
      <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <CurrentPageComponent />
        </div>
      </main>
    </div>
  );
};

export default App;

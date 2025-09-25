
import React from 'react';
import type { Page } from '../types';
import { ChefHat, LucideProps } from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  pageIcons: { [key in Page]: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> };
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, pageIcons }) => {
  const navItems: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pos', label: 'Ponto de Venda' },
    { id: 'tables', label: 'Mesas' },
    { id: 'inventory', label: 'Estoque' },
    { id: 'reports', label: 'Relatórios' },
    { id: 'staff', label: 'Atendentes' },
  ];

  return (
    <aside className="w-64 bg-white text-gray-800 flex flex-col shadow-lg">
      <div className="flex items-center justify-center h-20 border-b">
        <ChefHat className="h-8 w-8 text-amber-800" />
        <h1 className="text-2xl font-bold ml-2 text-amber-900">Café Pro</h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => {
            const Icon = pageIcons[item.id];
            const isActive = currentPage === item.id;
            return (
              <li key={item.id} className="mb-2">
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center w-full text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 font-semibold'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-amber-800' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <p className="text-xs text-gray-500 text-center">&copy; 2024 Café Control Pro</p>
      </div>
    </aside>
  );
};

export default Sidebar;

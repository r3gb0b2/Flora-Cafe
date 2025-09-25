
import React from 'react';
import type { Page } from '../types';
import { ChefHat, LucideProps, X } from 'lucide-react';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  pageIcons: { [key in Page]: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>> };
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, pageIcons, isOpen, setIsOpen }) => {
  const navItems: { id: Page; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pos', label: 'Ponto de Venda' },
    { id: 'tables', label: 'Mesas' },
    { id: 'inventory', label: 'Estoque' },
    { id: 'reports', label: 'Relatórios' },
    { id: 'staff', label: 'Atendentes' },
  ];

  return (
    <>
      <aside className={`w-64 bg-white text-gray-800 flex flex-col shadow-lg fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-20 border-b px-4">
          <div className="flex items-center">
            <ChefHat className="h-8 w-8 text-amber-800" />
            <h1 className="text-2xl font-bold ml-2 text-amber-900">Café Flora</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500 hover:text-gray-800" aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul>
            {navItems.map((item) => {
              const Icon = pageIcons[item.id];
              const isActive = currentPage === item.id;
              return (
                <li key={item.id} className="mb-2">
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsOpen(false);
                    }}
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
          <p className="text-xs text-gray-500 text-center">&copy; 2024 Café Flora</p>
        </div>
      </aside>
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" aria-hidden="true"></div>}
    </>
  );
};

export default Sidebar;

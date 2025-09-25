
import React, { useState, useEffect, useCallback } from 'react';
import { getTables, updateTableStatus } from '../services/apiService';
import type { CafeTable } from '../types';
import { Utensils, CheckCircle, Clock } from 'lucide-react';
import Modal from '../components/Modal';

const TableCard: React.FC<{ table: CafeTable, onUpdate: () => void }> = ({ table, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(table.status);

  const statusConfig = {
    available: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      icon: <CheckCircle className="w-8 h-8" />,
      text: 'Disponível'
    },
    occupied: {
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-300',
      icon: <Utensils className="w-8 h-8" />,
      text: 'Ocupada'
    },
    reserved: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      icon: <Clock className="w-8 h-8" />,
      text: 'Reservada'
    }
  };

  const currentStatus = statusConfig[table.status];
  
  const handleStatusChange = () => {
    updateTableStatus(table.id, newStatus, newStatus === 'occupied' ? `temp-order-${Date.now()}` : null);
    onUpdate();
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className={`p-6 rounded-xl border-2 ${currentStatus.borderColor} ${currentStatus.bgColor} flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-shadow`}
        onClick={() => setIsModalOpen(true)}
      >
        <div className={`mb-4 ${currentStatus.textColor}`}>
          {currentStatus.icon}
        </div>
        <h3 className={`text-xl font-bold ${currentStatus.textColor}`}>{table.name}</h3>
        <p className={`font-semibold ${currentStatus.textColor}`}>{currentStatus.text}</p>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Gerenciar ${table.name}`}>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Alterar Status
          </label>
          <select
            id="status"
            name="status"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as CafeTable['status'])}
          >
            <option value="available">Disponível</option>
            <option value="occupied">Ocupada</option>
            <option value="reserved">Reservada</option>
          </select>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="bg-amber-800 text-white px-4 py-2 rounded-md hover:bg-amber-900"
              onClick={handleStatusChange}
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const Tables: React.FC = () => {
  const [tables, setTables] = useState<CafeTable[]>([]);

  const fetchTables = useCallback(() => {
    setTables(getTables());
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gerenciamento de Mesas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map(table => (
          <TableCard key={table.id} table={table} onUpdate={fetchTables} />
        ))}
      </div>
    </div>
  );
};

export default Tables;

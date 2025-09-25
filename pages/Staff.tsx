import React, { useState, useEffect, useCallback } from 'react';
import { getStaff, addStaff, updateStaff, deleteStaff } from '../services/apiService';
import type { StaffMember } from '../types';
import Modal from '../components/Modal';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const Staff: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formState, setFormState] = useState({ name: '', commissionRate: '5' });
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setStaffList(await getStaff());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleOpenModal = (staff: StaffMember | null = null) => {
    setEditingStaff(staff);
    if (staff) {
      setFormState({ 
        name: staff.name, 
        commissionRate: staff.commissionRate.toString(),
      });
    } else {
      setFormState({ name: '', commissionRate: '5' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const staffData = {
      name: formState.name,
      commissionRate: parseFloat(formState.commissionRate),
    };

    if (editingStaff) {
      await updateStaff({ ...editingStaff, ...staffData });
    } else {
      await addStaff(staffData);
    }
    fetchStaff();
    handleCloseModal();
  };

  const handleDelete = async (staffId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este atendente?')) {
      await deleteStaff(staffId);
      fetchStaff();
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Equipe de Atendentes</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center sm:justify-start bg-amber-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-900 transition-colors">
          <PlusCircle size={20} className="mr-2" />
          Adicionar Atendente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxa de Comissão</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={3} className="text-center py-10">Carregando...</td></tr>
            ) : staffList.map((staff) => (
              <tr key={staff.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.commissionRate}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(staff)} className="text-amber-600 hover:text-amber-900 mr-4" aria-label={`Edit ${staff.name}`}><Edit size={18} /></button>
                  <button onClick={() => handleDelete(staff.id)} className="text-red-600 hover:text-red-900" aria-label={`Delete ${staff.name}`}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingStaff ? 'Editar Atendente' : 'Adicionar Atendente'}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
              <input type="text" name="name" id="name" value={formState.name} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500" required />
            </div>
            <div>
              <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700">Taxa de Comissão (%)</label>
              <input type="number" name="commissionRate" id="commissionRate" value={formState.commissionRate} onChange={handleFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500" step="0.1" required />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
             <button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
             <button type="submit" className="bg-amber-800 text-white px-4 py-2 rounded-md hover:bg-amber-900">{editingStaff ? 'Salvar Alterações' : 'Adicionar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
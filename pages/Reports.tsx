
import React, { useState, useEffect } from 'react';
import { getSales, getProducts, getStaff } from '../services/apiService';
import { exportToPDF } from '../services/pdfService';
import type { Sale, Product, StaffMember } from '../types';
import { Download } from 'lucide-react';

type Tab = 'sales' | 'inventory' | 'commissions';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('sales');
  
  const renderContent = () => {
    switch (activeTab) {
      case 'sales': return <SalesReports />;
      case 'inventory': return <InventoryReports />;
      case 'commissions': return <CommissionReports />;
      default: return null;
    }
  };

  const tabs: {id: Tab, label: string}[] = [
      { id: 'sales', label: 'Vendas' },
      { id: 'inventory', label: 'Saída de Estoque' },
      { id: 'commissions', label: 'Comissões' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Relatórios</h1>
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                    activeTab === tab.id
                    ? 'border-amber-700 text-amber-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
                {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
};


const SalesReports: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  useEffect(() => {
    setSales(getSales());
    setProducts(getProducts());
    setStaff(getStaff());
  }, []);
  
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'N/A';
  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'N/A';

  const handleExport = () => {
    const headers = ['Data', 'Atendente', 'Total', 'Itens'];
    const data = sales.map(sale => [
      new Date(sale.date).toLocaleString('pt-BR'),
      getStaffName(sale.staffId),
      `R$ ${sale.total.toFixed(2)}`,
      sale.items.map(item => `${item.quantity}x ${getProductName(item.productId)}`).join(', ')
    ]);
    exportToPDF('Relatório de Vendas', headers, data, 'relatorio_vendas');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Todas as Vendas</h2>
        <button onClick={handleExport} className="flex items-center bg-blue-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <Download size={16} className="mr-2" /> Exportar PDF
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Atendente</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Itens</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sales.map(sale => (
            <tr key={sale.id}>
              <td className="px-4 py-2 text-sm text-gray-600">{new Date(sale.date).toLocaleString('pt-BR')}</td>
              <td className="px-4 py-2 text-sm text-gray-600">{getStaffName(sale.staffId)}</td>
              <td className="px-4 py-2 text-sm font-semibold text-gray-800">R$ {sale.total.toFixed(2)}</td>
              <td className="px-4 py-2 text-sm text-gray-600">
                {sale.items.map(item => `${item.quantity}x ${getProductName(item.productId)}`).join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const InventoryReports: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);

    useEffect(() => {
        setProducts(getProducts());
        setSales(getSales());
    }, []);

    const productSales = products.map(product => {
        const unitsSold = sales.reduce((acc, sale) => {
            const item = sale.items.find(i => i.productId === product.id);
            return acc + (item ? item.quantity : 0);
        }, 0);
        return { ...product, unitsSold };
    });

    const handleExport = () => {
      const headers = ['Produto', 'Categoria', 'Unidades Vendidas', 'Estoque Atual', 'Preço Unitário'];
      const data = productSales.map(p => [
          p.name,
          p.category,
          p.unitsSold,
          p.stock,
          `R$ ${p.price.toFixed(2)}`
      ]);
      exportToPDF('Relatório de Saída de Estoque', headers, data, 'relatorio_estoque');
    };

    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Saída de Estoque</h2>
          <button onClick={handleExport} className="flex items-center bg-blue-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <Download size={16} className="mr-2" /> Exportar PDF
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidades Vendidas</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estoque Atual</th>
            </tr>
          </thead>
          <tbody>
            {productSales.sort((a,b) => b.unitsSold - a.unitsSold).map(p => (
              <tr key={p.id}>
                <td className="px-4 py-2 text-sm font-semibold text-gray-800">{p.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{p.unitsSold}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
};


const CommissionReports: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<string>('all');

    useEffect(() => {
        setStaff(getStaff());
        setSales(getSales());
    }, []);

    const staffWithSales = staff.map(s => {
        const memberSales = sales.filter(sale => sale.staffId === s.id);
        const totalSold = memberSales.reduce((acc, sale) => acc + sale.total, 0);
        const commission = totalSold * (s.commissionRate / 100);
        return { ...s, totalSold, commission, salesCount: memberSales.length };
    });

    const filteredStaff = selectedStaff === 'all' 
        ? staffWithSales 
        : staffWithSales.filter(s => s.id === selectedStaff);

    const handleExport = () => {
      const headers = ['Atendente', 'Total Vendido', 'Taxa de Comissão', 'Comissão (R$)', 'Nº de Vendas'];
      const data = filteredStaff.map(s => [
        s.name,
        `R$ ${s.totalSold.toFixed(2)}`,
        `${s.commissionRate}%`,
        `R$ ${s.commission.toFixed(2)}`,
        s.salesCount
      ]);
      const title = selectedStaff === 'all' 
          ? 'Relatório Geral de Comissões'
          : `Relatório de Comissão - ${staff.find(s => s.id === selectedStaff)?.name}`;

      exportToPDF(title, headers, data, 'relatorio_comissoes');
    };

    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Comissões dos Atendentes</h2>
          <div className="flex items-center gap-4">
            <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} className="p-2 border rounded-lg">
                <option value="all">Todos os Atendentes</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={handleExport} className="flex items-center bg-blue-600 text-white px-3 py-2 text-sm rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              <Download size={16} className="mr-2" /> Exportar PDF
            </button>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Atendente</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Vendido</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(s => (
              <tr key={s.id}>
                <td className="px-4 py-2 text-sm font-semibold text-gray-800">{s.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">R$ {s.totalSold.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm font-bold text-green-700">R$ {s.commission.toFixed(2)} ({s.commissionRate}%)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
};


export default Reports;

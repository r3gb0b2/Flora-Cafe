
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { getSales, getTables, getProducts } from '../services/apiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Utensils, Coffee, Package } from 'lucide-react';
import type { Sale } from '../types';

const Dashboard: React.FC = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [occupiedTables, setOccupiedTables] = useState(0);
  const [topProduct, setTopProduct] = useState('N/A');
  const [salesData, setSalesData] = useState<Sale[]>([]);

  useEffect(() => {
    const sales = getSales();
    const tables = getTables();
    const products = getProducts();
    
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = sales.filter(sale => sale.date.startsWith(today));
    
    const revenue = todaysSales.reduce((acc, sale) => acc + sale.total, 0);
    setTotalRevenue(revenue);
    
    setOccupiedTables(tables.filter(t => t.status === 'occupied').length);
    
    const productSalesCount: { [key: string]: number } = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        productSalesCount[item.productId] = (productSalesCount[item.productId] || 0) + item.quantity;
      });
    });
    
    const topProductId = Object.keys(productSalesCount).sort((a, b) => productSalesCount[b] - productSalesCount[a])[0];
    const topProd = products.find(p => p.id === topProductId);
    setTopProduct(topProd ? topProd.name : 'N/A');

    setSalesData(sales);
  }, []);

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const last7DaysSales = () => {
    const salesByDay: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayString = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      salesByDay[dayString] = 0;
    }
    
    salesData.forEach(sale => {
      const saleDate = new Date(sale.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - saleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) {
        const dayString = saleDate.toLocaleDateString('pt-BR', { weekday: 'short' });
        salesByDay[dayString] += sale.total;
      }
    });

    return Object.keys(salesByDay).map(day => ({ name: day, Vendas: salesByDay[day] }));
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          title="Receita de Hoje"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="text-green-800" />}
          color="bg-green-100"
        />
        <Card 
          title="Mesas Ocupadas"
          value={occupiedTables}
          icon={<Utensils className="text-blue-800" />}
          color="bg-blue-100"
        />
        <Card 
          title="Produto Mais Vendido"
          value={topProduct}
          icon={<Coffee className="text-amber-800" />}
          color="bg-amber-100"
        />
         <Card 
          title="Total de Produtos"
          value={getProducts().length}
          icon={<Package className="text-purple-800" />}
          color="bg-purple-100"
        />
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Vendas nos Últimos 7 Dias</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={last7DaysSales()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `R$${value}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="Vendas" fill="#a16207" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;

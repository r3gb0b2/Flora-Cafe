import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import { getSales, getTables, getProducts } from '../services/apiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, Utensils, Coffee, Package } from 'lucide-react';
import type { Sale } from '../types';

const Loader: React.FC = () => (
  <div className="flex justify-center items-center h-full w-full absolute inset-0 bg-gray-50 bg-opacity-75">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-800"></div>
  </div>
);

const Dashboard: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [salesData, tablesData, productsData] = await Promise.all([
        getSales(),
        getTables(),
        getProducts(),
      ]);
      setSales(salesData);
      setTables(tablesData);
      setProducts(productsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const { totalRevenue, occupiedTables, topProduct, totalProducts } = useMemo(() => {
    if (loading) return { totalRevenue: 0, occupiedTables: 0, topProduct: 'N/A', totalProducts: 0 };
    
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = sales.filter(sale => sale.date.startsWith(today));
    
    const revenue = todaysSales.reduce((acc, sale) => acc + sale.total, 0);
    const occupied = tables.filter(t => t.status === 'occupied').length;
    
    const productSalesCount: { [key: string]: number } = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        productSalesCount[item.productId] = (productSalesCount[item.productId] || 0) + item.quantity;
      });
    });
    
    const topProductId = Object.keys(productSalesCount).sort((a, b) => productSalesCount[b] - productSalesCount[a])[0];
    const topProd = products.find(p => p.id === topProductId);
    const topProdName = topProd ? topProd.name : 'N/A';

    return {
        totalRevenue: revenue,
        occupiedTables: occupied,
        topProduct: topProdName,
        totalProducts: products.length
    };
  }, [loading, sales, tables, products]);


  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const last7DaysSales = useMemo(() => {
    const salesByDay: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayString = d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0,3);
      salesByDay[dayString] = salesByDay[dayString] || 0;
    }
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const today = new Date();
      const diffTime = today.getTime() - saleDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 6) {
        const dayString = saleDate.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0,3);
        salesByDay[dayString] = (salesByDay[dayString] || 0) + sale.total;
      }
    });

    return Object.keys(salesByDay).map(day => ({ name: day, Vendas: salesByDay[day] }));
  }, [sales]);
  
  return (
    <div className="relative">
      {loading && <Loader />}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          value={totalProducts}
          icon={<Package className="text-purple-800" />}
          color="bg-purple-100"
        />
      </div>
      
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Vendas nos Últimos 7 Dias</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={last7DaysSales}>
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
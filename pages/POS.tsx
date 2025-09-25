import React, { useState, useEffect, useCallback } from 'react';
import { getProducts, getTables, getStaff, addSale } from '../services/apiService';
import type { Product, CafeTable, StaffMember, OrderItem } from '../types';
import { PlusCircle, MinusCircle, Trash2, Search, X, CheckCircle, Loader2 } from 'lucide-react';

const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [notification, setNotification] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);

  const fetchData = useCallback(async () => {
    const [productsData, tablesData, staffData] = await Promise.all([
      getProducts(),
      getTables(),
      getStaff(),
    ]);
    setProducts(productsData);
    setTables(tablesData);
    setStaff(staffData);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categories = ['Todos', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === '') &&
    (selectedCategory === 'Todos' || p.category === selectedCategory)
  );

  const addToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    if (existingItem) {
      if (product.stock > existingItem.quantity) {
        setOrderItems(orderItems.map(item => 
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        showNotification(`Estoque de ${product.name} insuficiente.`);
      }
    } else {
      if (product.stock > 0) {
        setOrderItems([...orderItems, { productId: product.id, quantity: 1, priceAtSale: product.price }]);
      } else {
        showNotification(`Estoque de ${product.name} esgotado.`);
      }
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const item = orderItems.find(i => i.productId === productId);
    const product = products.find(p => p.id === productId);
    if (!item || !product) return;

    const newQuantity = item.quantity + delta;

    if (newQuantity > product.stock) {
      showNotification(`Estoque de ${product.name} insuficiente.`);
      return;
    }
    
    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter(i => i.productId !== productId));
    } else {
      setOrderItems(orderItems.map(i => i.productId === productId ? { ...i, quantity: newQuantity } : i));
    }
  };

  const removeFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Produto desconhecido';
  };

  const orderTotal = orderItems.reduce((acc, item) => {
    return acc + (item.priceAtSale * item.quantity);
  }, 0);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const finalizeSale = async () => {
    if (!selectedTable || !selectedStaff || orderItems.length === 0) {
      showNotification("Por favor, selecione uma mesa, um atendente e adicione itens ao pedido.");
      return;
    }
    setIsFinalizing(true);
    try {
      await addSale({
        tableId: selectedTable,
        staffId: selectedStaff,
        items: orderItems,
      });
      showNotification("Venda finalizada com sucesso!");
      setOrderItems([]);
      setSelectedTable('');
      setSelectedStaff('');
      fetchData(); // Refresh data, especially stock and table status
    } catch (error) {
      if(error instanceof Error) {
        showNotification(`Erro ao finalizar a venda: ${error.message}`);
      } else {
        showNotification(`Erro ao finalizar a venda.`);
      }
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-6rem)] gap-6">
      {notification && (
        <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg flex items-center z-50">
          <CheckCircle className="mr-2" /> {notification}
        </div>
      )}
      {/* Left side: Product Selection */}
      <div className="w-full lg:w-2/3 bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Produtos</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar produto..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border rounded-lg px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <button 
                key={product.id}
                onClick={() => addToOrder(product)}
                className="bg-gray-50 border rounded-lg p-3 text-center hover:shadow-lg hover:border-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between"
                disabled={product.stock <= 0}
              >
                <p className="font-semibold text-gray-700 truncate">{product.name}</p>
                <div>
                  <p className="text-sm text-gray-500">R$ {product.price.toFixed(2)}</p>
                  <p className={`text-xs ${product.stock > 5 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock} em estoque
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right side: Current Order */}
      <div className="w-full lg:w-1/3 bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Pedido Atual</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} className="w-full sm:w-1/2 p-2 border rounded-lg">
            <option value="">Selecione a Mesa</option>
            {tables.filter(t => t.status !== 'reserved').map(table => <option key={table.id} value={table.id}>{table.name} ({table.status})</option>)}
          </select>
          <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)} className="w-full sm:w-1/2 p-2 border rounded-lg">
            <option value="">Selecione o Atendente</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto border-t border-b py-2">
          {orderItems.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Nenhum item no pedido.</p>
          ) : (
            orderItems.map(item => (
              <div key={item.productId} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-semibold">{getProductName(item.productId)}</p>
                  <p className="text-sm text-gray-500">R$ {(item.priceAtSale * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="text-gray-600 hover:text-red-600"><MinusCircle size={20} /></button>
                  <span className="font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="text-gray-600 hover:text-green-600"><PlusCircle size={20} /></button>
                  <button onClick={() => removeFromOrder(item.productId)} className="text-gray-500 hover:text-red-700 ml-2"><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total:</span>
            <span>R$ {orderTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={finalizeSale}
            disabled={!selectedTable || !selectedStaff || orderItems.length === 0 || isFinalizing}
            className="w-full mt-4 bg-amber-800 text-white py-3 rounded-lg font-bold hover:bg-amber-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isFinalizing && <Loader2 className="animate-spin mr-2" />}
            {isFinalizing ? 'Finalizando...' : 'Finalizar Venda'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
import { INITIAL_PRODUCTS, INITIAL_STAFF, INITIAL_TABLES } from '../constants';
import type { Product, StaffMember, CafeTable, Sale, OrderItem } from '../types';

const FAKE_LATENCY = 200; // ms

const get = <T,>(key: string, fallback: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const stored = localStorage.getItem(key);
      resolve(stored ? JSON.parse(stored) : fallback);
    }, FAKE_LATENCY);
  });
};

const set = <T,>(key: string, value: T): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(value));
      resolve();
    }, FAKE_LATENCY);
  });
};


export const initializeData = () => {
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem('staff')) {
    localStorage.setItem('staff', JSON.stringify(INITIAL_STAFF));
  }
  if (!localStorage.getItem('tables')) {
    localStorage.setItem('tables', JSON.stringify(INITIAL_TABLES));
  }
  if (!localStorage.getItem('sales')) {
    localStorage.setItem('sales', JSON.stringify([]));
  }
};

// Product API
export const getProducts = (): Promise<Product[]> => get('products', []);
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const products = await get<Product[]>('products', []);
  const newProduct: Product = { ...product, id: `prod-${Date.now()}` };
  await set('products', [...products, newProduct]);
  return newProduct;
};
export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
  const products = await get<Product[]>('products', []);
  const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
  await set('products', newProducts);
  return updatedProduct;
};
export const deleteProduct = async (productId: string): Promise<void> => {
  const products = await get<Product[]>('products', []);
  await set('products', products.filter(p => p.id !== productId));
};

// Staff API
export const getStaff = (): Promise<StaffMember[]> => get('staff', []);
export const addStaff = async (staff: Omit<StaffMember, 'id'>): Promise<StaffMember> => {
  const staffList = await get<StaffMember[]>('staff', []);
  const newStaff: StaffMember = { ...staff, id: `staff-${Date.now()}` };
  await set('staff', [...staffList, newStaff]);
  return newStaff;
};
export const updateStaff = async (updatedStaff: StaffMember): Promise<StaffMember> => {
    const staffList = await get<StaffMember[]>('staff', []);
    const newStaffList = staffList.map(s => s.id === updatedStaff.id ? updatedStaff : s);
    await set('staff', newStaffList);
    return updatedStaff;
};
export const deleteStaff = async (staffId: string): Promise<void> => {
    const staffList = await get<StaffMember[]>('staff', []);
    await set('staff', staffList.filter(s => s.id !== staffId));
};


// Table API
export const getTables = (): Promise<CafeTable[]> => get('tables', []);
export const updateTableStatus = async (tableId: string, status: CafeTable['status'], orderId: string | null = null): Promise<void> => {
  const tables = await get<CafeTable[]>('tables', []);
  const newTables = tables.map(t => t.id === tableId ? { ...t, status, currentOrderId: orderId } : t);
  await set('tables', newTables);
};

// Sales API
export const getSales = (): Promise<Sale[]> => get('sales', []);
export const addSale = async (saleData: Omit<Sale, 'id' | 'date' | 'total'>): Promise<Sale> => {
  const sales = await get<Sale[]>('sales', []);
  const products = await get<Product[]>('products', []);
  
  let total = 0;
  const itemsWithPrice = saleData.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) throw new Error(`Product with id ${item.productId} not found`);
    const priceAtSale = product.price;
    total += priceAtSale * item.quantity;
    return { ...item, priceAtSale };
  });

  const newSale: Sale = {
    ...saleData,
    items: itemsWithPrice,
    id: `sale-${Date.now()}`,
    date: new Date().toISOString(),
    total,
  };
  
  // Update stock
  const updatedProducts = products.map(p => {
    const soldItem = newSale.items.find(item => item.productId === p.id);
    if (soldItem) {
      return { ...p, stock: p.stock - soldItem.quantity };
    }
    return p;
  });
  await set('products', updatedProducts);

  // Update table status
  await updateTableStatus(newSale.tableId, 'available', null);

  await set('sales', [...sales, newSale]);
  return newSale;
};
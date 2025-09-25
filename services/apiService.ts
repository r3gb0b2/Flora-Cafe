
import { INITIAL_PRODUCTS, INITIAL_STAFF, INITIAL_TABLES } from '../constants';
import type { Product, StaffMember, CafeTable, Sale, OrderItem } from '../types';

const get = <T,>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
};

const set = <T,>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const initializeData = () => {
  if (!localStorage.getItem('products')) {
    set('products', INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem('staff')) {
    set('staff', INITIAL_STAFF);
  }
  if (!localStorage.getItem('tables')) {
    set('tables', INITIAL_TABLES);
  }
  if (!localStorage.getItem('sales')) {
    set('sales', []);
  }
};

// Product API
export const getProducts = (): Product[] => get('products', []);
export const addProduct = (product: Omit<Product, 'id'>): Product => {
  const products = getProducts();
  const newProduct: Product = { ...product, id: `prod-${Date.now()}` };
  set('products', [...products, newProduct]);
  return newProduct;
};
export const updateProduct = (updatedProduct: Product): Product => {
  const products = getProducts();
  const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
  set('products', newProducts);
  return updatedProduct;
};
export const deleteProduct = (productId: string): void => {
  const products = getProducts();
  set('products', products.filter(p => p.id !== productId));
};

// Staff API
export const getStaff = (): StaffMember[] => get('staff', []);
export const addStaff = (staff: Omit<StaffMember, 'id'>): StaffMember => {
  const staffList = getStaff();
  const newStaff: StaffMember = { ...staff, id: `staff-${Date.now()}` };
  set('staff', [...staffList, newStaff]);
  return newStaff;
};
export const updateStaff = (updatedStaff: StaffMember): StaffMember => {
    const staffList = getStaff();
    const newStaffList = staffList.map(s => s.id === updatedStaff.id ? updatedStaff : s);
    set('staff', newStaffList);
    return updatedStaff;
};
export const deleteStaff = (staffId: string): void => {
    const staffList = getStaff();
    set('staff', staffList.filter(s => s.id !== staffId));
};


// Table API
export const getTables = (): CafeTable[] => get('tables', []);
export const updateTableStatus = (tableId: string, status: CafeTable['status'], orderId: string | null = null): void => {
  const tables = getTables();
  const newTables = tables.map(t => t.id === tableId ? { ...t, status, currentOrderId: orderId } : t);
  set('tables', newTables);
};

// Sales API
export const getSales = (): Sale[] => get('sales', []);
export const addSale = (saleData: Omit<Sale, 'id' | 'date' | 'total'>): Sale => {
  const sales = getSales();
  const products = getProducts();
  
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
  set('products', updatedProducts);

  // Update table status
  updateTableStatus(newSale.tableId, 'available', null);

  set('sales', [...sales, newSale]);
  return newSale;
};


export type Page = 'dashboard' | 'pos' | 'tables' | 'inventory' | 'reports' | 'staff';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface StaffMember {
  id: string;
  name: string;
  commissionRate: number; // as a percentage, e.g., 5 for 5%
}

export interface CafeTable {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId: string | null;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtSale: number;
}

export interface Sale {
  id: string;
  tableId: string;
  staffId: string;
  items: OrderItem[];
  total: number;
  date: string; // ISO 8601 format
}

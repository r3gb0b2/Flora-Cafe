
import type { Product, StaffMember, CafeTable } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod-1', name: 'Espresso', category: 'Bebidas Quentes', price: 5.00, stock: 100 },
  { id: 'prod-2', name: 'Cappuccino', category: 'Bebidas Quentes', price: 8.50, stock: 80 },
  { id: 'prod-3', name: 'Latte', category: 'Bebidas Quentes', price: 9.00, stock: 75 },
  { id: 'prod-4', name: 'Iced Coffee', category: 'Bebidas Frias', price: 7.50, stock: 60 },
  { id: 'prod-5', name: 'Frappuccino', category: 'Bebidas Frias', price: 12.00, stock: 50 },
  { id: 'prod-6', name: 'Croissant', category: 'Comidas', price: 6.00, stock: 40 },
  { id: 'prod-7', name: 'Pão de Queijo', category: 'Comidas', price: 4.00, stock: 120 },
  { id: 'prod-8', name: 'Bolo de Cenoura', category: 'Comidas', price: 8.00, stock: 30 },
];

export const INITIAL_STAFF: StaffMember[] = [
  { id: 'staff-1', name: 'Ana Silva', commissionRate: 5 },
  { id: 'staff-2', name: 'João Santos', commissionRate: 5 },
  { id: 'staff-3', name: 'Maria Oliveira', commissionRate: 6 },
];

export const INITIAL_TABLES: CafeTable[] = [
  { id: 'table-1', name: 'Mesa 1', status: 'available', currentOrderId: null },
  { id: 'table-2', name: 'Mesa 2', status: 'available', currentOrderId: null },
  { id: 'table-3', name: 'Mesa 3', status: 'occupied', currentOrderId: 'temp-order-1' },
  { id: 'table-4', name: 'Mesa 4', status: 'available', currentOrderId: null },
  { id: 'table-5', name: 'Mesa 5', status: 'available', currentOrderId: null },
  { id: 'table-6', name: 'Mesa 6', status: 'reserved', currentOrderId: null },
  { id: 'table-7', name: 'Mesa 7', status: 'available', currentOrderId: null },
  { id: 'table-8', name: 'Mesa 8', status: 'available', currentOrderId: null },
];

export const COMMISSION_RATE = 0.05; // 5% default

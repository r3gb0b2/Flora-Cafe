// Fix: Import firebase v8 SDK for types and side-effects.
import { db } from './firebase';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { INITIAL_PRODUCTS, INITIAL_STAFF, INITIAL_TABLES } from '../constants';
import type { Product, StaffMember, CafeTable, Sale, OrderItem } from '../types';

const collections = {
  products: 'products',
  staff: 'staff',
  tables: 'tables',
  sales: 'sales',
  metadata: 'metadata'
}

// Helper to convert Firestore snapshot to array
// Fix: Corrected type signature from DocumentData to firebase.firestore.QuerySnapshot
const snapshotToArray = <T>(snapshot: firebase.firestore.QuerySnapshot): T[] => {
    return snapshot.docs.map((doc: firebase.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() })) as T[];
}

// Fix: Refactored to use Firebase v8 SDK
export const initializeData = async () => {
    const metadataRef = db.collection(collections.metadata).doc('initialData');
    const metadataSnap = await metadataRef.get();

    if (metadataSnap.exists && metadataSnap.data()?.seeded) {
        console.log("Database already seeded.");
        return;
    }

    console.log("Seeding initial data into Firestore...");
    const batch = db.batch();

    INITIAL_PRODUCTS.forEach(product => {
        const docRef = db.collection(collections.products).doc();
        batch.set(docRef, { ...product, id: docRef.id });
    });

    INITIAL_STAFF.forEach(staff => {
        const docRef = db.collection(collections.staff).doc();
        batch.set(docRef, { ...staff, id: docRef.id });
    });
    
    INITIAL_TABLES.forEach(table => {
        const docRef = db.collection(collections.tables).doc();
        batch.set(docRef, { ...table, id: docRef.id });
    });
    
    batch.set(metadataRef, { seeded: true, seededAt: new Date().toISOString() });
    
    await batch.commit();
    console.log("Initial data seeded successfully.");
};


// Product API
// Fix: Refactored to use Firebase v8 SDK
export const getProducts = async (): Promise<Product[]> => {
    const snapshot = await db.collection(collections.products).get();
    return snapshotToArray<Product>(snapshot);
};
// Fix: Refactored to use Firebase v8 SDK
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const docRef = await db.collection(collections.products).add(product);
    return { ...product, id: docRef.id };
};
// Fix: Refactored to use Firebase v8 SDK
export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    const docRef = db.collection(collections.products).doc(updatedProduct.id);
    await docRef.update({ ...updatedProduct });
    return updatedProduct;
};
// Fix: Refactored to use Firebase v8 SDK
export const deleteProduct = async (productId: string): Promise<void> => {
    await db.collection(collections.products).doc(productId).delete();
};

// Staff API
// Fix: Refactored to use Firebase v8 SDK
export const getStaff = async (): Promise<StaffMember[]> => {
    const snapshot = await db.collection(collections.staff).get();
    return snapshotToArray<StaffMember>(snapshot);
};
// Fix: Refactored to use Firebase v8 SDK
export const addStaff = async (staff: Omit<StaffMember, 'id'>): Promise<StaffMember> => {
    const docRef = await db.collection(collections.staff).add(staff);
    return { ...staff, id: docRef.id };
};
// Fix: Refactored to use Firebase v8 SDK
export const updateStaff = async (updatedStaff: StaffMember): Promise<StaffMember> => {
    const docRef = db.collection(collections.staff).doc(updatedStaff.id);
    await docRef.update({ ...updatedStaff });
    return updatedStaff;
};
// Fix: Refactored to use Firebase v8 SDK
export const deleteStaff = async (staffId: string): Promise<void> => {
    await db.collection(collections.staff).doc(staffId).delete();
};

// Table API
// Fix: Refactored to use Firebase v8 SDK
export const getTables = async (): Promise<CafeTable[]> => {
    const snapshot = await db.collection(collections.tables).get();
    return snapshotToArray<CafeTable>(snapshot);
};
// Fix: Refactored to use Firebase v8 SDK
export const updateTableStatus = async (tableId: string, status: CafeTable['status'], orderId: string | null = null): Promise<void> => {
    const docRef = db.collection(collections.tables).doc(tableId);
    await docRef.update({ status, currentOrderId: orderId });
};

// Sales API
// Fix: Refactored to use Firebase v8 SDK
export const getSales = async (): Promise<Sale[]> => {
    const snapshot = await db.collection(collections.sales).get();
    return snapshotToArray<Sale>(snapshot);
};

// Fix: Refactored to use Firebase v8 SDK
export const addSale = async (saleData: Omit<Sale, 'id' | 'date' | 'total'>): Promise<Sale> => {
  try {
    const newSale = await db.runTransaction(async (transaction) => {
      let total = 0;
      const itemsWithPrice: OrderItem[] = [];

      // Process all product updates within the transaction
      for (const item of saleData.items) {
        const productRef = db.collection(collections.products).doc(item.productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists) {
          throw new Error(`Product with id ${item.productId} not found`);
        }
        
        const product = productDoc.data() as Product;
        const newStock = product.stock - item.quantity;
        if (newStock < 0) {
            throw new Error(`Estoque insuficiente para o produto: ${product.name}`);
        }

        const priceAtSale = product.price;
        total += priceAtSale * item.quantity;
        itemsWithPrice.push({ ...item, priceAtSale });
        
        transaction.update(productRef, { stock: newStock });
      }

      // Final sale object
      const saleToCreate: Omit<Sale, 'id'> = {
        ...saleData,
        items: itemsWithPrice,
        date: new Date().toISOString(),
        total,
      };

      // Add the sale document
      const saleRef = db.collection(collections.sales).doc();
      transaction.set(saleRef, saleToCreate);

      // Update table status
      const tableRef = db.collection(collections.tables).doc(saleData.tableId);
      transaction.update(tableRef, { status: 'available', currentOrderId: null });

      return { ...saleToCreate, id: saleRef.id };
    });
    
    return newSale;

  } catch (e) {
    console.error("Transaction failed: ", e);
    if (e instanceof Error) {
        throw e;
    }
    throw new Error("Ocorreu um erro ao finalizar a venda.");
  }
};
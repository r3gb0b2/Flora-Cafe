import { db } from './firebase';
// Fix: Updated Firebase import to use the scoped package for consistency.
import { 
    collection, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    writeBatch, 
    runTransaction,
    Timestamp,
} from '@firebase/firestore';
import type { QuerySnapshot, QueryDocumentSnapshot } from '@firebase/firestore';
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
const snapshotToArray = <T>(snapshot: QuerySnapshot): T[] => {
    return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() })) as T[];
}

export const initializeData = async () => {
    const metadataRef = doc(db, collections.metadata, 'initialData');
    const metadataSnap = await getDoc(metadataRef);

    if (metadataSnap.exists() && metadataSnap.data()?.seeded) {
        console.log("Database already seeded.");
        return;
    }

    console.log("Seeding initial data into Firestore...");
    const batch = writeBatch(db);

    INITIAL_PRODUCTS.forEach(product => {
        const docRef = doc(collection(db, collections.products));
        batch.set(docRef, { ...product, id: docRef.id });
    });

    INITIAL_STAFF.forEach(staff => {
        const docRef = doc(collection(db, collections.staff));
        batch.set(docRef, { ...staff, id: docRef.id });
    });
    
    INITIAL_TABLES.forEach(table => {
        const docRef = doc(collection(db, collections.tables));
        batch.set(docRef, { ...table, id: docRef.id });
    });
    
    batch.set(metadataRef, { seeded: true, seededAt: new Date().toISOString() });
    
    await batch.commit();
    console.log("Initial data seeded successfully.");
};


// Product API
export const getProducts = async (): Promise<Product[]> => {
    const productsCollection = collection(db, collections.products);
    const snapshot = await getDocs(productsCollection);
    return snapshotToArray<Product>(snapshot);
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const productsCollection = collection(db, collections.products);
    const docRef = await addDoc(productsCollection, product);
    return { ...product, id: docRef.id };
};

export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    const { id, ...productData } = updatedProduct;
    const docRef = doc(db, collections.products, id);
    await updateDoc(docRef, productData);
    return updatedProduct;
};

export const deleteProduct = async (productId: string): Promise<void> => {
    const docRef = doc(db, collections.products, productId);
    await deleteDoc(docRef);
};

// Staff API
export const getStaff = async (): Promise<StaffMember[]> => {
    const staffCollection = collection(db, collections.staff);
    const snapshot = await getDocs(staffCollection);
    return snapshotToArray<StaffMember>(snapshot);
};

export const addStaff = async (staff: Omit<StaffMember, 'id'>): Promise<StaffMember> => {
    const staffCollection = collection(db, collections.staff);
    const docRef = await addDoc(staffCollection, staff);
    return { ...staff, id: docRef.id };
};

export const updateStaff = async (updatedStaff: StaffMember): Promise<StaffMember> => {
    const { id, ...staffData } = updatedStaff;
    const docRef = doc(db, collections.staff, id);
    await updateDoc(docRef, staffData);
    return updatedStaff;
};

export const deleteStaff = async (staffId: string): Promise<void> => {
    const docRef = doc(db, collections.staff, staffId);
    await deleteDoc(docRef);
};

// Table API
export const getTables = async (): Promise<CafeTable[]> => {
    const tablesCollection = collection(db, collections.tables);
    const snapshot = await getDocs(tablesCollection);
    return snapshotToArray<CafeTable>(snapshot);
};

export const updateTableStatus = async (tableId: string, status: CafeTable['status'], orderId: string | null = null): Promise<void> => {
    const docRef = doc(db, collections.tables, tableId);
    await updateDoc(docRef, { status, currentOrderId: orderId });
};

// Sales API
export const getSales = async (): Promise<Sale[]> => {
    const salesCollection = collection(db, collections.sales);
    const snapshot = await getDocs(salesCollection);
    const salesData = snapshotToArray<any>(snapshot); // Use 'any' to handle the raw Firestore data
    
    // Convert Firestore Timestamps to ISO strings to prevent runtime errors
    return salesData.map((sale: any) => ({
        ...sale,
        date: sale.date instanceof Timestamp ? sale.date.toDate().toISOString() : sale.date,
    })) as Sale[];
};

export const addSale = async (saleData: Omit<Sale, 'id' | 'date' | 'total'>): Promise<Sale> => {
  try {
    const newSale = await runTransaction(db, async (transaction) => {
      let total = 0;
      const itemsWithPrice: OrderItem[] = [];

      // Process all product updates within the transaction
      for (const item of saleData.items) {
        const productRef = doc(db, collections.products, item.productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
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
      const saleRef = doc(collection(db, collections.sales));
      transaction.set(saleRef, saleToCreate);

      // Update table status
      const tableRef = doc(db, collections.tables, saleData.tableId);
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
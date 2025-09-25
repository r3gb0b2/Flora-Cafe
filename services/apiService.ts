import { db, firebase } from './firebase';
import { INITIAL_PRODUCTS, INITIAL_STAFF, INITIAL_TABLES } from '../constants';
import type { Product, StaffMember, CafeTable, Sale, OrderItem } from '../types';

const collections = {
  products: 'products',
  staff: 'staff',
  tables: 'tables',
  sales: 'sales',
  metadata: 'metadata'
};

// Helper to convert Firestore snapshot to array
const snapshotToArray = <T>(snapshot: firebase.firestore.QuerySnapshot): T[] => {
    return snapshot.docs.map((doc: firebase.firestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() })) as T[];
}

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
export const getProducts = async (): Promise<Product[]> => {
    const productsCollection = db.collection(collections.products);
    const snapshot = await productsCollection.get();
    return snapshotToArray<Product>(snapshot);
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const productsCollection = db.collection(collections.products);
    const docRef = await productsCollection.add(product);
    return { ...product, id: docRef.id };
};

export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    const { id, ...productData } = updatedProduct;
    const docRef = db.collection(collections.products).doc(id);
    await docRef.update(productData);
    return updatedProduct;
};

export const deleteProduct = async (productId: string): Promise<void> => {
    const docRef = db.collection(collections.products).doc(productId);
    await docRef.delete();
};

// Staff API
export const getStaff = async (): Promise<StaffMember[]> => {
    const staffCollection = db.collection(collections.staff);
    const snapshot = await staffCollection.get();
    return snapshotToArray<StaffMember>(snapshot);
};

export const addStaff = async (staff: Omit<StaffMember, 'id'>): Promise<StaffMember> => {
    const staffCollection = db.collection(collections.staff);
    const docRef = await staffCollection.add(staff);
    return { ...staff, id: docRef.id };
};

export const updateStaff = async (updatedStaff: StaffMember): Promise<StaffMember> => {
    const { id, ...staffData } = updatedStaff;
    const docRef = db.collection(collections.staff).doc(id);
    await docRef.update(staffData);
    return updatedStaff;
};

export const deleteStaff = async (staffId: string): Promise<void> => {
    const docRef = db.collection(collections.staff).doc(staffId);
    await docRef.delete();
};

// Table API
export const getTables = async (): Promise<CafeTable[]> => {
    const tablesCollection = db.collection(collections.tables);
    const snapshot = await tablesCollection.get();
    return snapshotToArray<CafeTable>(snapshot);
};

export const updateTableStatus = async (tableId: string, status: CafeTable['status'], orderId: string | null = null): Promise<void> => {
    const docRef = db.collection(collections.tables).doc(tableId);
    await docRef.update({ status, currentOrderId: orderId });
};

// Sales API
export const getSales = async (): Promise<Sale[]> => {
    const salesCollection = db.collection(collections.sales);
    const snapshot = await salesCollection.get();
    const salesData = snapshotToArray<any>(snapshot); // Use 'any' to handle the raw Firestore data
    
    // Convert Firestore Timestamps to ISO strings to prevent runtime errors
    return salesData.map((sale: any) => ({
        ...sale,
        date: sale.date instanceof firebase.firestore.Timestamp ? sale.date.toDate().toISOString() : sale.date,
    })) as Sale[];
};

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

      const saleDate = new Date();
      // Final sale object for Firestore
      const saleToCreate = {
        ...saleData,
        items: itemsWithPrice,
        date: firebase.firestore.Timestamp.fromDate(saleDate),
        total,
      };

      // Add the sale document
      const saleRef = db.collection(collections.sales).doc();
      transaction.set(saleRef, saleToCreate);

      // Update table status
      const tableRef = db.collection(collections.tables).doc(saleData.tableId);
      transaction.update(tableRef, { status: 'available', currentOrderId: null });

      // Return an object that matches the `Sale` type (with date as string)
      return {
        ...saleData,
        items: itemsWithPrice,
        total,
        date: saleDate.toISOString(),
        id: saleRef.id,
      };
    });
    
    if (!newSale) {
        throw new Error("A transação falhou e não retornou uma nova venda.");
    }
    return newSale;

  } catch (e) {
    console.error("Transaction failed: ", e);
    if (e instanceof Error) {
        throw e;
    }
    throw new Error("Ocorreu um erro ao finalizar a venda.");
  }
};
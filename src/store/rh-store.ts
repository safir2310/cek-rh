import { create } from 'zustand';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { User, Product, Notification, RHSummary, RHStatus } from '@/types/rh';

type AppView = 'login' | 'register' | 'dashboard' | 'scan' | 'add-product' | 'notifications';

interface RHStore {
  // View state
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Products state
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addBatchToProduct: (productId: string, batch: any) => void;

  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  generateNotifications: () => void;

  // RH Summary
  summary: RHSummary;
  updateSummary: () => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Pending barcode for add product
  pendingBarcode: string | null;
  setPendingBarcode: (barcode: string | null) => void;
}

// Helper function to calculate RH status based on expiry date
const calculateRHStatus = (expiryDate: Date): RHStatus => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry <= 0) {
    return 'expired';
  } else if (daysUntilExpiry <= 14) {
    return 'warning';
  }
  return 'safe';
};

// Helper function to calculate RH date (14 days before expiry)
const calculateRHDate = (expiryDate: Date): Date => {
  const rhDate = new Date(expiryDate);
  rhDate.setDate(rhDate.getDate() - 14);
  return rhDate;
};

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    barcode: '8991234567890',
    plu: 'PLU001',
    name: 'Indomie Goreng Spesial',
    description: 'Mie instan goreng rasa spesial',
    category: 'Makanan',
    batches: [
      {
        id: 'b1',
        productId: '1',
        batchNumber: 'BATCH001',
        expiryDate: new Date('2025-02-15'),
        rhDate: calculateRHDate(new Date('2025-02-15')),
        quantity: 100,
        status: calculateRHStatus(new Date('2025-02-15')),
        createdAt: new Date(),
      },
      {
        id: 'b2',
        productId: '1',
        batchNumber: 'BATCH002',
        expiryDate: new Date('2025-04-20'),
        rhDate: calculateRHDate(new Date('2025-04-20')),
        quantity: 150,
        status: calculateRHStatus(new Date('2025-04-20')),
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    barcode: '8999876543210',
    plu: 'PLU002',
    name: 'Aqua 600ml',
    description: 'Air mineral dalam kemasan 600ml',
    category: 'Minuman',
    batches: [
      {
        id: 'b3',
        productId: '2',
        batchNumber: 'BATCH003',
        expiryDate: new Date('2024-12-31'),
        rhDate: calculateRHDate(new Date('2024-12-31')),
        quantity: 200,
        status: calculateRHStatus(new Date('2024-12-31')),
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    barcode: '8995555555555',
    plu: 'PLU003',
    name: 'Susu UHT 1L',
    description: 'Susu UHT cokelat 1 liter',
    category: 'Minuman',
    batches: [
      {
        id: 'b4',
        productId: '3',
        batchNumber: 'BATCH004',
        expiryDate: new Date('2025-01-28'),
        rhDate: calculateRHDate(new Date('2025-01-28')),
        quantity: 80,
        status: calculateRHStatus(new Date('2025-01-28')),
        createdAt: new Date(),
      },
      {
        id: 'b5',
        productId: '3',
        batchNumber: 'BATCH005',
        expiryDate: new Date('2025-05-10'),
        rhDate: calculateRHDate(new Date('2025-05-10')),
        quantity: 120,
        status: calculateRHStatus(new Date('2025-05-10')),
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'warning',
    productId: '1',
    productName: 'Indomie Goreng Spesial',
    barcode: '8991234567890',
    batchNumber: 'BATCH001',
    rhDate: calculateRHDate(new Date('2025-02-15')),
    expiryDate: new Date('2025-02-15'),
    message: 'BATCH001 akan mencapai H-14 dalam 7 hari',
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: 'n2',
    type: 'expired',
    productId: '2',
    productName: 'Aqua 600ml',
    barcode: '8999876543210',
    batchNumber: 'BATCH003',
    rhDate: calculateRHDate(new Date('2024-12-31')),
    expiryDate: new Date('2024-12-31'),
    message: 'BATCH003 telah jatuh RH',
    isRead: false,
    createdAt: new Date(),
  },
];

export const useRHStore = create<RHStore>((set, get) => ({
  currentView: 'login',
  setCurrentView: (view) => set({ currentView: view }),

  user: null,
  setUser: (user) => set({ user }),

  products: mockProducts,
  setProducts: (products) => set({ products }),
  addProduct: (product) =>
    set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, updatedProduct) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updatedProduct } : p
      ),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  addBatchToProduct: (productId, batch) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId
          ? { ...p, batches: [...p.batches, batch], updatedAt: new Date() }
          : p
      ),
    })),

  notifications: mockNotifications,
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
  generateNotifications: () => {
    const { products, notifications } = get();
    const newNotifications: Notification[] = [];

    products.forEach((product) => {
      product.batches.forEach((batch) => {
        if (batch.status === 'warning' || batch.status === 'expired') {
          // Check if notification already exists for this batch
          const existingNotification = notifications.find(
            (n) => n.batchNumber === batch.batchNumber && n.productId === product.id
          );

          if (!existingNotification) {
            newNotifications.push({
              id: `notif-${Date.now()}-${Math.random()}`,
              type: batch.status === 'warning' ? 'warning' : 'expired',
              productId: product.id,
              productName: product.name,
              barcode: product.barcode,
              batchNumber: batch.batchNumber,
              rhDate: batch.rhDate,
              expiryDate: batch.expiryDate,
              message: batch.status === 'warning'
                ? `${batch.batchNumber} wajib diretur sebelum ${format(batch.rhDate, 'dd MMM yyyy', { locale: id })}`
                : `${batch.batchNumber} telah jatuh RH pada ${format(batch.rhDate, 'dd MMM yyyy', { locale: id })}`,
              isRead: false,
              createdAt: new Date(),
            });
          }
        }
      });
    });

    if (newNotifications.length > 0) {
      set((state) => ({
        notifications: [...newNotifications, ...state.notifications],
      }));
    }
  },

  summary: {
    totalSafe: 0,
    totalWarning: 0,
    totalExpired: 0,
    totalProducts: 0,
  },
  updateSummary: () => {
    const { products } = get();
    let totalSafe = 0;
    let totalWarning = 0;
    let totalExpired = 0;

    products.forEach((product) => {
      product.batches.forEach((batch) => {
        if (batch.status === 'safe') totalSafe++;
        else if (batch.status === 'warning') totalWarning++;
        else if (batch.status === 'expired') totalExpired++;
      });
    });

    set({
      summary: {
        totalSafe,
        totalWarning,
        totalExpired,
        totalProducts: products.length,
      },
    });
  },

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  pendingBarcode: null,
  setPendingBarcode: (barcode) => set({ pendingBarcode: barcode }),
}));

// Initialize summary on load
useRHStore.getState().updateSummary();

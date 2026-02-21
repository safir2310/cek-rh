// RH System Type Definitions

export type RHStatus = 'safe' | 'warning' | 'expired';

export type UserRole = 'admin' | 'gudang' | 'user';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  whatsapp: string;
  role: UserRole;
  createdAt: Date;
}

export interface ProductBatch {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate: Date;
  rhDate: Date;
  quantity: number;
  status: RHStatus;
  createdAt: Date;
}

export interface Product {
  id: string;
  barcode: string;
  plu: string;
  name: string;
  description?: string;
  category?: string;
  batches: ProductBatch[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RHSummary {
  totalSafe: number;
  totalWarning: number;
  totalExpired: number;
  totalProducts: number;
}

export interface Notification {
  id: string;
  type: 'warning' | 'expired';
  productId: string;
  productName: string;
  barcode: string;
  batchNumber: string;
  rhDate: Date;
  expiryDate: Date;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ScanResult {
  barcode?: string;
  plu?: string;
  productName?: string;
  found: boolean;
}

export const RH_STATUS_LABELS: Record<RHStatus, string> = {
  safe: 'Aman',
  warning: 'Wajib Retur (H-14)',
  expired: 'Jatuh RH',
};

export const RH_STATUS_COLORS: Record<RHStatus, string> = {
  safe: 'bg-rh-safe text-rh-safe-foreground',
  warning: 'bg-rh-warning text-rh-warning-foreground',
  expired: 'bg-rh-expired text-rh-expired-foreground',
};

export const RH_STATUS_ANIMATIONS: Record<RHStatus, string> = {
  safe: '',
  warning: 'animate-blink-warning',
  expired: 'animate-blink-expired',
};

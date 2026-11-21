/**
 * Shared Domain Types for Omni-channel Sales & POS Management System
 * Conforms to GLOSSARY.md and ADRs 0001 - 0005.
 */

export type SalesChannelType = 'POS' | 'SHOPEE' | 'LAZADA' | 'TIKTOK_SHOP' | 'WEB';

export interface SalesChannel {
  id: string;
  name: string;
  type: SalesChannelType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  basePrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  skus?: SKU[];
}

export interface SKU {
  id: string;
  productId: string;
  skuCode: string;
  barcode: string;
  name: string;
  variantAttributes: Record<string, string>;
  price: number;
  costPrice?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  inventory?: InventoryBalance;
}

export interface InventoryBalance {
  id: string;
  skuId: string;
  onHand: number;
  reserved: number;
  available: number;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod = 'CASH' | 'VIETQR';

export interface OrderItem {
  id: string;
  orderId: string;
  skuId: string;
  skuCode: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  discountAmount: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderCode: string;
  channelId: string;
  customerId?: string;
  cashierId?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountTendered?: number;
  changeGiven?: number;
  paymentReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  customer?: Customer;
  channel?: SalesChannel;
}

export interface CreatePOSOrderDTO {
  customerId?: string;
  items: {
    skuId: string;
    quantity: number;
    unitPrice: number;
    discountAmount?: number;
  }[];
  paymentMethod: PaymentMethod;
  amountTendered?: number;
  discountAmount?: number;
  notes?: string;
}

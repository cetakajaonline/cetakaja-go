// types/index.ts

// ✅ User
export interface User {
  id: number;
  name: string;
  username: string;
  phone: string;
  address: string | null;
  role?: string;
  createdAt: Date;
}

// ✅ Category
export interface Category {
  id: number;
  name: string;
  code: string;
  description: string | null;
  createdAt: Date;
}

// ✅ Setting
export interface Setting {
  id: number;
  name: string;
  description: string;
  logo?: string;
}

// ✅ ProductVariant
export interface ProductVariant {
  id: number;
  variantName: string;
  price: number;
  createdAt: Date;
  updatedAt?: Date;
  productId?: number;
}

// ✅ Product
export interface Product {
  id: number;
  name: string;
  description: string | null;
  baseCode: string;
  photo: string | null;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
  variants: ProductVariant[];
  createdAt: Date;
}

// ✅ OrderItem
export interface OrderItem {
  id: number;
  productId: number;
  variantId: number | null | undefined;
  qty: number;
  price: number;
  subtotal: number;
  product: {
    id: number;
    name: string;
  };
  variant:
    | {
        id: number;
        variantName: string;
      }
    | null
    | undefined;
}

// ✅ PaymentProof
export interface PaymentProof {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: Date;
}

// ✅ Payment
export interface Payment {
  id: number;
  method: string; // PaymentMethod enum
  amount: number;
  status: string; // PaymentStatus enum
  transactionRef: string | null;
  paidAt: Date | null;
  proofs: PaymentProof[];
  createdAt: Date;
}

// ✅ Order
export interface Order {
  id: number;
  orderNumber: string;
  status: string; // OrderStatus enum
  shippingMethod: string; // ShippingMethod enum
  paymentMethod: string; // PaymentMethod enum
  paymentStatus: string; // PaymentStatus enum
  totalAmount: number;
  notes: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  createdById: number | null | undefined;
  user: {
    id: number;
    name: string;
    username: string;
    phone: string;
    address: string | null;
  };
  createdBy?: {
    id: number;
    name: string;
    username: string;
  } | null;
  orderItems: OrderItem[];
  payments: Payment[]; // Added payments relation
}

// Sort keys for Product
export type ProductSortKey = keyof Product | "category.name";

// ✅ Form data untuk Login dan Register
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  username: string;
  password: string;
}

// ✅ Tipe standar response dari API
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// src/lib/types/index.ts

// ✅ Expense
export interface Expense {
  id: number;
  nominal: number; // Amount of the expense
  category: string; // Category of the expense (operasional, marketing, gaji, lainnya)
  date: Date; // Date of the expense
  description: string | null; // Optional description of the expense
  proofFile: string | null; // Optional path to proof file
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Order
export interface Order {
  id: number;
  orderNumber: string;
  status: "pending" | "processing" | "finished" | "canceled";
  shippingMethod: "pickup" | "delivery";
  paymentMethod: "transfer" | "qris" | "cash";
  paymentStatus: "pending" | "confirmed" | "failed" | "refunded";
  totalAmount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  createdById: number | null;

  // Relations
  user: {
    id: number;
    name: string;
    username: string;
    phone: string;
    address: string | null;
  };
  createdBy: {
    id: number;
    name: string;
    username: string;
  } | null;
  orderItems: OrderItem[];
  payments: Payment[];
}

// ✅ Order Item
export interface OrderItem {
  id: number;
  productId: number;
  variantId: number | null;
  qty: number;
  price: number;
  subtotal: number;
  notes: string | null;
  orderId?: number;

  // Relations
  product: {
    id: number;
    name: string;
  };
  variant: {
    id: number | null;
    variantName: string | null;
  } | null;
}

// ✅ Payment
export interface Payment {
  id: number;
  orderId: number;
  userId: number;
  createdById: number | null;
  method: "transfer" | "qris" | "cash";
  amount: number;
  status: "pending" | "confirmed" | "failed" | "refunded";
  transactionRef: string | null;
  paidAt: Date | null;
  createdAt: Date;

  // Relations
  proofs: PaymentProof[];
}

// ✅ Payment Proof
export interface PaymentProof {
  id: number;
  paymentId: number;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: Date;
}

// ✅ Product
export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  baseCode: string;
  photo: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  category: {
    id: number;
    name: string;
    code: string;
  };
  variants: ProductVariant[];
}

// ✅ Product Variant
export interface ProductVariant {
  id: number;
  productId: number;
  variantName: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Setting
export interface Setting {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  bankName: string | null;
  bankCode: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  qrisImage: string | null;
}

// ✅ User
export interface User {
  id: number;
  name: string;
  username: string;
  phone: string;
  role: "admin" | "staff" | "customer";
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Category
export interface Category {
  id: number;
  name: string;
  code: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Notification
export interface Notification {
  id: number;
  userId: number;
  orderId?: number;
  toNumber: string;
  message: string;
  status: "pending" | "sent" | "failed";
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user: {
    id: number;
    name: string;
    username: string;
    phone: string;
  };
  order?: {
    id: number;
    orderNumber: string;
  };
}

// ✅ Daily Report
export interface DailyReportData {
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    finished: number;
    canceled: number;
  };
  topSellingProducts: Array<{
    id: number;
    name: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  orders: Array<{
    id: number;
    orderNumber: string;
    status: "pending" | "processing" | "finished" | "canceled";
    totalAmount: number;
    createdAt: Date;
    user: {
      name: string;
    };
  }>;
  expenses: Array<{
    id: number;
    nominal: number;
    category: string;
    description: string | null;
    date: Date;
  }>;
}

// ✅ Weekly Report
export interface WeeklyReportData {
  startDate: Date;
  endDate: Date;
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    finished: number;
    canceled: number;
  };
  topSellingProducts: Array<{
    id: number;
    name: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  orders: Array<{
    id: number;
    orderNumber: string;
    status: "pending" | "processing" | "finished" | "canceled";
    totalAmount: number;
    createdAt: Date;
    user: {
      name: string;
    };
  }>;
  expenses: Array<{
    id: number;
    nominal: number;
    category: string;
    description: string | null;
    date: Date;
  }>;
}

// ✅ Product Sort Key
export type ProductSortKey =
  | "name"
  | "baseCode"
  | "createdAt"
  | "category.name";

// ✅ Auth Response
export interface AuthResponse {
  user: User;
  token: string;
}

// ✅ API Response
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ✅ Dashboard Page Data
export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  finishedOrders: number;
  canceledOrders: number;
  monthlyRevenue: Array<{
    month: string;
    total: number;
  }>;
  topSellingProducts: Array<{
    id: number;
    name: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  recentOrders: Order[];
  totalExpenses: number;
  netRevenue: number;
}

export interface DashboardPageData {
  user: User;
  users: User[];
  orders: Order[];
  products: Product[];
  expenses: Expense[];
  stats: DashboardStats;
}

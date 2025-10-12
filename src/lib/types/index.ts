// src/lib/types/index.ts

// Existing types...

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
  updatedAt: Date;
  
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

// ✅ Product Sort Key
export type ProductSortKey = 'name' | 'baseCode' | 'createdAt' | 'category.name';

// ✅ Report Types
export interface DailyReport {
  date: Date;
  orders: Order[];
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netRevenue: number;
}

export interface WeeklyReport {
  weekLabel: string;
  startDate: Date;
  endDate: Date;
  orders: Order[];
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netRevenue: number;
}

export interface MonthlyReport {
  monthLabel: string;
  startDate: Date;
  endDate: Date;
  orders: Order[];
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netRevenue: number;
}

export interface AnnualReport {
  year: number;
  orders: Order[];
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netRevenue: number;
}

export interface ProductPerformanceReport {
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  orders: Order[];
}

export interface CustomerReport {
  userId: number;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  orders: Order[];
}

export interface RevenueReport {
  period: string;
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  orders: Order[];
}

export interface ExpenseReport {
  period: string;
  startDate: Date;
  endDate: Date;
  totalExpenses: number;
  expenses: Expense[];
}

export interface AllProductsPerformanceReport {
  totalProducts: number;
  totalSold: number;
  totalRevenue: number;
  products: {
    productId: number;
    productName: string;
    totalSold: number;
    totalRevenue: number;
    orders: Order[];
  }[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface AllCustomersReport {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  customers: {
    userId: number;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
    orders: Order[];
  }[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

export interface ReportFilter {
  startDate?: Date | string;
  endDate?: Date | string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'annual' | 'product' | 'customer' | 'revenue' | 'expense';
  productId?: number;
  userId?: number;
}

export interface ReportResponse {
  reportType: string;
  data: any;
  summary: {
    total: number;
    revenue: number;
    expenses: number;
    net: number;
  };
  dateRange: {
    start: Date;
    end: Date;
  };
}

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
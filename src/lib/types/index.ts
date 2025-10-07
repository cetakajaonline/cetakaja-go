// types/index.ts

// ✅ User
export interface User {
  id: number;
  name: string;
  username: string;
  phone: string;
  address?: string;
  role?: string;
  createdAt: Date;
}

// ✅ Category
export interface Category {
  id: number;
  name: string;
  code: string;
  description?: string;
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
}

// ✅ Product
export interface Product {
  id: number;
  name: string;
  description?: string;
  baseCode: string;
  photo?: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
  variants: ProductVariant[];
  createdAt: Date;
}

// Sort keys for Product
export type ProductSortKey = keyof Product | 'category.name';

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



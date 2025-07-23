// types/index.ts

// ✅ User
export interface User {
  id: number;
  name: string;
  email: string;
  photo?: string | null;
  role?: string;
  createdAt: string;
}

// ✅ Token
export type Token = {
  id: number;
  name: string;
  token: string;
  createdBy: number;
  createdAt: string;
  revoked: boolean;
  creator?: {
    id: number;
    name: string;
    email: string;
    photo?: string;
  };
};

// ✅ Form data untuk Login dan Register
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

// ✅ Tipe standar response dari API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// ✅ Item
export interface Item {
  id: number;
  name: string;
  desc: string;
  createdAt: string;
  updatedAt: string;
}

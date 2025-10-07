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



// utils/validation.ts

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password)
  );
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}


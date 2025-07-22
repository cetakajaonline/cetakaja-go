declare global {
  namespace App {
    interface Locals {
      user?: User;
      token?: ApiToken;
    }
  }
}

export {};

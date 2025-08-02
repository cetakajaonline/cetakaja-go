import type { User, ApiToken, Item } from "$lib/types";

declare global {
  namespace App {
    interface Locals {
      user?: User;
      token?: ApiToken;
    }
    interface PageData {
      tokens: ApiToken[];
      items: Item[];
    }
  }
}
export { };

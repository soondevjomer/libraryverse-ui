import { Role } from "./auth.model";

export interface Navigation {
  name: string;
  path: string;
  role?: string[];
  icon?: string;
}

export const NAV_ITEMS: Navigation[] = [
  { name: 'Login', path: 'login', icon: 'log-in', role: [Role.Guest] },
  { name: 'Register', path: 'register', icon: 'file-pen', role: [Role.Guest] },

  { name: 'Dashboard', path: 'dashboard', icon: 'layout-dashboard', role: [Role.Librarian] },

  { name: 'Books', path: 'books', icon: 'book-open', role: [Role.Guest, Role.Reader, Role.Librarian] },
  { name: 'Create Book', path: 'books/create', icon: 'book-plus', role: [Role.Librarian] },

  { name: 'Libraries', path: 'libraries', icon: 'library', role: [Role.Guest, Role.Librarian, Role.Reader] },

  { name: 'Carts', path: 'carts', icon: 'shopping-cart', role: [Role.Reader] },

  { name: 'Orders', path: 'orders', icon: 'clipboard-list', role: [Role.Librarian, Role.Reader] },

  { name: 'Customers', path: 'customers', icon: 'users', role: [Role.Librarian] },

  { name: 'Library Sales', path: 'sales', icon: 'receipt', role: [Role.Librarian] },
];

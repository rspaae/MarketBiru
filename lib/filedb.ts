/**
 * filedb.ts — File-based in-memory database pengganti MySQL
 * Data disimpan di memori (seeded dari data statis).
 * Cocok untuk presentasi & deployment Vercel tanpa database eksternal.
 */

import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data';
import { Product, Category, Order } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DBUser {
  id: number;
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'petugas' | 'kasir' | 'siswa';
  nisn?: string | null;
  student_class?: string | null;
  whatsapp?: string | null;
  created_at: string;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_USERS: DBUser[] = [
  {
    id: 1,
    name: 'Administrator Koperasi',
    username: 'admin',
    email: 'admin@smkn11bdg.sch.id',
    password: 'admin123',
    role: 'admin',
    nisn: null,
    student_class: null,
    whatsapp: '081234567890',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Petugas Kasir 11',
    username: 'kasir',
    email: 'kasir@smkn11bdg.sch.id',
    password: 'kasir123',
    role: 'kasir',
    nisn: null,
    student_class: null,
    whatsapp: '081234567891',
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

// ─── In-Memory Store (Global Singleton) ───────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __filedb: {
    users: DBUser[];
    products: Product[];
    categories: Category[];
    orders: Order[];
    _userIdSeq: number;
    _initialized: boolean;
  } | undefined;
}

function getStore() {
  if (!global.__filedb) {
    global.__filedb = {
      users: [...SEED_USERS],
      products: [...INITIAL_PRODUCTS],
      categories: [...INITIAL_CATEGORIES],
      orders: [],
      _userIdSeq: SEED_USERS.length + 1,
      _initialized: true,
    };
  }
  return global.__filedb;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function dbGetUsers(): DBUser[] {
  return getStore().users;
}

export function dbGetUserById(id: number | string): DBUser | undefined {
  return getStore().users.find((u) => String(u.id) === String(id));
}

export function dbGetUserByCredential(identifier: string): DBUser | undefined {
  const lower = identifier.toLowerCase();
  return getStore().users.find(
    (u) =>
      u.username.toLowerCase() === lower ||
      u.email.toLowerCase() === lower ||
      (u.nisn && u.nisn === identifier)
  );
}

export function dbCreateUser(data: Omit<DBUser, 'id' | 'created_at'>): DBUser {
  const store = getStore();
  const newUser: DBUser = {
    ...data,
    id: store._userIdSeq++,
    created_at: new Date().toISOString(),
  };
  store.users.push(newUser);
  return newUser;
}

export function dbDeleteUser(id: number | string): boolean {
  const store = getStore();
  const idx = store.users.findIndex((u) => String(u.id) === String(id));
  if (idx === -1) return false;
  store.users.splice(idx, 1);
  return true;
}

export function dbUserExists(username: string, email: string, nisn?: string): boolean {
  const store = getStore();
  return store.users.some(
    (u) =>
      u.username.toLowerCase() === username.toLowerCase() ||
      u.email.toLowerCase() === email.toLowerCase() ||
      (nisn && nisn.trim() !== '' && u.nisn === nisn)
  );
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function dbGetProducts(opts?: { categoryId?: string; activeOnly?: boolean }): Product[] {
  let list = [...getStore().products];
  if (opts?.categoryId && opts.categoryId !== 'all') {
    list = list.filter((p) => p.categoryId === opts.categoryId);
  }
  if (opts?.activeOnly) {
    list = list.filter((p) => p.isActive);
  }
  return list;
}

export function dbGetProductById(id: string): Product | undefined {
  return getStore().products.find((p) => p.id === id);
}

export function dbGetProductBySlug(slug: string): Product | undefined {
  return getStore().products.find((p) => p.slug === slug);
}

export function dbCreateProduct(data: Omit<Product, 'id'>): Product {
  const store = getStore();
  const newProduct: Product = {
    ...data,
    id: `prod-${Date.now()}`,
  };
  store.products.unshift(newProduct);
  return newProduct;
}

export function dbUpdateProduct(id: string, data: Partial<Product>): Product | null {
  const store = getStore();
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  store.products[idx] = { ...store.products[idx], ...data };
  return store.products[idx];
}

export function dbDeleteProduct(id: string): boolean {
  const store = getStore();
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  store.products.splice(idx, 1);
  return true;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function dbGetCategories(): Category[] {
  return [...getStore().categories];
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function dbGetOrders(opts?: { status?: string; limit?: number; code?: string }): Order[] {
  let list = [...getStore().orders].reverse(); // newest first
  if (opts?.code) {
    return list.filter(
      (o) => o.orderCode.toUpperCase() === opts.code!.toUpperCase()
    );
  }
  if (opts?.status && opts.status !== 'all') {
    list = list.filter((o) => o.status === opts.status);
  }
  if (opts?.limit) {
    list = list.slice(0, opts.limit);
  }
  return list;
}

export function dbGetOrderById(id: string): Order | undefined {
  return getStore().orders.find((o) => o.id === id);
}

export function dbCreateOrder(order: Order): Order {
  const store = getStore();
  const idx = store.orders.findIndex((o) => o.id === order.id || o.orderCode === order.orderCode);
  if (idx !== -1) {
    store.orders[idx] = { ...store.orders[idx], ...order };
    return store.orders[idx];
  }
  store.orders.push(order);
  return order;
}

export function dbUpdateOrder(id: string, data: Partial<Order>): Order | null {
  const store = getStore();
  const idx = store.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  store.orders[idx] = {
    ...store.orders[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return store.orders[idx];
}

export function dbDeleteOrder(id: string): boolean {
  const store = getStore();
  const idx = store.orders.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  store.orders.splice(idx, 1);
  return true;
}

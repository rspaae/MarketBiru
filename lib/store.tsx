'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Category, Product, CartItem, Order, OrderStatus, PaymentStatus } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from './data';
import { AuthUser } from './auth';

interface StoreContextType {
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  cartCount: number;
  cartTotal: number;
  isHydrated: boolean;
  currentUser: AuthUser | null;
  refreshUser: () => Promise<void>;
  isStudentModalOpen: boolean;
  setIsStudentModalOpen: (open: boolean) => void;
  requireStudentAuth: (onSuccess?: () => void) => boolean;
  addToCart: (product: Product, quantity?: number) => boolean;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  createOrder: (order: Omit<Order, 'id' | 'orderCode' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  confirmPayment: (orderId: string) => void;
  deleteOrder: (orderId: string) => void;
  findOrderByCode: (code: string) => Order | undefined;
  addProduct: (product: Omit<Product, 'id' | 'slug'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;
  resetToDefault: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const pendingAuthCallback = useRef<(() => void) | null>(null);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('smkn11_current_user', JSON.stringify(data.user));
          return;
        }
      }
      setCurrentUser(null);
      localStorage.removeItem('smkn11_current_user');
    } catch {
      // Keep cached user if offline/fetch error
      const cached = localStorage.getItem('smkn11_current_user');
      if (cached) {
        try {
          setCurrentUser(JSON.parse(cached));
        } catch (_) {}
      }
    }
  };

  useEffect(() => {
    // Initial check from localStorage for zero-lag UI
    try {
      const cached = localStorage.getItem('smkn11_current_user');
      if (cached) {
        setCurrentUser(JSON.parse(cached));
      }
    } catch (_) {}

    refreshUser();
  }, []);

  /**
   * Helper to check if student is logged in.
   * If not, opens the Student Login Modal and saves the pending action to execute on login.
   */
  const requireStudentAuth = (onSuccess?: () => void): boolean => {
    const cachedUser = currentUser || (() => {
      try {
        const saved = localStorage.getItem('smkn11_current_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })();

    if (cachedUser) {
      if (!currentUser) setCurrentUser(cachedUser);
      if (onSuccess) onSuccess();
      return true;
    }
    if (onSuccess) {
      pendingAuthCallback.current = onSuccess;
    }
    setIsStudentModalOpen(true);
    return false;
  };

  // When user logs in, execute any pending action
  useEffect(() => {
    if (currentUser && pendingAuthCallback.current) {
      const fn = pendingAuthCallback.current;
      pendingAuthCallback.current = null;
      fn();
    }
  }, [currentUser]);

  // Load from LocalStorage on mount & sync with API
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('smkn11_products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedCategories = localStorage.getItem('smkn11_categories');
      if (savedCategories) setCategories(JSON.parse(savedCategories));

      const savedCart = localStorage.getItem('smkn11_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem('smkn11_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.error('Failed to load storage', e);
    } finally {
      setIsHydrated(true);
    }

    // Live sync products from API to ensure exact 7 SMKN 11 products
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products && data.products.length > 0) {
          setProducts(data.products);
          localStorage.setItem('smkn11_products', JSON.stringify(data.products));
        }
      })
      .catch(() => {});
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('smkn11_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('smkn11_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem('smkn11_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders, isHydrated]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1): boolean => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }];
    });
    return true;
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clamped = Math.min(Math.max(1, quantity), item.product.stock);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order operations
  const createOrder = (orderData: Omit<Order, 'id' | 'orderCode' | 'createdAt'>): Order => {
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `MB11-${timestamp.toString().slice(-4)}${randomSuffix}`;

    const newOrder: Order = {
      ...orderData,
      id: `ord-${timestamp}`,
      orderCode,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Decrease stock of ordered products
    setProducts((prev) =>
      prev.map((prod) => {
        const orderedItem = orderData.items.find((it) => it.productId === prod.id);
        if (orderedItem) {
          return { ...prod, stock: Math.max(0, prod.stock - orderedItem.quantity) };
        }
        return prod;
      })
    );

    // Clear cart after successful checkout
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  };

  const confirmPayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              paymentStatus: 'paid' as PaymentStatus,
              status: order.status === 'pending' ? ('processing' as OrderStatus) : order.status,
            }
          : order
      )
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  const findOrderByCode = (code: string) => {
    return orders.find(
      (o) =>
        o.orderCode.toLowerCase() === code.trim().toLowerCase() ||
        o.whatsappNumber.replace(/[^0-9]/g, '') === code.replace(/[^0-9]/g, '')
    );
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'slug'>): Product => {
    const slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      slug,
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, ...updates } : prod))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
  };

  const toggleProductActive = (id: string) => {
    setProducts((prev) =>
      prev.map((prod) => (prod.id === id ? { ...prod, isActive: !prod.isActive } : prod))
    );
  };

  const resetToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setOrders(INITIAL_ORDERS);
    setCart([]);
    localStorage.removeItem('smkn11_products');
    localStorage.removeItem('smkn11_categories');
    localStorage.removeItem('smkn11_orders');
    localStorage.removeItem('smkn11_cart');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <StoreContext.Provider
      value={{
        categories,
        products,
        cart,
        orders,
        cartCount,
        cartTotal,
        isHydrated,
        currentUser,
        refreshUser,
        isStudentModalOpen,
        setIsStudentModalOpen,
        requireStudentAuth,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        createOrder,
        updateOrderStatus,
        confirmPayment,
        deleteOrder,
        findOrderByCode,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductActive,
        resetToDefault,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

export function formatRupiah(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

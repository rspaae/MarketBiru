export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  isActive: boolean;
  categoryName?: string;
  unit?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'transfer';
export type OrderStatus = 'pending' | 'processing' | 'ready_for_pickup' | 'delivering' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderCode: string;
  studentName: string;
  studentClass: string;
  whatsappNumber: string;
  deliveryMethod: DeliveryMethod;
  deliveryFee: number;
  deliveryAddress?: string; // Classroom details
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string;
  notes?: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

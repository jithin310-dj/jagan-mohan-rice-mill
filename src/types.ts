export interface Review {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  rating: number;
  price: number; // Base price for smallest bag size
  discount: number; // Discount percentage (e.g. 10 for 10% off)
  stock: number; // Total stock in kg or bags
  category: string;
  isAddOn?: boolean;
  image: string;
  bagSizes: number[]; // Available bag weights in kg, e.g., [10, 26, 50]
  nutrition?: {
    calories: string; // per 100g
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
  reviews: Review[];
}

export interface CartItem {
  id: string; // combined product.id + "-" + selectedSize (+ optional selectedAge)
  product: Product;
  selectedSize: number; // in kg
  quantity: number;
  selectedAge?: string; // '1 Year Old' or '2 Years Old'
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  items: {
    productId: string;
    productName: string;
    size: number;
    quantity: number;
    pricePerItem: number;
    selectedAge?: string;
  }[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Out For Delivery' | 'Delivered' | 'Cancelled';
  paymentMethod: 'COD' | 'UPI' | 'Card';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  upiScreenshot?: string;
  upiTransactionId?: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  addresses: string[];
  wishlist: string[]; // Product IDs
  role: 'customer' | 'admin';
  picture?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  description?: string;
  type: 'success' | 'info' | 'error' | 'warning';
  duration?: number;
}

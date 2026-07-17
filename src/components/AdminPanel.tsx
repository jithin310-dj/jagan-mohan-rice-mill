import React, { useState } from 'react';
import { 
  TrendingUp, ShoppingBag, Users, Layers, AlertCircle, 
  Plus, Edit, Trash2, CheckCircle2, RotateCcw, Save, 
  DollarSign, Package, Star, Percent, Settings, X,
  MessageSquare, LineChart, Settings2, Eye, ExternalLink, Calendar,
  Activity, CheckCircle, Smartphone, Printer, Download
} from 'lucide-react';
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Product, Order, Review, Coupon } from '../types';
import { CATEGORIES } from '../data';
import { printOrderInvoice, downloadOrderPDF } from '../utils';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status'], paymentStatus: Order['paymentStatus']) => void;
  coupons: Coupon[];
  onAddCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (code: string) => void;
}

export default function AdminPanel({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  coupons,
  onAddCoupon,
  onDeleteCoupon
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'inventory' | 'reviews' | 'offers' | 'analytics' | 'settings'>('dashboard');

  // Add / Edit Product modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields for Products
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(60);
  const [prodDiscount, setProdDiscount] = useState(0);
  const [prodStock, setProdStock] = useState(1000);
  const [prodCategory, setProdCategory] = useState(CATEGORIES[0]);
  const [prodImage, setProdImage] = useState('');
  const [prodSizes, setProdSizes] = useState<string>('10, 26, 50');

  // Coupon state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(1000);

  // Search/Filter states inside admin
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [viewingUpiScreenshot, setViewingUpiScreenshot] = useState<string | null>(null);

  // Settings State simulation
  const [minOrderWeight, setMinOrderWeight] = useState(() => {
    return localStorage.getItem('jm_min_order_weight') || '10';
  });
  const [merchantUpiId, setMerchantUpiId] = useState(() => {
    return localStorage.getItem('jm_merchant_upi_id') || '7382299666@ybl';
  });
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(() => {
    return localStorage.getItem('jm_free_delivery_threshold') || '2000';
  });
  const [razorpayKey, setRazorpayKey] = useState(() => {
    return localStorage.getItem('jm_razorpay_key') || 'rzp_test_jaganmohan82';
  });
  const [lotusAgingPremium, setLotusAgingPremium] = useState(() => {
    return localStorage.getItem('jm_lotus_aging_premium') || '4';
  });
  const [lotusDeamPremium, setLotusDeamPremium] = useState(() => {
    return localStorage.getItem('jm_lotus_deam_premium') || '6';
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('jm_min_order_weight', minOrderWeight);
    localStorage.setItem('jm_merchant_upi_id', merchantUpiId);
    localStorage.setItem('jm_free_delivery_threshold', freeDeliveryThreshold);
    localStorage.setItem('jm_razorpay_key', razorpayKey);
    localStorage.setItem('jm_lotus_aging_premium', lotusAgingPremium);
    localStorage.setItem('jm_lotus_deam_premium', lotusDeamPremium);
    // Fire a custom event to notify other components of the price premium update instantly
    window.dispatchEvent(new Event('jm_settings_updated'));
    alert('Mill Administrative Settings saved successfully!');
  };

  // Stats Calculations
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  const totalSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const lowStockProducts = products.filter(p => p.stock < 500);

  // Extract customers dynamically from orders
  const customersMap: { [email: string]: { name: string; phone: string; address: string; ordersCount: number; totalSpent: number; lastOrderDate: string } } = {};
  orders.forEach(o => {
    const emailLower = o.email.toLowerCase();
    if (!customersMap[emailLower]) {
      customersMap[emailLower] = {
        name: o.customerName,
        phone: o.phone,
        address: o.address,
        ordersCount: 0,
        totalSpent: 0,
        lastOrderDate: o.createdAt.split('T')[0]
      };
    }
    customersMap[emailLower].ordersCount += 1;
    if (o.status !== 'Cancelled') {
      customersMap[emailLower].totalSpent += o.total;
    }
    if (o.createdAt > customersMap[emailLower].lastOrderDate) {
      customersMap[emailLower].lastOrderDate = o.createdAt.split('T')[0];
    }
  });

  // Fallback default simulation customers if no live orders exist yet
  const defaultCustomers = [
    { name: 'Dr. Madhavi L.', email: 'madhavi@med.org', phone: '08632230154', address: 'Amaravathi Road, Guntur', ordersCount: 4, totalSpent: 8500, lastOrderDate: '2026-07-09' },
    { name: 'Chandra Sekhar', email: 'cs@gmail.com', phone: '7382299666', address: 'Cobald Pet, Guntur', ordersCount: 3, totalSpent: 6200, lastOrderDate: '2026-07-08' },
    { name: 'Srinivas Rao', email: 'srinivas@gmail.com', phone: '9440523120', address: 'Broadipet 4th Lane, Guntur', ordersCount: 2, totalSpent: 4800, lastOrderDate: '2026-07-07' },
    { name: 'Rama Lakshmi', email: 'ramalakshmi@yahoo.com', phone: '9848123456', address: 'Syamala Nagar, Guntur', ordersCount: 1, totalSpent: 2900, lastOrderDate: '2026-07-02' }
  ];

  const customersList = Object.keys(customersMap).map(email => ({
    email,
    ...customersMap[email]
  }));

  const finalCustomers = customersList.length > 0 ? customersList : defaultCustomers;
  const filteredCustomers = finalCustomers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  // Extract all product reviews in one flat list for management
  const reviewsList: { productId: string; productName: string; reviewId: string; userName: string; email: string; rating: number; comment: string; date: string }[] = [];
  products.forEach(p => {
    if (p.reviews) {
      p.reviews.forEach(r => {
        reviewsList.push({
          productId: p.id,
          productName: p.name,
          reviewId: r.id,
          userName: r.userName,
          email: r.userEmail,
          rating: r.rating,
          comment: r.comment,
          date: r.date
        });
      });
    }
  });

  // Modal Open Handlers
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdDesc(product.description);
    setProdPrice(product.price);
    setProdDiscount(product.discount);
    setProdStock(product.stock);
    setProdCategory(product.category);
    setProdImage(product.image);
    setProdSizes(product.bagSizes.join(', '));
    setIsModalOpen(true);
  };

  const handleStartAdd = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice(60);
    setProdDiscount(0);
    setProdStock(1000);
    setProdCategory(CATEGORIES[0]);
    setProdImage('/assets/logo.jpeg');
    setProdSizes('10, 26, 50');
    setIsModalOpen(true);
  };

  // Form Submission Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sizeArray = prodSizes
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((num) => !isNaN(num) && num > 0);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `jm-${Date.now()}`,
      name: prodName,
      description: prodDesc,
      price: prodPrice,
      discount: prodDiscount,
      stock: prodStock,
      category: prodCategory,
      image: prodImage || '/assets/logo.jpeg',
      bagSizes: sizeArray.length > 0 ? sizeArray : [10, 26, 50],
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviews: editingProduct ? editingProduct.reviews : [],
      nutrition: editingProduct?.nutrition || {
        calories: '350 kcal',
        protein: '7.0g',
        carbs: '80g',
        fat: '0.5g',
        fiber: '1.2g'
      }
    };

    if (editingProduct) {
      onUpdateProduct(productPayload);
    } else {
      onAddProduct(productPayload);
    }

    setIsModalOpen(false);
  };

  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const coupon: Coupon = {
      code: newCouponCode.trim().toUpperCase(),
      type: newCouponType,
      value: newCouponValue,
      minOrderValue: newCouponMinOrder
    };

    onAddCoupon(coupon);
    setNewCouponCode('');
    setNewCouponValue(10);
    setNewCouponMinOrder(1000);
    alert(`Coupon Code ${coupon.code} added successfully!`);
  };

  const handleDeleteReview = (productId: string, reviewId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (confirm('Are you sure you want to delete this customer review?')) {
      const updatedReviews = product.reviews.filter(r => r.id !== reviewId);
      const avgRating = updatedReviews.length > 0
        ? Number((updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(1))
        : 5.0;

      onUpdateProduct({
        ...product,
        reviews: updatedReviews,
        rating: avgRating
      });
    }
  };
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Delete this order permanently?")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "orders", orderId));

      // 👇 PASTE THIS HERE
      const saved = localStorage.getItem("jm_orders_fallback");

      if (saved) {
        const orders: Order[] = JSON.parse(saved);

        const updated = orders.filter(o => o.id !== orderId);

        localStorage.setItem(
          "jm_orders_fallback",
          JSON.stringify(updated)
        );
      }

      alert("Order deleted successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to delete order.");
    }
  };
    

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Upper Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-accent-gold flex items-center gap-1.5 leading-none mb-1">
            <Activity className="w-3 h-3 animate-pulse" /> Guntur Mill Central Command
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-950 uppercase tracking-tight italic">
            Mill Administrative Terminal
          </h2>
          <p className="text-xs text-gray-500 mt-1">Configure varieties, verify UPI vouchers, manage coupons, and dispatch grain bags.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleStartAdd}
            className="bg-primary-green hover:bg-primary-green-dark text-white text-[11px] uppercase tracking-widest font-bold px-5 py-3 rounded-full shadow-lg shadow-primary-green/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Rice Variety
          </button>
        </div>
      </div>

      {/* Modern Horizontal Navigation Tabs */}
      <div className="flex overflow-x-auto pb-1.5 border-b border-gray-100 gap-2 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'products', label: 'Products', icon: Layers },
          { id: 'orders', label: 'Orders Ledger', icon: ShoppingBag },
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'reviews', label: 'Reviews', icon: MessageSquare },
          { id: 'offers', label: 'Offers / Coupons', icon: Percent },
          { id: 'analytics', label: 'Analytics', icon: LineChart },
          { id: 'settings', label: 'Mill Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'bg-primary-green text-white shadow-sm shadow-primary-green/20' 
                  : 'text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Metrics KPI Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Milled Sales</span>
              <h4 className="text-xl font-serif font-black text-gray-950">₹{totalSales.toLocaleString('en-IN')}</h4>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">● Fresh Guntur Ledgers</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Shipments Placed</span>
              <h4 className="text-xl font-serif font-black text-gray-950">{orders.length} Orders</h4>
              <p className="text-[10px] text-gray-400 mt-1">{completedOrders.length} Completed dispatches</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Awaiting Dispatch</span>
              <h4 className="text-xl font-serif font-black text-amber-600">{pendingOrdersCount} Pending</h4>
              <p className="text-[10px] text-amber-600 font-semibold mt-1">Requires packaging checks</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Low Stock Grains</span>
              <h4 className="text-xl font-serif font-black text-red-600">{lowStockProducts.length} Varieties</h4>
              <p className="text-[10px] text-red-600 font-semibold mt-1">Below 500 kg threshold</p>
            </div>

          </div>

          {/* Quick Info Alerts & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Actions Rail */}
            <div className="lg:col-span-1 bg-gradient-to-br from-primary-green to-primary-green-dark text-white rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="font-serif font-bold text-lg text-white">Mill Status Feed</h3>
              <p className="text-xs text-gray-200 leading-relaxed">
                Welcome to Jagan Mohan Mill command deck. Currently operating Guntur Delta double polishing machines. 
                Ensure to dispatch orders quickly to guarantee same-day transit.
              </p>
              <div className="pt-2 divide-y divide-white/10 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <span>Mill Steam Boilers:</span>
                  <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">Online</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span>Active Packaging Staff:</span>
                  <span className="text-white font-bold">12 Operators</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span>Merchant UPI Gateway:</span>
                  <span className="text-accent-gold font-mono font-bold">{merchantUpiId}</span>
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-serif font-bold text-[#1A1A1A] text-base">Recent Shipments Log</h3>
              {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs italic">
                  No orders placed yet. Simulate an order in the store checkout view.
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left divide-y divide-gray-100">
                    <thead>
                      <tr className="text-gray-400 font-bold uppercase text-[9px] tracking-wider pb-2">
                        <th className="pb-2">Invoice</th>
                        <th className="pb-2">Buyer</th>
                        <th className="pb-2">Net Value</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-[#1A1A1A]">
                      {orders.slice(0, 5).map(ord => (
                        <tr key={ord.id} className="hover:bg-bg-cream/10">
                          <td className="py-3 font-mono font-bold text-primary-green">{ord.id}</td>
                          <td>
                            <span className="font-bold block">{ord.customerName}</span>
                            <span className="text-[10px] text-gray-400">{ord.phone}</span>
                          </td>
                          <td className="font-bold">₹{ord.total}</td>
                          <td>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              ord.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => setActiveTab('orders')}
                              className="text-primary-green hover:underline font-bold text-[10px]"
                            >
                              Manage Ledger
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: PRODUCTS MANAGER */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h3 className="font-serif font-bold text-[#1A1A1A] text-base">Active Crop Catalogue</h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Total Listed: {products.length} Varieties</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse text-gray-600">
              <thead>
                <tr className="border-b border-gray-150 font-bold uppercase text-[9px] text-gray-400 tracking-wider">
                  <th className="py-2.5">Crop Details</th>
                  <th>Category</th>
                  <th>Base Price/kg</th>
                  <th>Discount</th>
                  <th>Mill Stock</th>
                  <th>Rating</th>
                  <th className="text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-bg-cream/10">
                    <td className="py-3 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-9 h-9 rounded-md object-cover flex-shrink-0" onError={(e) => { e.currentTarget.src = "/assets/logo.jpeg"; }} />
                      <div>
                        <strong className="text-gray-900 block font-sans text-xs">{p.name}</strong>
                        <span className="text-[10px] text-gray-400 font-semibold">Bags: {p.bagSizes.map(s => s === 0.5 ? '500g' : `${s}kg`).join(', ')}</span>
                      </div>
                    </td>
                    <td><span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-semibold">{p.category}</span></td>
                    <td className="font-bold text-gray-800">₹{p.price}</td>
                    <td className="text-emerald-700 font-bold">{p.discount > 0 ? `${p.discount}% OFF` : 'None'}</td>
                    <td>
                      <span className={`font-semibold ${p.stock < 500 ? 'text-red-600 font-extrabold' : 'text-gray-700'}`}>
                        {p.stock} kg
                      </span>
                    </td>
                    <td className="text-yellow-500 font-bold">★ {p.rating}</td>
                    <td className="text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="p-1 text-gray-500 hover:text-primary-green hover:bg-gray-50 rounded-full cursor-pointer"
                          title="Edit pricing/stock"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full cursor-pointer"
                          title="Delete crop entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: COMPREHENSIVE ORDERS LEDGER */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-4">
            <div>
              <h3 className="font-serif font-bold text-gray-950 text-base">Comprehensive Mill Shipments Ledger</h3>
              <p className="text-xs text-gray-500">Track Guntur destination deliveries and verify manual UPI screenshots.</p>
            </div>
            <div>
              <input
                type="text"
                placeholder="Search by invoice, phone, or name..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="text-xs p-2.5 px-3.5 bg-gray-50 border border-gray-250 rounded-full focus:outline-none focus:border-primary-green w-64 text-[#1A1A1A]"
              />
            </div>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-6 text-center">No orders have been recorded in the database yet.</p>
          ) : (
            <div className="space-y-4">
              {orders
                .filter(o => 
                  o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                  o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                  o.phone.includes(orderSearch)
                )
                .map((o) => (
                  <div key={o.id} className="border border-gray-150 rounded-3xl overflow-hidden shadow-xs bg-white text-xs">
                    
                    {/* Invoice Banner Header */}
                    <div className="bg-bg-cream/30 p-4 border-b border-gray-150 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-3">
                        <strong className="text-primary-green font-mono font-bold text-sm">{o.id}</strong>
                        <span className="text-gray-400">By: {o.customerName} ({o.phone})</span>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">{o.createdAt.split('T')[0]}</span>
                      </div>
                      
                      <div className="flex gap-2 items-center flex-wrap">
                        <button
                          type="button"
                          onClick={() => downloadOrderPDF(o)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer border border-emerald-200"
                          title="Download official mill PDF invoice directly"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PDF
                        </button>

                        <button
                          type="button"
                          onClick={() => printOrderInvoice(o)}
                          className="bg-[#0B4A3A] hover:bg-[#0B4A3A]/90 text-white px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md mr-2 cursor-pointer"
                          title="Print official mill invoice to PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print Invoice
                        </button>
                        {o.status === "Delivered" && o.paymentStatus === "Paid" && (
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(o.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
                            title="Delete this order permanently"
                          >
                            🗑 Delete Order
                          </button>
                        )}

                        <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">Status:</span>
                        <select
                          value={o.status}
                          onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as Order['status'], o.paymentStatus)}
                          className="bg-white border border-gray-250 text-xs px-2.5 py-1 rounded-full focus:outline-none focus:border-primary-green font-bold cursor-pointer text-gray-700"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Out For Delivery">Out For Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <select
                          value={o.paymentStatus}
                          onChange={(e) => onUpdateOrderStatus(o.id, o.status, e.target.value as Order['paymentStatus'])}
                          className={`border text-xs px-2.5 py-1 rounded-full focus:outline-none font-bold cursor-pointer ${
                            o.paymentStatus === 'Paid' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-orange-50 border-orange-200 text-orange-700'
                          }`}
                        >
                          <option value="Pending">Unpaid / Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </div>
                    </div>

                    {/* Details Rows */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Destination Shipping */}
                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destination Shipping Address</span>
                        <p className="text-[#1A1A1A] leading-tight font-medium">{o.address}</p>
                        {o.notes && (
                          <div className="mt-2 bg-amber-50/50 p-2 border border-amber-100 text-amber-800 rounded-xl">
                            <strong>Buyer Note:</strong> {o.notes}
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400 font-semibold pt-1">Email: {o.email}</p>
                      </div>

                      {/* Items Purchased */}
                      <div className="space-y-1">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Milled Items Purchased</span>
                        <div className="divide-y divide-gray-50">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between py-1 text-gray-700 font-medium">
                              <span>{it.productName} ({it.size}kg × {it.quantity})</span>
                              <span className="font-bold text-slate-900">₹{it.pricePerItem * it.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 pt-2 flex justify-between items-center font-serif font-black text-primary-green">
                          <span>Total Invoice:</span>
                          <span>₹{o.total}</span>
                        </div>
                      </div>

                      {/* UPI Proof verification section */}
                      <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Channel Verification</span>
                        <div className="space-y-1">
                          <p className="text-gray-700 font-semibold">Method: <span className="font-bold text-slate-900">{o.paymentMethod}</span></p>
                          <p className="text-gray-700 font-semibold">Payment Status: 
                            <span className={`ml-1 font-extrabold ${o.paymentStatus === 'Paid' ? 'text-green-600' : 'text-amber-600'}`}>
                              {o.paymentStatus}
                            </span>
                          </p>
                        </div>

                        {o.paymentMethod === 'UPI' && (
                          <div className="bg-gray-50 border border-gray-150 p-3 rounded-2xl space-y-2 text-[11px] text-gray-600">
                            <span className="font-bold text-slate-800 block">UPI Transaction Verification:</span>
                            {o.upiTransactionId ? (
                              <p className="font-mono bg-white p-1 rounded border text-slate-900">TXN: {o.upiTransactionId}</p>
                            ) : (
                              <p className="text-[10px] text-gray-400 italic">No transaction code supplied</p>
                            )}

                            {o.upiScreenshot ? (
                              <div className="space-y-2">
                                <span className="text-[10px] text-emerald-700 font-bold block">✓ Screenshot receipt uploaded!</span>
                                <button
                                  type="button"
                                  onClick={() => setViewingUpiScreenshot(o.upiScreenshot || null)}
                                  className="w-full bg-primary-green/10 text-primary-green hover:bg-primary-green hover:text-white transition-all py-1.5 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Receipt Image
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic block">No screenshot coupon uploaded</span>
                            )}

                            {o.paymentStatus !== 'Paid' && (
                              <button
                                type="button"
                                onClick={() => onUpdateOrderStatus(o.id, o.status, 'Paid')}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg font-bold transition-all text-[10px] uppercase tracking-wider cursor-pointer mt-1"
                              >
                                Approve Payment (Mark Paid)
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: CUSTOMERS LEDGER */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-3">
            <div>
              <h3 className="font-serif font-bold text-gray-950 text-base">Milled Grains Customer Directory</h3>
              <p className="text-xs text-gray-500">Overview of customers registered or who placed orders at Cobald Pet mill.</p>
            </div>
            <div>
              <input
                type="text"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="text-xs p-2 px-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-primary-green w-56 text-[#1A1A1A]"
              />
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left divide-y divide-gray-100">
              <thead>
                <tr className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                  <th className="py-2">Customer Profile</th>
                  <th>Guntur Contact</th>
                  <th>Order Frequency</th>
                  <th>Accumulated Value</th>
                  <th>Last Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-slate-800">
                {filteredCustomers.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-bg-cream/10">
                    <td className="py-3">
                      <span className="font-bold text-gray-950 block">{cust.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{cust.email}</span>
                    </td>
                    <td>
                      <span className="font-semibold block">{cust.phone}</span>
                      <span className="text-[10px] text-gray-400 truncate max-w-xs block">{cust.address}</span>
                    </td>
                    <td className="font-bold text-primary-green">{cust.ordersCount} Purchases</td>
                    <td className="font-bold">₹{cust.totalSpent.toLocaleString('en-IN')}</td>
                    <td className="text-gray-400 font-semibold">{cust.lastOrderDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 5: INVENTORY & QUICK STOCK CORRECTION */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-orange-50 border border-orange-200 text-orange-950 p-4 rounded-3xl text-xs flex gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-orange-700 shrink-0" />
            <div>
              <span className="font-bold block text-sm mb-0.5">Silviculture Stock alerts</span>
              <p className="leading-relaxed">
                Repackaging stock lines below 500 kg require quick replenishment. Double polishing boilers can dispatch 1000 kg bags instantly.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-serif font-bold text-gray-950 text-base">Bulk Grain Stock Corrections</h3>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left divide-y divide-gray-100">
                <thead>
                  <tr className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-2.5">Crop Details</th>
                    <th>Current Price</th>
                    <th>Current Stock Level</th>
                    <th>Correction Adjustment</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-slate-800">
                  {products.map((p) => {
                    return (
                      <tr key={p.id} className="hover:bg-bg-cream/10">
                        <td className="py-3 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover shrink-0" onError={(e) => { e.currentTarget.src = "/assets/logo.jpeg"; }} />
                          <div>
                            <strong className="text-gray-900 block text-xs">{p.name}</strong>
                            <span className="text-[10px] text-gray-400 font-semibold">{p.category}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">₹</span>
                            <input
                              key={`${p.id}-price-${p.price}`}
                              type="number"
                              defaultValue={p.price}
                              onBlur={(e) => {
                                const newPrice = Number(e.target.value);
                                if (newPrice > 0 && newPrice !== p.price) {
                                  onUpdateProduct({ ...p, price: newPrice });
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const newPrice = Number((e.target as HTMLInputElement).value);
                                  if (newPrice > 0 && newPrice !== p.price) {
                                    onUpdateProduct({ ...p, price: newPrice });
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }
                              }}
                              className="w-12 border border-gray-200 rounded p-1 text-center text-xs font-bold bg-gray-50 focus:outline-none focus:border-primary-green focus:bg-white transition-all"
                            />
                            <span className="text-[10px] text-gray-400">/kg</span>
                          </div>
                        </td>
                        <td>
                          <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            p.stock < 500 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {p.stock} kg
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              onClick={() => onUpdateProduct({ ...p, stock: p.stock + 100 })}
                              className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              +100kg
                            </button>
                            <button
                              onClick={() => onUpdateProduct({ ...p, stock: p.stock + 500 })}
                              className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              +500kg
                            </button>
                            <button
                              onClick={() => onUpdateProduct({ ...p, stock: p.stock + 1000 })}
                              className="bg-gray-100 hover:bg-emerald-500 hover:text-white px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
                            >
                              +1000kg
                            </button>
                          </div>
                        </td>
                        <td className="text-right">
                          <input
                            type="number"
                            placeholder="Set Stock"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = Number((e.target as HTMLInputElement).value);
                                if (val >= 0) {
                                  onUpdateProduct({ ...p, stock: val });
                                  (e.target as HTMLInputElement).value = '';
                                  alert(`Stock for ${p.name} corrected to ${val} kg!`);
                                }
                              }
                            }}
                            className="w-20 border border-gray-200 rounded p-1 text-xs text-center placeholder-gray-300"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 6: REVIEWS MANAGER */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 animate-fade-in">
          <div className="pb-2 border-b border-gray-50">
            <h3 className="font-serif font-bold text-gray-950 text-base">Consumer Reviews Moderation</h3>
            <p className="text-xs text-gray-500">Moderate and audit customer feedback comments left on milling varieties.</p>
          </div>

          {reviewsList.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-6 text-center">No crop reviews exist in database.</p>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left divide-y divide-gray-100">
                <thead>
                  <tr className="text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="py-2">Milled Variety</th>
                    <th>User / Reviewer</th>
                    <th>Rating Stars</th>
                    <th>Comment Snippet</th>
                    <th>Date</th>
                    <th className="text-right">Moderate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-slate-800">
                  {reviewsList.map((rev, idx) => (
                    <tr key={idx} className="hover:bg-bg-cream/10">
                      <td className="py-3 font-bold text-primary-green">{rev.productName}</td>
                      <td>
                        <span className="font-bold block">{rev.userName}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{rev.email}</span>
                      </td>
                      <td>
                        <div className="flex text-yellow-500 font-bold items-center gap-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                          <span className="text-slate-700 ml-1">({rev.rating})</span>
                        </div>
                      </td>
                      <td className="max-w-xs truncate italic text-gray-600 font-medium">"{rev.comment}"</td>
                      <td className="text-gray-400 font-semibold">{rev.date}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDeleteReview(rev.productId, rev.reviewId)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                          title="Purge review feedback"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 7: PROMOTIONS & OFFERS */}
      {activeTab === 'offers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Add Coupon Panel */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs h-fit space-y-4">
            <h3 className="font-serif font-bold text-gray-950 text-base border-b border-gray-50 pb-2">Create Promotional Offer</h3>
            
            <form onSubmit={handleAddCouponSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. GUNTURGOLD20"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary-green font-mono uppercase font-bold text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Discount Calculation Type *</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setNewCouponType('percentage')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      newCouponType === 'percentage' 
                        ? 'bg-primary-green/10 border-primary-green text-primary-green' 
                        : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCouponType('fixed')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      newCouponType === 'fixed' 
                        ? 'bg-primary-green/10 border-primary-green text-primary-green' 
                        : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    Flat Rupee (₹)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Min Order Value (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newCouponMinOrder}
                    onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                    className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-green hover:bg-primary-green-dark text-white text-[10px] uppercase tracking-widest font-bold py-3.5 rounded-full transition-colors cursor-pointer shadow-lg shadow-primary-green/10"
              >
                Launch Promo Coupon
              </button>
            </form>
          </div>

          {/* Active Coupons List */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-gray-950 text-base border-b border-gray-50 pb-2">Active Promotional Coupons</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((c) => (
                <div key={c.code} className="border border-dashed border-primary-green/20 rounded-2xl p-5 bg-bg-cream/10 relative overflow-hidden flex flex-col min-h-[180px]">
                  {/* Decorative notch */}
                  <div className="absolute top-1/2 -left-2 w-4 h-4 bg-white rounded-full border-r border-gray-150 transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white rounded-full border-l border-gray-150 transform -translate-y-1/2"></div>

                  <div className="space-y-1">
                    <span className="font-mono font-bold text-xs bg-primary-green text-white px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">
                      {c.code}
                    </span>
                    <p className="text-xs font-serif font-bold text-slate-800 pt-1">
                      {c.type === 'percentage' ? `${c.value}% discount` : `₹${c.value} OFF`}
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold">Min basket order value: ₹{c.minOrderValue}</p>
                  </div>

                  {/* {/* <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
                      ● Active coupon
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Active Coupon
                    </span> */}
                                        
                  {/* </div> */} 
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 8: ADVANCED PERFORMANCE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Average Ticket Value (AOV)</span>
                <DollarSign className="w-4 h-4 text-primary-green" />
              </div>
              <h4 className="text-xl font-serif font-black text-gray-950">
                ₹{orders.length > 0 ? Math.round(totalSales / orders.length) : '4,850'}
              </h4>
              <p className="text-[10px] text-gray-400 font-semibold">Average order size per Guntur shipment</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Client Conversion Rate</span>
                <Smartphone className="w-4 h-4 text-primary-green" />
              </div>
              <h4 className="text-xl font-serif font-black text-gray-950">3.4%</h4>
              <p className="text-[10px] text-emerald-600 font-semibold">↑ 12% increase this billing cycle</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Active Customer Lifetime (CLV)</span>
                <Users className="w-4 h-4 text-primary-green" />
              </div>
              <h4 className="text-xl font-serif font-black text-gray-950">₹14,500</h4>
              <p className="text-[10px] text-gray-400 font-semibold">Average total purchases per customer</p>
            </div>

          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-6 text-xs">
            <h3 className="font-serif font-bold text-gray-950 text-base">Crop Category Purchase Share</h3>
            
            <div className="space-y-4">
              {[
                { name: 'Jagan Mohan Signature Series', share: 45, sales: totalSales * 0.45 },
                { name: 'BPT & BPT Silk Rice', share: 25, sales: totalSales * 0.25 },
                { name: 'Health diet Low-GI Rice', share: 15, sales: totalSales * 0.15 },
                { name: 'Organic Millets & Addons', share: 10, sales: totalSales * 0.10 },
                { name: 'Specialty Rice varieties', share: 5, sales: totalSales * 0.05 }
              ].map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between font-bold text-gray-700">
                    <span>{cat.name}</span>
                    <span>{cat.share}% (₹{Math.round(cat.sales).toLocaleString('en-IN')})</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary-green h-full rounded-full" style={{ width: `${cat.share}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 9: MILL CONFIGURATION SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 max-w-2xl mx-auto animate-fade-in">
          <h3 className="font-serif font-bold text-gray-950 text-base border-b border-gray-50 pb-2 mb-4">Guntur Headquarters Console Settings</h3>
          
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Minimum Order Weight Target (kg)</label>
                <input
                  type="number"
                  required
                  value={minOrderWeight}
                  onChange={(e) => setMinOrderWeight(e.target.value)}
                  className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary-green font-bold text-[#1A1A1A]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Checkout weight must satisfy this to proceed (defaults to 10kg).</span>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Active Merchant UPI ID</label>
                <input
                  type="text"
                  required
                  value={merchantUpiId}
                  onChange={(e) => setMerchantUpiId(e.target.value)}
                  className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary-green font-bold text-[#1A1A1A]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">UPI QR code payments will route to this VPA.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Free Delivery Threshold Value (₹)</label>
                <input
                  type="number"
                  required
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary-green font-bold text-[#1A1A1A]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Orders above this receive free dispatch.</span>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Razorpay API Secret Key</label>
                <input
                  type="text"
                  required
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary-green font-mono font-bold text-[#1A1A1A]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Pre-configured Merchant keys.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-amber-600 font-bold mb-1 uppercase tracking-widest text-[9px]">Intelligent Ageing Premium (₹/kg)</label>
                <input
                  type="number"
                  required
                  value={lotusAgingPremium}
                  onChange={(e) => setLotusAgingPremium(e.target.value)}
                  className="w-full p-2.5 px-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl focus:outline-none focus:border-primary-green font-bold text-[#1A1A1A]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Surcharge per kg applied for 2 Years Old aged Lotus Sona Masoori Rice.</span>
              </div>

              <div>
                <label className="block text-amber-600 font-bold mb-1 uppercase tracking-widest text-[9px]">Deam Ageing Premium (₹/kg)</label>
                <input
                  type="number"
                  required
                  value={lotusDeamPremium}
                  onChange={(e) => setLotusDeamPremium(e.target.value)}
                  className="w-full p-2.5 px-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl focus:outline-none focus:border-primary-green font-bold text-[#1A1A1A]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Surcharge per kg applied for Deam aged Lotus Sona Masoori Rice.</span>
              </div>
            </div>

            <div className="border-t border-gray-50 pt-4 flex justify-end">
              <button
                type="submit"
                className="bg-primary-green hover:bg-primary-green-dark text-white text-[10px] uppercase tracking-widest font-bold py-3.5 px-6 rounded-full shadow-lg shadow-primary-green/10 transition-colors cursor-pointer"
              >
                Save Administrative Configurations
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Product ADD/EDIT Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif font-bold text-lg text-gray-950 mb-5 border-b border-gray-50 pb-2">
              {editingProduct ? 'Edit Crop Details' : 'Add New Rice Variety'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Crop Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary-green text-[#1A1A1A]"
                  placeholder="E.g. Jagan Mohan Rose Supreme"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Category *</label>
                <select
                  value={prodCategory}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setProdCategory(newCat);
                    if (!editingProduct) {
                      if (['Health & Diet Rice', 'Basmati Rice'].includes(newCat)) {
                        setProdSizes('0.5, 1, 2, 5, 10');
                      } else if (['Millets', 'Specialty Rice & Rice Products'].includes(newCat)) {
                        setProdSizes('0.5, 1, 2, 5');
                      } else {
                        setProdSizes('10, 26, 50');
                      }
                    }
                  }}
                  className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none font-bold text-gray-700 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Base Price (₹/kg) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Discount % *</label>
                  <input
                    type="number"
                    required
                    value={prodDiscount}
                    onChange={(e) => setProdDiscount(Number(e.target.value))}
                    className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Initial Stock (kg) *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Bag Sizes (kg) *</label>
                  <input
                    type="text"
                    required
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-[#1A1A1A]"
                    placeholder="E.g. 10, 26, 50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Crop Image (Upload File or URL)</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none text-[#1A1A1A]"
                    placeholder="Paste Unsplash food/grain photo link or custom URL"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Or Upload File:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProdImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-gray-500 cursor-pointer file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-primary-green/10 file:text-primary-green hover:file:bg-primary-green/20"
                    />
                  </div>
                  {prodImage && prodImage.startsWith('data:') && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-emerald-600 font-bold">✓ Local image uploaded successfully!</span>
                      <button
                        type="button"
                        onClick={() => setProdImage('')}
                        className="text-[9px] text-red-500 font-bold underline"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1 uppercase tracking-widest text-[9px]">Crop Description *</label>
                <textarea
                  required
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full p-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none resize-none text-[#1A1A1A]"
                  placeholder="Grain size length, age, swelling ratio, etc."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-green hover:bg-primary-green-dark text-white text-[11px] uppercase tracking-widest font-bold py-3.5 rounded-full shadow-lg shadow-primary-green/10 transition-colors cursor-pointer"
              >
                {editingProduct ? 'Save Crop Configuration' : 'Release To Market Listing'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UPI Screenshot Lightbox Modal Dialog */}
      {viewingUpiScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 text-center space-y-4">
            <button
              onClick={() => setViewingUpiScreenshot(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer p-1 bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-serif font-bold text-gray-950 text-sm">manual UPI receipt image proof</h4>
            <div className="max-h-[70vh] overflow-hidden rounded-2xl border border-gray-150">
              <img src={viewingUpiScreenshot} alt="UPI Payment Screenshot proof" className="w-full h-auto object-contain mx-auto" />
            </div>
            <p className="text-[10px] text-gray-400">Review payment reference ID and amounts with Guntur Bank lines before approving.</p>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { ShieldCheck, Truck, CheckCircle2, QrCode, CreditCard, Landmark, ClipboardList, Send, Mail, Smartphone } from 'lucide-react';
import { Coupon, CartItem, Order } from '../types';

interface CheckoutProps {
  cartItems: CartItem[];
  appliedCoupon: Coupon | null;
  totalWeight: number;
  deliveryCharge: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onPlaceOrder: (order: Order) => void;
  onCancel: () => void;
}

export default function Checkout({
  cartItems,
  appliedCoupon,
  totalWeight,
  deliveryCharge,
  customerName,
  customerEmail,
  customerPhone,
  onPlaceOrder,
  onCancel
}: CheckoutProps) {
  // Form fields
  const [name, setName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail);
  const [phone, setPhone] = useState(customerPhone);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'Card'>('COD');

  // UPI transaction fields
  const [upiTxId, setUpiTxId] = useState('');
  const [upiScreenshotBase64, setUpiScreenshotBase64] = useState<string>('');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPay' | 'PhonePe' | 'Paytm'>('GPay');
  
  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Checkout flow state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);



  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpiScreenshotBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Totals calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const discountedPrice = Math.round(item.product.price * (1 - item.product.discount / 100));
    return acc + discountedPrice * item.selectedSize * item.quantity;
  }, 0);

  let couponDiscountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      couponDiscountValue = Math.round(subtotal * (appliedCoupon.value / 100));
    } else if (appliedCoupon.type === 'fixed') {
      couponDiscountValue = appliedCoupon.value;
    }
  }
  const bagCharge = cartItems.reduce((total, item) => {
    console.log(item.product.name, item.selectedSize, item.product.category);

    const isRice = item.product.category !== "Millets";

    if (
      isRice &&
      (item.selectedSize === 5 || item.selectedSize === 10)
    ) {
      return total + (5 * item.quantity);
    }

    return total;
  }, 0);

  const grandTotal = Math.max(0, subtotal - couponDiscountValue + deliveryCharge + bagCharge);

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!name.trim()) tempErrors.name = 'Full name is required';
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Please enter a valid email address';
    if (!phone.trim() || phone.length < 10) tempErrors.phone = '10-digit mobile number is required';
    if (!address.trim()) tempErrors.address = 'Detailed delivery address in Guntur is required';
    if (paymentMethod === 'UPI' && !upiTxId.trim()) tempErrors.upiTxId = 'UPI Transaction ID is required for verification';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const completeOrder = (method: 'COD' | 'UPI' | 'Card', payStatus: 'Pending' | 'Paid') => {
    const orderItems = cartItems.map(item => {
      const discountedPrice = Math.round(item.product.price * (1 - item.product.discount / 100));
      return {
        productId: item.product.id,
        productName: item.selectedAge ? `${item.product.name} (${item.selectedAge})` : item.product.name,
        size: item.selectedSize,
        quantity: item.quantity,
        pricePerItem: discountedPrice * item.selectedSize,
        selectedAge: item.selectedAge
      };
    });

    const orderId = 'JMM-' + Math.floor(100000 + Math.random() * 900000);
    
    const newOrder: Order = {
      id: orderId,
      customerName: name,
      email: email,
      phone: phone,
      address: address,
      notes: notes,
      items: orderItems,
      subtotal: subtotal,
      discount: couponDiscountValue,
      deliveryCharge: deliveryCharge,
      total: grandTotal,
      status: 'Pending',
      paymentMethod: method,
      paymentStatus: payStatus,
      upiTransactionId: method === 'UPI' ? upiTxId : undefined,
      upiScreenshot: method === 'UPI' ? upiScreenshotBase64 : undefined,
      createdAt: new Date().toISOString()
    };

    setPlacedOrder(newOrder);
    setIsSuccess(true);
    setIsSubmitting(false);
    onPlaceOrder(newOrder);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      completeOrder(paymentMethod, "Pending");
    }, 1200);
  };

  // Render Order Confirmation Page / Success Screen
  if (isSuccess && placedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-11 h-11" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">Order Successfully Placed!</h2>
          <p className="text-sm text-gray-500">
            Thank you for shopping with <strong>Jagan Mohan Rice Mill</strong>. Your grains will be freshly bagged and loaded.
          </p>
          <div className="inline-block bg-bg-cream border border-primary-green/5 px-4 py-2 rounded-full text-xs font-bold font-mono text-primary-green">
            Order Reference: {placedOrder.id}
          </div>
        </div>

        {/* Dynamic delivery time and address summary */}
        <div className="bg-white rounded-3xl border border-primary-green/5 p-6 text-left space-y-4 shadow-xs max-w-xl mx-auto">
          <h4 className="font-serif font-bold text-[#1A1A1A] text-sm border-b border-gray-100 pb-3 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary-green" />
            <span>Delivery details</span>
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block uppercase tracking-widest text-[9px] font-bold">Consignee Name</span>
              <strong className="text-gray-800">{placedOrder.customerName}</strong>
            </div>
            <div>
              <span className="text-gray-400 block uppercase tracking-widest text-[9px] font-bold">Contact Phone</span>
              <strong className="text-gray-800">{placedOrder.phone}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 block uppercase tracking-widest text-[9px] font-bold">Shipping Destination</span>
              <strong className="text-gray-800 leading-tight block mt-0.5">{placedOrder.address}</strong>
            </div>
            <div>
              <span className="text-gray-400 block uppercase tracking-widest text-[9px] font-bold">Scheduled Arrival</span>
              <strong className="text-primary-green flex items-center gap-1 mt-0.5">
                <Truck className="w-4 h-4" /> Within One Day (Express)
              </strong>
            </div>
            <div>
              <span className="text-gray-400 block uppercase tracking-widest text-[9px] font-bold">Payment Method</span>
              <strong className="text-accent-gold mt-0.5 block capitalize">{placedOrder.paymentMethod} • {placedOrder.paymentStatus}</strong>
            </div>
          </div>
        </div>

        {/* Razorpay Integration Preparation notice & email simulation placeholder */}
        <div className="bg-bg-cream/40 p-5 rounded-3xl border border-primary-green/5 max-w-xl mx-auto text-xs text-gray-500 space-y-3.5 leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-800 font-bold justify-center">
            <Mail className="w-4 h-4 text-primary-green" />
            <span>Simulated Mail Delivery</span>
          </div>
          <p>
            An automated email receipt with the invoice has been dispatched to <strong className="text-gray-700">{placedOrder.email}</strong>.
          </p>
          <div className="border-t border-gray-100 pt-3">
            <p className="font-bold text-gray-650 uppercase tracking-widest text-[10px] flex items-center justify-center gap-1">
              <Send className="w-3.5 h-3.5 text-primary-green" /> Mill Dispatch Center Active
            </p>
            <p className="mt-1 text-[11px]">
              Jagan Mohan Mill administrators have received your order details and are preparing packaging. Guntur stock status for products updated successfully.
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={onCancel} // Back to catalog home
            className="bg-primary-green hover:bg-primary-green-dark text-white text-[11px] uppercase tracking-widest font-bold px-8 py-3.5 rounded-full shadow-lg shadow-primary-green/10 transition-all cursor-pointer"
          >
            Continue Browsing Varieties
          </button>
        </div>
      </div>
    );
  }  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6">
        Secure Mill Checkout
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form and Payment Columns */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
          
          {/* Shipping Address Section */}
          <div className="bg-white p-6 rounded-3xl border border-primary-green/5 shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-gray-900 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary-green" />
              <span>Consignee & Shipping Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full text-xs p-3 bg-bg-cream/20 border rounded-2xl focus:outline-none focus:bg-white transition-all ${
                    errors.name ? 'border-red-400 focus:border-red-400' : 'border-primary-green/10 focus:border-primary-green'
                  }`}
                  placeholder="E.g. Jagan Mohan Rao"
                />
                {errors.name && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Mobile Phone *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  className={`w-full text-xs p-3 bg-bg-cream/20 border rounded-2xl focus:outline-none focus:bg-white transition-all ${
                    errors.phone ? 'border-red-400 focus:border-red-400' : 'border-primary-green/10 focus:border-primary-green'
                  }`}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.phone}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full text-xs p-3 bg-bg-cream/20 border rounded-2xl focus:outline-none focus:bg-white transition-all ${
                    errors.email ? 'border-red-400 focus:border-red-400' : 'border-primary-green/10 focus:border-primary-green'
                  }`}
                  placeholder="Enter email (optional)"
                />
                {errors.email && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.email}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Guntur Delivery Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className={`w-full text-xs p-3 bg-bg-cream/20 border rounded-2xl focus:outline-none focus:bg-white transition-all resize-none ${
                    errors.address ? 'border-red-400 focus:border-red-400' : 'border-primary-green/10 focus:border-primary-green'
                  }`}
                  placeholder="House No, Street name, Land Mark, Guntur, AP - 522002"
                />
                {errors.address && <span className="text-[10px] text-red-500 font-bold mt-1 block">{errors.address}</span>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Order Packing & Dispatch Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-3 bg-bg-cream/20 border border-primary-green/10 rounded-2xl focus:outline-none focus:bg-white focus:border-primary-green transition-all"
                  placeholder="E.g. Pack in dry single bags, deliver after 10 AM, etc."
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection Column (UPI Only) */}
          <div className="bg-white p-6 rounded-3xl border border-primary-green/5 shadow-xs space-y-5">
            <h3 className="font-serif font-bold text-gray-900 text-base border-b border-gray-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-green" />
              <span>Choose Payment Method</span>
            </h3>

            {/* <div className="p-4 rounded-2xl border-2 border-primary-green bg-green-50 text-center">
              <h4 className="font-bold text-primary-green">
                Cash on Delivery
              </h4>

              <p className="text-sm text-gray-600 mt-2">
                Pay when your order is delivered.
              </p>
            </div> */}

            {/* <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-300 text-center">
              <p className="text-[13px] text-yellow-800 leading-relaxed font-serif">
                <strong>Cash on Delivery</strong>
                <br />
                Pay the delivery person when your order is delivered.
              </p>

              <p className="mt-3 text-lg font-bold text-primary-green">
                Amount to Pay: ₹{grandTotal}
              </p>
            </div> */}

          {/* <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-yellow-800">
              Cash on Delivery
            </h3>

            <p className="mt-2 text-gray-700">
              Pay the delivery person when your order arrives.
            </p>

            <p className="mt-4 text-xl font-bold text-primary-green">
              Amount to Pay: ₹{grandTotal}
            </p>
          </div> */}
          {paymentMethod === "COD" && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-yellow-800">
                Cash on Delivery
              </h3>

              <p className="mt-2 text-gray-700">
                Pay the delivery person when your order arrives.
              </p>

              <p className="mt-4 text-xl font-bold text-primary-green">
                Amount to Pay: ₹{grandTotal}
              </p>
            </div>
          )}
          </div>

        </form>

        {/* Invoice Cost Column summary */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-primary-green/5 p-6 shadow-sm space-y-6">
          <h3 className="font-serif font-bold text-gray-900 text-base border-b border-gray-100 pb-3">Purchase Invoice</h3>

          {/* Items Summary list */}
          <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const discountedPrice = Math.round(item.product.price * (1 - item.product.discount / 100));
              return (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="min-w-0 flex-grow pr-3">
                    <span className="block font-bold text-gray-800 truncate flex items-center gap-1">
                      <span>{item.product.name}</span>
                      {item.selectedAge && (
                        <span className="text-[8px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">
                          {item.selectedAge}
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {item.selectedSize === 0.5 ? '500gms' : `${item.selectedSize}kg`} Bag × {item.quantity}
                    </span>
                  </div>
                  <strong className="text-gray-900 shrink-0">₹{discountedPrice * item.selectedSize * item.quantity}</strong>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-650">
            <div className="flex justify-between">
              <span>Items Total weight</span>
              <strong className="text-gray-850">{totalWeight.toFixed(1)} kg</strong>
            </div>

            <div className="flex justify-between">
              <span>Raw Subtotal</span>
              <strong className="text-gray-850">₹{subtotal}</strong>
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon Applied ({appliedCoupon.code})</span>
                <span>- ₹{couponDiscountValue}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Double-Aged Dispatch Fee</span>
              <strong className="text-gray-850">
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </strong>
            </div>
            {bagCharge > 0 && (
              <div className="flex justify-between">
                <span>Bag Charge</span>
                <strong className="text-gray-850">₹{bagCharge}</strong>
              </div>
            )}
            </div>

          {/* Grand Total */}
          <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
            <span className="text-sm font-bold text-gray-850">Invoice Total</span>
            <span className="text-2xl font-sans font-extrabold text-primary-green-dark">₹{grandTotal}</span>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-primary-green hover:bg-primary-green-dark text-white text-[11px] uppercase tracking-widest font-bold py-3.5 px-4 rounded-full shadow-lg shadow-primary-green/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <span>PROCURING STOCK...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>PLACE SECURE ORDER</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-white hover:bg-gray-50 text-gray-600 border border-primary-green/5 text-[11px] uppercase tracking-widest font-bold py-2.5 px-4 rounded-full transition-all cursor-pointer text-center"
          >
            Go Back To Cart
          </button>
        </div>
      </div>
    </div>
  );
}

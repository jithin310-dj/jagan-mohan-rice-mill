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
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'Card'>('UPI');

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
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Valid email is required';
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
                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full text-xs p-3 bg-bg-cream/20 border rounded-2xl focus:outline-none focus:bg-white transition-all ${
                    errors.email ? 'border-red-400 focus:border-red-400' : 'border-primary-green/10 focus:border-primary-green'
                  }`}
                  placeholder="E.g. buyer@gmail.com"
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
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`p-4 rounded-2xl border-2 transition-all font-bold ${
                  paymentMethod === "UPI"
                    ? "border-primary-green bg-green-50 text-primary-green"
                    : "border-gray-200"
                }`}
              >
                UPI Payment
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`p-4 rounded-2xl border-2 transition-all font-bold ${
                  paymentMethod === "COD"
                    ? "border-primary-green bg-green-50 text-primary-green"
                    : "border-gray-200"
                }`}
              >
                Cash on Delivery
              </button>
            </div>

            {paymentMethod === "UPI" ? (
              <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-500/10 text-center">
                <p className="text-[11px] text-emerald-800 leading-relaxed font-serif">
                  <strong>Jagan Mohan Rice Mill</strong> operates on <strong>Direct UPI payments</strong> for quick billing, instant milling queues, and express local dispatch.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-300 text-center">
                <p className="text-[13px] text-yellow-800 leading-relaxed font-serif">
                  <strong>Cash on Delivery Selected</strong>
                  <br />
                  Pay the delivery person when your order is delivered.
                </p>
              </div>
            )}

            {/* Paytm Styled QR Card */}
            {paymentMethod === "UPI" && (
            <div className="flex flex-col items-center justify-center py-4 bg-gray-50/50 rounded-3xl border border-gray-200/60 p-6 space-y-6">
           
              {/* Interactive UPI App Selector */}
              <div className="w-full space-y-3">
                <span className="block text-[11px] uppercase tracking-wider font-extrabold text-gray-400 text-center">Select Your UPI App</span>
                <div className="grid grid-cols-3 gap-2">
                  {/* Google Pay */}
                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('GPay')}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedUpiApp === 'GPay'
                        ? 'bg-blue-50/55 border-[#4285F4] text-[#4285F4] shadow-xs'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.67-.35-1.37-.35-2.09z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span className="text-xs font-bold font-sans">GPay</span>
                  </button>

                  {/* PhonePe */}
                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('PhonePe')}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedUpiApp === 'PhonePe'
                        ? 'bg-[#5f259f]/5 border-[#5f259f] text-[#5f259f] shadow-xs'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#5f259f] text-white flex items-center justify-center text-[10px] font-black">₹</div>
                    <span className="text-xs font-bold font-sans">PhonePe</span>
                  </button>

                  {/* Paytm */}
                  <button
                    type="button"
                    onClick={() => setSelectedUpiApp('Paytm')}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedUpiApp === 'Paytm'
                        ? 'bg-sky-50 border-[#002e6e] text-[#002e6e] shadow-xs'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-[10px] font-sans font-black tracking-tighter bg-[#00baf2] text-white px-1 py-0.5 rounded-xs leading-none uppercase">paytm</span>
                    <span className="text-xs font-bold font-sans">Paytm</span>
                  </button>
                </div>
              </div>

              {/* Deep Link Redirection button */}
              <div className="w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => {
                    const upiId = 'paytmqr5xxrp9@ptys';
                    const payeeName = encodeURIComponent('Jagan Mohan Rice Mill');
                    const amount = grandTotal;
                    let link = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=Order%20Payment`;
                    if (selectedUpiApp === 'PhonePe') {
                      link = `phonepe://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=Order%20Payment`;
                    } else if (selectedUpiApp === 'Paytm') {
                      link = `paytmmp://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR&tn=Order%20Payment`;
                    }
                    window.location.href = link;
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] cursor-pointer ${
                    selectedUpiApp === 'GPay' ? 'bg-[#4285F4] hover:bg-[#357AE8] shadow-blue-500/10' :
                    selectedUpiApp === 'PhonePe' ? 'bg-[#5f259f] hover:bg-[#4d1e82] shadow-[#5f259f]/10' :
                    'bg-[#002e6e] hover:bg-[#00204d] shadow-[#002e6e]/10'
                  }`}
                >
                  <Smartphone className="w-4.5 h-4.5" />
                  <span>Pay with {selectedUpiApp === 'GPay' ? 'Google Pay' : selectedUpiApp === 'PhonePe' ? 'PhonePe' : 'Paytm'}</span>
                </button>
              </div>

              {/* Paytm Styled QR Card */}
              <div className="w-full max-w-xs bg-white rounded-2xl border-2 border-[#002e6e] overflow-hidden shadow-lg flex flex-col items-center relative">
                {/* Paytm blue top header */}
                <div className="w-full bg-[#002e6e] py-3.5 px-4 text-center flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-sans font-extrabold text-white text-lg tracking-tight">paytm</span>
                    <span className="text-white text-[10px] uppercase font-bold tracking-wider bg-sky-500 px-1.5 py-0.2 rounded-sm">Accepted Here</span>
                  </div>
                </div>

                {/* QR Code container */}
                <div className="p-5 flex flex-col items-center justify-center bg-white w-full">
                  <div className="border-4 border-sky-100 p-2.5 rounded-2xl bg-white relative group">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=paytmqr5xxrp9@ptys&pn=Jagan Mohan Rice Mill&am=${grandTotal}&cu=INR`)}`} 
                      alt="Paytm QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                    {/* Scanning visual focus */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-sky-500/40 rounded-2xl pointer-events-none transition-all duration-300"></div>
                  </div>
                  
                  {/* UPI ID display */}
                  <div className="mt-4 text-center space-y-1">
                    <span className="text-[10px] text-gray-400 block uppercase tracking-widest font-bold">Paytm UPI ID</span>
                    <div className="flex items-center justify-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                      <code className="text-xs font-mono font-bold text-gray-800">paytmqr5xxrp9@ptys</code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('paytmqr5xxrp9@ptys');
                          alert('UPI ID copied to clipboard!');
                        }}
                        className="p-1 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded transition-colors text-[10px] font-bold uppercase"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer logos */}
                <div className="w-full border-t border-gray-150 bg-gray-50 py-2.5 px-4 flex items-center justify-between text-gray-400 text-[10px] font-bold font-mono">
                  <span className="text-[#002e6e] font-sans">BHIM UPI</span>
                  <span className="text-gray-400 font-sans uppercase">All UPI Apps Accepted</span>
                </div>
              </div>

              <div className="text-center space-y-1 max-w-sm">
                <h4 className="font-serif font-bold text-xs text-gray-900 uppercase tracking-wider">How to pay?</h4>
                <p className="text-[11px] text-gray-500 leading-normal">
                  Click the payment button above to pay directly from your phone, or scan this Paytm QR code using any UPI App to prefill <strong className="text-primary-green">₹{grandTotal}</strong>, and enter the Reference ID below.
                </p>
              </div>

              {/* Manual UPI reference forms */}
              <div className="w-full border-t border-gray-200 pt-5">
                <div className="max-w-md mx-auto">
                  <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">UPI Transaction Reference ID *</label>
                  <input
                    type="text"
                    value={upiTxId}
                    onChange={(e) => setUpiTxId(e.target.value)}
                    placeholder="Enter 12-digit UPI Ref/UTR No"
                    className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:border-primary-green text-[#1A1A1A] font-mono text-center font-bold tracking-wider ${
                      errors.upiTxId ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.upiTxId && (
                    <span className="text-[9px] text-red-500 font-bold mt-1 block leading-tight text-center">{errors.upiTxId}</span>
                  )}
                  <span className="text-[9px] text-gray-400 mt-1 block text-center">Mandatory for payment confirmation and queue billing.</span>
                </div>
              
              </div>
            </div>
          )}
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

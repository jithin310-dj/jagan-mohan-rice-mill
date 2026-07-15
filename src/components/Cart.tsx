import React, { useState } from 'react';
import { ShoppingBag, Trash2, ArrowRight, Ticket, Info, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';
import { CartItem, Coupon } from '../types';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (appliedCoupon: Coupon | null, totalWeight: number, deliveryCharge: number) => void;
  onContinueShopping: () => void;
  coupons: Coupon[];
}

export default function Cart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
  coupons
}: CartProps) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Calculate Subtotal & Total Weight in kg
  const subtotal = cartItems.reduce((acc, item) => {
    const discountedPrice = Math.round(item.product.price * (1 - item.product.discount / 100));
    return acc + discountedPrice * item.selectedSize * item.quantity;
  }, 0);

  const totalWeight = cartItems.reduce((acc, item) => {
    return acc + item.selectedSize * item.quantity;
  }, 0);

  // Delivery Charges Tier:
  // 10-14kg -> ₹30
  // 15-49kg -> ₹20
  // 50kg+ -> FREE
  // Min Order 10kg is required to checkout.
  let deliveryCharge = 0;
  if (totalWeight >= 10 && totalWeight < 15) {
    deliveryCharge = 30;
  } else if (totalWeight >= 15 && totalWeight < 50) {
    deliveryCharge = 20;
  } else if (totalWeight >= 50) {
    deliveryCharge = 0;
  } else {
    // Under 10kg, default delivery estimation shown but checkout blocked
    deliveryCharge = 30;
  }

  // Calculate Discount Value
  let couponDiscountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      couponDiscountValue = Math.round(subtotal * (appliedCoupon.value / 100));
    } else if (appliedCoupon.type === 'fixed') {
      couponDiscountValue = appliedCoupon.value;
    }
  }
  const riceCategories = [
    "Jagan Mohan Rice",
    "Health & Diet Rice",
    "BPT & BPT Silk Rice",
    "Basmati Rice",
    "Specialty Rice & Rice Products",
  ];

  const bagCharge = cartItems.reduce((total, item) => {
    const isRice = riceCategories.includes(item.product.category);

    if (isRice && (Number(item.selectedSize) === 5 || Number(item.selectedSize) === 10)) {
      return total + (5 * item.quantity);
    }

    return total;
  }, 0);

  const grandTotal = Math.max(0,subtotal - couponDiscountValue + deliveryCharge + bagCharge);
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponCode.trim()) return;

    const matched = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());

    if (!matched) {
      setCouponError('Invalid coupon code. Try JAGANMOHAN10.');
      setAppliedCoupon(null);
      return;
    }

    if (subtotal < matched.minOrderValue) {
      setCouponError(`Min order value to apply this coupon is ₹${matched.minOrderValue}.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(matched);
    if (matched.type === 'percentage') {
      setCouponSuccess(`Success! ${matched.value}% discount applied to order.`);
    } else {
      setCouponSuccess(`Success! Flat ₹${matched.value} discount applied to order.`);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const isMinOrderSatisfied = totalWeight >= 10;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingBag className="w-7 h-7 text-primary-green" />
        <span>Your Shopping Cart</span>
      </h2>

      {cartItems.length === 0 ? (
        <div id="empty-cart-state" className="text-center py-16 bg-white rounded-3xl border border-primary-green/5 max-w-xl mx-auto p-8 shadow-xs">
          <div className="w-16 h-16 bg-bg-cream rounded-full flex items-center justify-center mx-auto mb-4 text-primary-green">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-gray-800 text-lg mb-2">Your cart is currently empty</h3>
          <p className="text-xs text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">
            Explore our rich catalog of signature rices, aged BPT, and high-calcium organic millets to add to your pantry.
          </p>
          <button
            onClick={onContinueShopping}
            className="bg-primary-green hover:bg-primary-green-dark text-white text-[11px] uppercase tracking-widest font-bold px-8 py-3.5 rounded-full transition-all cursor-pointer shadow-md shadow-primary-green/10"
          >
            Start Shopping Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Weight limit announcement banner */}
            <div className={`p-4 rounded-3xl border flex items-start gap-3 ${
              isMinOrderSatisfied
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {isMinOrderSatisfied ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-bold">
                  {isMinOrderSatisfied 
                    ? 'Minimum Order Satisfied!' 
                    : `Minimum Order Limit is 10kg (You have ${totalWeight.toFixed(1)}kg)`
                  }
                </p>
                <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                  {isMinOrderSatisfied 
                    ? `Great job! Your current order weight is ${totalWeight.toFixed(1)}kg. You qualify for checkout.`
                    : `Please add ${ (10 - totalWeight).toFixed(1) }kg of rice or add-on products to unlock Guntur home delivery.`
                  }
                </p>
                
                {/* Weight meter bar */}
                <div className="w-full bg-black/10 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isMinOrderSatisfied ? 'bg-emerald-600' : 'bg-amber-500'}`} 
                    style={{ width: `${Math.min(100, (totalWeight / 10) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-primary-green/5 divide-y divide-gray-150 overflow-hidden">
              {cartItems.map((item) => {
                const discountedPrice = Math.round(item.product.price * (1 - item.product.discount / 100));
                const itemTotal = discountedPrice * item.selectedSize * item.quantity;
                return (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-primary-green/5">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = "/assets/logo.jpeg";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5 flex-wrap">
                          <span>{item.product.name}</span>
                          {item.selectedAge && (
                            <span className="text-[9px] font-sans px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/50 font-bold uppercase tracking-wide">
                              {item.selectedAge}
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5 tracking-wider">
                          {item.product.category} • {item.selectedSize === 0.5 ? '500gms' : `${item.selectedSize}kg`} Bag
                        </p>
                        <div className="mt-1.5">
                          <span className="text-[11px] text-primary-green-dark font-extrabold bg-primary-green/5 px-2 py-0.5 rounded border border-primary-green/10 inline-block">
                            ₹{discountedPrice} / kg
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-primary-green/10 rounded-full bg-bg-cream/40">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="px-2.5 py-1 text-gray-500 hover:text-primary-green font-bold text-sm cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-700 min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-gray-500 hover:text-primary-green font-bold text-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Cumulative pack weight display */}
                      <div className="text-right min-w-[70px]">
                        <span className="block text-xs text-gray-400">Total Pack</span>
                        <span className="text-xs font-bold text-gray-850">
                          {item.selectedSize * item.quantity < 1 
                            ? `${item.selectedSize * item.quantity * 1000}g` 
                            : `${(item.selectedSize * item.quantity).toFixed(1).replace(/\.0$/, '')} kg`}
                        </span>
                      </div>

                      {/* Item Subtotal */}
                      <div className="text-right min-w-[85px]">
                        <span className="block text-xs text-gray-400">Subtotal</span>
                        <span className="text-sm font-sans font-extrabold text-primary-green-dark">₹{itemTotal}</span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Tiers Help Card */}
            <div className="bg-bg-cream/40 p-4 rounded-3xl border border-primary-green/5 flex gap-3.5">
              <Truck className="w-5 h-5 text-primary-green shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600">
                <span className="font-bold text-gray-800 block mb-1">Guntur Shipping Tier Estimates</span>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <li>• 10-14 kg Bag weight: <strong>₹30 Charge</strong></li>
                  <li>• 15-49 kg Bag weight: <strong>₹20 Charge</strong></li>
                  <li>• 50 kg+ Bag weight: <strong>FREE Delivery</strong></li>
                </ul>
                <p className="mt-2 text-[10px] text-gray-400 italic">★ Fast Home Delivery guaranteed within 24 hours of order confirmation!</p>
              </div>
            </div>

          </div>

          {/* Pricing Summary Side Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-primary-green/5 p-6 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-gray-900 text-base border-b border-gray-100 pb-3">Order Cost Breakdown</h3>
            
            {/* Coupon Code Input */}
            <div>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                    className="w-full text-xs p-2.5 bg-bg-cream/30 border border-primary-green/5 rounded-full px-4 focus:outline-none focus:border-primary-green disabled:bg-gray-100 uppercase text-gray-800"
                  />
                  <Ticket className="w-4 h-4 text-gray-400 absolute right-4 top-3" />
                </div>
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full border border-red-200 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="bg-primary-green hover:bg-primary-green-dark text-white text-[10px] uppercase tracking-widest font-bold px-5 py-2 rounded-full shadow-xs transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                )}
              </form>
              
              {couponError && <p className="text-[10px] text-red-500 font-bold mt-1.5">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-emerald-600 font-bold mt-1.5">{couponSuccess}</p>}
              
              {!appliedCoupon && (
                <div className="mt-2 text-[10px] text-gray-400">
                  ⚡ Try code <strong className="text-gray-600">JAGANMOHAN10</strong> (10% off for orders ₹1000+)
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-3.5 text-xs text-gray-600 border-t border-b border-gray-100 py-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Accumulated Weight</span>
                <span className="font-bold text-gray-900">{totalWeight.toFixed(1)} kg</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-750 font-semibold bg-emerald-50 p-2.5 rounded-2xl">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>- ₹{couponDiscountValue}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  Delivery Fee 
                  <span className="group relative">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] p-2 rounded-md w-32 hidden group-hover:block leading-tight z-10">
                      Tiered based on total weight of rice bags.
                    </span>
                  </span>
                </span>
                <span className="font-bold text-gray-900">
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              {bagCharge > 0 && (
                <div className="flex justify-between">
                  <span>Bag Charge</span>
                  <span className="font-bold text-gray-900">
                    ₹{bagCharge}
                  </span>
                </div>
              )}
              </div>

            {/* Grand Total */}
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-855">Grand Total</span>
              <div className="text-right">
                <span className="text-2xl font-sans font-extrabold text-primary-green-dark">₹{grandTotal}</span>
                <p className="text-[10px] text-gray-400 mt-0.5">All taxes included</p>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => onCheckout(appliedCoupon, totalWeight, deliveryCharge)}
              disabled={!isMinOrderSatisfied}
              className="w-full bg-primary-green hover:bg-primary-green-dark text-white text-[11px] uppercase tracking-widest font-bold py-3.5 px-4 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-primary-green/10 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onContinueShopping}
              className="w-full bg-white hover:bg-gray-50 text-gray-600 border border-primary-green/5 text-[11px] uppercase tracking-widest font-bold py-2.5 px-4 rounded-full transition-all cursor-pointer text-center"
            >
              Continue Shopping Crops
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

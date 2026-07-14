import React, { useState } from 'react';
import { User, ClipboardList, Heart, MapPin, Settings, LogOut, Sparkles, CheckCircle2, ChevronRight, Save, Trash2, Edit, Printer, Download } from 'lucide-react';
import { UserProfile, Order, Product } from '../types';
import { printOrderInvoice, downloadOrderPDF } from '../utils';

interface CustomerDashboardProps {
  user: UserProfile;
  orders: Order[];
  wishlistProducts: Product[];
  onRemoveWishlist: (productId: string) => void;
  onLogout: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export default function CustomerDashboard({
  user,
  orders,
  wishlistProducts,
  onRemoveWishlist,
  onLogout,
  onUpdateProfile
}: CustomerDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'profile' | 'wishlist' | 'addresses' | 'settings'>('orders');

  // Local state for profile edits
  const [nameInput, setNameInput] = useState(user.name);
  const [phoneInput, setPhoneInput] = useState(user.phone);
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Local state for address edits
  const [addresses, setAddresses] = useState<string[]>(user.addresses);
  const [newAddressInput, setNewAddressInput] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name: nameInput, phone: phoneInput });
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 3000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressInput.trim()) return;
    const updated = [...addresses, newAddressInput.trim()];
    setAddresses(updated);
    onUpdateProfile({ addresses: updated });
    setNewAddressInput('');
    setShowAddressForm(false);
  };

  const handleRemoveAddress = (index: number) => {
    const updated = addresses.filter((_, idx) => idx !== index);
    setAddresses(updated);
    onUpdateProfile({ addresses: updated });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar Panel */}
        <div className="lg:col-span-3 bg-white border border-primary-green/5 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="w-11 h-11 bg-primary-green text-white font-bold text-sm rounded-full flex items-center justify-center shadow-md shadow-primary-green/10">
              {user.name.charAt(0)}
            </div>
            <div>
              <span className="block font-serif font-bold text-gray-900 text-sm">{user.name}</span>
              <span className="block text-[10px] text-gray-400 capitalize">{user.role} Dashboard</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`w-full text-left py-2.5 px-4 rounded-full flex items-center justify-between transition-all cursor-pointer ${
                activeSubTab === 'orders'
                  ? 'bg-primary-green text-white shadow-xs font-bold'
                  : 'hover:bg-bg-cream/50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                <span>My Rice Orders</span>
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${activeSubTab === 'orders' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('profile')}
              className={`w-full text-left py-2.5 px-4 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'profile'
                  ? 'bg-primary-green text-white shadow-xs font-bold'
                  : 'hover:bg-bg-cream/50 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Profile</span>
            </button>

            <button
              onClick={() => setActiveSubTab('wishlist')}
              className={`w-full text-left py-2.5 px-4 rounded-full flex items-center justify-between transition-all cursor-pointer ${
                activeSubTab === 'wishlist'
                  ? 'bg-primary-green text-white shadow-xs font-bold'
                  : 'hover:bg-bg-cream/50 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>My Wishlist</span>
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${activeSubTab === 'wishlist' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {wishlistProducts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('addresses')}
              className={`w-full text-left py-2.5 px-4 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'addresses'
                  ? 'bg-primary-green text-white shadow-xs font-bold'
                  : 'hover:bg-bg-cream/50 hover:text-gray-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </button>

            <button
              onClick={() => setActiveSubTab('settings')}
              className={`w-full text-left py-2.5 px-4 rounded-full flex items-center gap-2 transition-all cursor-pointer ${
                activeSubTab === 'settings'
                  ? 'bg-primary-green text-white shadow-xs font-bold'
                  : 'hover:bg-bg-cream/50 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full text-left py-2.5 px-4 rounded-full flex items-center gap-2 transition-all text-red-600 hover:bg-red-50 mt-4 border-t border-gray-50 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>

        {/* Dynamic Inner Panel View Column */}
        <div className="lg:col-span-9 bg-white border border-primary-green/5 rounded-3xl p-6 sm:p-8 shadow-xs">
          
          {/* SubTab 1: Orders */}
          {activeSubTab === 'orders' && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-3 flex justify-between items-center">
                <h3 className="font-serif font-bold text-gray-900 text-lg">Your Historical Crop Orders</h3>
                <span className="text-xs text-gray-400">Showing {orders.length} order(s)</span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-bg-cream/10 rounded-3xl p-4">
                  <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-500 font-bold">No orders placed yet</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Explore our grains catalog to get fresh delivery tomorrow!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="border border-primary-green/5 rounded-3xl overflow-hidden shadow-xs bg-white">
                      {/* Order Header */}
                      <div className="bg-bg-cream/40 px-4 py-3 border-b border-primary-green/5 flex flex-wrap justify-between items-center gap-2 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-primary-green">{ord.id}</span>
                          <span className="text-gray-400">Placed on: {new Date(ord.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {/* Order Status Badge */}
                          <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full ${
                            ord.status === 'Delivered' 
                              ? 'bg-green-50 text-green-700' 
                              : ord.status === 'Cancelled' 
                                ? 'bg-red-50 text-red-700' 
                                : 'bg-orange-50 text-orange-700'
                          }`}>
                            {ord.status}
                          </span>
                          {/* Payment status */}
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{ord.paymentMethod} • {ord.paymentStatus}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="p-4 space-y-3.5 divide-y divide-gray-50">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs pt-2.5 first:pt-0">
                            <div>
                              <strong className="text-gray-800 font-sans block">{it.productName}</strong>
                              <span className="text-gray-400 text-[10px] block">{it.size}kg Bag • Qty: {it.quantity}</span>
                            </div>
                            <span className="font-bold text-gray-900">₹{it.pricePerItem * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer Cost Breakdown */}
                      <div className="bg-bg-cream/20 px-4 py-3 border-t border-primary-green/5 flex justify-between items-center text-xs flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Grand Total (Incl. dispatch charges)</span>
                          <strong className="text-primary-green-dark font-sans font-extrabold text-sm ml-1">₹{ord.total}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => downloadOrderPDF(ord)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer border border-emerald-200"
                            title="Download auto-generated PDF invoice directly"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => printOrderInvoice(ord)}
                            className="bg-[#0B4A3A] hover:bg-[#0B4A3A]/90 text-white px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer"
                            title="Print full invoice to PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Print Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SubTab 2: Profile Form */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-3">
                <h3 className="font-serif font-bold text-gray-900 text-lg">Personal Profile Settings</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Manage details Guntur shipping logistics references.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-[10px] font-bold text-gray-450 mb-1.5 uppercase tracking-widest">Account Email (Static)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full text-xs p-3 px-4 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500 cursor-not-allowed focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-455 mb-1.5 uppercase tracking-widest">Consignee Name</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full text-xs p-3 px-4 bg-bg-cream/20 border border-primary-green/10 rounded-2xl focus:outline-none focus:bg-white focus:border-primary-green transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-455 mb-1.5 uppercase tracking-widest">Contact Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full text-xs p-3 px-4 bg-bg-cream/20 border border-primary-green/10 rounded-2xl focus:outline-none focus:bg-white focus:border-primary-green transition-all"
                  />
                </div>

                {isProfileSaved && (
                  <div className="p-3 bg-green-50 border border-green-100 text-green-800 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Profile saved successfully!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-primary-green hover:bg-primary-green-dark text-white text-[10px] uppercase tracking-widest font-bold px-5 py-3 rounded-full shadow-lg shadow-primary-green/10 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* SubTab 3: Wishlist items */}
          {activeSubTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-3">
                <h3 className="font-serif font-bold text-gray-900 text-lg">My Bookmarked Varieties</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Quickly access and add your favorite milled rice products to cart.</p>
              </div>

              {wishlistProducts.length === 0 ? (
                <div className="text-center py-12 bg-bg-cream/10 rounded-3xl p-4">
                  <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs text-gray-500 font-bold">Your wishlist is currently empty</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Pencil mark your favorite crops in the catalog to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => (
                    <div key={p.id} className="border border-primary-green/5 rounded-3xl p-4 flex items-center justify-between gap-3 bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="w-12 h-12 rounded-2xl object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = "/assets/logo.jpeg";
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-gray-800 text-xs truncate">{p.name}</h4>
                          <span className="text-[10px] text-accent-gold-dark font-medium">{p.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveWishlist(p.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SubTab 4: Saved Addresses */}
          {activeSubTab === 'addresses' && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-gray-900 text-lg">Delivery Locations</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Manage physical addresses within Guntur city limits.</p>
                </div>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="bg-primary-green hover:bg-primary-green-dark text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2.5 rounded-full cursor-pointer transition-all"
                >
                  {showAddressForm ? 'Cancel' : 'Add New'}
                </button>
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-bg-cream/10 p-5 rounded-3xl border border-primary-green/5 max-w-md space-y-3">
                  <label className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">New Delivery Address</label>
                  <textarea
                    required
                    rows={2}
                    value={newAddressInput}
                    onChange={(e) => setNewAddressInput(e.target.value)}
                    placeholder="E.g. Flat 301, Venkat Mansion, 4th Lane, Cobald Pet, Guntur - 522002"
                    className="w-full text-xs p-3 px-4 bg-white border border-primary-green/10 rounded-2xl focus:outline-none focus:border-primary-green resize-none text-[#1A1A1A]"
                  />
                  <button
                    type="submit"
                    className="bg-primary-green hover:bg-primary-green-dark text-white text-[10px] uppercase tracking-widest font-bold px-5 py-2.5 rounded-full cursor-pointer transition-all shadow-md"
                  >
                    Add Address
                  </button>
                </form>
              )}

              {/* Saved List */}
              <div className="space-y-3">
                {addresses.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No addresses saved. Add one to speed up checkout.</p>
                ) : (
                  addresses.map((addr, idx) => (
                    <div key={idx} className="bg-bg-cream/10 p-4 rounded-3xl border border-primary-green/5 flex justify-between items-start gap-4">
                      <div className="flex gap-2.5">
                        <MapPin className="w-4 h-4 text-primary-green mt-0.5 shrink-0" />
                        <span className="text-xs text-gray-700 leading-relaxed font-semibold">{addr}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAddress(idx)}
                        className="text-gray-450 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SubTab 5: Settings Simulation */}
          {activeSubTab === 'settings' && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-3">
                <h3 className="font-serif font-bold text-gray-900 text-lg">Notification & Security Preferences</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Control how Jagan Mohan Mill interacts with your credentials.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="flex items-center justify-between p-4 bg-white border border-primary-green/5 rounded-3xl">
                  <div>
                    <strong className="text-xs text-[#1A1A1A] block">WhatsApp Shipment Updates</strong>
                    <span className="text-[10px] text-gray-400">Send live tracking notifications via Guntur dispatch.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="text-primary-green focus:ring-primary-green w-4 h-4 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-primary-green/5 rounded-3xl">
                  <div>
                    <strong className="text-xs text-[#1A1A1A] block">Email Invoice PDF Copy</strong>
                    <span className="text-[10px] text-gray-400">Receive formal commercial dispatch invoices.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="text-primary-green focus:ring-primary-green w-4 h-4 cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-primary-green/5 rounded-3xl">
                  <div>
                    <strong className="text-xs text-[#1A1A1A] block">Promotional Coupon Alerts</strong>
                    <span className="text-[10px] text-gray-400">Notify when seasonal rice mill offers go active.</span>
                  </div>
                  <input type="checkbox" className="text-primary-green focus:ring-primary-green w-4 h-4 cursor-pointer" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

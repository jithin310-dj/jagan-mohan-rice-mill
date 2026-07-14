import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Heart, User, LogOut, ShieldAlert, Sparkles, X, Menu, PhoneCall, ArrowRight, Loader2, Smartphone } from 'lucide-react';
import JMRLogo from './JMRLogo';
import { Product, UserProfile } from '../types';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface NavbarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  cartCount: number;
  wishlistCount: number;
  user: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  allProducts: Product[];
  onSearchSelect: (product: Product) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

export default function Navbar({
  currentTab,
  onChangeTab,
  cartCount,
  wishlistCount,
  user,
  onLogin,
  onLogout,
  allProducts,
  onSearchSelect,
  showAuthModal,
  setShowAuthModal
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Product[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Phone Login custom states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [authStep, setAuthStep] = useState<'phone' | 'register' | 'admin-password'>('phone');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingAdminData, setPendingAdminData] = useState<any>(null);
  const [adminPassword, setAdminPassword] = useState('');

  // Reset auth states when modal opens/closes
  useEffect(() => {
    if (!showAuthModal) {
      setPhoneNumber('');
      setFullName('');
      setAuthStep('phone');
      setAuthLoading(false);
      setAuthError(null);
      setPendingAdminData(null);
      setAdminPassword('');
    }
  }, [showAuthModal]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    // Validate phone number format (exactly 10 Indian digits, starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    let sanitizedPhone = phoneNumber.trim().replace(/\D/g, ''); // strip non-numeric
    
    // Handle country code prefixes (e.g., +91 or 91)
    if (sanitizedPhone.length === 12 && sanitizedPhone.startsWith('91')) {
      sanitizedPhone = sanitizedPhone.slice(2);
    } else if (sanitizedPhone.length === 11 && sanitizedPhone.startsWith('0')) {
      sanitizedPhone = sanitizedPhone.slice(1);
    }
    
    if (!phoneRegex.test(sanitizedPhone)) {
      setAuthError('Please enter a valid 10-digit Indian mobile number (starts with 6-9).');
      return;
    }

    setAuthLoading(true);
    try {
      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', sanitizedPhone);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // User exists! Let's log them in and update lastLogin
        const userData = userDocSnap.data();
        const loginTime = new Date().toISOString();
        
        const cleanPhone = sanitizedPhone.trim().replace(/\D/g, '');
        const cleanName = (userData.name || '').trim().toLowerCase();

        // If they exist but have no name or have 'Valued Customer' (placeholder), let's prompt them for a name!
        if (!userData.name || userData.name.trim() === '' || userData.name.trim().toLowerCase() === 'valued customer') {
          setAuthStep('register');
          setAuthLoading(false);
          return;
        }
        
        // Define Admin checks:
        // 1. Phone = 7382299666 and Name contains "jagan mohan"
        // 2. Phone = 9391848587 and Name contains "jithin"
        // 3. Phone = 9885198095 (Nusr)
        // 4. Phone = 9885090088 (Kjssp)
        const isJaganMohanAdmin = cleanPhone === '7382299666' && (cleanName.includes('jagan mohan') || cleanName === 'jagan mohan');
        const isJithinAdmin = cleanPhone === '9391848587' && (cleanName.includes('jithin') || cleanName === 'jithin');
        const isNusrAdmin = cleanPhone === '9885198095' && (cleanName.includes('nusr') || cleanName === 'nusr');
        const isKjsspAdmin = cleanPhone === '9885090088' && (cleanName.includes('kjssp') || cleanName === 'kjssp');
        const isDirectPhoneAdmin = ['7382299666', '9391848587', '9885198095', '9885090088'].includes(cleanPhone);
        const isGenericAdmin = cleanName.includes('admin');
        
        const isAdminMatch = isJaganMohanAdmin || isJithinAdmin || isNusrAdmin || isKjsspAdmin || isDirectPhoneAdmin || isGenericAdmin || userData.role === 'admin';
        const finalRole = isAdminMatch ? 'admin' : (userData.role || 'customer');

        if (finalRole === 'admin') {
          setPendingAdminData({
            isRegistration: false,
            userDocRef,
            loginTime,
            finalRole,
            userData,
            sanitizedPhone
          });
          setAdminPassword('');
          setAuthStep('admin-password');
          setAuthLoading(false);
          return;
        }

        if (finalRole !== userData.role) {
          await updateDoc(userDocRef, {
            lastLogin: loginTime,
            role: finalRole
          });
        } else {
          await updateDoc(userDocRef, {
            lastLogin: loginTime
          });
        }

        const profile: UserProfile = {
          name: userData.name || 'Valued Customer',
          email: userData.email || '',
          phone: sanitizedPhone,
          addresses: userData.addresses || [],
          wishlist: userData.wishlist || [],
          role: finalRole,
          picture: userData.picture || undefined
        };

        onLogin(profile);
        setShowAuthModal(false);
      } else {
        // User does not exist, move to registration step
        setAuthStep('register');
      }
    } catch (err: any) {
      const isQuotaError = String(err).toLowerCase().includes("quota exceeded") || 
                         String(err).toLowerCase().includes("resource exhausted") || 
                         String(err).toLowerCase().includes("permission denied") ||
                         String(err).toLowerCase().includes("quota");
      if (isQuotaError) {
        console.warn('Login error (Quota Exceeded):', err.message || err);
      } else {
        console.error('Login error:', err);
      }
      if (isQuotaError || !navigator.onLine) {
        // Fallback to offline/local mode login immediately
        let savedName = 'Valued Customer';
        let savedRole: 'customer' | 'admin' = 'customer';
        try {
          const savedProfiles = localStorage.getItem('jm_offline_users');
          const offlineUsers = savedProfiles ? JSON.parse(savedProfiles) : {};
          if (offlineUsers[sanitizedPhone]) {
            savedName = offlineUsers[sanitizedPhone].name;
            savedRole = offlineUsers[sanitizedPhone].role;
          }
        } catch {}

        const cleanPhone = sanitizedPhone.trim().replace(/\D/g, '');
        const isJaganMohanAdmin = cleanPhone === '7382299666';
        const isJithinAdmin = cleanPhone === '9391848587';
        const isNusrAdmin = cleanPhone === '9885198095';
        const isKjsspAdmin = cleanPhone === '9885090088';
        const isDirectPhoneAdmin = ['7382299666', '9391848587', '9885198095', '9885090088'].includes(cleanPhone);
        
        if (isJaganMohanAdmin || isJithinAdmin || isNusrAdmin || isKjsspAdmin || isDirectPhoneAdmin) {
          savedRole = 'admin';
        }

        const profile: UserProfile = {
          name: savedName,
          email: '',
          phone: sanitizedPhone,
          addresses: [],
          wishlist: [],
          role: savedRole
        };

        if (savedRole === 'admin') {
          setPendingAdminData({
            isRegistration: false,
            userDocRef: doc(db, 'users', sanitizedPhone),
            loginTime: new Date().toISOString(),
            finalRole: 'admin',
            userData: { name: savedName, role: 'admin' },
            sanitizedPhone,
            isOffline: true,
            profile
          });
          setAdminPassword('');
          setAuthStep('admin-password');
          setAuthLoading(false);
          return;
        }

        onLogin(profile);
        setShowAuthModal(false);
      } else {
        setAuthError('An error occurred while connecting to the database. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const sanitizedName = fullName.trim();
    if (sanitizedName.length < 2) {
      setAuthError('Please enter a valid name (at least 2 characters).');
      return;
    }

    let sanitizedPhone = phoneNumber.trim().replace(/\D/g, '');
    if (sanitizedPhone.length === 12 && sanitizedPhone.startsWith('91')) {
      sanitizedPhone = sanitizedPhone.slice(2);
    } else if (sanitizedPhone.length === 11 && sanitizedPhone.startsWith('0')) {
      sanitizedPhone = sanitizedPhone.slice(1);
    }

    setAuthLoading(true);

    try {
      const userDocRef = doc(db, 'users', sanitizedPhone);
      const userDocSnap = await getDoc(userDocRef);
      const existingData = userDocSnap.exists() ? userDocSnap.data() : {};

      const cleanPhone = sanitizedPhone.trim().replace(/\D/g, '');
      const cleanName = sanitizedName.trim().toLowerCase();
      
      // Define Admin checks:
      const isJaganMohanAdmin = cleanPhone === '7382299666' && (cleanName.includes('jagan mohan') || cleanName === 'jagan mohan');
      const isJithinAdmin = cleanPhone === '9391848587' && (cleanName.includes('jithin') || cleanName === 'jithin');
      const isNusrAdmin = cleanPhone === '9885198095' && (cleanName.includes('nusr') || cleanName === 'nusr');
      const isKjsspAdmin = cleanPhone === '9885090088' && (cleanName.includes('kjssp') || cleanName === 'kjssp');
      const isDirectPhoneAdmin = ['7382299666', '9391848587', '9885198095', '9885090088'].includes(cleanPhone);
      const isGenericAdmin = cleanName.includes('admin');
      
      const finalRole = (isJaganMohanAdmin || isJithinAdmin || isNusrAdmin || isKjsspAdmin || isDirectPhoneAdmin || isGenericAdmin || existingData.role === 'admin') ? 'admin' : (existingData.role || 'customer');
      const now = new Date().toISOString();

      const newProfileData = {
        name: sanitizedName,
        phone: sanitizedPhone,
        email: existingData.email || '',
        addresses: existingData.addresses || [],
        wishlist: existingData.wishlist || [],
        role: finalRole,
        createdAt: existingData.createdAt || now,
        lastLogin: now
      };

      const profile: UserProfile = {
        name: sanitizedName,
        email: existingData.email || '',
        phone: sanitizedPhone,
        addresses: existingData.addresses || [],
        wishlist: existingData.wishlist || [],
        role: finalRole,
        picture: existingData.picture || undefined
      };

      if (finalRole === 'admin') {
        setPendingAdminData({
          isRegistration: true,
          userDocRef,
          newProfileData,
          profile
        });
        setAdminPassword('');
        setAuthStep('admin-password');
        setAuthLoading(false);
        return;
      }

      await setDoc(userDocRef, newProfileData);
      onLogin(profile);
      setShowAuthModal(false);
    } catch (err: any) {
      const isQuotaError = String(err).toLowerCase().includes("quota exceeded") || 
                         String(err).toLowerCase().includes("resource exhausted") || 
                         String(err).toLowerCase().includes("permission denied") ||
                         String(err).toLowerCase().includes("quota");
      if (isQuotaError) {
        console.warn('Registration error (Quota Exceeded):', err.message || err);
      } else {
        console.error('Registration error:', err);
      }
      if (isQuotaError || !navigator.onLine) {
        const cleanPhone = sanitizedPhone.trim().replace(/\D/g, '');
        const cleanName = sanitizedName.trim().toLowerCase();
        
        const isJaganMohanAdmin = cleanPhone === '7382299666' && (cleanName.includes('jagan mohan') || cleanName === 'jagan mohan');
        const isJithinAdmin = cleanPhone === '9391848587' && (cleanName.includes('jithin') || cleanName === 'jithin');
        const isNusrAdmin = cleanPhone === '9885198095' && (cleanName.includes('nusr') || cleanName === 'nusr');
        const isKjsspAdmin = cleanPhone === '9885090088' && (cleanName.includes('kjssp') || cleanName === 'kjssp');
        const isDirectPhoneAdmin = ['7382299666', '9391848587', '9885198095', '9885090088'].includes(cleanPhone);
        
        const finalRole = (isJaganMohanAdmin || isJithinAdmin || isNusrAdmin || isKjsspAdmin || isDirectPhoneAdmin) ? 'admin' : 'customer';

        const profile: UserProfile = {
          name: sanitizedName,
          email: '',
          phone: sanitizedPhone,
          addresses: [],
          wishlist: [],
          role: finalRole
        };

        try {
          const savedProfiles = localStorage.getItem('jm_offline_users');
          const offlineUsers = savedProfiles ? JSON.parse(savedProfiles) : {};
          offlineUsers[sanitizedPhone] = { name: sanitizedName, role: finalRole };
          localStorage.setItem('jm_offline_users', JSON.stringify(offlineUsers));
        } catch {}

        if (finalRole === 'admin') {
          setPendingAdminData({
            isRegistration: true,
            userDocRef: doc(db, 'users', sanitizedPhone),
            newProfileData: { ...profile, createdAt: new Date().toISOString(), lastLogin: new Date().toISOString() },
            profile,
            isOffline: true
          });
          setAdminPassword('');
          setAuthStep('admin-password');
          setAuthLoading(false);
          return;
        }

        onLogin(profile);
        setShowAuthModal(false);
      } else {
        setAuthError('Failed to create account. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const currentPhone = (pendingAdminData?.sanitizedPhone || pendingAdminData?.profile?.phone || '').trim().replace(/\D/g, '');
    const enteredPassword = adminPassword.trim();
    
    let isCorrect = false;
    if (currentPhone === '9885198095') {
      isCorrect = enteredPassword.toLowerCase() === 'nusr';
    } else if (currentPhone === '9885090088') {
      isCorrect = enteredPassword.toLowerCase() === 'kjssp';
    } else if (currentPhone === '7382299666') {
      isCorrect = enteredPassword.toLowerCase() === 'jagan mohan';
    } else if (currentPhone === '9391848587') {
      isCorrect = enteredPassword.toLowerCase() === 'jithin';
    } else {
      // General fallback passwords for any other admin logins
      const correctPasswords = ['jmr@admin', 'admin123', '9885090088', '7382299666', 'jmr@2026', 'admin'];
      isCorrect = correctPasswords.includes(enteredPassword) || correctPasswords.includes(enteredPassword.toLowerCase());
    }

    if (!isCorrect) {
      setAuthError('Incorrect admin security key. Please try again.');
      return;
    }

    if (!pendingAdminData) {
      setAuthError('Session expired. Please try again.');
      setAuthStep('phone');
      return;
    }

    setAuthLoading(true);
    try {
      if (pendingAdminData.isOffline) {
        onLogin(pendingAdminData.profile);
        setShowAuthModal(false);
        return;
      }

      if (pendingAdminData.isRegistration) {
        await setDoc(pendingAdminData.userDocRef, pendingAdminData.newProfileData);
        onLogin(pendingAdminData.profile);
      } else {
        const { userDocRef, loginTime, finalRole, userData, sanitizedPhone } = pendingAdminData;
        
        if (finalRole !== userData.role) {
          await updateDoc(userDocRef, {
            lastLogin: loginTime,
            role: finalRole
          });
        } else {
          await updateDoc(userDocRef, {
            lastLogin: loginTime
          });
        }

        const profile: UserProfile = {
          name: userData.name || 'Valued Customer',
          email: userData.email || '',
          phone: sanitizedPhone,
          addresses: userData.addresses || [],
          wishlist: userData.wishlist || [],
          role: finalRole,
          picture: userData.picture || undefined
        };

        onLogin(profile);
      }
      setShowAuthModal(false);
    } catch (err: any) {
      const isQuotaError = String(err).toLowerCase().includes("quota exceeded") || 
                         String(err).toLowerCase().includes("resource exhausted") || 
                         String(err).toLowerCase().includes("permission denied") ||
                         String(err).toLowerCase().includes("quota");
      if (isQuotaError) {
        console.warn('Admin password verification error (Quota Exceeded):', err.message || err);
      } else {
        console.error('Admin password verification error:', err);
      }
      if (isQuotaError || !navigator.onLine) {
        if (pendingAdminData?.profile) {
          onLogin(pendingAdminData.profile);
        }
        setShowAuthModal(false);
      } else {
        setAuthError('Verification failed. Database connection failed.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Filter suggestions based on input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSuggestions([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const matches = allProducts.filter(
      p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
    ).slice(0, 5);
    setFilteredSuggestions(matches);
  }, [searchQuery, allProducts]);

  // Handle click outside to close suggestion panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (product: Product) => {
    onSearchSelect(product);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <>
      {/* Top Banner (Crucial Contact info and Hours) */}
      <div className="bg-primary-green-dark text-white py-1 px-4 text-xs font-sans border-b border-white/10 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5 text-accent-gold" /> Sales: <strong>7382299666</strong></span>
            <span>📍 1st Lane, Cobald Pet, Guntur</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-accent-gold">Freshly Milled Daily</span>
            <span>Mon-Sat: 8AM-7PM | Sun: 8AM-1PM</span>
          </div>
        </div>
      </div>

      {/* Sticky Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 sm:h-28 lg:h-32 gap-1.5 xs:gap-3 sm:gap-4">
            
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-gray-500 hover:text-primary-green cursor-pointer"
            >
              <Menu className="w-5 h-5 xs:w-6 xs:h-6" />
            </button>

            {/* Logo */}
            <div 
              onClick={() => onChangeTab('home')}
              className="flex items-center gap-3 xs:gap-4 cursor-pointer group shrink-0 select-none animate-fade-in"
            >
              <JMRLogo className="w-16 h-16 xs:w-18 xs:h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-28 lg:h-28 group-hover:scale-105 transition-transform duration-350" />
              <div className="flex flex-col">
                <span className="text-[#FF5722] font-display font-black text-base xs:text-lg sm:text-2xl md:text-3xl lg:text-4xl leading-none tracking-tight uppercase">
                  Jagan Mohan
                </span>
                <span className="text-primary-green font-display font-extrabold text-[11px] xs:text-[13px] sm:text-base md:text-lg tracking-widest mt-1 sm:mt-2 leading-none uppercase">
                  Rice Mill
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-semibold text-gray-500">
              <button
                id="nav-home"
                onClick={() => onChangeTab('home')}
                className={`py-1 transition-colors cursor-pointer border-b-2 hover:text-primary-green ${currentTab === 'home' ? 'border-accent-gold text-primary-green' : 'border-transparent'}`}
              >
                Home
              </button>
              <button
                id="nav-products"
                onClick={() => onChangeTab('products')}
                className={`py-1 transition-colors cursor-pointer border-b-2 hover:text-primary-green ${currentTab === 'products' ? 'border-accent-gold text-primary-green' : 'border-transparent'}`}
              >
                Products
              </button>
              <button
                id="nav-about"
                onClick={() => onChangeTab('about')}
                className={`py-1 transition-colors cursor-pointer border-b-2 hover:text-primary-green ${currentTab === 'about' ? 'border-accent-gold text-primary-green' : 'border-transparent'}`}
              >
                About
              </button>
              <button
                id="nav-contact"
                onClick={() => onChangeTab('contact')}
                className={`py-1 transition-colors cursor-pointer border-b-2 hover:text-primary-green ${currentTab === 'contact' ? 'border-accent-gold text-primary-green' : 'border-transparent'}`}
              >
                Contact
              </button>
            </nav>

            {/* Search Bar (With Autocomplete Suggestion Dropdown) */}
            <div ref={searchRef} className="relative flex-grow max-w-xs sm:max-w-md hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search rice varieties..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full text-xs pl-9 pr-8 py-2 border border-primary-green/5 rounded-full focus:outline-none focus:border-primary-green bg-bg-cream/45 focus:bg-white transition-all h-9 text-[#1A1A1A]"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-11 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-gray-50">
                  <div className="p-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    Live Rice Catalog Match
                  </div>
                  {filteredSuggestions.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSuggestionClick(p)}
                      className="p-2.5 flex items-center gap-3 hover:bg-bg-cream/40 cursor-pointer transition-colors"
                    >
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="w-8 h-8 rounded-md object-cover" 
                        onError={(e) => {
                          e.currentTarget.src = "/assets/logo.jpeg";
                        }}
                      />
                      <div className="min-w-0 flex-grow">
                        <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{p.category} • ₹{p.price}/kg</p>
                      </div>
                      <span className="text-[10px] font-bold bg-primary-green/10 text-primary-green px-2 py-0.5 rounded-full uppercase">View</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Icons Actions Panel */}
            <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 shrink-0">
              
              {/* Wishlist Icon */}
              <button
                id="wishlist-nav"
                onClick={() => onChangeTab('wishlist')}
                className="relative p-1.5 sm:p-2 text-gray-600 hover:text-primary-green transition-all rounded-full hover:bg-gray-50 cursor-pointer"
                title="Wishlist"
              >
                <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-accent-gold text-white text-[8px] sm:text-[9px] font-bold w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Icon */}
              <button
                id="cart-nav"
                onClick={() => onChangeTab('cart')}
                className="relative p-1.5 sm:p-2 text-gray-600 hover:text-primary-green transition-all rounded-full hover:bg-gray-50 cursor-pointer"
                title="Cart"
              >
                <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-primary-green text-white text-[8px] sm:text-[9px] font-bold w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Auth Button / Profile Trigger */}
              {user ? (
                <div className="flex items-center gap-1 border border-primary-green/5 pl-1 pr-2 xs:pl-1.5 xs:pr-3 py-1 xs:py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer relative group">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-6 h-6 xs:w-7 xs:h-7 rounded-full object-cover border border-slate-200 shadow-xs" />
                  ) : (
                    <div className="w-6 h-6 xs:w-7 xs:h-7 rounded-full bg-primary-green text-white text-[10px] xs:text-xs font-bold flex items-center justify-center shadow-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-[11px] xs:text-xs font-bold text-gray-700 max-w-[50px] xs:max-w-[60px] truncate hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>

                  {/* Dropdown Menu on hover */}
                  <div className="absolute right-0 top-full pt-1.5 w-48 hidden group-hover:block z-50">
                    <div className="bg-white border border-primary-green/5 rounded-3xl shadow-lg p-1.5 space-y-1">
                      <div className="px-2.5 py-1.5 border-b border-gray-50 text-left">
                        <span className="block text-xs font-bold text-gray-800 truncate">{user.name}</span>
                        <span className="block text-[10px] text-gray-400 capitalize">{user.role} Account</span>
                      </div>
                      
                      <button
                        onClick={() => onChangeTab('dashboard')}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-gray-600 hover:bg-bg-cream/40 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-primary-green" />
                        My Dashboard
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => onChangeTab('admin')}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Admin Console
                        </button>
                      )}

                      <button
                        onClick={onLogout}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-semibold flex items-center gap-2 border-t border-gray-50 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  id="login-btn"
                  onClick={() => setShowAuthModal(true)}
                  className="bg-primary-green hover:bg-primary-green-dark text-white text-[9px] xs:text-[10px] uppercase tracking-widest font-bold px-2.5 py-1.5 xs:px-4 xs:py-2 rounded-full flex items-center gap-1 xs:gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  <User className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                  <span className="hidden xs:inline">Login</span>
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search premium rice crops..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="w-full text-xs pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="bg-white border border-gray-100 mt-1 rounded-lg shadow-md divide-y divide-gray-50">
                  {filteredSuggestions.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        handleSuggestionClick(p);
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-2 flex items-center gap-2 hover:bg-gray-50 text-xs font-semibold"
                    >
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="w-6 h-6 object-cover rounded" 
                        onError={(e) => {
                          e.currentTarget.src = "/assets/logo.jpeg";
                        }}
                      />
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => { onChangeTab('home'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg ${currentTab === 'home' ? 'bg-primary-green text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Home
            </button>
            <button
              onClick={() => { onChangeTab('products'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg ${currentTab === 'products' ? 'bg-primary-green text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Products Catalog
            </button>
            <button
              onClick={() => { onChangeTab('about'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg ${currentTab === 'about' ? 'bg-primary-green text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              About Jagan Mohan Mill
            </button>
            <button
              onClick={() => { onChangeTab('contact'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg ${currentTab === 'contact' ? 'bg-primary-green text-white' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Contact & Support
            </button>
            {user && (
              <>
                <button
                  onClick={() => { onChangeTab('dashboard'); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg ${currentTab === 'dashboard' ? 'bg-primary-green text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  My Dashboard
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => { onChangeTab('admin'); setIsMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 text-xs font-bold rounded-lg text-emerald-800 bg-emerald-50"
                  >
                    Admin Panel
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </header>

      {/* Authentication Modal (Indian Phone Number Passwordless Login) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl border border-gray-100">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 select-none">
              {/* Centered circular logo */}
              <div className="inline-flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-300">
                <JMRLogo className="w-36 h-36" hideBorder={true} />
              </div>
              <h3 className="font-sans font-bold text-2xl text-slate-900 tracking-tight leading-tight">
                {authStep === 'phone' ? 'Sign In / Register' : authStep === 'admin-password' ? 'Admin Security' : 'Complete Registration'}
              </h3>
              <div className="flex flex-col items-center justify-center gap-1 mt-3">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">to continue to</span>
                <div className="flex flex-col items-center">
                  <span className="text-[#FF5722] font-display font-black text-2xl uppercase tracking-wider">
                    Jagan Mohan Rice Mill
                  </span>
                </div>
              </div>
            </div>

            {authStep === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Enter Indian Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-sm font-bold text-gray-500 border-r border-gray-200 pr-3">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumber(val);
                      }}
                      placeholder="9876543210"
                      required
                      autoFocus
                      disabled={authLoading}
                      className="w-full text-sm py-3.5 pl-16 pr-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary-green text-[#1A1A1A] font-bold tracking-widest placeholder-gray-300 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                    We will instantly verify if your number exists or automatically set up a new account for you. No password or OTP required!
                  </p>
                </div>

                {authError && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-medium leading-relaxed">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-primary-green hover:bg-primary-green-dark text-white text-xs uppercase tracking-widest font-extrabold py-4 rounded-full transition-all cursor-pointer shadow-lg shadow-primary-green/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Mobile...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : authStep === 'admin-password' ? (
              <form onSubmit={handleAdminPasswordSubmit} className="space-y-5 animate-fade-in">
                <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-800 font-semibold leading-relaxed mb-1 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                  <div>
                    <span className="block font-bold">Admin Verification</span>
                    <span className="block font-normal text-amber-700 mt-0.5">Enter key for secure Guntur delta clearance.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Enter Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    disabled={authLoading}
                    className="w-full text-sm p-3.5 px-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-amber-500 text-[#1A1A1A] font-bold tracking-widest transition-colors"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                    Admin access grants full Guntur stock level control and order queue management.
                  </p>
                </div>

                {authError && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-medium leading-relaxed">
                    {authError}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs uppercase tracking-widest font-extrabold py-4 rounded-full transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Key...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Login</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('phone');
                      setAdminPassword('');
                      setAuthError(null);
                    }}
                    disabled={authLoading}
                    className="w-full bg-transparent text-gray-500 hover:text-gray-700 text-xs font-bold py-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    Go Back
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-5 animate-fade-in">
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-800 font-semibold leading-relaxed mb-1 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary-green shrink-0" />
                  <span>Number verified: +91 {phoneNumber}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Enter Your Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    required
                    autoFocus
                    disabled={authLoading}
                    className="w-full text-sm p-3.5 px-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary-green text-[#1A1A1A] font-semibold transition-colors"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                    This is your first time signing in! Please provide your name to finalize your premium customer profile.
                  </p>
                </div>

                {authError && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-medium leading-relaxed">
                    {authError}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-primary-green hover:bg-primary-green-dark text-white text-xs uppercase tracking-widest font-extrabold py-4 rounded-full transition-all cursor-pointer shadow-lg shadow-primary-green/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account & Login</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthStep('phone')}
                    disabled={authLoading}
                    className="w-full bg-transparent text-gray-500 hover:text-gray-700 text-xs font-bold py-2.5 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    Go Back
                  </button>
                </div>
              </form>
            )}

            <p className="text-[10px] text-gray-400 text-center mt-5 leading-normal font-medium">
              By logging in, you agree to secure local session storage and instant Firestore profile tracking for Guntur's finest premium rice crops.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

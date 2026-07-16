import React, { useState, useEffect } from 'react';
import { 
  Heart, ShoppingBag, Search, Sparkles, Filter, SlidersHorizontal, 
  ArrowRight, PhoneCall, MessageCircle, Mail, MapPin, 
  CheckCircle, ArrowUpRight, ShieldCheck, ShieldAlert, Star, Sparkle, X,
  Play, Pause, Volume2, VolumeX, Radio, Upload, Tv, RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Product, CartItem, Order, UserProfile, Coupon, Review, ToastMessage } from './types';
import { PRODUCTS, CATEGORIES, CONTACT_INFO, COUPONS } from './data';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import CustomerDashboard from './components/CustomerDashboard';
import AdminPanel from './components/AdminPanel';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import JMRLogo from './components/JMRLogo';
import ToastContainer from './components/ToastContainer';

import { db, sendOrderConfirmation } from './firebase';
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [scrollToFilters, setScrollToFilters] = useState(false);
  // Database / Global states with real-time Firestore sync and LocalStorage fallback
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('jm_products_fallback');
      if (saved) {
        const parsed = JSON.parse(saved) as Product[];
        const merged = PRODUCTS.map(defaultProd => {
          if (defaultProd.id === 'brawn-specialty') return null;
          const savedProd = parsed.find(p => p.id === defaultProd.id);
          if (savedProd) {
            return {
              ...defaultProd,
              price: savedProd.price,
              stock: savedProd.stock,
              discount: savedProd.discount,
              rating: savedProd.rating ?? defaultProd.rating,
              reviews: savedProd.reviews ?? defaultProd.reviews
            };
          }
          return defaultProd;
        }).filter(Boolean) as Product[];

        // Include any custom products not in the default catalog
        const defaultIds = new Set(PRODUCTS.map(p => p.id));
        parsed.forEach(savedProd => {
          if (savedProd.id !== 'brawn-specialty' && !defaultIds.has(savedProd.id)) {
            merged.push(savedProd);
          }
        });
        return merged;
      }
      return PRODUCTS.filter(p => p.id !== 'brawn-specialty');
    } catch {
      return PRODUCTS.filter(p => p.id !== 'brawn-specialty');
    }
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jm_cart');
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        return parsed.map(item => {
          const defaultProd = PRODUCTS.find(p => p.id === item.product.id);
          if (defaultProd) {
            return {
              ...item,
              product: {
                ...defaultProd,
                price: item.product.price,
                stock: item.product.stock,
                discount: item.product.discount,
                rating: item.product.rating ?? defaultProd.rating,
                reviews: item.product.reviews ?? defaultProd.reviews
              }
            };
          }
          return item;
        });
      }
      return [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('jm_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('jm_orders_fallback');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('jm_coupons_fallback');
      return saved ? JSON.parse(saved) : COUPONS;
    } catch {
      return COUPONS;
    }
  });
  const [firestoreQuotaExceeded, setFirestoreQuotaExceeded] = useState<boolean>(false);
  const logFirestoreError = (context: string, err: any) => {
    const errMsg = String(err).toLowerCase();
    const isQuota = errMsg.includes("quota exceeded") || 
                    errMsg.includes("resource exhausted") || 
                    errMsg.includes("permission denied") || 
                    errMsg.includes("quota");
    if (isQuota) {
      console.warn(`${context} (Quota Exceeded/Permission Denied) - using local fallback:`, err.message || err);
      setFirestoreQuotaExceeded(true);
    } else {
      console.error(context, err);
    }
  };
  const [dismissedOfflineBanner, setDismissedOfflineBanner] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('jm_user');
    if (saved) {
      try {
        const user = JSON.parse(saved) as UserProfile;
        const cleanPhone = user.phone.trim().replace(/\D/g, '');
        const cleanName = user.name.trim().toLowerCase();
        const isJaganMohanAdmin = cleanPhone === '7382299666' && (cleanName === 'jagan mohan' || cleanName.includes('jagan mohan'));
        const isJithinAdmin = cleanPhone === '9391848587' && (cleanName === 'jithin' || cleanName.includes('jithin'));
        const isNusrAdmin = cleanPhone === '9885198095' && (cleanName === 'nusr' || cleanName.includes('nusr'));
        const isKjsspAdmin = cleanPhone === '9885090088' && (cleanName === 'kjssp' || cleanName.includes('kjssp'));
        const isDirectPhoneAdmin = ['7382299666', '9391848587', '9885198095', '9885090088'].includes(cleanPhone);
        if (isJaganMohanAdmin || isJithinAdmin || isNusrAdmin || isKjsspAdmin || isDirectPhoneAdmin) {
          user.role = 'admin';
        }
        return user;
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
    return null;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, description?: string, type: ToastMessage['type'] = 'success', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, description, type, duration }]);
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Selected Product for Details Modal View
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(200); // Max Price
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<number | 'All'>('All');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<string>('popularity');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [showChatPopover, setShowChatPopover] = useState<boolean>(false);

  // Checkout State Coordination
  const [checkoutCoupon, setCheckoutCoupon] = useState<Coupon | null>(null);
  const [checkoutWeight, setCheckoutWeight] = useState<number>(0);
  const [checkoutDelivery, setCheckoutDelivery] = useState<number>(0);

  // Paddy Milling Interactive Inspection Feed States
  const [inspectionMode, setInspectionMode] = useState<'video' | 'photo'>('video');
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(true);
  const [inspectionVideoUrl, setInspectionVideoUrl] = useState<string>('https://assets.mixkit.co/videos/preview/mixkit-farmer-hands-holding-and-sorting-rice-grains-42045-large.mp4');
  const [inspectionPhotoUrl, setInspectionPhotoUrl] = useState<string>('/assets/Poster.png');
  const [liveThroughput, setLiveThroughput] = useState<number>(145);
  const [livePurity, setLivePurity] = useState<number>(99.98);

  // Auto-Simulation of real-time computer vision grain telemetry
  useEffect(() => {
    if (inspectionMode !== 'video' || !isVideoPlaying) return;
    const interval = setInterval(() => {
      setLiveThroughput(prev => {
        const diff = Math.random() > 0.5 ? 1 : -1;
        const next = prev + diff;
        return next >= 135 && next <= 155 ? next : prev;
      });
      setLivePurity(prev => {
        const diff = (Math.random() - 0.5) * 0.02;
        const next = Number((prev + diff).toFixed(2));
        return next >= 99.85 && next <= 99.99 ? next : prev;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [inspectionMode, isVideoPlaying]);

  // Live Guntur Mill Clock
  const [gunturTime, setGunturTime] = useState('');
  useEffect(() => {
    const getGunturTimeStr = () => {
      try {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).format(new Date());
      } catch (e) {
        return new Date().toLocaleTimeString();
      }
    };
    setGunturTime(getGunturTimeStr());
    const timer = setInterval(() => {
      setGunturTime(getGunturTimeStr());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Firestore Sync and Auto-Seeding
  useEffect(() => {
    // Check if error is quota exceeded
    const checkQuotaError = (err: any) => {
      const errMsg = String(err).toLowerCase();
      if (errMsg.includes("quota exceeded") || errMsg.includes("resource exhausted") || errMsg.includes("permission denied") || errMsg.includes("quota")) {
        setFirestoreQuotaExceeded(true);
      }
    };
    // Products listener
    const unsubscribeProducts = onSnapshot(
      collection(db, "products"),
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed only if Firestore is available
          if (!firestoreQuotaExceeded) {
            PRODUCTS.forEach(async (p) => {
              try {
                await setDoc(doc(db, "products", p.id), p);
              } catch (e) {
                logFirestoreError(`Failed seeding product ${p.name}`, e);
              }
            });
          }
          return;
        }

        const prodList: Product[] = [];
        let hasOldBrawn = false;
        const validIds = new Set(PRODUCTS.map((p) => p.id));
        const storedIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Product;

          if (data.id === "brawn-specialty") {
            hasOldBrawn = true;
          } else if (!validIds.has(data.id) || !validIds.has(docSnap.id)) {
            // Delete stale products only if Firestore is available
            if (!firestoreQuotaExceeded) {
              deleteDoc(doc(db, "products", docSnap.id)).catch((e) => {
                logFirestoreError(
                  `Failed to delete stale product document ${docSnap.id}`,
                  e
                );
              });
            }
          } else {
            prodList.push(data);
            storedIds.add(data.id);
          }
        });

        const mergedList = PRODUCTS.map(defaultProd => {
          if (defaultProd.id === 'brawn-specialty') return null;

          const firestoreProd = prodList.find(
            p => p.id === defaultProd.id
          );

          if (firestoreProd) {
            return {
              ...defaultProd,
              price: firestoreProd.price,
              stock: firestoreProd.stock,
              discount: firestoreProd.discount,
              rating: firestoreProd.rating ?? defaultProd.rating,
              reviews: firestoreProd.reviews ?? defaultProd.reviews
            };
          }

          return defaultProd;
        }).filter(Boolean) as Product[];

        const defaultIds = new Set(PRODUCTS.map(p => p.id));

        prodList.forEach(firestoreProd => {
          if (
            firestoreProd.id !== 'brawn-specialty' &&
            !defaultIds.has(firestoreProd.id)
          ) {
            mergedList.push(firestoreProd);
          }
        });

        console.log("Products:", mergedList.map(p => p.id));

        setProducts(mergedList);
        console.log("Merged Products:", mergedList);

        console.log("Millets Combo:",mergedList.find(p => p.id === "millets-combo"));

        setProducts(mergedList);

      },
      (error) => {
        logFirestoreError("Firestore loading products failed", error);

        if (
          error.code === "resource-exhausted" ||
          error.code === "permission-denied"
        ) {
          setFirestoreQuotaExceeded(true);
        }
      }
    );

    

    // 2. Orders snapshot listener
    const unsubscribeOrders = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const orderList: Order[] = [];

        snapshot.forEach((docSnap) => {
          orderList.push(docSnap.data() as Order);
        });

        // Combine with local offline fallback orders
        // try {
        //   const saved = localStorage.getItem("jm_orders_fallback");
        //   const offlineOrders: Order[] = saved ? JSON.parse(saved) : [];
        //   const syncedIds = new Set(orderList.map(o => o.id));

        //   offlineOrders.forEach(o => {
        //     if (!syncedIds.has(o.id)) {
        //       orderList.push(o);
        //     }
        //   });
        // } catch (e) {
        //   console.error("Failed to parse fallback orders:", e);
        // }

        orderList.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
            
        );

        setOrders(orderList);
      },
      (error) => {
        logFirestoreError("Firestore loading orders failed", error);
      }
    );

    // 3. Coupons snapshot listener
    const unsubscribeCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      if (snapshot.empty) {
        // Seed initial coupons
        COUPONS.forEach(async (c) => {
          try {
            await setDoc(doc(db, 'coupons', c.code), c);
          } catch (e) {
            logFirestoreError(`Failed seeding coupon ${c.code}`, e);
          }
        });
      } else {
        const couponList: Coupon[] = [];
        snapshot.forEach((docSnap) => {
          couponList.push(docSnap.data() as Coupon);
        });
        setCoupons(couponList);
      }
    }, (error) => {
      logFirestoreError("Firestore loading coupons failed", error);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeCoupons();
    };
  }, []);

  // Product Deep Linking via URL Hash (#product=jm-rose)
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#product=')) {
        const prodId = hash.replace('#product=', '');
        const found = products.find(p => p.id === prodId) || PRODUCTS.find(p => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
        }
      }
    };
    
    // Check on initial render when products list becomes available
    if (products.length > 0) {
      checkHash();
    }
    
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [products]);

  // Sync client-only states to LocalStorage
  useEffect(() => {
    localStorage.setItem('jm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('jm_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('jm_products_fallback', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('jm_coupons_fallback', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    if (currentUser) {
      // Force admin upgrade dynamically if credentials match
      const cleanPhone = currentUser.phone.trim().replace(/\D/g, '');
      const cleanName = currentUser.name.trim().toLowerCase();
      const isJaganMohanAdmin = cleanPhone === '7382299666' && (cleanName === 'jagan mohan' || cleanName.includes('jagan mohan'));
      const isJithinAdmin = cleanPhone === '9391848587' && (cleanName === 'jithin' || cleanName.includes('jithin'));
      const isNusrAdmin = cleanPhone === '9885198095' && (cleanName === 'nusr' || cleanName.includes('nusr'));
      const isKjsspAdmin = cleanPhone === '9885090088' && (cleanName === 'kjssp' || cleanName.includes('kjssp'));
      const isDirectPhoneAdmin = ['7382299666', '9391848587', '9885198095', '9885090088'].includes(cleanPhone);
      const isGenericAdmin = cleanName.includes('admin');
      
      const isAnyAdmin = isJaganMohanAdmin || isJithinAdmin || isNusrAdmin || isKjsspAdmin || isDirectPhoneAdmin || isGenericAdmin || currentUser.role === 'admin';
      if (isAnyAdmin && currentUser.role !== 'admin') {
        const updatedUser = { ...currentUser, role: 'admin' as const };
        setCurrentUser(updatedUser);
        localStorage.setItem('jm_user', JSON.stringify(updatedUser));
        updateDoc(doc(db, 'users', cleanPhone), { role: 'admin' })
          .catch(err => logFirestoreError("Error updating admin role in Firestore on check:", err));
      } else {
        localStorage.setItem('jm_user', JSON.stringify(currentUser));
      }
    } else {
      localStorage.removeItem('jm_user');
    }
  }, [currentUser]);

  // Handle successful Phone Login
  const handleLogin = (profile: UserProfile) => {
    setCurrentUser(profile);
    
    // Redirect to home page after successful login
    setCurrentTab('home');

    showToast(
      "Signed in successfully",
      `Welcome back, ${profile.name}! You are logged in as a ${profile.role === 'admin' ? 'Mill Administrator' : 'Customer'}.`,
      "success",
      4000
    );
  };

  const handleLogout = () => {
    const prevName = currentUser?.name || 'Customer';
    setCurrentUser(null);
    setCurrentTab('home');
    showToast(
      "Signed out",
      `Goodbye, ${prevName}. Your session has ended securely.`,
      "info",
      3000
    );
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updated });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setInspectionVideoUrl(url);
        setInspectionMode('video');
        setIsVideoPlaying(true);
        showToast('Inspection Video Loaded', `Successfully loaded custom video file: ${file.name}`, 'success');
      } else {
        showToast('Invalid File Type', 'Please upload a valid video file.', 'error');
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setInspectionPhotoUrl(url);
        setInspectionMode('photo');
        showToast('Inspection Photo Loaded', `Successfully loaded custom photo file: ${file.name}`, 'success');
      } else {
        showToast('Invalid File Type', 'Please upload a valid image file.', 'error');
      }
    }
  };

  // Cart Management
  const handleAddToCart = (product: Product, size: number, qty: number, selectedAge?: string) => {
    let finalProduct = product;
    if (product.id === 'jm-lotus') {
      if (selectedAge === '2 Years Old') {
        const agingPremium = Number(localStorage.getItem('jm_lotus_aging_premium') || '4');
        finalProduct = {
          ...product,
          price: product.price + agingPremium
        };
      } else if (selectedAge === 'Deam') {
        const deamPremium = Number(localStorage.getItem('jm_lotus_deam_premium') || '6');
        finalProduct = {
          ...product,
          price: product.price + deamPremium
        };
      }
    }

    const itemId = selectedAge 
      ? `${product.id}-${size}-${selectedAge.replace(/\s+/g, '-')}` 
      : `${product.id}-${size}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item => 
          item.id === itemId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { id: itemId, product: finalProduct, selectedSize: size, quantity: qty, selectedAge }];
    });
    
    showToast(
      "Added to Cart!",
      `${qty} x ${product.name} ${selectedAge ? `(${selectedAge}) ` : ''}(${size === 0.5 ? '500gms' : `${size}kg`} bag) added to your milling dispatch queue.`,
      "success",
      3000
    );

    // Switch to cart page for positive UX feedback
    setCurrentTab('cart');
  };

  const handleUpdateCartQty = (id: string, qty: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const handleRemoveCartItem = (id: string) => {
    const item = cart.find(it => it.id === id);
    if (item) {
      showToast(
        "Variety Removed",
        `${item.product.name} has been cleared from your shopping cart.`,
        "info",
        3000
      );
    }
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Wishlist Management
  const handleToggleWishlist = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    setWishlist(prev => {
      if (prev.includes(productId)) {
        if (prod) {
          showToast(
            "Bookmark Removed",
            `Removed ${prod.name} from your milled wishlist bookmarks.`,
            "info",
            3000
          );
        }
        return prev.filter(id => id !== productId);
      }
      if (prod) {
        showToast(
          "Variety Bookmarked!",
          `Saved ${prod.name} to your wishlist for quick access.`,
          "success",
          3000
        );
      }
      return [...prev, productId];
    });
  };

  // Order Placement and Stock Reduction with Firestore / Local Fallback
  const handlePlaceOrder = async (newOrder: Order) => {
    let orderStoredSuccessfully = false;

    try {
      // 1. Save new order to Firestore
      await setDoc(doc(db, "orders", newOrder.id), newOrder);

      // 2. Reduce stock of each item in order in Firestore
      products.forEach(async (prod) => {
        const matchingOrderedItems = newOrder.items.filter(it => it.productId === prod.id);
        if (matchingOrderedItems.length > 0) {
          const totalOrderedQtyKg = matchingOrderedItems.reduce((acc, match) => acc + (match.size * match.quantity), 0);
          const newStock = Math.max(0, prod.stock - totalOrderedQtyKg);
          await updateDoc(doc(db, 'products', prod.id), { stock: newStock });
        }
      });

      // 3. Trigger Cloud Function automated confirmation email
      try {
        await sendOrderConfirmation(newOrder);
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
      }

      orderStoredSuccessfully = true;
    } catch (e) {
      logFirestoreError("Firestore placing order failed, falling back to local storage:", e);
    }

    // Whether Firestore succeeded or failed, let's keep local states updated
    // 1. Update fallback local orders in localStorage so they survive page reloads
    try {
      const saved = localStorage.getItem('jm_orders_fallback');
      const offlineOrders: Order[] = saved ? JSON.parse(saved) : [];
      if (!offlineOrders.some(o => o.id === newOrder.id)) {
        offlineOrders.push(newOrder);
        localStorage.setItem('jm_orders_fallback', JSON.stringify(offlineOrders));
      }
    } catch (err) {
      console.error("Failed to write offline fallback order:", err);
    }

    // 2. Update local state
    setOrders(prev => {
      const exists = prev.some(o => o.id === newOrder.id);
      if (exists) return prev;
      const newList = [newOrder, ...prev];
      newList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return newList;
    });

    // 3. Update local products stock
    setProducts(prev => prev.map(prod => {
      const matchingOrderedItems = newOrder.items.filter(it => it.productId === prod.id);
      if (matchingOrderedItems.length > 0) {
        const totalOrderedQtyKg = matchingOrderedItems.reduce((acc, match) => acc + (match.size * match.quantity), 0);
        return { ...prod, stock: Math.max(0, prod.stock - totalOrderedQtyKg) };
      }
      return prod;
    }));

    // 4. Empty cart locally
    setCart([]);

    // 5. Trigger success toast
    showToast(
      "Order Received by Mill!",
      `Order Reference ${newOrder.id} has been registered${orderStoredSuccessfully ? "" : " locally (offline fallback mode)"}. Our packing lines are preparing your fresh grain consignment.`,
      "success",
      6000
    );
  };

  // Product Review Addition in Firestore / Local Fallback
  const handleAddReview = async (productId: string, newReview: Review) => {
    // 1. Update state locally first so it is immediately visible
    let updatedProductsList: Product[] = [];
    setProducts(prev => {
      updatedProductsList = prev.map(p => {
        if (p.id === productId) {
          const updatedReviews = [newReview, ...p.reviews];
          const avgRating = Number((updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(1));
          return { ...p, reviews: updatedReviews, rating: avgRating };
        }
        return p;
      });
      return updatedProductsList;
    });

    try {
      const prod = products.find(p => p.id === productId);
      if (prod) {
        const updatedReviews = [newReview, ...prod.reviews];
        const avgRating = Number((updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(1));
        await updateDoc(doc(db, 'products', productId), {
          reviews: updatedReviews,
          rating: avgRating
        });
      }
    } catch (e) {
      logFirestoreError("Firestore adding review failed, falling back to local state:", e);
    }
  };

  // Admin Product Actions with Firestore / Local Fallback
  const handleAddProductAdmin = async (newProd: Product) => {
    // 1. Update state locally first
    setProducts(prev => {
      if (prev.some(p => p.id === newProd.id)) {
        return prev.map(p => p.id === newProd.id ? newProd : p);
      }
      return [newProd, ...prev];
    });

    try {
      await setDoc(doc(db, 'products', newProd.id), newProd);
      showToast(
        "Crop Added Successfully",
        `${newProd.name} has been added to the mill catalog.`,
        "success",
        3000
      );
    } catch (e) {
      logFirestoreError("Firestore creating product failed, falling back to local state:", e);
    }
  };

  const handleUpdateProductAdmin = async (updatedProd: Product) => {
    // 1. Update state locally first
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));

    try {
      await setDoc(doc(db, 'products', updatedProd.id), updatedProd);
      showToast(
        "Crop Updated Successfully",
        `${updatedProd.name} pricing and stock have been updated.`,
        "success",
        3000
      );
    } catch (e) {
      logFirestoreError("Firestore updating product failed, falling back to local state:", e);
    }
  };

  const handleDeleteProductAdmin = async (id: string) => {
    // 1. Update state locally first
    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      logFirestoreError("Firestore deleting product failed, falling back to local state:", e);
    }
  };

  // Admin Order Dispatch Action in Firestore / Local Fallback
  const handleUpdateOrderStatusAdmin = async (orderId: string, status: Order['status'], paymentStatus: Order['paymentStatus']) => {
    // 1. Update state locally first
    setOrders(prev => {
      const updatedList = prev.map(o => o.id === orderId ? { ...o, status, paymentStatus } : o);
      // Persist fallback order statuses
      try {
        localStorage.setItem('jm_orders_fallback', JSON.stringify(updatedList));
      } catch (err) {
        console.error("Failed to write fallback orders to localStorage:", err);
      }
      return updatedList;
    });

    try {
      await updateDoc(doc(db, 'orders', orderId), { status, paymentStatus });
    } catch (e) {
      logFirestoreError("Firestore updating order status failed, falling back to local state:", e);
    }
  };

  // Search Navigation Coordinator
  const handleSearchSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  // Checkout transition configuration
  const handleCheckoutInitiate = (coupon: Coupon | null, weight: number, delivery: number) => {
    if (!currentUser) {
      showToast("Verification Required", "Please log in with your phone number to proceed with secure checkout.", "info");
      setShowAuthModal(true);
      return;
    }
    setCheckoutCoupon(coupon);
    setCheckoutWeight(weight);
    setCheckoutDelivery(delivery);
    setCurrentTab('checkout');
  };

  // Filtering Logic for Products Catalog View
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    
    const discountedPrice = Math.round(p.price * (1 - p.discount / 100));
    const matchPrice = discountedPrice <= priceRange;
    
    const matchSize = selectedSizeFilter === 'All' || p.bagSizes.includes(Number(selectedSizeFilter));
    
    const matchStock = !onlyInStock || p.stock > 0;
    console.log({
      name: p.name,
      category: p.category,
      selectedCategory,
      selectedSizeFilter,
      bagSizes: p.bagSizes,
      matchCategory,
      matchSize
    });

    return matchSearch && matchCategory && matchPrice && matchSize && matchStock;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Math.round(a.price * (1 - a.discount / 100));
    const priceB = Math.round(b.price * (1 - b.discount / 100));

    if (sortOption === 'price-low') return priceA - priceB;
    if (sortOption === 'price-high') return priceB - priceA;
    if (sortOption === 'newest') return b.reviews.length - a.reviews.length; // Mock newest using review count
    return b.rating - a.rating; // Popularity / highest rating default
  });

  return (
    <div className="min-h-screen bg-bg-cream font-sans text-gray-800 flex flex-col">
      
      {/* Dynamic Navbar */}
      <Navbar
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        user={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        allProducts={products}
        onSearchSelect={handleSearchSelect}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
      />

      {/* {currentUser?.role === "admin" && firestoreQuotaExceeded &&!dismissedOfflineBanner && (
        <div id="offline-fallback-banner" className="bg-amber-50 px-4 py-4.5 border-b border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm font-medium">
          <div className="flex items-start gap-3 text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="block font-bold text-amber-950 text-base">
                Database Daily Quota Exceeded (Spark Plan Limit Reached)
              </span>
              <p className="text-amber-800 leading-relaxed max-w-4xl">
                The Firestore Cloud Database has reached its daily free tier limits (such as daily read/write limits). 
                To ensure a flawless experience, we have activated our <strong>Offline-Resilient Fallback Engine</strong>: logins, 
                catalog browsing, admin pricing updates, and checkout will continue to work seamlessly via persistent local browser caching.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 items-center">
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono">
                  Code: RESOURCE_EXHAUSTED
                </span>
                <a 
                  id="firestore-upgrade-link"
                  href="https://console.firebase.google.com/project/gothic-quota-r40ks/firestore/databases/ai-studio-jaganmohanricemi-10075640-dbab-4b8e-9e46-0a5f6c00ad8f/data?openUpgradeDialog=true"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-950 hover:text-amber-900 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-all duration-150 font-bold border border-amber-300 shadow-xs"
                >
                  Upgrade Firestore Database / Verify Quota 
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <button 
            id="close-offline-banner"
            onClick={() => setDismissedOfflineBanner(true)}
            className="p-1.5 hover:bg-amber-200/50 rounded-full text-amber-700 hover:text-amber-900 transition-colors duration-150 shrink-0 self-end md:self-center"
            title="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )} */}

      {/* Main Screen Views Routing */}
      <main className="flex-grow">
        
        {/* VIEW 1: HOME PAGE */}
        {currentTab === 'home' && (
          <div className="space-y-16 pb-16">
            {/* <Hero
              onShopNow={() => setCurrentTab('products')}
              onExploreProducts={() => {
                setSelectedCategory('All');
                setCurrentTab('products');
              }}
            /> */}
            {/* <Hero
              onShopNow={() => setCurrentTab('products')}
              onExploreProducts={() => {
                setSelectedCategory('All');
                setCurrentTab('products');

                setTimeout(() => {
                  document
                    .getElementById("catalog-filters")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }, 300);
              }}
            /> */}
            <Hero
              onShopNow={() => setCurrentTab('products')}
              onExploreProducts={() => {
                setSelectedCategory('All');
                setCurrentTab('products');
                setScrollToFilters(true);
              }}
            />


            {/* Categories Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-2 mb-10">
                <span className="text-xs font-bold text-accent-gold uppercase tracking-[0.2em] block">Finest Grain Selection</span>
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#1A1A1A]">Explore Premium Milling Categories</h2>
                <p className="text-xs md:text-sm text-gray-400 max-w-md mx-auto">Freshly separated, packed, and moisture-sealed on Guntur headquarters.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {CATEGORIES.map((cat, idx) => (
                  <div
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCurrentTab('products');
                    }}
                    className="bg-white hover:bg-primary-green hover:text-white rounded-3xl border border-primary-green/5 p-5 text-center cursor-pointer transition-all hover:shadow-lg group"
                  >
                    <div className="w-12 h-12 rounded-full bg-bg-cream text-primary-green flex items-center justify-center mx-auto mb-3 font-mono font-bold group-hover:bg-white group-hover:text-primary-green transition-colors">
                      {idx + 1}
                    </div>
                    <span className="block font-sans font-bold text-xs leading-tight">{cat}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Bestselling signature products */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-bold text-accent-gold uppercase tracking-[0.2em] block">Top Rated Choice</span>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1A1A]">Signature Rose & BPT Crops</h2>
                </div>
                <button
                  onClick={() => setCurrentTab('products')}
                  className="text-[11px] font-bold text-primary-green hover:text-primary-green-dark flex items-center gap-1 cursor-pointer self-start sm:self-auto uppercase tracking-widest"
                >
                  <span>See Full 25+ Rice Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.slice(0, 4).map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={handleAddToCart}
                    onQuickView={setSelectedProduct}
                    isWishlisted={wishlist.includes(prod.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </section>

            {/* Farmers and Sourcing Section */}
            <section className="bg-primary-green text-white py-14 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-5"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <span className="text-xs font-bold text-accent-gold uppercase tracking-[0.2em] block">Direct From Guntur Delta</span>
                  <h3 className="text-2xl md:text-4xl font-serif font-bold leading-tight">Fresh Paddy Procured and Milled Sanitarily</h3>
                  <p className="text-xs md:text-sm opacity-85 leading-relaxed">
                    By bypassing secondary middlemen brokers, Jagan Mohan Rice Mill procures raw harvests directly from Guntur delta agriculturists. This sustains fair prices for farmers and delivers outstanding value directly to your household.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs">
                      <CheckCircle className="w-4 h-4 text-accent-gold" />
                      <span>Computerized Color Sorters</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs">
                      <CheckCircle className="w-4 h-4 text-accent-gold" />
                      <span>Double-Polished Steam Process</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs">
                      <CheckCircle className="w-4 h-4 text-accent-gold" />
                      <span>Moisture Sealing Bags</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {/* Tab Selector for Photo vs Video (Swipe Type) */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white/5 p-3 rounded-3xl border border-white/10 shadow-lg">
                    {/* True Swipe-type Toggle Switch */}
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setInspectionMode(prev => prev === 'video' ? 'photo' : 'video')}
                        className="relative w-56 h-10 bg-black/45 rounded-full p-1 border border-white/15 cursor-pointer flex items-center select-none shadow-inner"
                      >
                        {/* Track Labels */}
                        <div className="absolute inset-0 flex justify-between items-center px-6 text-[10px] font-extrabold uppercase tracking-widest text-white/50 pointer-events-none">
                          <span>Video</span>
                          <span>Photo</span>
                        </div>

                        {/* Active Slide Knob with genuine drag/swipe motion */}
                        <motion.div
                          drag="x"
                          dragConstraints={{ left: 0, right: 104 }}
                          dragElastic={0.25}
                          dragMomentum={false}
                          animate={{ x: inspectionMode === 'video' ? 0 : 104 }}
                          onDragEnd={(event, info) => {
                            if (info.offset.x > 30) {
                              setInspectionMode('photo');
                            } else if (info.offset.x < -30) {
                              setInspectionMode('video');
                            }
                          }}
                          className="w-[108px] h-8 bg-accent-gold rounded-full flex items-center justify-center text-[10px] font-extrabold text-[#0B4A3A] uppercase tracking-wider shadow-md select-none cursor-grab active:cursor-grabbing z-10"
                        >
                          {inspectionMode === 'video' ? 'Video Live' : 'Photo HD'}
                        </motion.div>
                      </div>
                      <span className="text-[9px] text-white/40 italic hidden sm:inline">(Drag or click to swipe)</span>
                    </div>

                    {/* Admin-Only File Upload Actions */}
                    {currentUser?.role === 'admin' ? (
                      <div className="flex gap-2">
                        {inspectionMode === 'video' ? (
                          <div className="relative">
                            <input
                              type="file"
                              accept="video/*"
                              id="inspection-video-upload"
                              onChange={handleVideoUpload}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            <button
                              type="button"
                              className="flex items-center gap-1.5 bg-[#0B4A3A] hover:bg-[#0B4A3A]/85 text-white border border-white/20 px-3.5 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md"
                            >
                              <Upload className="w-3.5 h-3.5 text-accent-gold" />
                              <span>Upload Video</span>
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              id="inspection-photo-upload"
                              onChange={handlePhotoUpload}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            <button
                              type="button"
                              className="flex items-center gap-1.5 bg-[#0B4A3A] hover:bg-[#0B4A3A]/85 text-white border border-white/20 px-3.5 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md"
                            >
                              <Upload className="w-3.5 h-3.5 text-accent-gold" />
                              <span>Upload Photo</span>
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-1 bg-accent-gold/20 text-accent-gold border border-accent-gold/25 px-2 py-1 rounded-xl text-[8px] font-bold uppercase tracking-wider">
                          <span>ADMIN ACCESS</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-white/30 text-[9px] font-extrabold uppercase tracking-widest">
                        <span>Mill Quality Monitor</span>
                      </div>
                    )}
                  </div>

                  {/* Core Inspection Container (Clean layout: no overlay texts) */}
                  <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-black flex items-center justify-center group/player">
                    {inspectionMode === 'photo' ? (
                      <img
                        src={inspectionPhotoUrl}
                        alt="Paddy milling grain inspection"
                        className="w-full h-full object-cover select-none"
                        onError={(e) => {
                          e.currentTarget.src = "/assets/logo.jpeg";
                        }}
                      />
                    ) : (
                      <>
                        <video
                          key={inspectionVideoUrl}
                          src={inspectionVideoUrl}
                          className="w-full h-full object-cover"
                          loop
                          playsInline
                          autoPlay={isVideoPlaying}
                          muted={isVideoMuted}
                        />

                        {/* Interactive Audio & Video Player Controls Overlay (No text overlay) */}
                        <div className="absolute bottom-3 right-3 flex gap-1.5 pointer-events-auto z-10">
                          <button
                            type="button"
                            onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                            className="w-8 h-8 rounded-full bg-black/60 hover:bg-primary-green text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer shadow-md"
                            title={isVideoPlaying ? 'Pause Feed' : 'Play Feed'}
                          >
                            {isVideoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsVideoMuted(!isVideoMuted)}
                            className="w-8 h-8 rounded-full bg-black/60 hover:bg-primary-green text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer shadow-md"
                            title={isVideoMuted ? 'Unmute Audio' : 'Mute Audio'}
                          >
                            {isVideoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Centered Large Play/Pause Notification Accent */}
                        {!isVideoPlaying && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none transition-all">
                            <div className="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center text-white/80">
                              <Play className="w-6 h-6 fill-current ml-0.5" />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: PRODUCTS CATALOG PAGE */}
        {currentTab === 'products' && (
          <div id="catalog-filters" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Mobile Filter Toggle Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-primary-green/10 text-primary-green hover:bg-bg-cream/20 py-3 px-4 rounded-2xl text-xs font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{showMobileFilters ? 'Hide Catalog Filters' : 'Show Catalog Filters'}</span>
                {(selectedCategory !== 'All' || priceRange < 200 || selectedSizeFilter !== 'All' || onlyInStock) && (
                  <span className="ml-1 w-2.5 h-2.5 rounded-full bg-accent-gold" />
                )}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Left Rail Sidebar: Filters */}
              <aside className={`w-full lg:w-64 bg-white border border-primary-green/5 rounded-3xl p-5 shrink-0 shadow-xs space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-serif font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-primary-green" />
                    <span>Catalog Filters</span>
                  </h3>
                  <button 
                    onClick={() => {
                      setSelectedCategory('All');
                      setPriceRange(200);
                      setSelectedSizeFilter('All');
                      setOnlyInStock(false);
                      setSearchQuery('');
                      setSortOption('popularity');
                    }}
                    className="text-[9px] text-accent-gold uppercase tracking-widest font-bold hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {/* Categories Select Dropdown/List */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Milling Category</label>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`text-xs text-left px-2.5 py-1.5 rounded-full transition-colors font-semibold ${selectedCategory === 'All' ? 'bg-primary-green text-white font-bold shadow-md' : 'hover:bg-bg-cream/50 text-gray-600'}`}
                    >
                      All Varieties
                    </button>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs text-left px-2.5 py-1.5 rounded-full transition-colors font-semibold ${selectedCategory === cat ? 'bg-primary-green text-white font-bold shadow-md' : 'hover:bg-bg-cream/50 text-gray-600'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2 border-t border-gray-50 pt-4">
                  <div className="flex justify-between items-baseline">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Price / kg</label>
                    <span className="text-xs font-bold text-primary-green">₹{priceRange}</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={200}
                    step={5}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-green"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400">
                    <span>₹40/kg</span>
                    <span>₹200/kg</span>
                  </div>
                </div>

                {/* Bag Sizing Filter */}
                <div className="space-y-2 border-t border-gray-50 pt-4">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pack Bag Sizing</label>
                  <select
                    value={selectedSizeFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedSizeFilter(val === 'All' ? 'All' : Number(val));
                    }}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-green font-semibold cursor-pointer"
                  >
                    <option value="All">All Bag Weights</option>
                    <option value="0.5">500 gms Only</option>
                    <option value="1">1 kg Bag Only</option>
                    <option value="2">2 kg Bag Only</option>
                    <option value="5">5 kg Bag Only</option>
                    <option value="10">10 kg Bag Only</option>
                    <option value="26">26 kg Bag Only</option>
                    <option value="50">50 kg Bag Only</option>
                  </select>
                </div>

                {/* Stock Switcher */}
                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer" htmlFor="stock-switch">
                    Only In Stock Items
                  </label>
                  <input
                    id="stock-switch"
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 text-primary-green focus:ring-primary-green border-gray-300 rounded cursor-pointer"
                  />
                </div>
              </aside>

              {/* Products Grid + Search/Sorting headers */}
              <div className="flex-grow space-y-6">
                
                {/* Search query header + sort option */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="relative flex-grow sm:max-w-md">
                    <input
                      type="text"
                      placeholder="Search signature rose, bullet bpt, matta, millets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-primary-green transition-all"
                    />
                    <Search className="w-4.5 h-4.5 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Sort by</span>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="text-xs bg-gray-50 border border-gray-200 p-2 rounded-lg focus:outline-none font-bold cursor-pointer text-gray-700"
                    >
                      <option value="popularity">Popularity (Rating)</option>
                      <option value="newest">Newest Arrived</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                {sortedProducts.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
                    <p className="text-xs text-gray-400 font-bold italic mb-2">No matching products found</p>
                    <p className="text-[11px] text-gray-400">Try loosening your search query or selecting another category.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onAddToCart={handleAddToCart}
                        onQuickView={setSelectedProduct}
                        isWishlisted={wishlist.includes(p.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: ABOUT PAGE */}
        {currentTab === 'about' && <AboutPage />}

        {/* VIEW 4: CONTACT PAGE */}
        {currentTab === 'contact' && <ContactPage />}

        {/* VIEW 5: SHOPPING CART */}
        {currentTab === 'cart' && (
          <Cart
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onCheckout={handleCheckoutInitiate}
            onContinueShopping={() => setCurrentTab('products')}
            coupons={coupons}
          />
        )}

        {/* VIEW 6: SECURE CHECKOUT */}
        {currentTab === 'checkout' && (
          <Checkout
            cartItems={cart}
            appliedCoupon={checkoutCoupon}
            totalWeight={checkoutWeight}
            deliveryCharge={checkoutDelivery}
            customerName={currentUser?.name || ''}
            customerEmail={currentUser?.email || ''}
            customerPhone={currentUser?.phone || ''}
            onPlaceOrder={handlePlaceOrder}
            onCancel={() => setCurrentTab('cart')}
          />
        )}

        {/* VIEW 7: WISHLIST BOOKMARKS PAGE */}
        {currentTab === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500 fill-current" />
              <span>My Milled Wishlist Bookmarks</span>
            </h2>

            {wishlist.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 max-w-lg mx-auto p-8 shadow-xs">
                <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <h3 className="font-display font-bold text-gray-800 text-base mb-1">No bookmarked varieties yet</h3>
                <p className="text-xs text-gray-400 mb-6">Pencil mark your favorite crops in the catalog to quickly access them.</p>
                <button
                  onClick={() => setCurrentTab('products')}
                  className="bg-primary-green hover:bg-primary-green-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Start Catalog Browsing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products
                  .filter(p => wishlist.includes(p.id))
                  .map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onAddToCart={handleAddToCart}
                      onQuickView={setSelectedProduct}
                      isWishlisted={true}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* VIEW 8: CUSTOMER DASHBOARD */}
        {currentTab === 'dashboard' && currentUser && (
          <CustomerDashboard
            user={currentUser}
            orders={orders}
            wishlistProducts={products.filter(p => wishlist.includes(p.id))}
            onRemoveWishlist={handleToggleWishlist}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {/* VIEW 9: ADMIN PANEL & SECURE REDIRECT / ACCESS DENIED */}
        {currentTab === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminPanel
              products={products}
              orders={orders}
              onAddProduct={handleAddProductAdmin}
              onUpdateProduct={handleUpdateProductAdmin}
              onDeleteProduct={handleDeleteProductAdmin}
              onUpdateOrderStatus={handleUpdateOrderStatusAdmin}
              coupons={coupons}
              onAddCoupon={(newCoupon) => setCoupons(prev => [newCoupon, ...prev])}
              onDeleteCoupon={(code) => setCoupons(prev => prev.filter(c => c.code !== code))}
            />
          ) : (
            <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 bg-white border border-red-200/50 rounded-3xl shadow-xl my-8 animate-fade-in">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-serif font-bold text-gray-950">Access Denied</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  This terminal is strictly reserved for authorized Jagan Mohan Rice Mill administrators. 
                  Your current logged-in account does not have administrative clearance.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setTimeout(() => {
                      setShowAuthModal(true);
                    }, 150);
                  }}
                  className="bg-primary-green hover:bg-primary-green-dark text-white text-xs font-bold py-3 px-5 rounded-full shadow-lg shadow-primary-green/10 transition-colors cursor-pointer"
                >
                  Sign in with Admin Phone Number
                </button>
                <button
                  onClick={() => setCurrentTab('home')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-3 px-5 rounded-full transition-colors cursor-pointer"
                >
                  Return to Marketplace Home
                </button>
              </div>
            </div>
          )
        )}

      </main>

      {/* Footer Section */}
      <footer className="bg-primary-green text-white border-t border-white/5 font-sans">
        
        {/* Main Columns Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 items-start">
          
          {/* Col 1: Brand */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <JMRLogo className="w-10 h-10 bg-white p-1.5 rounded-full shadow-md shrink-0" />
              <div>
                <span className="block font-display font-black text-white text-base leading-none uppercase tracking-wider">
                  Jagan Mohan Rice Mill
                </span>
                <span className="block text-accent-gold text-[10px] font-bold font-display tracking-widest mt-1 uppercase">
                  Guntur Delta
                </span>
              </div>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Delivering premium standard white Sona Masoori, double-aged BPT Silk, long grain biryani basmati, health diet low-GI crops and high-fiber organic millets fresh from direct Guntur mills.
            </p>

            {/* Direct Contact indicators */}
            <div className="space-y-2 text-xs text-gray-300 pt-2 border-t border-white/5">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent-gold" />
                <span>1st Lane, Cobald Pet, Guntur, AP - 522002</span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-accent-gold" />
                <span>08632-230154 | +91 7382299666</span>
              </p>
            </div>
          </div>

          {/* Col 2: Categories quick links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-accent-gold">Milling Catalog</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              {CATEGORIES.slice(0, 5).map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => { setSelectedCategory(cat); setCurrentTab('products'); window.scrollTo(0, 0); }}
                    className="hover:text-accent-gold transition-colors text-left cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Support / Legal */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-accent-gold">Customer Support</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button 
                  onClick={() => { setCurrentTab('about'); window.scrollTo(0, 0); }}
                  className="hover:text-accent-gold transition-colors text-left cursor-pointer"
                >
                  About Our Mill
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setCurrentTab('contact'); window.scrollTo(0, 0); }}
                  className="hover:text-accent-gold transition-colors text-left cursor-pointer"
                >
                  Contact Helpdesk
                </button>
              </li>
              <li><span className="opacity-60 cursor-not-allowed">Privacy Policy</span></li>
              <li><span className="opacity-60 cursor-not-allowed">Terms of Carriage</span></li>
            </ul>
          </div>

          {/* Col 4: Dispatch metrics */}
          <div className="lg:col-span-3 space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-accent-gold">Direct Delivery Logistics</h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              We pack freshly milled grains in heavy protective bags. Minimum order size is <strong>10 kg</strong> with free delivery for Guntur orders above 50 kg.
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] uppercase font-sans font-bold text-gray-400">Guaranteed Dispatch</span>
              <strong className="text-xs text-emerald-400 font-bold">Within 24 Hours</strong>
            </div>
          </div>

        </div>

        {/* Bottom Bar copyright */}
        <div className="border-t border-white/5 bg-primary-green-dark text-center py-5 text-[11px] text-gray-400 font-sans">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© 2026 Jagan Mohan Rice Mill. All Rights Reserved. Guntur, AP.</span>
            <div className="flex gap-4">
              <a href="https://wa.me/7382299666" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">WhatsApp Helpdesk</a>
              <span>•</span>
              <span className="text-gray-500 font-mono text-[10px]">Merchant UPID: 7382299666@ybl</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Dynamic Product Details modal view */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isWishlisted={wishlist.includes(selectedProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          relatedProducts={products
            .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
            .slice(0, 3)
          }
          onSelectProduct={setSelectedProduct}
          onAddReview={handleAddReview}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Floating Phone & WhatsApp Chat Inquiry Support Widget */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[999] flex flex-col items-end">
        
        {/* Animated Popover Panel */}
        <AnimatePresence>
          {showChatPopover && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-80 bg-white rounded-3xl shadow-2xl border border-primary-green/5 overflow-hidden mb-4 text-[#1A1A1A] flex flex-col"
            >
              {/* Header */}
              <div className="bg-[#0B4A3A] p-4 text-white relative">
                <button 
                  onClick={() => setShowChatPopover(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Close helpdesk"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center font-serif text-accent-gold font-bold text-sm">
                      JMR
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0B4A3A] rounded-full"></span>
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-white flex items-center gap-1">
                      Jagan Mohan Rice Mill
                    </h4>
                    <p className="text-[10px] text-emerald-300 font-sans tracking-wide">Support Desk • Online</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Interested in wholesale prices, custom dispatch, or premium crops like <strong>BPT Silk</strong> &amp; <strong>Kurnool Sona</strong>? Chat with our team now!
                </p>

                {/* Pre-filled Message Preview */}
                <div className="bg-bg-cream/40 border border-primary-green/5 p-3 rounded-2xl relative">
                  <span className="absolute -top-2 left-4 px-2 py-0.5 bg-accent-gold text-[#1A1A1A] text-[8px] uppercase tracking-widest font-bold rounded-md">
                    Message Preview
                  </span>
                  <p className="text-[11px] text-gray-700 italic pt-1 leading-normal">
                    "Hi, I am inquiring about premium rice varieties from Jagan Mohan Rice Mill. Please share the pricing list and order delivery details."
                  </p>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <a
                    href="https://wa.me/917382299666?text=Hi%2C%20I%20am%20inquiring%20about%20premium%20rice%20varieties%20from%20Jagan%20Mohan%20Rice%20Mill.%20Could%20you%20please%20share%20the%20pricing%20and%20delivery%20details%20for%20my%20order%3F"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setShowChatPopover(false)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white/10" />
                    <span>Inquire via WhatsApp</span>
                  </a>

                  <a
                    href="tel:+917382299666"
                    onClick={() => setShowChatPopover(false)}
                    className="w-full flex items-center justify-center gap-2 bg-bg-cream/60 hover:bg-bg-cream text-primary-green-dark border border-primary-green/10 font-sans text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <PhoneCall className="w-4 h-4 text-primary-green" />
                    <span>Call Sales: 7382299666</span>
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50/80 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                <span>Free delivery on Guntur orders &gt; 50kg</span>
                <span className="font-mono text-[9px]">Guntur, AP</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <div className="relative group">
          
          {/* Animated Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#0B4A3A] border border-accent-gold/20 text-white text-[10px] uppercase tracking-wider font-bold py-1.5 px-3 rounded-xl shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 md:block hidden pointer-events-none transition-all duration-300">
            Quick Inquiry 💬
          </div>

          {/* Glowing Ring when closed */}
          {!showChatPopover && (
            <span className="absolute inset-0 rounded-full bg-emerald-600/30 animate-pulse -m-1 pointer-events-none z-0"></span>
          )}

          {/* Main FAB */}
          <button
            onClick={() => setShowChatPopover(!showChatPopover)}
            className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer ${
              showChatPopover 
                ? 'bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rotate-90' 
                : 'bg-emerald-600 hover:bg-emerald-500 hover:scale-105 active:scale-95 text-white'
            }`}
            aria-label="Contact helpdesk"
          >
            {showChatPopover ? (
              <X className="w-6 h-6" />
            ) : (
              <>
                <MessageCircle className="w-7 h-7" />
                {/* Active Notification Dot */}
                <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent-gold"></span>
                </span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}

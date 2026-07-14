import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Star, ShieldCheck, Flame, Scale, Trophy, Camera, Trash2, Image as ImageIcon, Share2, Check, Copy, MessageCircle } from 'lucide-react';
import { Product, Review } from '../types';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: number, qty: number, selectedAge?: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  relatedProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onAddReview: (productId: string, review: Review) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  relatedProducts,
  onSelectProduct,
  onAddReview
}: ProductDetailsModalProps) {
  const [selectedSize, setSelectedSize] = useState<number>(product.bagSizes[0] || 26);
  const [selectedAge, setSelectedAge] = useState<string>('1 Year Old');
  const [quantity, setQuantity] = useState<number>(1);
  const [reviewName, setReviewName] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#product=${product.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error("Failed to copy link:", err);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach((file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setReviewImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      filesArray.forEach((file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setReviewImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const [activeTab, setActiveTab] = useState<'details' | 'nutrition' | 'reviews'>('details');
  const [agingPremium, setAgingPremium] = useState<number>(() => {
    return Number(localStorage.getItem('jm_lotus_aging_premium') || '4');
  });
  const [deamPremium, setDeamPremium] = useState<number>(() => {
    return Number(localStorage.getItem('jm_lotus_deam_premium') || '6');
  });

  useEffect(() => {
    const handleUpdate = () => {
      setAgingPremium(Number(localStorage.getItem('jm_lotus_aging_premium') || '4'));
      setDeamPremium(Number(localStorage.getItem('jm_lotus_deam_premium') || '6'));
    };
    window.addEventListener('jm_settings_updated', handleUpdate);
    return () => window.removeEventListener('jm_settings_updated', handleUpdate);
  }, []);

  const basePricePerKg = product.id === 'jm-lotus'
    ? (selectedAge === '2 Years Old'
        ? product.price + agingPremium
        : (selectedAge === 'Deam'
            ? product.price + deamPremium
            : product.price))
    : product.price;

  const discountedPrice = Math.round(basePricePerKg * (1 - product.discount / 100));
  const currentPrice = discountedPrice * selectedSize;
  const originalPrice = basePricePerKg * selectedSize;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment || !reviewEmail) return;

    const newReview: Review = {
      id: 'rev-' + Date.now(),
      userName: reviewName,
      userEmail: reviewEmail,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split('T')[0],
      images: reviewImages.length > 0 ? reviewImages : undefined
    };

    onAddReview(product.id, newReview);
    
    // Reset review inputs
    setReviewName('');
    setReviewEmail('');
    setReviewRating(5);
    setReviewComment('');
    setReviewImages([]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div 
        id="product-details-modal"
        className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full h-[85vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black p-2.5 rounded-full transition-all duration-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
 
        {/* Modal Content Grid */}
        <div className="p-5 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Gallery / Image Column */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-b from-[#F9F7F2] to-[#F1EDE2] border border-primary-green/5 shadow-inner flex items-center justify-center p-6 sm:p-8">
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-xl hover:scale-103 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/logo.jpeg";
                    }}
                  />
                </div>
                {product.discount > 0 && (
                  <span className="absolute top-4 left-4 bg-accent-gold text-white font-serif text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-sm">
                    {product.discount}% OFF SPECIAL OFFER
                  </span>
                )}
              </div>
              
              {/* Trust indicators */}
              <div className="grid grid-cols-3 gap-2 bg-bg-cream/50 p-3 rounded-xl border border-gray-100 text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-primary-green mb-1" />
                  <span className="text-[10px] font-bold text-gray-700 uppercase">100% Organic</span>
                </div>
                <div className="flex flex-col items-center border-x border-gray-200">
                  <Trophy className="w-5 h-5 text-accent-gold mb-1" />
                  <span className="text-[10px] font-bold text-gray-700 uppercase">Double Aged</span>
                </div>
                <div className="flex flex-col items-center">
                  <Scale className="w-5 h-5 text-primary-green mb-1" />
                  <span className="text-[10px] font-bold text-gray-700 uppercase">Precise Weight</span>
                </div>
              </div>
            </div>

            {/* Product Meta Column */}
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase text-accent-gold tracking-widest mb-1">
                {product.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1A1A] mb-2 leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-accent-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-200'}`}
                    />
                  ))}
                  <span className="ml-1.5 text-xs font-semibold text-gray-600">
                    {product.rating} ({product.reviews.length} customer reviews)
                  </span>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                  product.stock > 100 
                    ? 'bg-green-50 text-green-700' 
                    : product.stock > 0 
                      ? 'bg-orange-50 text-orange-700' 
                      : 'bg-red-50 text-red-700'
                }`}>
                  {product.stock > 100 ? 'In Stock' : product.stock > 0 ? 'Limited Stock' : 'Out Of Stock'}
                </span>
              </div>

              {/* Price Row */}
              <div className="bg-emerald-50/20 p-5 rounded-3xl border border-primary-green/10 mb-6 shadow-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-primary-green-dark uppercase tracking-wider block">
                    Selected Pack Price ({selectedSize === 0.5 ? '500g' : `${selectedSize}kg`})
                  </span>
                  {product.discount > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Save {product.discount}% OFF
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-sans font-extrabold text-primary-green-dark tracking-tight">
                    ₹{currentPrice}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-lg font-medium text-gray-400 line-through">
                      ₹{originalPrice}
                    </span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-primary-green/10 text-xs text-gray-600 flex flex-wrap gap-2 justify-between items-center font-medium">
                  <span className="flex items-center gap-1.5">
                    Unit Price: <strong className="text-primary-green font-bold text-sm bg-primary-green/5 px-2.5 py-0.5 rounded border border-primary-green/10">₹{discountedPrice} / kg</strong>
                  </span>
                  {product.discount > 0 && (
                    <span className="text-emerald-800 font-bold bg-emerald-100/70 px-3 py-1 rounded-full text-xs shadow-xs">
                      You save ₹{originalPrice - currentPrice}!
                    </span>
                  )}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Pack Size (Weight)
                </label>
                <div className="flex gap-2">
                  {product.bagSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all ${
                        selectedSize === size
                          ? 'bg-primary-green border-primary-green text-white shadow-md'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {size === 0.5 ? '500gms' : `${size} kg`} Bag
                    </button>
                  ))}
                </div>
              </div>

              {/* Ageing Selector (Lotus Rice) */}
              {product.id === 'jm-lotus' && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Select Ageing Type
                  </label>
                  <div className="flex gap-2">
                    {['1 Year Old', '2 Years Old', 'Deam'].map((age) => (
                      <button
                        key={age}
                        id={`age-modal-btn-${product.id}-${age.replace(/\s+/g, '-')}`}
                        type="button"
                        onClick={() => setSelectedAge(age)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all ${
                          selectedAge === age
                            ? 'bg-accent-gold border-accent-gold text-[#1A1A1A] shadow-md'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Wishlist */}
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Quantity
                  </label>
                  <div className="flex items-center border border-primary-green/10 rounded-full bg-bg-cream/30 overflow-hidden h-11">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 text-gray-500 hover:text-primary-green font-bold text-base cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 font-bold text-gray-700 min-w-8 text-center text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 text-gray-500 hover:text-primary-green font-bold text-base cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex-grow flex gap-2 pt-5">
                  <button
                    onClick={() => onAddToCart(product, selectedSize, quantity, product.id === 'jm-lotus' ? selectedAge : undefined)}
                    className="flex-grow bg-primary-green hover:bg-primary-green-dark text-white text-[11px] uppercase tracking-widest font-bold h-11 rounded-full flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    ADD TO CART (₹{currentPrice * quantity})
                  </button>

                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className={`p-3 rounded-full border h-11 w-11 flex items-center justify-center transition-all cursor-pointer ${
                      isWishlisted
                        ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-red-500 hover:bg-gray-100'
                    }`}
                    title="Toggle Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`p-3 rounded-full border h-11 w-11 flex items-center justify-center transition-all cursor-pointer ${
                      copied
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 shadow-inner'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-primary-green hover:bg-gray-100'
                    }`}
                    title={copied ? "Link Copied!" : "Copy Product Link"}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Direct Share Options and WhatsApp */}
                <div className="mt-4 flex gap-3 items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-gray-400 font-sans">Share:</span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 hover:text-primary-green transition-colors font-semibold bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied! ✓' : 'Copy Link'}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} at Jagan Mohan Rice Mill! Perfect premium quality. Price: ₹${currentPrice} for ${selectedSize}kg. See here: ${window.location.origin}${window.location.pathname}#product=${product.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors font-semibold bg-emerald-50/50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Tabs Section */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2.5 px-4 text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'border-primary-green text-primary-green'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Product Details
              </button>
              {product.nutrition && (
                <button
                  onClick={() => setActiveTab('nutrition')}
                  className={`pb-2.5 px-4 text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                    activeTab === 'nutrition'
                      ? 'border-primary-green text-primary-green'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Nutrition Info
                </button>
              )}
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2.5 px-4 text-sm font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'border-primary-green text-primary-green'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Reviews ({product.reviews.length})
              </button>
            </div>

            {/* Tab content 1: Details */}
            {activeTab === 'details' && (
              <div className="prose max-w-none text-sm text-gray-600 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">Mill Processing Specifications</h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                      <li>Double-polished steam-purified grains</li>
                      <li>Aged under optimal temperature control</li>
                      <li>Premium grain sorting via computerized color-sorters</li>
                      <li>Moisture-sealed high durability bags</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">Cooking Instructions</h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs">
                      <li>Rinse gently under cold water 2-3 times</li>
                      <li>Soak for 20-30 minutes for best expansion</li>
                      <li>Recommended ratio: 1 cup rice to 2 cups water</li>
                      <li>Cook in closed vessel or premium electric cooker</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab content 2: Nutrition */}
            {activeTab === 'nutrition' && product.nutrition && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-bg-cream p-3 rounded-xl text-center border border-gray-100">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Calories</span>
                  <span className="text-sm font-bold text-gray-800">{product.nutrition.calories}</span>
                </div>
                <div className="bg-bg-cream p-3 rounded-xl text-center border border-gray-100">
                  <span className="font-display font-bold text-primary-green text-base block mb-1">PRO</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Protein</span>
                  <span className="text-sm font-bold text-gray-800">{product.nutrition.protein}</span>
                </div>
                <div className="bg-bg-cream p-3 rounded-xl text-center border border-gray-100">
                  <span className="font-display font-bold text-accent-gold text-base block mb-1">CAR</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Carbs</span>
                  <span className="text-sm font-bold text-gray-800">{product.nutrition.carbs}</span>
                </div>
                <div className="bg-bg-cream p-3 rounded-xl text-center border border-gray-100">
                  <span className="font-display font-bold text-gray-500 text-base block mb-1">FAT</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Fat</span>
                  <span className="text-sm font-bold text-gray-800">{product.nutrition.fat}</span>
                </div>
                <div className="bg-bg-cream p-3 rounded-xl text-center border border-gray-100">
                  <span className="font-display font-bold text-emerald-600 text-base block mb-1">FIB</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Fiber</span>
                  <span className="text-sm font-bold text-gray-800">{product.nutrition.fiber}</span>
                </div>
              </div>
            )}

            {/* Tab content 3: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Reviews List */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {product.reviews.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-4">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    product.reviews.map((rev) => (
                      <div key={rev.id} className="border-b border-gray-100 pb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-gray-800">{rev.userName}</span>
                          <span className="text-[10px] text-gray-400">{rev.date}</span>
                        </div>
                        <div className="flex text-yellow-500 mb-1">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${idx < rev.rating ? 'fill-current' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">{rev.comment}</p>
                        {rev.images && rev.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {rev.images.map((img, idx) => (
                              <div
                                key={idx}
                                onClick={() => setLightboxImage(img)}
                                className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-gray-100 cursor-zoom-in hover:border-primary-green transition-all bg-bg-cream flex items-center justify-center p-0.5 shadow-xs"
                              >
                                <img
                                  src={img}
                                  alt="Grain quality review"
                                  className="max-w-full max-h-full object-contain rounded-md"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add review form */}
                <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Write an Honest Review</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="E.g. Srinivas Rao"
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-green"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={reviewEmail}
                        onChange={(e) => setReviewEmail(e.target.value)}
                        placeholder="E.g. srinivas@gmail.com"
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-green"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setReviewRating(val)}
                          className="text-yellow-500"
                        >
                          <Star className={`w-6 h-6 ${val <= reviewRating ? 'fill-current' : 'text-gray-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1">Review Description</label>
                    <textarea
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your cooking and tasting experience with Jagan Mohan Rice..."
                      rows={3}
                      className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-green resize-none"
                    />
                  </div>

                  {/* Photo Upload with Drag and Drop Support */}
                  <div className="mb-4">
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold mb-1.5">
                      Share Grain Quality Photos (Optional)
                    </label>
                    <div className="flex flex-wrap gap-3 items-center">
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-green hover:bg-emerald-50/20 cursor-pointer transition-all group relative"
                      >
                        <Camera className="w-5 h-5 text-gray-400 group-hover:text-primary-green mb-1" />
                        <span className="text-[9px] text-gray-400 group-hover:text-primary-green font-semibold">Upload</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>

                      {reviewImages.map((img, index) => (
                        <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-white flex items-center justify-center shadow-xs">
                          <img src={img} alt="Preview grain quality" className="max-w-full max-h-full object-contain p-1" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1">Tip: You can also drag & drop grain photos directly onto the upload box.</p>
                  </div>

                  <button
                    type="submit"
                    className="bg-primary-green hover:bg-primary-green-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="font-serif font-bold text-[#1A1A1A] text-base mb-4">Related Premium Crops</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {relatedProducts.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="group border border-primary-green/5 hover:border-primary-green/20 p-2.5 rounded-2xl cursor-pointer hover:shadow-md transition-all flex items-center gap-3 bg-white"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        referrerPolicy="no-referrer" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        onError={(e) => {
                          e.currentTarget.src = "/assets/logo.jpeg";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-sans font-bold text-gray-800 text-xs truncate group-hover:text-primary-green transition-colors">{p.name}</h4>
                      <p className="text-[11px] text-primary-green-dark font-bold font-sans">₹{p.price}/kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Enlarged grain quality review" 
            className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl object-contain border border-white/10"
          />
        </div>
      )}
    </div>
  );
}

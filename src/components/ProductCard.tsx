import React, { useState, useEffect } from 'react';
import { Eye, Heart, ShoppingBag, Sparkles, Share2, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (product: Product, size: number, qty: number, selectedAge?: string) => void;
  onQuickView: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onQuickView,
  isWishlisted,
  onToggleWishlist
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<number>(product.bagSizes[0] || 26);
  const [selectedAge, setSelectedAge] = useState<string>('1 Year Old');
  const [quantity, setQuantity] = useState<number>(1);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [agingPremium, setAgingPremium] = useState<number>(() => {
    return Number(localStorage.getItem('jm_lotus_aging_premium') || '4');
  });
  const [deamPremium, setDeamPremium] = useState<number>(() => {
    return Number(localStorage.getItem('jm_lotus_deam_premium') || '6');
  });

  const handleCardShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#product=${product.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    }).catch((err) => {
      console.error("Failed to copy link:", err);
    });
  };

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedSize, quantity, product.id === 'jm-lotus' ? selectedAge : undefined);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-white rounded-3xl border border-primary-green/5 hover:border-primary-green/20 overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Tag */}
      {product.discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-accent-gold text-white font-serif text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          {product.discount}% OFF
        </span>
      )}

      {/* Wishlist Button */}
      <button
        id={`wishlist-btn-${product.id}`}
        onClick={() => onToggleWishlist(product.id)}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full border shadow-sm transition-all duration-300 ${
          isWishlisted
            ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100'
            : 'bg-white/85 backdrop-blur-xs border-gray-150 text-gray-400 hover:text-red-500 hover:bg-white'
        }`}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart className={`w-4 h-4 transition-transform duration-300 ${isWishlisted ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
      </button>

      {/* Share/Copy Button */}
      <button
        id={`share-btn-${product.id}`}
        onClick={(e) => {
          e.stopPropagation();
          handleCardShare();
        }}
        className={`absolute top-3 right-13 z-10 p-2 rounded-full border shadow-sm transition-all duration-300 ${
          copiedCard
            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
            : 'bg-white/85 backdrop-blur-xs border-gray-150 text-gray-400 hover:text-primary-green hover:bg-white'
        }`}
        title={copiedCard ? 'Link Copied!' : 'Copy Product Link'}
      >
        {copiedCard ? (
          <Check className="w-4 h-4" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>

      {/* Product Image Section */}
      <div 
        onClick={() => onQuickView(product)}
        className="relative pt-[90%] bg-gradient-to-b from-[#F9F7F2] to-[#F1EDE2] overflow-hidden cursor-pointer flex items-center justify-center border-b border-primary-green/5"
      >
        <div className="absolute inset-4 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-700 ease-out group-hover:scale-108 drop-shadow-md"
            onError={(e) => {
              console.log("FAILED IMAGE:", product.image);
            }}
          />
        </div>
        {/* Category Overlay Badge */}
        <span className="absolute bottom-3 left-3 bg-[#0B4A3A] text-white font-sans text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded shadow-xs">
          {product.category}
        </span>
      </div>

      {/* Details Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Rating and Stock */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-accent-gold font-bold text-xs">★</span>
            <span className="text-xs font-semibold text-gray-600">{product.rating}</span>
            <span className="text-gray-300 text-[10px]">({product.reviews.length})</span>
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            product.stock > 100 
              ? 'bg-green-50 text-green-700' 
              : product.stock > 0 
                ? 'bg-orange-50 text-orange-700' 
                : 'bg-red-50 text-red-700'
          }`}>
            {product.stock > 100 ? 'In Stock' : product.stock > 0 ? 'Limited Stock' : 'Out Of Stock'}
          </span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onQuickView(product)}
          className="font-serif font-bold text-gray-900 group-hover:text-primary-green transition-colors line-clamp-1 cursor-pointer text-base mb-1"
        >
          {product.name}
        </h3>



        {/* Size Selector */}
        <div className="mb-4">
          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Select Pack Weight
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {product.bagSizes.map((size) => (
              <button
                key={size}
                id={`size-btn-${product.id}-${size}`}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full border transition-all ${
                  selectedSize === size
                    ? 'bg-primary-green border-primary-green text-white shadow-xs'
                    : 'bg-bg-cream/40 border-primary-green/10 text-gray-600 hover:bg-bg-cream hover:border-primary-green/20'
                }`}
              >
                {size === 0.5 ? '500gms' : `${size} kg`}
              </button>
            ))}
          </div>
        </div>

        {/* Ageing Selection (Lotus Rice) */}
        {product.id === 'jm-lotus' && (
          <div className="mb-4">
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Select Ageing Type
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {['1 Year Old', '2 Years Old', 'Deam'].map((age) => (
                <button
                  key={age}
                  id={`age-btn-${product.id}-${age.replace(/\s+/g, '-')}`}
                  type="button"
                  onClick={() => setSelectedAge(age)}
                  className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full border transition-all ${
                    selectedAge === age
                      ? 'bg-accent-gold border-accent-gold text-[#1A1A1A] shadow-xs'
                      : 'bg-bg-cream/40 border-primary-green/10 text-gray-600 hover:bg-bg-cream hover:border-primary-green/20'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Section */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              Price ({selectedSize === 0.5 ? '500g' : `${selectedSize}kg`})
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-sans font-extrabold text-primary-green-dark">
                ₹{currentPrice}
              </span>
              {product.discount > 0 && (
                <span className="text-xs font-semibold text-gray-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                ₹{discountedPrice}/kg
              </span>
              {product.discount > 0 && (
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  {product.discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center border border-primary-green/10 rounded-full bg-bg-cream/30">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2.5 py-1 text-gray-500 hover:text-primary-green text-xs font-bold"
            >
              -
            </button>
            <span className="px-1.5 text-xs font-bold text-gray-750 min-w-4 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-2.5 py-1 text-gray-500 hover:text-primary-green text-xs font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart Action */}
        <button
          id={`add-to-cart-btn-${product.id}`}
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="w-full mt-4 bg-primary-green text-white py-2.5 px-4 rounded-full text-[11px] font-bold hover:bg-primary-green-dark transition-all duration-300 flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer uppercase tracking-widest"
        >
          <ShoppingBag className="w-4 h-4" />
          {product.stock <= 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
        </button>
      </div>
    </div>
  );
}

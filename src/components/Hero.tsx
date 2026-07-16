import React from 'react';
import { ShoppingBag, ChevronRight, Award, ShieldCheck, Truck, Sparkles, Building2 } from 'lucide-react';
import JMRLogo from './JMRLogo';

interface HeroProps {
  onShopNow: () => void;
  onExploreProducts: () => void;
}

export default function Hero({ onShopNow, onExploreProducts }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-bg-cream pt-10 pb-16 md:py-24">
      {/* Absolute Decorative Golden Orbits */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-gold/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-primary-green/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Intro Column */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-green/5 border border-primary-green/10 rounded-full w-fit">
              <JMRLogo className="w-5 h-5" />
              <span className="text-[10px] uppercase font-bold text-primary-green tracking-widest">Farm to Table &bull; Guntur, Andhra Pradesh</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-primary-green leading-[1.1] tracking-tight">
              Premium Rice <br />
              <span className="italic font-normal text-accent-gold-dark">Delivered Fresh</span> <br />
              From Our Mill.
            </h1>

            <p className="text-sm md:text-base text-gray-500 max-w-xl font-sans leading-relaxed">
              Experience the authentic taste of Guntur's finest rice. Tradition-rich processing methods ensuring high nutritional value and superior aroma in every grain.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                id="hero-shop-now"
                onClick={onShopNow}
                className="px-8 py-3.5 bg-primary-green text-white rounded-full font-bold text-sm hover:bg-primary-green-dark shadow-lg shadow-primary-green/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                <span>Shop Now</span>
              </button>

              <button
                id="hero-explore"
                onClick={onExploreProducts}
                className="px-8 py-3.5 border border-accent-gold text-accent-gold rounded-full font-bold text-sm hover:bg-accent-gold/5 uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>SHOW CATALOG FILTERS</span>
                <ChevronRight className="w-4 h-4 text-accent-gold" />
              </button>
            </div>

            {/* Feature Statistics */}
            <div className="flex items-center gap-6 sm:gap-10 pt-4 border-t border-gray-150">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-primary-green">50+</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">Varieties</span>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-primary-green">10k+</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">Customers</span>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-primary-green">24h</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-0.5">Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Large Hero Image Column */}
          <div className="lg:col-span-6 relative h-[500px] sm:h-[650px] lg:h-[700px] flex items-center justify-center">
            {/* Soft glowing halo */}
            <div className="absolute w-96 h-96 bg-primary-green/5 rounded-full opacity-50 blur-3xl"></div>
            
            {/* Sack Showcase Card style */}
            <div className="relative z-10 w-full max-w-[340px] sm:max-w-[440px] lg:max-w-[480px] bg-white rounded-3xl border border-primary-green/5 shadow-2xl flex flex-col p-5 sm:p-6 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="w-full h-80 sm:h-[440px] lg:h-[480px] bg-bg-cream rounded-2xl mb-5 relative flex items-center justify-center overflow-hidden border border-gray-100">
                <img
                  src="/rose.png?v=3"
                  alt="Jagan Mohan Rose"
                  className="w-full h-full object-contain p-4 scale-105 transition-transform duration-1000 hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/logo.jpeg";
                  }}
                />
                <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-md p-2 rounded-xl flex justify-between items-center border border-gray-100">
                  <span className="text-[9px] font-bold text-primary-green tracking-wider">BEST SELLER</span>
                  <span className="text-[10px] font-bold text-accent-gold">★ 4.9</span>
                </div>
              </div>
              
              <div className="w-full space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-primary-green">Jagan Mohan Rose</h3>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Premium Sona Masoori</p>
                  </div>
                  <span className="text-accent-gold-dark font-bold text-lg sm:text-xl">₹1,500</span>
                </div>
                <div className="flex gap-2 pt-3">
                  <div className="flex-1 h-10 border border-primary-green/20 rounded-xl flex items-center justify-center text-xs font-bold text-primary-green">26 KG BAG</div>
                  <button 
                    onClick={onShopNow}
                    className="w-10 h-10 bg-primary-green hover:bg-primary-green-dark text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute bottom-6 -left-4 bg-white p-3.5 rounded-2xl shadow-xl border border-primary-green/5 flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-gold/10 rounded-full flex items-center justify-center text-accent-gold-dark shrink-0">
                ★
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary-green">Organic Certified</span>
                <span className="text-[9px] text-gray-400 font-semibold leading-none">100% Pesticide Free</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

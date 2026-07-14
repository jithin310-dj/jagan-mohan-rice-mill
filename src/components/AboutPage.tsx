import React from 'react';
import { Award, ShieldCheck, HeartHandshake, History, HelpCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-accent-gold uppercase tracking-[0.2em] block">The Legacy of Guntur</span>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1A1A1A] leading-tight">
          Heritage Milled Grains Since Generation
        </h2>
        <p className="text-sm md:text-base text-gray-500 leading-relaxed font-sans">
          Nestled in Guntur, Andhra Pradesh, Jagan Mohan Rice Mill represents unmatched craftsmanship in procurement, ageing, milling, and supplying elite quality grain crops.
        </p>
      </div>

      {/* Hero Mill Visual Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl overflow-hidden border border-primary-green/5 p-6 md:p-10 shadow-xs">
        <div className="space-y-6">
          <div className="flex gap-4">
            <span className="p-3 bg-primary-green/5 text-primary-green rounded-2xl h-12 shrink-0">
              <History className="w-6 h-6" />
            </span>
            <div>
              <strong className="text-base text-[#1A1A1A] font-serif font-bold block mb-1">Our Humble Beginnings</strong>
              <p className="text-xs text-gray-400 leading-relaxed">
                Jagan Mohan Rice Mill was established in 1984 under the visionary leadership of Sri Karamsetti Sambha Siva Rao. What began as a single local rice huller has grown into one of Guntur's premier automated rice milling enterprises, processing thousands of metric tons of premium-quality rice every year. Built on decades of trust, innovation, and uncompromising quality standards, the mill combines traditional values with modern milling technology to deliver fresh, nutritious, and consistently high-quality rice to families, retailers, wholesalers, and institutions across Andhra Pradesh and beyond.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="p-3 bg-primary-green/5 text-primary-green rounded-2xl h-12 shrink-0">
              <Award className="w-6 h-6" />
            </span>
            <div>
              <strong className="text-base text-[#1A1A1A] font-serif font-bold block mb-1">Direct Delta Sourcing</strong>
              <p className="text-xs text-gray-400 leading-relaxed">
                We believe the best rice comes from deep partnerships. We procure our paddy crop directly from local farmers in the highly fertile Krishna-Godavari Guntur delta plains, paying fair trade value and supporting sustainable agro-farming.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="p-3 bg-primary-green/5 text-primary-green rounded-2xl h-12 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <strong className="text-base text-[#1A1A1A] font-serif font-bold block mb-1">Modern Milling Excellence</strong>
              <p className="text-xs text-gray-400 leading-relaxed">
                Using state-of-the-art Japanese computerized sorters, steam cleaners, and multi-stage dry polishers, we ensure every bag of rice contains perfectly uniform, dust-free, high-expansion grains with high hygiene standards.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-md bg-[#FAF6F0] p-1 flex items-center justify-center border border-amber-100">
          <img
            src="/assets/Poster.png"
            alt="Jagan Mohan Rice Mill Poster"
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain rounded-xl max-h-[500px]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/assets/logo.jpeg";
            }}
          />
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-bg-cream/40 rounded-3xl border border-primary-green/5 p-6 md:p-10 space-y-6">
        <h3 className="font-serif font-bold text-gray-950 text-xl text-center flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary-green" />
          <span>Rice Mill Consumer FAQs</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600">
          <div className="bg-white p-5 rounded-3xl border border-primary-green/5 space-y-1.5">
            <strong className="text-gray-900 font-semibold block">What does "Double Aged" mean?</strong>
            <p className="leading-relaxed">
              Double-aged rice is stored in dry warehouse facilities for over 18 to 24 months. During this natural curing process, moisture escapes, stabilizing the starches so cooked grains stay long, separate, fluffy, and aromatic without turning sticky.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-primary-green/5 space-y-1.5">
            <strong className="text-gray-900 font-semibold block">Is there a minimum delivery size?</strong>
            <p className="leading-relaxed">
              Yes, because we operate at direct-from-mill prices, our minimum home delivery order is <strong>10 kg</strong> (which can be a single bag or multiple custom add-ons like millets and rava).
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-primary-green/5 space-y-1.5">
            <strong className="text-gray-900 font-semibold block">How are delivery fees calculated?</strong>
            <p className="leading-relaxed">
              We charge ₹30 for cumulative weights between 10-14kg, ₹20 for 15-49kg, and offer <strong>100% FREE delivery</strong> for all bulk orders of 50kg or above.
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-primary-green/5 space-y-1.5">
            <strong className="text-gray-900 font-semibold block">Do you ship outside of Guntur?</strong>
            <p className="leading-relaxed">
              Currently, our local instant delivery operations are focused within Guntur, Andhra Pradesh limits, ensuring your grains arrive freshly packed at your doorstep in under 24 hours. For bulk outstation truckload shipments, please call us directly.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

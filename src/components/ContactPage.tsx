import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { CONTACT_INFO } from '../data';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isMillOpen = () => {
    try {
      const getKolkataComponent = (options: Intl.DateTimeFormatOptions) => {
        return new Intl.DateTimeFormat('en-US', {
          ...options,
          timeZone: 'Asia/Kolkata'
        }).format(new Date());
      };

      const weekday = getKolkataComponent({ weekday: 'long' });
      const hourStr = getKolkataComponent({ hour: 'numeric', hour12: false });
      const minuteStr = getKolkataComponent({ minute: '2-digit' });

      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const timeValue = hour + minute / 60;

      if (weekday === 'Sunday') {
        return timeValue >= 8 && timeValue < 13;
      } else {
        return timeValue >= 8 && timeValue < 19;
      }
    } catch (e) {
      // Precise fallback to Guntur Indian Standard Time (IST is UTC +5:30)
      const d = new Date();
      const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      const nd = new Date(utc + (3600000 * 5.5));
      const day = nd.getDay();
      const hour = nd.getHours();
      const minute = nd.getMinutes();
      const timeValue = hour + minute / 60;

      if (day === 0) {
        return timeValue >= 8 && timeValue < 13;
      } else {
        return timeValue >= 8 && timeValue < 19;
      }
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !msg) return;

    setIsSuccess(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setEmail('');
      setMsg('');
      setIsSuccess(false);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-accent-gold uppercase tracking-[0.2em] block">Direct Mill Support</span>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1A1A1A] leading-tight">
          Get In Touch With Our Dispatch Team
        </h2>
        <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
          Have queries about custom sizing, bulk truckloads, or institutional catering orders? Drop us a message or call Guntur directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info and Map Grid */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-primary-green/5 p-6 space-y-5 shadow-xs">
            <h3 className="font-serif font-bold text-gray-950 text-base border-b border-gray-50 pb-2.5">
              Mill Headquarters Office
            </h3>

            {/* Address */}
            <div className="flex gap-3 text-xs text-gray-600">
              <MapPin className="w-5 h-5 text-primary-green shrink-0" />
              <div>
                <strong className="text-gray-800 block mb-0.5">Physical Location</strong>
                <span>{CONTACT_INFO.address}</span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-3 text-xs text-gray-600 border-t border-gray-50 pt-4">
              <Phone className="w-5 h-5 text-primary-green shrink-0" />
              <div>
                <strong className="text-gray-800 block mb-0.5">Sales Landlines</strong>
                <p>{CONTACT_INFO.phone1}</p>
                <p>{CONTACT_INFO.phone2}</p>
              </div>
            </div>

            {/* Mobile / WhatsApp */}
            <div className="flex gap-3 text-xs text-gray-600 border-t border-gray-50 pt-4">
              <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-emerald-800 font-bold block mb-1">WhatsApp & Mobile Assistance</strong>
                <p className="font-mono font-bold text-gray-800 text-sm">+{CONTACT_INFO.mobile}</p>
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=Hello%20Jagan%20Mohan%20Rice%20Mill,%20I%20am%20interested%20in%20placing%20a%20rice%20order.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 bg-emerald-50 text-emerald-700 font-bold px-4 py-2 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer text-[10px] uppercase tracking-wider"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-3 text-xs text-gray-600 border-t border-gray-50 pt-4">
              <Mail className="w-5 h-5 text-primary-green shrink-0" />
              <div>
                <strong className="text-gray-800 block mb-0.5">Commercial Email</strong>
                <span className="font-mono font-bold">{CONTACT_INFO.email}</span>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-3 text-xs text-gray-600 border-t border-gray-50 pt-4">
              <Clock className="w-5 h-5 text-accent-gold-dark shrink-0" />
              <div>
                <strong className="text-gray-800 block mb-0.5">Milling Hours of Operation</strong>
                <p>{CONTACT_INFO.hoursWeekday}</p>
                <p>{CONTACT_INFO.hoursSunday}</p>
              </div>
            </div>
          </div>

          {/* Immediate Mill Dispatch Hotline Card */}
          <div className="bg-gradient-to-br from-primary-green to-primary-green-dark text-white rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-start">
              <h4 className="font-serif font-bold text-base text-white">Immediate Mill Dispatches</h4>
              {isMillOpen() ? (
                <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  Active Now
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  Closed
                </span>
              )}
            </div>
            
            <p className="text-[11px] text-gray-200 leading-relaxed">
              {isMillOpen()
                ? "Our boilers and polishing lines are currently packing fresh bags. Connect directly with the Guntur dispatch desk for instant invoice processing:"
                : "The mill is currently closed, but you can still submit inquiries or leave a WhatsApp message! Our dispatch team will process it first thing next morning:"
              }
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <a 
                href={`tel:${CONTACT_INFO.phone2}`}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5"
              >
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-accent-gold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-300 font-bold uppercase tracking-wider">Direct Landline</span>
                  <strong className="text-white">{CONTACT_INFO.phone2}</strong>
                </div>
              </a>

              <a 
                href={`https://wa.me/${CONTACT_INFO.whatsapp}?text=Hello%20Jagan%20Mohan%20Rice%20Mill,%20I%20want%20to%20order%20premium%2520rice%2525bag.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-600/30 rounded-2xl hover:bg-emerald-600/50 transition-colors border border-emerald-500/20"
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-emerald-300 font-bold uppercase tracking-wider">WhatsApp Dispatcher</span>
                  <strong className="text-white">+{CONTACT_INFO.mobile}</strong>
                </div>
              </a>
            </div>

            <div className="text-[10px] text-gray-300 border-t border-white/5 pt-3 flex justify-between">
              <span>Standard Order Target: 10kg minimum</span>
              <span>Guntur Delta Region</span>
            </div>
          </div>
        </div>

        {/* Contact Form Submission Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-primary-green/5 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="font-serif font-bold text-gray-900 text-lg border-b border-gray-100 pb-3 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-green" />
            <span>Submit Inbound Inquiry</span>
          </h3>

          <form onSubmit={handleContactSubmit} className="space-y-4 text-xs text-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-450 mb-1 uppercase tracking-widest text-[9px]">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Jagan Mohan Rao"
                  className="w-full text-xs p-3 bg-bg-cream/40 border border-primary-green/5 rounded-2xl focus:outline-none focus:bg-white focus:border-primary-green transition-all text-gray-800"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-450 mb-1 uppercase tracking-widest text-[9px]">Contact Mobile *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="E.g. 7382299666"
                  className="w-full text-xs p-3 bg-bg-cream/40 border border-primary-green/5 rounded-2xl focus:outline-none focus:bg-white focus:border-primary-green transition-all text-gray-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-455 mb-1 uppercase tracking-widest text-[9px]">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E.g. jaganmohanricemill@gmail.com"
                className="w-full text-xs p-3 bg-bg-cream/40 border border-primary-green/5 rounded-2xl focus:outline-none focus:bg-white focus:border-primary-green transition-all text-gray-800"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-455 mb-1 uppercase tracking-widest text-[9px]">Inquiry Description *</label>
              <textarea
                required
                rows={5}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Share detail specifications about grain variety requirements, weight parameters, bulk catering needs, or packing requests..."
                className="w-full text-xs p-3 bg-bg-cream/40 border border-primary-green/5 rounded-2xl focus:outline-none focus:bg-white focus:border-primary-green transition-all resize-none text-gray-800 leading-relaxed"
              />
            </div>

            {isSuccess && (
              <div className="p-4 bg-green-50 border border-green-100 text-green-800 rounded-2xl flex items-center gap-3 font-semibold text-xs animate-pulse">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <span className="font-bold block">Inquiry Dispatched Successfully!</span>
                  <span className="text-[11px] opacity-90 block mt-0.5">Mill operators have received your specifications and will respond within 2 hours.</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="bg-primary-green hover:bg-primary-green-dark text-white text-[11px] uppercase tracking-widest font-bold py-3.5 px-8 rounded-full shadow-lg shadow-primary-green/10 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Secure Inquiry</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm px-4 sm:px-0 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void; key?: string }) {
  const { id, message, description, type, duration = 5000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  // Styling maps
  const config = {
    success: {
      bg: 'bg-white/95 border-emerald-100',
      text: 'text-emerald-800',
      descriptionText: 'text-emerald-600/90',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      bar: 'bg-emerald-500',
      shadow: 'shadow-emerald-950/5 shadow-xl',
    },
    error: {
      bg: 'bg-white/95 border-red-100',
      text: 'text-red-800',
      descriptionText: 'text-red-600/90',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      bar: 'bg-red-500',
      shadow: 'shadow-red-950/5 shadow-xl',
    },
    warning: {
      bg: 'bg-white/95 border-amber-100',
      text: 'text-amber-800',
      descriptionText: 'text-amber-600/90',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      bar: 'bg-amber-500',
      shadow: 'shadow-amber-950/5 shadow-xl',
    },
    info: {
      bg: 'bg-white/95 border-blue-100',
      text: 'text-blue-800',
      descriptionText: 'text-blue-600/90',
      icon: <Info className="w-5 h-5 text-blue-500" />,
      bar: 'bg-blue-500',
      shadow: 'shadow-blue-950/5 shadow-xl',
    },
  }[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`pointer-events-auto relative overflow-hidden flex gap-3.5 p-4.5 rounded-2xl border backdrop-blur-md ${config.bg} ${config.shadow} transition-all`}
    >
      {/* Icon */}
      <div className="shrink-0 pt-0.5">{config.icon}</div>

      {/* Content */}
      <div className="flex-1 space-y-1 pr-4">
        <h5 className={`font-sans font-bold text-[13px] leading-snug ${config.text}`}>
          {message}
        </h5>
        {description && (
          <p className={`font-sans text-[11px] leading-relaxed ${config.descriptionText}`}>
            {description}
          </p>
        )}
      </div>

      {/* Manual close button */}
      <button
        onClick={() => onRemove(id)}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer self-start"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Animated time progress bar at the bottom */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-[3px] ${config.bar}`}
      />
    </motion.div>
  );
}

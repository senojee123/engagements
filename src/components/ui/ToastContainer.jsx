import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const toastIcons = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-cyan-500 shrink-0" />,
};

const toastBorders = {
  success: 'border-emerald-200 bg-white text-slate-900',
  error: 'border-rose-200 bg-white text-slate-900',
  warning: 'border-amber-200 bg-white text-slate-900',
  info: 'border-cyan-200 bg-white text-slate-900',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl border shadow-lg ${
              toastBorders[toast.type] || toastBorders.info
            }`}
          >
            <div className="flex items-start gap-3">
              {toastIcons[toast.type] || toastIcons.info}
              <p className="text-sm font-medium text-slate-800 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

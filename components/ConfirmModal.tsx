'use client';

import React from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  LogOut, 
  RotateCcw, 
  CheckCircle2, 
  HelpCircle,
  X,
  Loader2
} from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  icon?: 'trash' | 'logout' | 'reset' | 'warning' | 'check';
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'primary',
  icon = 'warning',
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (icon) {
      case 'trash':
        return <Trash2 className="w-6 h-6 text-rose-600" />;
      case 'logout':
        return <LogOut className="w-6 h-6 text-rose-600" />;
      case 'reset':
        return <RotateCcw className="w-6 h-6 text-amber-600" />;
      case 'check':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-50 border-rose-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getConfirmBtnClass = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-200/90 relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Content */}
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 ${getIconBg()}`}>
            {getIcon()}
          </div>

          <h3 className="text-base font-black text-slate-900 tracking-tight mb-1.5">
            {title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mb-6">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer ${getConfirmBtnClass()}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

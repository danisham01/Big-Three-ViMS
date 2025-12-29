
import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

// Container
export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, ...props }) => (
  <div className={`bg-white/80 dark:bg-[#1E1E2E]/90 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-2xl rounded-3xl p-5 relative overflow-hidden transition-colors duration-300 ${className}`} {...props}>
    {/* Subtle Glows - reduced opacity for cleaner dark look */}
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
    {title && <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 tracking-wide flex items-center gap-2">{title}</h2>}
    <div className="relative z-10 text-slate-800 dark:text-white">
      {children}
    </div>
  </div>
);

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', loading, disabled, ...props }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border-none', 
    secondary: 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20',
    outline: 'border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white',
  };

  return (
    <button 
      className={`px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
};

// Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
  autoFocus?: boolean;
  icon?: React.ReactNode; 
  suffix?: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLInputElement>;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', icon, suffix, ...props }) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-medium text-slate-500 dark:text-white/60 mb-2 ml-1 uppercase tracking-wider">{label}</label>}
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
          {icon}
        </div>
      )}
      <input 
        className={`w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 ${error ? 'focus:ring-red-500/30' : 'focus:ring-blue-500/20'} transition-all font-medium ${icon ? 'pl-12' : ''} ${suffix ? 'pr-12' : ''} ${className} ${error ? 'ring-1 ring-red-500/50' : ''}`}
        {...props}
      />
      {suffix && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400 transition-colors z-10">
          {suffix}
        </div>
      )}
    </div>
    {error && <p className="mt-1 ml-1 text-[10px] text-red-500 dark:text-red-400 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
  </div>
);

// Select
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  className?: string;
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  error?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-medium text-slate-500 dark:text-white/60 mb-2 ml-1 uppercase tracking-wider">{label}</label>}
    <div className="relative group">
      <select 
        className={`w-full bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 appearance-none font-medium ${className} ${error ? 'ring-1 ring-red-500/50' : ''}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="text-gray-900">{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
    {error && <p className="mt-1 ml-1 text-[10px] text-red-500 dark:text-red-400 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
  </div>
);

// Badge
export const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    PENDING: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-500/30',
    APPROVED: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-500/30',
    REJECTED: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-200 border-red-200 dark:border-red-500/30',
    ADHOC: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 border-purple-200 dark:border-purple-500/30',
    PREREGISTERED: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200 border-indigo-200 dark:border-indigo-500/30',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status as keyof typeof styles] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-white'}`}>
      {status}
    </span>
  );
};

// Toast
export const Toast = ({ message, show, onHide }: { message: string, show: boolean, onHide: () => void }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/90 dark:bg-[#1E1E2E]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
           <CheckCircle size={16} />
        </div>
        <span className="text-sm font-bold text-slate-800 dark:text-white whitespace-nowrap">{message}</span>
      </div>
    </div>
  );
};

// Confirmation Modal
export const ConfirmModal = ({ 
  show, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "danger" 
}: { 
  show: boolean, 
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel: () => void,
  confirmText?: string,
  cancelText?: string,
  variant?: 'danger' | 'primary'
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <GlassCard className="max-w-xs w-full animate-in zoom-in-95 duration-200 border-slate-200 dark:border-white/10 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${variant === 'danger' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
          <p className="text-slate-500 dark:text-white/50 text-sm mb-6 leading-relaxed">{message}</p>
          <div className="flex gap-3 w-full">
            <Button variant="ghost" onClick={onCancel} className="flex-1 !py-3">
              {cancelText}
            </Button>
            <Button variant={variant} onClick={onConfirm} className="flex-1 !py-3">
              {confirmText}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

// Loading Components
export const Spinner = ({ className = '', size = 24 }: { className?: string, size?: number }) => (
  <Loader2 className={`animate-spin text-blue-500 ${className}`} size={size} />
);

export const LoadingOverlay = ({ message = 'Processing...' }: { message?: string }) => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 dark:bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-white dark:bg-[#1E1E2E] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
      <Spinner size={40} />
      <p className="text-slate-900 dark:text-white font-bold tracking-wide">{message}</p>
    </div>
  </div>
);

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-slate-200 dark:bg-[#1E1E2E] rounded-xl overflow-hidden relative ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
  </div>
);

// Specific Skeletons
export const VisitorCardSkeleton = () => (
  <div className="bg-white/50 dark:bg-[#1E1E2E]/50 border border-slate-200 dark:border-white/5 rounded-3xl p-5 flex flex-col gap-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-10 flex-1 rounded-xl" />
      <Skeleton className="h-10 flex-1 rounded-xl" />
    </div>
  </div>
);

export const HistoryItemSkeleton = () => (
  <div className="bg-slate-100 dark:bg-[#151520] border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between">
    <div className="flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2 w-16" />
      </div>
    </div>
    <Skeleton className="h-5 w-16 rounded-full" />
  </div>
);

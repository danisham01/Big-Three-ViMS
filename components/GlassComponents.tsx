import React from 'react';

// Container
export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const GlassCard = ({ children, className = '', title, ...props }: GlassCardProps) => (
  <div className={`bg-[#1E1E2E]/90 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-5 relative overflow-hidden ${className}`} {...props}>
    {/* Subtle Glows - reduced opacity for cleaner dark look */}
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
    {title && <h2 className="text-lg font-bold text-white mb-4 tracking-wide flex items-center gap-2">{title}</h2>}
    <div className="relative z-10">
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
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border-none', // Solid Blue from screenshot
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/10',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
    outline: 'border border-blue-500/30 text-blue-400 hover:bg-blue-500/10',
    ghost: 'bg-transparent hover:bg-white/5 text-white/60 hover:text-white',
  };

  return (
    <button 
      className={`px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  required?: boolean;
  type?: string;
  maxLength?: number;
  autoFocus?: boolean;
  icon?: React.ReactNode; 
}

export const Input = ({ label, className = '', icon, ...props }: InputProps) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-medium text-white/60 mb-2 ml-1 uppercase tracking-wider">{label}</label>}
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
          {icon}
        </div>
      )}
      <input 
        className={`w-full bg-white text-gray-900 placeholder-gray-400 border-none rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium ${icon ? 'pl-12' : ''} ${className}`}
        {...props}
      />
    </div>
  </div>
);

// Select
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  className?: string;
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

export const Select = ({ label, options, className = '', ...props }: SelectProps) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-medium text-white/60 mb-2 ml-1 uppercase tracking-wider">{label}</label>}
    <select 
      className={`w-full bg-white text-gray-900 border-none rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/20 appearance-none font-medium ${className}`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="text-gray-900">{opt.label}</option>
      ))}
    </select>
  </div>
);

// Badge
export const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    PENDING: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    APPROVED: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    REJECTED: 'bg-red-500/20 text-red-200 border-red-500/30',
    ADHOC: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
    PREREGISTERED: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status as keyof typeof styles] || 'bg-gray-500/20'}`}>
      {status}
    </span>
  );
};
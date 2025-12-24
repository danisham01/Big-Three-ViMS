import React from 'react';

// Container
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  title?: string;
}

export const GlassCard = ({ children, className = '', title, ...props }: GlassCardProps) => (
  <div className={`bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 relative overflow-hidden ${className}`} {...props}>
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
    {title && <h2 className="text-xl font-bold text-white mb-4 tracking-wide">{title}</h2>}
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 border-none',
    secondary: 'bg-white/20 hover:bg-white/30 text-white border border-white/10',
    danger: 'bg-red-500/80 hover:bg-red-500 text-white',
    outline: 'border border-white/40 text-white hover:bg-white/10',
  };

  return (
    <button 
      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className = '', ...props }: InputProps) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-white/80 mb-1 ml-1">{label}</label>}
    <input 
      className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all ${className}`}
      {...props}
    />
  </div>
);

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = ({ label, options, className = '', ...props }: SelectProps) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-white/80 mb-1 ml-1">{label}</label>}
    <select 
      className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none ${className}`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">{opt.label}</option>
      ))}
    </select>
  </div>
);

// Badge
export const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    PENDING: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
    APPROVED: 'bg-green-500/20 text-green-200 border-green-500/30',
    REJECTED: 'bg-red-500/20 text-red-200 border-red-500/30',
    ADHOC: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    PREREGISTERED: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${styles[status as keyof typeof styles] || 'bg-gray-500/20'}`}>
      {status}
    </span>
  );
};
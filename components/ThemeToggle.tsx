
import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-44 right-6 z-[90] w-14 h-14 rounded-full bg-white/80 dark:bg-[#1E1E2E]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 group overflow-hidden"
      aria-label="Toggle Theme"
    >
      {/* Animated Sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Icon Transition */}
      <div className="relative">
        {theme === 'light' ? (
          <Sun 
            size={24} 
            className="text-amber-500 animate-in zoom-in spin-in-90 duration-500" 
          />
        ) : (
          <Moon 
            size={24} 
            className="text-blue-400 animate-in zoom-in spin-in-45 duration-500" 
          />
        )}
      </div>

      {/* Decorative Glow */}
      <div className={`absolute -inset-1 rounded-full blur-xl transition-opacity duration-500 ${theme === 'light' ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}></div>
    </button>
  );
};

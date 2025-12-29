
import React from 'react';
import { useTheme } from './ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shadow-inner transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 overflow-hidden"
      aria-label="Toggle Theme"
    >
      {/* Track Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Sun size={14} className="text-amber-500" />
        <Moon size={14} className="text-blue-200" />
      </div>

      {/* Sliding Knob */}
      <div
        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          theme === 'light' ? 'left-1 translate-x-0' : 'left-1 translate-x-8'
        }`}
      >
        {theme === 'light' ? (
          <Sun size={12} className="text-amber-500" />
        ) : (
          <Moon size={12} className="text-slate-800" />
        )}
      </div>
      
      {/* Glass Overlay for sheen */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
    </button>
  );
};

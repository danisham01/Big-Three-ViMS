
import React from 'react';
import logoImage from '../logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/10 blur-2xl rounded-full scale-150"></div>
      
      {/* Logo Image */}
      <img 
        src={logoImage} 
        alt="BigThree ViMS Logo" 
        className="w-full h-full object-contain relative z-10 drop-shadow-2xl animate-in zoom-in-50 duration-700"
      />
      
      {/* Inner Glass Reflection (Simulated) */}
      <div className="absolute inset-0 rounded-full border border-white/20 dark:border-white/5 pointer-events-none z-20"></div>
    </div>
  );
};

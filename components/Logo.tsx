
import React from 'react';

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

  // Note: Using the provided image asset. In a production environment, 
  // this would be a reference to a local file or a CDN URL.
  const logoUrl = "https://files.oaiusercontent.com/file-K8kP867vU36fA6V7K4X2fG?se=2025-02-21T10%3A58%3A12Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D46328731-5079-467f-9f76-02e0d37e3d11.webp&sig=G0B3%2BU5A4HwR2qU4U0G3Z6S7n8o9p0q1r2s3t4u5v6w%3D";

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-400/10 blur-2xl rounded-full scale-150"></div>
      
      {/* Logo Image */}
      <img 
        src={logoUrl} 
        alt="BigThree ViMS Logo" 
        className="w-full h-full object-contain relative z-10 drop-shadow-2xl animate-in zoom-in-50 duration-700"
      />
      
      {/* Inner Glass Reflection (Simulated) */}
      <div className="absolute inset-0 rounded-full border border-white/20 dark:border-white/5 pointer-events-none z-20"></div>
    </div>
  );
};

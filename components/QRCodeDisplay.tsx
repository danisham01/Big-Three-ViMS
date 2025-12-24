import React from 'react';
import { QRType } from '../types';

interface QRCodeDisplayProps {
  value: string;
  type: QRType;
  label?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, type, label }) => {
  // Simulating a QR code pattern with SVG for robustness (no external lib dependency issues)
  // In a real app, use `react-qr-code`
  const generatePattern = (str: string) => {
    const seed = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rects = [];
    for(let i=0; i<64; i++) {
        if ((seed * (i+1)) % 3 === 0) {
            const x = (i % 8) * 12.5;
            const y = Math.floor(i / 8) * 12.5;
            rects.push(<rect key={i} x={x} y={y} width="10" height="10" fill="currentColor" opacity="0.9" />);
        }
    }
    return rects;
  };

  const getTypeColor = (t: QRType) => {
    switch (t) {
        case QRType.QR1: return 'text-blue-400';
        case QRType.QR2: return 'text-orange-400';
        case QRType.QR3: return 'text-green-400';
        default: return 'text-gray-400';
    }
  };

  const getTypeLabel = (t: QRType) => {
    switch (t) {
        case QRType.QR1: return 'Front Gate Only';
        case QRType.QR2: return 'Elevator Only';
        case QRType.QR3: return 'All Access';
        default: return 'Invalid';
    }
  };

  if (type === QRType.NONE) {
    return (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-xl bg-white/5">
            <p className="text-white/60 text-center text-sm">No QR Code Required</p>
            <p className="text-white font-bold mt-2">LPR Entry Enabled</p>
        </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-2xl flex flex-col items-center">
      <svg viewBox="0 0 100 100" className={`w-48 h-48 ${getTypeColor(type)}`}>
        {/* Finder Patterns */}
        <rect x="0" y="0" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="10" y="10" width="10" height="10" fill="currentColor" />
        
        <rect x="70" y="0" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="80" y="10" width="10" height="10" fill="currentColor" />
        
        <rect x="0" y="70" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="5" />
        <rect x="10" y="80" width="10" height="10" fill="currentColor" />
        
        {/* Random Data Pattern */}
        <g transform="translate(10,10) scale(0.8)">
            {generatePattern(value)}
        </g>
      </svg>
      <div className="mt-3 text-center">
        <span className="block text-gray-900 font-mono text-xs tracking-wider uppercase mb-1">{value}</span>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${
            type === QRType.QR1 ? 'bg-blue-500' :
            type === QRType.QR2 ? 'bg-orange-500' : 'bg-green-500'
        }`}>
            {type} • {getTypeLabel(type)}
        </span>
      </div>
      {label && <p className="text-gray-500 text-xs mt-2">{label}</p>}
    </div>
  );
};

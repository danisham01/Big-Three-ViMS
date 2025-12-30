
import React from 'react';
import QRCode from 'react-qr-code';
import { ShieldCheck } from 'lucide-react';
import { QRType } from '../types';

interface QRCodeDisplayProps {
  value: string;
  type: QRType;
  label?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, type, label }) => {
  const getTypeColor = (t: QRType) => {
    switch (t) {
        case QRType.QR1: return '#3b82f6'; // Blue-500
        case QRType.QR2: return '#f97316'; // Orange-500
        case QRType.QR3: return '#22c55e'; // Green-500
        case QRType.QR4: return '#8b5cf6'; // Purple-500
        default: return '#1f2937'; // Gray-800
    }
  };

  const getTypeLabel = (t: QRType) => {
    switch (t) {
        case QRType.QR1: return 'Front Gate Only';
        case QRType.QR2: return 'Elevator Only';
        case QRType.QR3: return 'All Access';
        case QRType.QR4: return 'Gate + Elevator';
        default: return 'Invalid';
    }
  };

  if (type === QRType.NONE) {
    // return (
    //     <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-xl bg-white/5">
    //         <p className="text-white/60 text-center text-sm">Access Denied</p>
    //     </div>
    // );
    return (
  <div className="w-full rounded-3xl border border-slate-300/20 dark:border-white/10 bg-slate-100/60 dark:bg-white/5 p-6 text-center">
    <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center">
      <ShieldCheck className="text-slate-600 dark:text-white/70" size={28} />
    </div>

    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40">
      Access Status
    </p>

    <h3 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
      LPR Access
    </h3>

    <p className="mt-3 text-[11px] text-slate-600 dark:text-white/60 font-semibold">
      QR code not required. Vehicle access will be handled via license plate recognition.
    </p>
  </div>
);

  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-2xl flex flex-col items-center animate-in zoom-in duration-300">
      <div className="w-48 h-48 flex items-center justify-center">
        <QRCode 
          id="qr-code-svg"
          value={value} 
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          viewBox={`0 0 256 256`}
          fgColor={getTypeColor(type)}
          level="H"
        />
      </div>
      <div className="mt-4 text-center">
        <span className="block text-gray-900 font-mono text-sm tracking-[0.2em] font-bold uppercase mb-2">
          {value}
        </span>
        <span 
          className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider"
          style={{ backgroundColor: getTypeColor(type) }}
        >
          {type} • {getTypeLabel(type)}
        </span>
      </div>
      {label && <p className="text-gray-400 text-[10px] mt-2 font-medium">{label}</p>}
    </div>
  );
};


import React from 'react';
import { GlassCard, Button } from './GlassComponents';
import { X, BookOpen, User, CheckCircle, Car, Scan, Shield, Crown, Info, AlertCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="max-w-md w-full max-h-[85vh] bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col relative animate-in zoom-in-95 duration-300">
        
        {/* Fixed Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5 rounded-t-[2.5rem]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">User Manual</h2>
              <p className="text-[10px] text-slate-500 dark:text-white/30 font-bold uppercase tracking-widest leading-none mt-0.5">System Guidance & Help</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          
          {/* Section: Visitor Flows */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <User size={14} /> Visitor Registration
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white mb-2 uppercase">1. Ad-hoc Visitor (Walk-in)</p>
                <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed">
                  Choose this if you don't have an appointment. You must provide your name, phone number, and a live snapshot of your ID for verification. Access is valid for the current day only.
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white mb-2 uppercase">2. Pre-registered (Invite)</p>
                <p className="text-xs text-slate-500 dark:text-white/60 leading-relaxed">
                  If a staff member invited you, use your 5-digit unique code to download your digital pass. This pass contains specific time windows for your visit.
                </p>
              </div>
            </div>
          </section>

          {/* Section: QR Types */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Scan size={14} /> QR Access Guide
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'QR1 (Blue)', text: 'Front Gate Pedestrian entry only.', color: 'bg-blue-500' },
                { label: 'QR2 (Orange)', text: 'Internal Elevator access. Used when car enters via LPR.', color: 'bg-orange-500' },
                { label: 'QR3 (Green)', text: 'All Access. Full gate and elevator clearance.', color: 'bg-emerald-500' }
              ].map((qr, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                  <div className={`w-3 h-10 rounded-full ${qr.color}`}></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{qr.label}</p>
                    <p className="text-xs text-slate-500 dark:text-white/60">{qr.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Vehicle Entry */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Car size={14} /> Vehicle & LPR
            </h3>
            <div className="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl">
              <ul className="space-y-3">
                <li className="flex gap-3 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                  <span>Ensure your license plate is clean and visible for the camera.</span>
                </li>
                <li className="flex gap-3 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                  <span>Authorized vehicles trigger the barrier automatically.</span>
                </li>
                <li className="flex gap-3 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                  <span>Visitor status must be 'Approved' for the gate to open.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section: Security */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
              <Shield size={14} /> Security Protocol
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-500/20 flex items-start gap-3">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-800 dark:text-red-200/70 leading-relaxed">
                  <span className="font-bold">Blacklist Policy:</span> Identified individuals on the security blacklist are automatically denied access terminal-wide.
                </p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-500/20 flex items-start gap-3">
                <Crown size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-200/70 leading-relaxed">
                  <span className="font-bold">VIP Priority:</span> VVIP and VIP guests have priority clearance and dedicated lane access.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 rounded-b-[2.5rem]">
          <Button onClick={onClose} className="w-full font-black uppercase tracking-widest text-[11px] h-12 shadow-xl shadow-blue-600/10">
            I Understand
          </Button>
        </div>
      </div>
    </div>
  );
};

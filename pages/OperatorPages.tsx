
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, StatusBadge, Skeleton, VisitorCardSkeleton, HistoryItemSkeleton, Input, Toast, ConfirmModal } from '../components/GlassComponents';
import { EntryAnalytics } from '../components/EntryAnalytics';
import { VisitorStatus, Visitor, UserRole, TransportMode, VipRecord } from '../types';
import { VipDetailModal } from './VipPages';
import { CheckCircle, XCircle, Filter, User, Clock, Briefcase, LogOut, Search, Car, User as UserIcon, ListFilter, X, Calendar, ArrowRight, AlertCircle, Send, BellRing, Bike, Phone, Mail, CreditCard, ExternalLink, CalendarDays, MapPin, Hash, UserCheck, Crown, ShieldCheck, AlertTriangle } from 'lucide-react';

const checkIsOverstaying = (v: Visitor): boolean => {
  if (!v.timeIn || v.timeOut || !v.endDate) return false;
  return new Date() > new Date(v.endDate);
};

const normalizePlate = (plate?: string) => plate?.toUpperCase().replace(/[^A-Z0-9]/g, '') || '';
const formatDateTime = (ts?: string) => ts ? new Date(ts).toLocaleString() : 'Not available';
const formatDuration = (entryAt?: string, exitAt?: string, nowMs?: number) => {
  if (!entryAt) return 'Not available';
  const start = new Date(entryAt).getTime();
  const end = exitAt ? new Date(exitAt).getTime() : (nowMs ?? Date.now());
  if (isNaN(start) || isNaN(end) || end < start) return 'Not available';
  const diff = end - start;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const label = hours ? `${hours}h ${minutes.toString().padStart(2, '0')}m` : `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  return exitAt ? label : `In progress (${label})`;
};

type OngoingItem = {
  id: string;
  name: string;
  type: string;
  plate?: string;
  transport: TransportMode;
  entryAt?: string;
  exitAt?: string;
  isVip: boolean;
  isOverstaying: boolean;
  record: Visitor | VipRecord | null;
  kind: 'VISITOR' | 'UNKNOWN';
};

const LiveDuration = ({ startTime, isOverstaying }: { startTime: string, isOverstaying?: boolean }) => {
  const [duration, setDuration] = useState('');
  useEffect(() => {
    const calc = () => {
       const start = new Date(startTime).getTime();
       const now = Date.now();
       const diff = now - start;
       if (diff < 0) return 'Just entered';
       const mins = Math.floor(diff / 60000);
       if (mins < 60) return `${mins}m`;
       const hrs = Math.floor(mins / 60);
       const m = mins % 60;
       return `${hrs}h ${m}m`;
    };
    setDuration(calc());
    const interval = setInterval(() => setDuration(calc()), 60000);
    return () => clearInterval(interval);
  }, [startTime]);
  return <span className={`font-mono font-bold ${isOverstaying ? 'text-red-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>{duration}</span>;
}

// Detailed Visitor Modal
const VisitorDetailModal = ({ visitor, onClose, onApprove, onReject, entryAt, exitAt }: { 
  visitor: Visitor | null, 
  onClose: () => void,
  onApprove: (id: string) => void,
  onReject: (id: string, reason: string) => void,
  entryAt?: string,
  exitAt?: string
}) => {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!visitor) return null;

  const isOverstaying = checkIsOverstaying(visitor);
  const nowTick = Date.now();
  const durationDisplay = formatDuration(entryAt || visitor.timeIn, exitAt || visitor.timeOut, nowTick);

  const handleReject = () => {
    if (showRejectInput) {
      if (!rejectionReason.trim()) return;
      onReject(visitor.id, rejectionReason);
      setShowRejectInput(false);
    } else {
      setShowRejectInput(true);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-md w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col relative animate-in zoom-in-95 duration-300 transition-colors">
        
        {/* Header/Close */}
        <button onClick={onClose} className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:text-white transition-colors">
          <X size={20} />
        </button>

        {/* Identity Header */}
        <div className="p-8 pb-4 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-blue-500 to-indigo-600 p-1 overflow-hidden shadow-2xl">
              <img src={visitor.icPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${visitor.name}`} alt="" className="w-full h-full rounded-[1.8rem] bg-white dark:bg-[#1E1E2E] object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1">
              <StatusBadge status={visitor.status} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{visitor.name}</h2>
          <p className="text-slate-500 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Ref: {visitor.id}</p>
        </div>

        {/* Detail Sections */}
        <div className="p-8 pt-4 space-y-6">
          
          {isOverstaying && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
               <AlertTriangle className="text-red-500 shrink-0" size={20} />
               <div>
                  <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest leading-none mb-1">Duration Exceeded</p>
                  <p className="text-xs font-bold text-red-700 dark:text-red-200">Visitor has passed scheduled checkout time.</p>
               </div>
            </div>
          )}

          {/* Section: Origin/Registration */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-widest px-1">Source Information</h3>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400"><UserCheck size={18} /></div>
                <div>
                   <p className="text-[10px] text-slate-500 dark:text-white/30 font-bold uppercase">Registered By</p>
                   <p className="text-sm font-bold text-slate-900 dark:text-white/90">{visitor.registeredBy === 'SELF' ? 'Self Registered' : `Staff: ${visitor.registeredBy}`}</p>
                </div>
            </div>
          </div>

          {/* Section: Identity */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">Identity Information</h3>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-4">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40"><CreditCard size={18} /></div>
                 <div>
                   <p className="text-[10px] text-slate-500 dark:text-white/30 font-bold uppercase">NRIC / Passport No.</p>
                   <p className="text-sm font-bold text-slate-900 dark:text-white/90">{visitor.icNumber || 'N/A'}</p>
                 </div>
               </div>
               {visitor.staffNumber && (
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40"><Hash size={18} /></div>
                    <div>
                      <p className="text-[10px] text-slate-500 dark:text-white/30 font-bold uppercase">Staff Number</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white/90">{visitor.staffNumber}</p>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* Section: Contact */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Contact Details</h3>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-4">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40"><Phone size={18} /></div>
                 <div className="flex-1">
                   <p className="text-[10px] text-slate-500 dark:text-white/30 font-bold uppercase">Phone Number</p>
                   <p className="text-sm font-bold text-slate-900 dark:text-white/90">{visitor.contact}</p>
                 </div>
               </div>
               {visitor.email && (
                 <>
                  <div className="h-[1px] bg-slate-200 dark:bg-white/5 w-full"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40"><Mail size={18} /></div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 dark:text-white/30 font-bold uppercase">Email Address</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white/90 truncate">{visitor.email}</p>
                    </div>
                  </div>
                 </>
               )}
            </div>
          </div>

          {/* Section: Visit Schedule */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-1">Schedule & Purpose</h3>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-5 space-y-5">
               <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="w-0.5 flex-1 bg-slate-300 dark:bg-white/5 min-h-[1rem]"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20"></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[9px] text-slate-500 dark:text-white/30 font-bold uppercase">Start Access</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white/80">{formatDate(visitor.visitDate)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 dark:text-white/30 font-bold uppercase">Expected End</p>
                      <p className={`text-xs font-bold ${isOverstaying ? 'text-red-500' : 'text-slate-900 dark:text-white/80'}`}>{visitor.endDate ? formatDate(visitor.endDate) : 'Standard Duration'}</p>
                    </div>
                  </div>
               </div>

               <div className="h-[1px] bg-slate-200 dark:bg-white/5 w-full"></div>

               <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40 shrink-0"><Briefcase size={18} /></div>
                 <div className="flex-1">
                   <p className="text-[10px] text-slate-500 dark:text-white/30 font-bold uppercase">Purpose of Visit</p>
                   <p className="text-xs font-bold text-slate-900 dark:text-white/90">{visitor.purpose}</p>
                   {visitor.dropOffArea && (
                     <p className="text-[10px] text-blue-500 dark:text-blue-400 font-medium mt-1">Area: {visitor.dropOffArea}</p>
                   )}
                   {visitor.specifiedLocation && (
                     <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-medium mt-1">Location: {visitor.specifiedLocation}</p>
                   )}
                   {visitor.location && (
                     <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium mt-1">Facility: {visitor.location}</p>
                   )}
                 </div>
               </div>

               <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/40 shrink-0">
                    {visitor.transportMode === TransportMode.CAR ? <Car size={18} /> : <Bike size={18} />}
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-500 dark:text-white/30 font-bold uppercase">Transportation</p>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white/90">{visitor.transportMode === TransportMode.CAR ? 'Private Vehicle' : 'Walk-in / Bike'}</span>
                      {visitor.licensePlate && (
                        <span className="bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded font-mono text-[10px] text-blue-600 dark:text-blue-400 font-black">{visitor.licensePlate}</span>
                      )}
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Section: Movement Tracking */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Movement Tracking</h3>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-500 dark:text-white/40 font-bold uppercase tracking-widest">Time of Entry</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white/90">{formatDateTime(entryAt || visitor.timeIn)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-500 dark:text-white/40 font-bold uppercase tracking-widest">Time of Exit</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white/70">{formatDateTime(exitAt || visitor.timeOut)}</p>
                </div>
              </div>
              <div className="h-[1px] bg-slate-200 dark:bg-white/5 w-full"></div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Clock size={14} />
                <p className="text-xs font-black uppercase tracking-widest">Duration in TNB: {durationDisplay}</p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          {visitor.status === VisitorStatus.PENDING && (
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-200 dark:border-white/5">
              {showRejectInput && (
                <div className="animate-in slide-in-from-top-2">
                   <Input 
                      placeholder="Enter rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="!py-3 !text-xs !bg-red-50 dark:!bg-red-500/5 text-red-700 dark:!text-red-200 border-red-200 dark:border-red-500/20 focus:ring-red-500/10 !mb-0"
                      autoFocus
                   />
                </div>
              )}
              <div className="flex gap-3">
                <button 
                  onClick={handleReject}
                  className={`flex-1 py-4 rounded-2xl border transition-all duration-300 text-xs font-black uppercase tracking-widest ${showRejectInput ? 'bg-red-600 text-white border-red-500' : 'border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500/60 hover:bg-red-50 dark:hover:bg-red-500/10'}`}
                >
                  {showRejectInput ? 'Confirm Deny' : 'Decline'}
                </button>
                {!showRejectInput && (
                  <button 
                    onClick={() => onApprove(visitor.id)}
                    className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    Authorize Entry <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UnknownDetailModal = ({ record, onClose }: { record: OngoingItem | null; onClose: () => void }) => {
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!record) return null;
  const duration = formatDuration(record.entryAt, record.exitAt, nowTick);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-md w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col relative animate-in zoom-in-95 duration-300 transition-colors">
        <button onClick={onClose} className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="p-8 pb-4 text-center">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-mono font-black text-xl tracking-widest inline-block mb-3 shadow-xl">
            {record.plate || 'UNKNOWN'}
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Unknown Vehicle</h2>
          <p className="text-slate-500 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">No record found</p>
        </div>

        <div className="p-8 pt-4 space-y-6">
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] text-slate-500 dark:text-white/40 font-bold uppercase tracking-widest">Time of Entry</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white/90">{formatDateTime(record.entryAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-500 dark:text-white/40 font-bold uppercase tracking-widest">Time of Exit</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white/70">{formatDateTime(record.exitAt)}</p>
              </div>
            </div>
            <div className="h-[1px] bg-slate-200 dark:bg-white/5 w-full"></div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Clock size={14} />
              <p className="text-xs font-black uppercase tracking-widest">Duration in TNB: {duration}</p>
            </div>
          </div>
        </div>

        <div className="p-8 pt-0">
          <Button variant="secondary" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[11px]" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { visitors, updateVisitorStatus, currentUser, logout, vipRecords, deactivateVip, updateVip, lprScanRecords } = useStore();
  const [initialLoading, setInitialLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [selectedVisitor, setSelectedVisitor] = useState<{ visitor: Visitor; entryAt?: string; exitAt?: string } | null>(null);
  const [selectedUnknown, setSelectedUnknown] = useState<OngoingItem | null>(null);
  const [selectedVip, setSelectedVip] = useState<VipRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<VisitorStatus | 'ALL'>('ALL');
  const [transportFilter, setTransportFilter] = useState<TransportMode | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        navigate('/staff/login');
    }
    const timer = setTimeout(() => {
        setInitialLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  const filterBySearch = (v: Visitor) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return v.name.toLowerCase().includes(query) || 
           v.id.includes(query) ||
           (v.licensePlate?.toLowerCase() || '').includes(query) ||
           v.purpose.toLowerCase().includes(query) ||
           (v.registeredBy?.toLowerCase() || '').includes(query);
  };

  const pendingVisitors = useMemo(() => {
    return visitors.filter(v => v.status === VisitorStatus.PENDING && filterBySearch(v));
  }, [visitors, searchQuery]);

  const liveVisitors = useMemo(() => {
    const merged = new Map<string, {
      id: string;
      name: string;
      type: string;
      plate?: string;
      transport: TransportMode;
      entryAt?: string;
      exitAt?: string;
      isVip: boolean;
      isOverstaying: boolean;
      record: Visitor | VipRecord | null;
    }>();

    // 1. Regular Visitors: timeIn exists, timeOut does not
    visitors.filter(v => v.timeIn && !v.timeOut).forEach(v => {
      const norm = normalizePlate(v.licensePlate);
      const lpr = norm ? lprScanRecords[norm] : undefined;
      const entryAt = lpr?.entryAt || v.timeIn || undefined;
      const exitAt = lpr?.exitAt || v.timeOut || undefined;
      merged.set(norm || v.id, {
        id: v.id,
        name: v.name,
        type: 'VISITOR',
        plate: v.licensePlate,
        transport: v.transportMode,
        entryAt,
        exitAt,
        isVip: false,
        isOverstaying: checkIsOverstaying(v),
        record: v,
        kind: 'VISITOR'
      });
    });

    // 2. VIPs: lastEntryTime exists, and (lastExitTime missing OR entry > exit)
    vipRecords.filter(v => 
        v.lastEntryTime && (!v.lastExitTime || new Date(v.lastEntryTime) > new Date(v.lastExitTime))
    ).forEach(v => {
      const norm = normalizePlate(v.licensePlate);
      const lpr = norm ? lprScanRecords[norm] : undefined;
      const entryAt = lpr?.entryAt || v.lastEntryTime || undefined;
      const exitAt = lpr?.exitAt || v.lastExitTime || undefined;
      merged.set(norm || v.id, {
        id: v.id,
        name: v.name,
        type: v.vipType,
        plate: v.licensePlate,
        transport: TransportMode.CAR, // VIPs typically use cars
        entryAt,
        exitAt,
        isVip: true,
        isOverstaying: false, // Assume VIPs are flexible for now
        record: v,
        kind: 'VISITOR'
      });
    });

    // 3. LPR-only records: entryAt exists, exitAt missing
    Object.values(lprScanRecords)
      .filter(rec => rec.entryAt && !rec.exitAt && rec.outcome !== 'BLOCKED')
      .forEach(rec => {
        const norm = normalizePlate(rec.plate);
        const existing = merged.get(norm);
        if (existing) {
          existing.entryAt = rec.entryAt || existing.entryAt;
          return;
        }
        merged.set(norm || `lpr-${rec.plate}`, {
          id: `lpr-${rec.plate}`,
          name: 'UNIDENTIFIED',
          type: 'UNKNOWN',
          plate: rec.plate,
          transport: TransportMode.CAR,
          entryAt: rec.entryAt!,
          exitAt: rec.exitAt,
          isVip: false,
          isOverstaying: false,
          record: null,
          kind: 'UNKNOWN'
        });
      });

    return Array.from(merged.values()).sort((a, b) => new Date(b.entryAt || 0).getTime() - new Date(a.entryAt || 0).getTime());
  }, [visitors, vipRecords, lprScanRecords]);

  const filteredHistory = useMemo(() => {
    return visitors.filter(v => {
      const matchesStatus = statusFilter === 'ALL' ? true : v.status === statusFilter;
      const matchesTransport = transportFilter === 'ALL' ? true : v.transportMode === transportFilter;
      const matchesSearch = filterBySearch(v);
      return matchesStatus && matchesTransport && matchesSearch;
    });
  }, [visitors, statusFilter, transportFilter, searchQuery]);

  const stats = {
    pending: visitors.filter(v => v.status === VisitorStatus.PENDING).length,
    approved: visitors.filter(v => v.status === VisitorStatus.APPROVED).length,
    rejected: visitors.filter(v => v.status === VisitorStatus.REJECTED).length,
  };

  const handleAction = async (id: string, status: VisitorStatus, reason?: string) => {
    setProcessingId(id);
    const visitor = visitors.find(v => v.id === id);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateVisitorStatus(id, status, reason);
    setProcessingId(null);
    setSelectedVisitor(null);

    if (status === VisitorStatus.APPROVED && visitor) {
      const channelText = visitor.email ? 'Email, WhatsApp & SMS' : 'WhatsApp & SMS';
      setToast({ 
        show: true, 
        message: `Approved! QR Pass sent to guest via ${channelText}.` 
      });
    } else {
      setToast({ show: true, message: `Visitor ${status.toLowerCase()}` });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-32">
      <Toast show={toast.show} message={toast.message} onHide={() => setToast({ ...toast, show: false })} />
      <ConfirmModal 
        show={showLogoutConfirm}
        title="Logout Confirmation"
        message="Are you sure you want to exit the Operator Console?"
        onConfirm={logout}
        onCancel={() => setShowLogoutConfirm(false)}
        confirmText="Logout"
      />

      <VisitorDetailModal 
        visitor={selectedVisitor?.visitor || null} 
        entryAt={selectedVisitor?.entryAt}
        exitAt={selectedVisitor?.exitAt}
        onClose={() => setSelectedVisitor(null)}
        onApprove={(id) => handleAction(id, VisitorStatus.APPROVED)}
        onReject={(id, reason) => handleAction(id, VisitorStatus.REJECTED, reason)}
      />

      <UnknownDetailModal 
        record={selectedUnknown} 
        onClose={() => setSelectedUnknown(null)} 
      />

      <VipDetailModal 
        vip={selectedVip}
        onClose={() => setSelectedVip(null)}
        onUpdate={(id, data) => updateVip(id, data, currentUser.username)}
        onDeactivate={(id) => deactivateVip(id, currentUser.username)}
        navigate={navigate}
      />
      
      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 border-2 border-white/20 p-0.5 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`} alt="Admin" className="w-full h-full rounded-full bg-white/10" />
             </div>
             <div>
                 <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold tracking-wider uppercase">{currentUser.role} Console</p>
                 <h1 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser.fullName}</h1>
             </div>
        </div>
        <button onClick={() => setShowLogoutConfirm(true)} className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors">
            <LogOut size={20} />
        </button>
      </div>

      {/* Enhanced Stat Containers */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Pending', count: stats.pending, color: 'blue', icon: Clock },
          { label: 'Approved', count: stats.approved, color: 'emerald', icon: CheckCircle },
          { label: 'Rejected', count: stats.rejected, color: 'red', icon: XCircle }
        ].map((stat, i) => {
          const cardColors = {
            blue: 'bg-blue-50 dark:bg-blue-600/20 border-blue-200 dark:border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-blue-500/10 dark:shadow-blue-900/10',
            emerald: 'bg-emerald-50 dark:bg-emerald-600/20 border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10 dark:shadow-emerald-900/10',
            red: 'bg-red-50 dark:bg-red-600/20 border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-400 shadow-red-500/10 dark:shadow-red-900/10'
          };
          
          return (
            <div key={i} className={`${cardColors[stat.color as keyof typeof cardColors]} border rounded-3xl p-4 flex flex-col relative overflow-hidden transition-all duration-300 shadow-lg group`}>
              {initialLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              ) : (
                <>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{stat.label}</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white">{stat.count}</div>
                  <div className={`absolute -bottom-2 -right-2 opacity-10 dark:opacity-20 rotate-12 transition-transform group-hover:scale-125 duration-500`}>
                      <stat.icon size={52} className={`text-${stat.color}-500 dark:text-${stat.color}-400`} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-white/90 uppercase tracking-[0.2em]">On-Going Visitors</h3>
            {!initialLoading && liveVisitors.length > 0 && (
                <span className="ml-auto bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 animate-pulse">
                    {liveVisitors.length} LIVE
                </span>
            )}
        </div>

        <div className="flex flex-col gap-4">
            {initialLoading ? (
                <VisitorCardSkeleton />
            ) : liveVisitors.length === 0 ? (
                <div className="text-center py-8 bg-white/50 dark:bg-[#1E1E2E]/30 rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                    <p className="text-xs text-slate-400 dark:text-white/30 font-medium tracking-wide">No visitors currently inside the premise.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-3xl border border-emerald-100 dark:border-emerald-500/20 bg-white dark:bg-[#0f111c] shadow-lg">
                  <table className="min-w-full text-sm">
                    <thead className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 bg-white/60 dark:bg-white/5">
                      <tr>
                        <th className="text-left font-black px-5 py-3">Visitor</th>
                        <th className="text-left font-black px-5 py-3">Status</th>
                        <th className="text-left font-black px-5 py-3">Duration</th>
                        <th className="text-left font-black px-5 py-3">Entry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {liveVisitors.map((item, idx) => {
                        const rowTone = item.isOverstaying ? 'bg-red-50/70 dark:bg-red-900/10' : 'hover:bg-emerald-50 dark:hover:bg-white/5';
                        return (
                          <tr
                            key={idx}
                            onClick={() => {
                              if (item.isVip) setSelectedVip(item.record as VipRecord);
                              else if (item.record) setSelectedVisitor({ visitor: item.record as Visitor, entryAt: item.entryAt, exitAt: item.exitAt });
                              else setSelectedUnknown(item);
                            }}
                            className={`cursor-pointer transition-colors ${rowTone}`}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${item.isVip ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600' : item.isOverstaying ? 'bg-red-100 dark:bg-red-500/10 text-red-600' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600'}`}>
                                  {item.isVip ? <Crown size={18} /> : <User size={18} />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">{item.name}</span>
                                    {item.isVip && <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/30">VIP</span>}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {item.plate ? (
                                      <span className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-600 dark:text-white/80">{item.plate}</span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-400 dark:text-white/50 uppercase">Walk-in</span>
                                    )}
                                    <span className="text-[10px] text-slate-400 dark:text-white/40 uppercase">{item.type}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                {item.isOverstaying && (
                                  <span className="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg flex items-center gap-1">
                                    <AlertTriangle size={12} /> Limit Exceeded
                                  </span>
                                )}
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 ${item.isOverstaying ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.isOverstaying ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                  {item.isOverstaying ? 'Overstay' : 'In Premise'}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-[12px] text-slate-600 dark:text-white/70">
                                <Clock size={14} />
                                <LiveDuration startTime={item.entryAt || ''} isOverstaying={item.isOverstaying} />
                              </div>
                            </td>
                            <td className="px-5 py-4 text-[12px] text-slate-500 dark:text-white/60">
                              {item.entryAt ? new Date(item.entryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            )}
        </div>
      </section>

      {/* Analytics Section */}
      <EntryAnalytics />

      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-4 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-white/90 uppercase tracking-[0.2em]">Active Requests</h3>
            {!initialLoading && pendingVisitors.length > 0 && (
                <span className="ml-auto bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/20">
                    {pendingVisitors.length} New
                </span>
            )}
        </div>

        <div className="flex flex-col gap-4">
            {initialLoading ? (
              <>
                <VisitorCardSkeleton />
                <VisitorCardSkeleton />
              </>
            ) : pendingVisitors.length === 0 ? (
                <div className="text-center py-12 bg-white/50 dark:bg-[#1E1E2E]/30 rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                    <Clock size={32} className="mx-auto mb-3 text-slate-300 dark:text-white/10" />
                    <p className="text-xs text-slate-400 dark:text-white/30 font-medium tracking-wide">
                        {searchQuery ? 'No pending matches found' : 'All caught up! No active requests.'}
                    </p>
                </div>
            ) : (
                pendingVisitors.map(visitor => (
                    <VisitorRequestCard 
                        key={visitor.id} 
                        visitor={visitor} 
                        isProcessing={processingId === visitor.id}
                        onApprove={() => handleAction(visitor.id, VisitorStatus.APPROVED)} 
                        onReject={(reason) => handleAction(visitor.id, VisitorStatus.REJECTED, reason)}
                        onClick={() => setSelectedVisitor({ visitor, entryAt: visitor.timeIn, exitAt: visitor.timeOut })}
                    />
                ))
            )}
        </div>
      </section>

      <section className="pb-20">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-slate-300 dark:bg-white/20 rounded-full"></div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-[0.2em]">Visitor Audit</h3>
            </div>
            {!initialLoading && <span className="text-[10px] text-slate-400 dark:text-white/20 font-bold uppercase tracking-wider">{filteredHistory.length} Total Records</span>}
        </div>
              <div className="mb-8 sticky top-4 z-30">
        <GlassCard className="!p-2 !bg-white/90 dark:!bg-[#1E1E2E]/80 backdrop-blur-2xl border-slate-200 dark:border-white/10 shadow-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, code, plate, or host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 pl-11 pr-11 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </GlassCard>
      </div>

        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 dark:text-white/30 shrink-0">
                    <Filter size={14} />
                </div>
                {[
                    { label: 'All', value: 'ALL' },
                    { label: 'Approved', value: VisitorStatus.APPROVED },
                    { label: 'Rejected', value: VisitorStatus.REJECTED },
                    { label: 'Pending', value: VisitorStatus.PENDING }
                ].map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value as any)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border ${
                            statusFilter === opt.value 
                            ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E2E] text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/10'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2">
                {[
                    { label: 'Vehicle Entry', value: TransportMode.CAR, icon: <Car size={12}/> },
                    { label: 'Walk-in / Bike', value: TransportMode.NON_CAR, icon: <div className="flex items-center gap-0.5"><UserIcon size={12}/><Bike size={12}/></div> }
                ].map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setTransportFilter(transportFilter === opt.value ? 'ALL' : opt.value as any)}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-[10px] font-bold transition-all ${
                            transportFilter === opt.value 
                            ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E2E] text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/10'
                        }`}
                    >
                        {opt.icon}
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex flex-col gap-3">
            {initialLoading ? (
              <>
                <HistoryItemSkeleton />
                <HistoryItemSkeleton />
                <HistoryItemSkeleton />
                <HistoryItemSkeleton />
              </>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-white/20">
                    <Search size={40} className="mx-auto mb-4 opacity-10" />
                    <p className="text-xs font-medium tracking-widest uppercase">No history records found</p>
                    <button onClick={() => {setStatusFilter('ALL'); setTransportFilter('ALL'); setSearchQuery('');}} className="mt-4 text-[10px] text-blue-500 font-bold hover:underline underline-offset-4">
                        Reset all filters
                    </button>
                </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f111c] shadow-lg">
                <table className="min-w-full text-sm">
                  <thead className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 bg-white/70 dark:bg-white/5">
                    <tr>
                      <th className="text-left font-black px-5 py-3">Visitor</th>
                      <th className="text-left font-black px-5 py-3">Mode / Host</th>
                      <th className="text-left font-black px-5 py-3">Status</th>
                      <th className="text-left font-black px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredHistory.map(visitor => {
                      const isOverstaying = checkIsOverstaying(visitor);
                      return (
                        <tr
                          key={visitor.id}
                          onClick={() => setSelectedVisitor({ visitor, entryAt: visitor.timeIn, exitAt: visitor.timeOut })}
                          className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5 ring-1 ring-slate-200 dark:ring-white/10">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${visitor.name}`} alt="" className="h-full w-full p-1" />
                                <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#151520] ${visitor.status === VisitorStatus.APPROVED ? (isOverstaying ? 'bg-red-500' : 'bg-emerald-500') : visitor.status === VisitorStatus.REJECTED ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                              </div>
                              <div>
                                <div className={`text-xs font-bold ${isOverstaying ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{visitor.name}</div>
                                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 dark:text-white/50">
                                  <span className="font-mono font-black bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">#{visitor.id}</span>
                                  {isOverstaying && (
                                    <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg flex items-center gap-1">
                                      <AlertTriangle size={10} /> Overstay
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-white/60">
                              <span className="flex items-center gap-1 font-semibold">
                                {visitor.transportMode === TransportMode.CAR ? <Car size={12}/> : <div className="flex items-center gap-1"><UserIcon size={12}/><Bike size={12}/></div>}
                                {visitor.transportMode === TransportMode.CAR ? (visitor.licensePlate || '??-????') : 'Walk-in'}
                              </span>
                              <span className="text-slate-300 dark:text-white/20">|</span>
                              <span className="text-purple-600/70 dark:text-purple-400/70 font-bold">{visitor.registeredBy === 'SELF' ? 'Self' : visitor.registeredBy}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={visitor.status} />
                          </td>
                          <td className="px-5 py-4 text-[12px] text-slate-500 dark:text-white/60">
                            <div className="flex items-center gap-2">
                              <Calendar size={12} />
                              {new Date(visitor.visitDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </section>
    </div>
  );
};

interface VisitorRequestCardProps {
    visitor: Visitor;
    isProcessing?: boolean;
    onApprove?: () => void;
    onReject?: (reason: string) => void;
    onClick?: () => void;
    readonly?: boolean;
}

const VisitorRequestCard: React.FC<VisitorRequestCardProps> = ({ visitor, isProcessing, onApprove, onReject, onClick, readonly = false }) => {
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleRejectClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (showRejectInput) {
        if (!rejectionReason.trim()) return;
        onReject?.(rejectionReason);
      } else {
        setShowRejectInput(true);
      }
    };

    const handleApproveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onApprove?.();
    };

    return (
        <div 
          onClick={onClick}
          className={`group animate-in zoom-in relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E2E] p-5 shadow-2xl transition-all duration-300 hover:border-blue-500/30 cursor-pointer ${isProcessing ? 'pointer-events-none opacity-70' : ''}`}
        >
            <div className="pointer-events-none absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-blue-100 dark:bg-blue-600/5 blur-[40px]"></div>
            
            <div className="relative z-10 mb-5 flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-white dark:from-white/10 dark:to-white/5 p-0.5 shadow-inner ring-1 ring-slate-200 dark:ring-white/10">
                        <img src={visitor.icPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${visitor.name}`} alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h3 className="text-md font-black leading-tight text-slate-900 dark:text-white transition-colors group-hover:text-blue-500 dark:group-hover:text-blue-400">{visitor.name}</h3>
                        <div className="mt-2 flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-white/40">
                                <Briefcase size={12} className="text-blue-500/60" /> {visitor.purpose}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-white/40">
                                {visitor.transportMode === TransportMode.CAR ? <Car size={12} className="text-indigo-500/60 dark:text-indigo-400/60" /> : <div className="flex items-center gap-1"><UserIcon size={12} className="text-indigo-500/60 dark:text-indigo-400/60" /><Bike size={12} className="text-indigo-500/60 dark:text-indigo-400/60" /></div>}
                                <span className="uppercase tracking-widest">{visitor.transportMode === TransportMode.CAR ? 'Car' : 'Walk-in / Bike'}</span>
                                {visitor.transportMode === TransportMode.CAR && visitor.licensePlate && <span className="ml-1 font-mono text-slate-400 dark:text-white/20">[{visitor.licensePlate}]</span>}
                            </div>
                            {visitor.registeredBy !== 'SELF' && (
                               <div className="flex items-center gap-1.5 text-[9px] font-black text-purple-600/70 dark:text-purple-400/70 uppercase tracking-widest mt-0.5">
                                 <UserCheck size={11} /> Invited by {visitor.registeredBy}
                               </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                  <StatusBadge status={visitor.status} />
                  <span className="mt-2 font-mono text-[10px] font-black tracking-widest text-slate-400 dark:text-white/20">ID {visitor.id}</span>
                </div>
            </div>

            {!readonly && (
                <div className="relative z-10 flex flex-col gap-3 mt-2">
                    {showRejectInput && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                         <Input 
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="!py-3 !text-xs !bg-red-50 dark:!bg-red-500/5 text-red-700 dark:!text-red-200 border-red-200 dark:border-red-500/20 focus:ring-red-500/10 !mb-0"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                         />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleRejectClick} 
                            disabled={isProcessing || (showRejectInput && !rejectionReason.trim())}
                            className={`flex-1 py-3.5 rounded-2xl border transition-all duration-300 text-xs font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${
                              showRejectInput 
                              ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20' 
                              : 'border-red-200 dark:border-red-500/10 text-red-600/60 dark:text-red-500/60 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400'
                            }`}
                        >
                            {showRejectInput ? <><Send size={14}/> Submit Deny</> : 'Decline'}
                        </button>
                        
                        {!showRejectInput && (
                          <button 
                              onClick={handleApproveClick} 
                              disabled={isProcessing}
                              className="flex-[2] py-3.5 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                              {isProcessing ? 'Processing...' : 'Authorize'} <ArrowRight size={14} />
                          </button>
                        )}

                        {showRejectInput && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowRejectInput(false); }}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, Spinner, ConfirmModal, VisitorCardSkeleton } from '../components/GlassComponents';
import { EntryAnalytics } from '../components/EntryAnalytics';
import { VisitorStatus, QRType, UserRole, TransportMode } from '../types';
import { Scan, AlertTriangle, Unlock, LogOut, CheckCircle2, ShieldAlert, Ban, UserCheck, Crown, User, Clock } from 'lucide-react';

const normalizePlate = (plate?: string) => plate?.toUpperCase().replace(/[^A-Z0-9]/g, '') || '';

const LiveDuration = ({ startTime }: { startTime: string }) => {
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
  return <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{duration}</span>;
}

const AccessPoint = ({ name, type, allowedQRs, allowLPR }: { 
    name: string, 
    type: 'FRONT_GATE' | 'ELEVATOR', 
    allowedQRs: QRType[],
    allowLPR: boolean 
}) => {
    const { getVisitorByCode, getVisitorByPlate, logAccess, checkBlacklist } = useStore();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error' | 'info' | 'blacklist', text: string, host?: string} | null>(null);

    const handleScan = () => {
        if (!input.trim()) return;
        
        setIsLoading(true);
        setMessage(null);

        // Simulate network latency for verification
        setTimeout(() => {
            let visitor;
            let method: 'QR' | 'LPR' = 'QR';

            const trimmedInput = input.trim().toUpperCase();

            if (allowLPR && !trimmedInput.startsWith('V-') && trimmedInput.length > 3) {
                visitor = getVisitorByCode(trimmedInput);
                // visitor = getVisitorByPlate(trimmedInput);
                // method = 'LPR';
            } else {
                visitor = getVisitorByCode(trimmedInput);
            }

            if (!visitor) {
                // Check if the identifier itself is blacklisted (e.g., LPR plate scan of unauthorized vehicle)
                const blacklisted = checkBlacklist(undefined, trimmedInput, trimmedInput);
                if (blacklisted) {
                    setMessage({ type: 'blacklist', text: `Blacklisted: ${blacklisted.reason}` });
                    logAccess({ visitorId: 'BLACKLISTED', visitorName: trimmedInput, action: 'BLACKLIST_HIT', location: type, method: method, details: `Identifier hit: ${trimmedInput}` });
                    setIsLoading(false);
                    return;
                }

                setMessage({ type: 'error', text: 'Record not found.' });
                setIsLoading(false);
                return;
            }

            // Visitor found, check their details against blacklist
            const blacklisted = checkBlacklist(visitor.icNumber, visitor.licensePlate, visitor.contact);
            if (blacklisted) {
                setMessage({ type: 'blacklist', text: `Blacklisted: ${blacklisted.reason}` });
                logAccess({ visitorId: visitor.id, visitorName: visitor.name, action: 'BLACKLIST_HIT', location: type, method: method, details: 'Visitor matched blacklist' });
                setIsLoading(false);
                return;
            }

            if (visitor.status !== VisitorStatus.APPROVED) {
                setMessage({ type: 'error', text: 'Unauthorized: Not Approved' });
                logAccess({ visitorId: visitor.id, visitorName: visitor.name, action: 'DENIED', location: type, method: method, details: 'Status not approved' });
                setIsLoading(false);
                return;
            }

            if (method === 'QR' && !allowedQRs.includes(visitor.qrType)) {
                 setMessage({ type: 'error', text: `Denied: ${visitor.qrType} for ${name}` });
                 setIsLoading(false);
                 return;
            }

            const isExit = !!visitor.timeIn && !visitor.timeOut; 
            const action = isExit ? 'EXIT' : 'ENTRY';
            
            logAccess({ visitorId: visitor.id, visitorName: visitor.name, action: action, location: type, method: method });
            setMessage({ 
                type: 'success', 
                text: `${action}: ${visitor.name}`,
                host: visitor.registeredBy !== 'SELF' ? visitor.registeredBy : undefined
            });
            setInput('');
            setIsLoading(false);
        }, 1200);
    };

    // Determine border color based on status
    const getBorderClass = () => {
        if (!message) return 'border-slate-200 dark:border-white/5';
        if (message.type === 'success') return 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
        if (message.type === 'error') return 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]';
        if (message.type === 'blacklist') return 'border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.4)] animate-pulse';
        return 'border-slate-200 dark:border-white/5';
    };

    return (
        <GlassCard className={`h-full flex flex-col group transition-all duration-500 border-2 ${getBorderClass()}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${type === 'FRONT_GATE' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'} group-hover:scale-110 transition-transform duration-500`}>
                        <Scan size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{name}</h3>
                        <p className="text-[10px] text-slate-500 dark:text-white/30 uppercase tracking-widest">Scanning Point</p>
                    </div>
                </div>
                {message && (
                    <div className={`animate-in fade-in zoom-in duration-300`}>
                         {message.type === 'success' ? (
                             <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                 <CheckCircle2 size={18} />
                             </div>
                         ) : (
                             <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                                 {message.type === 'blacklist' ? <Ban size={18} /> : <ShieldAlert size={18} />}
                             </div>
                         )}
                    </div>
                )}
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="relative transform transition-transform duration-300 group-focus-within:scale-[1.02]">
                    <Input 
                        placeholder={allowLPR ? "Scan QR Code" : "Scan QR Code"}
                        value={input}
                        disabled={isLoading}
                        onChange={(e) => setInput(e.target.value)}
                        className={`text-center font-mono tracking-widest !mb-0 h-14 transition-all duration-300 ${message?.type === 'error' || message?.type === 'blacklist' ? 'ring-2 ring-red-500/50' : ''}`}
                    />
                    {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Spinner size={20} />
                        </div>
                    )}
                </div>
                
                <Button 
                    onClick={handleScan} 
                    loading={isLoading}
                    disabled={!input.trim()}
                    className="w-full h-14 text-xs font-bold uppercase tracking-[0.2em]"
                >
                    {isLoading ? 'Verifying...' : 'Simulate Scan'}
                </Button>

                <div className="h-16 flex items-center justify-center">
                    {message && (
                        <div className={`w-full p-4 rounded-2xl text-[11px] font-black text-center animate-in fade-in slide-in-from-top-2 border flex items-center justify-center gap-2 ${
                            message.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20' :
                            message.type === 'blacklist' ? 'bg-red-900/40 text-red-200 dark:text-red-400 border-red-600 animate-pulse' :
                            'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20'
                        }`}>
                            <div className="flex items-center gap-2">
                               {message.type === 'success' ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                               <span className="uppercase tracking-wider">{message.text}</span>
                            </div>
                            {message.type === 'success' && message.host && (
                                <div className="flex items-center gap-1.5 mt-1 text-[9px] text-emerald-600 dark:text-emerald-400/60 uppercase tracking-widest font-black">
                                    <UserCheck size={12} /> Host: {message.host}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

export const GuardConsole = () => {
    const navigate = useNavigate();
    const { logAccess, currentUser, logout, visitors, vipRecords, lprScanRecords } = useStore();
    const [manualCode, setManualCode] = useState('');
    const [isReleasing, setIsReleasing] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (!currentUser || currentUser.role !== UserRole.ADMIN) {
            navigate('/staff/login');
        }
    }, [currentUser, navigate]);

    const liveVisitors = useMemo(() => {
        const merged = new Map<string, { id: string; name: string; type: string; plate?: string; entryAt?: string; isVip: boolean }>();

        // 1. Regular Visitors: timeIn exists, timeOut does not
        visitors.filter(v => v.timeIn && !v.timeOut).forEach(v => {
            const norm = normalizePlate(v.licensePlate);
            merged.set(norm || v.id, {
                id: v.id,
                name: v.name,
                type: 'VISITOR',
                plate: v.licensePlate,
                entryAt: v.timeIn!,
                isVip: false
            });
        });
    
        // 2. VIPs: lastEntryTime exists, and (lastExitTime missing OR entry > exit)
        vipRecords.filter(v => 
            v.lastEntryTime && (!v.lastExitTime || new Date(v.lastEntryTime) > new Date(v.lastExitTime))
        ).forEach(v => {
            const norm = normalizePlate(v.licensePlate);
            merged.set(norm || v.id, {
                id: v.id,
                name: v.name,
                type: v.vipType,
                plate: v.licensePlate,
                entryAt: v.lastEntryTime!,
                isVip: true
            });
        });

        // 3. LPR-only records (unknowns and any plate without exit)
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
                entryAt: rec.entryAt!,
                isVip: false
            });
          });
    
        return Array.from(merged.values()).sort((a, b) => new Date(b.entryAt || 0).getTime() - new Date(a.entryAt || 0).getTime());
    }, [visitors, vipRecords, lprScanRecords]);

    if (!currentUser) return null;

    const handleManualOverride = () => {
        if(!manualCode.trim()) return;
        setIsReleasing(true);
        
        // Simulate gate release mechanical delay
        setTimeout(() => {
            logAccess({ visitorId: 'MANUAL', visitorName: `Manual (${manualCode})`, action: 'MANUAL_OVERRIDE', location: 'FRONT_GATE', method: 'MANUAL' });
            setManualCode('');
            setIsReleasing(false);
            alert('Gate Released Manually');
        }, 1500);
    };

    return (
        <div className="p-4 max-w-5xl mx-auto pb-24">
             <ConfirmModal 
                show={showLogoutConfirm}
                title="Security Logout"
                message="Exit the security terminal? Active monitoring will continue."
                onConfirm={logout}
                onCancel={() => setShowLogoutConfirm(false)}
                confirmText="Logout"
             />

             <div className="flex items-center justify-between mb-8 mt-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Security Terminal</h1>
                    <p className="text-slate-500 dark:text-white/40 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Session: {currentUser.fullName}
                    </p>
                </div>
                <button onClick={() => setShowLogoutConfirm(true)} className="p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                    <LogOut size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <AccessPoint name="Main Entrance" type="FRONT_GATE" allowedQRs={[QRType.QR1, QRType.QR3, QRType.QR4]} allowLPR={true} />
                <AccessPoint name="Service Lift" type="ELEVATOR" allowedQRs={[QRType.QR2, QRType.QR3]} allowLPR={false} />
            </div>

            <GlassCard className="bg-red-50 dark:bg-red-900/5 border-red-200 dark:border-red-500/20 !p-8 mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-md uppercase tracking-wider">Manual Override</h3>
                        <p className="text-red-600/60 dark:text-red-500/60 text-[10px] font-bold uppercase tracking-widest">Emergency Gate Release</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input 
                            placeholder="Reason for manual override" 
                            value={manualCode} 
                            disabled={isReleasing}
                            onChange={e => setManualCode(e.target.value)} 
                            className="mb-0 h-14 text-sm" 
                        />
                    </div>
                    <Button 
                        variant="danger" 
                        onClick={handleManualOverride} 
                        loading={isReleasing}
                        disabled={!manualCode.trim() || isReleasing} 
                        className="whitespace-nowrap px-8 h-14"
                    >
                        <Unlock size={18} className="mr-2" /> 
                        {isReleasing ? 'RELEASING...' : 'RELEASE GATE'}
                    </Button>
                </div>
            </GlassCard>

            {/* Entry Analytics Section */}
            <EntryAnalytics />

            {/* On-Going Visitors Section for Guard */}
            <section className="mb-12">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <h3 className="text-xs font-bold text-slate-700 dark:text-white/90 uppercase tracking-[0.2em]">On-Going Visitors</h3>
                    {liveVisitors.length > 0 && (
                        <span className="ml-auto bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 animate-pulse">
                            {liveVisitors.length} LIVE
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {liveVisitors.length === 0 ? (
                        <div className="col-span-full text-center py-8 bg-white/50 dark:bg-[#1E1E2E]/30 rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
                            <p className="text-xs text-slate-400 dark:text-white/30 font-medium tracking-wide">No visitors currently inside the premise.</p>
                        </div>
                    ) : (
                        liveVisitors.map((item, idx) => (
                            <div 
                            key={idx}
                            className="group relative overflow-hidden rounded-3xl border border-emerald-100 dark:border-emerald-500/20 bg-white dark:bg-[#1E1E2E] p-5 shadow-lg transition-all duration-300 hover:scale-[1.01]"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black ${item.isVip ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600'}`}>
                                            {item.isVip ? <Crown size={18} /> : <User size={18} />}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{item.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {item.isVip && <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/30">VIP</span>}
                                                {item.plate ? (
                                                    <span className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-600 dark:text-white/80">{item.plate}</span>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-slate-400 dark:text-white/40 uppercase">Walk-in</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1.5 mb-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">IN PREMISE</span>
                                        </div>
                                        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 dark:text-white/50">
                                            <Clock size={12} />
                                            <LiveDuration startTime={item.entryAt || ''} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

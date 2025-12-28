
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, Spinner, ConfirmModal } from '../components/GlassComponents';
import { VisitorStatus, QRType, UserRole } from '../types';
import { Scan, AlertTriangle, Unlock, LogOut, CheckCircle2, ShieldAlert, Ban } from 'lucide-react';

const AccessPoint = ({ name, type, allowedQRs, allowLPR }: { 
    name: string, 
    type: 'FRONT_GATE' | 'ELEVATOR', 
    allowedQRs: QRType[],
    allowLPR: boolean 
}) => {
    const { getVisitorByCode, getVisitorByPlate, logAccess, checkBlacklist } = useStore();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error' | 'info' | 'blacklist', text: string} | null>(null);

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
                visitor = getVisitorByPlate(trimmedInput);
                method = 'LPR';
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
            setMessage({ type: 'success', text: `${action}: ${visitor.name}` });
            setInput('');
            setIsLoading(false);
        }, 1200);
    };

    // Determine border color based on status
    const getBorderClass = () => {
        if (!message) return 'border-white/5';
        if (message.type === 'success') return 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
        if (message.type === 'error') return 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]';
        if (message.type === 'blacklist') return 'border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.4)] animate-pulse';
        return 'border-white/5';
    };

    return (
        <GlassCard className={`h-full flex flex-col group transition-all duration-500 border-2 ${getBorderClass()}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${type === 'FRONT_GATE' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'} group-hover:scale-110 transition-transform duration-500`}>
                        <Scan size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">{name}</h3>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Scanning Point</p>
                    </div>
                </div>
                {message && (
                    <div className={`animate-in fade-in zoom-in duration-300`}>
                         {message.type === 'success' ? (
                             <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                 <CheckCircle2 size={18} />
                             </div>
                         ) : (
                             <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                                 {message.type === 'blacklist' ? <Ban size={18} /> : <ShieldAlert size={18} />}
                             </div>
                         )}
                    </div>
                )}
            </div>
            
            <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="relative transform transition-transform duration-300 group-focus-within:scale-[1.02]">
                    <Input 
                        placeholder={allowLPR ? "QR or License Plate" : "Scan QR Code"}
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
                            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                            message.type === 'blacklist' ? 'bg-red-900/40 text-red-400 border-red-600 animate-pulse' :
                            'bg-red-500/10 text-red-300 border-red-500/20'
                        }`}>
                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                            <span className="uppercase tracking-wider">{message.text}</span>
                        </div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

export const GuardConsole = () => {
    const navigate = useNavigate();
    const { logAccess, currentUser, logout } = useStore();
    const [manualCode, setManualCode] = useState('');
    const [isReleasing, setIsReleasing] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (!currentUser || currentUser.role !== UserRole.ADMIN) {
            navigate('/staff/login');
        }
    }, [currentUser, navigate]);

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
                    <h1 className="text-2xl font-bold text-white tracking-tight">Security Terminal</h1>
                    <p className="text-white/40 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Session: {currentUser.fullName}
                    </p>
                </div>
                <button onClick={() => setShowLogoutConfirm(true)} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    <LogOut size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <AccessPoint name="Main Entrance" type="FRONT_GATE" allowedQRs={[QRType.QR1, QRType.QR3, QRType.QR4]} allowLPR={true} />
                <AccessPoint name="Service Lift" type="ELEVATOR" allowedQRs={[QRType.QR2, QRType.QR3]} allowLPR={false} />
            </div>

            <GlassCard className="bg-red-900/5 border-red-500/20 !p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-md uppercase tracking-wider">Manual Override</h3>
                        <p className="text-red-500/60 text-[10px] font-bold uppercase tracking-widest">Emergency Gate Release</p>
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
        </div>
    );
};

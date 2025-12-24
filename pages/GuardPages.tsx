import React, { useState } from 'react';
import { useStore } from '../store';
import { GlassCard, Button, Input } from '../components/GlassComponents';
import { VisitorStatus, QRType } from '../types';
import { Scan, AlertTriangle, Unlock, Activity } from 'lucide-react';

// Access Point Simulator Component
const AccessPoint = ({ name, type, allowedQRs, allowLPR }: { 
    name: string, 
    type: 'FRONT_GATE' | 'ELEVATOR', 
    allowedQRs: QRType[],
    allowLPR: boolean 
}) => {
    const { getVisitorByCode, getVisitorByPlate, logAccess } = useStore();
    const [input, setInput] = useState('');
    const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null);

    const handleScan = () => {
        setMessage(null);
        let visitor;
        let method: 'QR' | 'LPR' = 'QR';

        // Try LPR first if allowed and input looks like plate (simple heuristic: no "v-" prefix)
        if (allowLPR && !input.startsWith('v-')) {
            visitor = getVisitorByPlate(input.toUpperCase());
            method = 'LPR';
        } else {
            // Assume QR code (visitor ID)
            visitor = getVisitorByCode(input);
        }

        if (!visitor) {
            setMessage({ type: 'error', text: 'Visitor not found.' });
            return;
        }

        if (visitor.status !== VisitorStatus.APPROVED) {
            setMessage({ type: 'error', text: 'Visitor not approved.' });
            logAccess({
                visitorId: visitor.id,
                visitorName: visitor.name,
                action: 'DENIED',
                location: type,
                method: method,
                details: 'Status not approved'
            });
            return;
        }

        // Check QR restrictions
        if (method === 'QR' && !allowedQRs.includes(visitor.qrType)) {
             setMessage({ type: 'error', text: `Access Denied: ${visitor.qrType} cannot access ${name}` });
             logAccess({
                visitorId: visitor.id,
                visitorName: visitor.name,
                action: 'DENIED',
                location: type,
                method: method,
                details: 'Invalid QR Type for location'
            });
            return;
        }

        // Check LPR restrictions (LPR only for Front Gate in this logic usually, but elevator implies walk)
        if (method === 'LPR' && type === 'ELEVATOR') {
             setMessage({ type: 'error', text: 'Cars cannot use elevator.' }); // Should physically be impossible, but logic wise
             return;
        }

        // Determine Entry or Exit (Simple toggle logic for MVP)
        const isExit = !!visitor.timeIn && !visitor.timeOut; 
        const action = isExit ? 'EXIT' : 'ENTRY';
        
        // Don't allow multiple entries without exit (optional strictness, skipping for MVP ease)
        
        logAccess({
            visitorId: visitor.id,
            visitorName: visitor.name,
            action: action,
            location: type,
            method: method
        });

        setMessage({ 
            type: 'success', 
            text: `Access Granted: ${action} - ${visitor.name}` 
        });
        setInput('');
    };

    return (
        <GlassCard className="h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${type === 'FRONT_GATE' ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
                    <Scan className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-white text-lg">{name}</h3>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
                <Input 
                    placeholder={allowLPR ? "Scan QR or Enter Plate" : "Scan QR Code"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="text-center font-mono tracking-wider"
                />
                <Button onClick={handleScan} className="w-full">
                    Simulate Scan
                </Button>

                {message && (
                    <div className={`mt-4 p-3 rounded-xl text-sm font-bold text-center animate-in fade-in zoom-in ${
                        message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        message.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        'bg-blue-500/20 text-blue-300'
                    }`}>
                        {message.text}
                    </div>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/40">
                Allowed: {allowedQRs.join(', ')} {allowLPR && ', LPR'}
            </div>
        </GlassCard>
    );
};

export const GuardConsole = () => {
    const { logAccess } = useStore();
    const [manualCode, setManualCode] = useState('');

    const handleManualOverride = () => {
        if(!manualCode) return;
        logAccess({
            visitorId: 'MANUAL',
            visitorName: `Manual Override (${manualCode})`,
            action: 'MANUAL_OVERRIDE',
            location: 'FRONT_GATE',
            method: 'MANUAL',
            details: 'Guard initiated override'
        });
        setManualCode('');
        alert('Gate Opened Manually');
    };

    return (
        <div className="p-4 max-w-5xl mx-auto pb-20">
             <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Guard Station & Simulation</h1>
                <p className="text-white/50">Simulate physical access points and handle exceptions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Front Gate: Accepts QR1, QR3, and LPR */}
                <AccessPoint 
                    name="Main Gate (Entry/Exit)" 
                    type="FRONT_GATE" 
                    allowedQRs={[QRType.QR1, QRType.QR3]} 
                    allowLPR={true} 
                />
                
                {/* Elevator: Accepts QR2, QR3. No LPR */}
                <AccessPoint 
                    name="Lobby Elevator" 
                    type="ELEVATOR" 
                    allowedQRs={[QRType.QR2, QRType.QR3]} 
                    allowLPR={false} 
                />
            </div>

            <GlassCard className="bg-red-900/10 border-red-500/30">
                <div className="flex items-center gap-3 mb-4 text-red-300">
                    <AlertTriangle />
                    <h3 className="font-bold text-lg">Exception Mode</h3>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input 
                            placeholder="Reason / ID for log" 
                            value={manualCode} 
                            onChange={e => setManualCode(e.target.value)} 
                        />
                    </div>
                    <Button variant="danger" onClick={handleManualOverride} className="whitespace-nowrap">
                        <Unlock size={18} className="mr-2 inline" /> Force Open Gate
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
};

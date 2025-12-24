import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, Select, StatusBadge } from '../components/GlassComponents';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { VisitorType, TransportMode, VisitorStatus, QRType } from '../types';
import { User, Car, Check, QrCode, AlertCircle, RefreshCw, Share2, Download, Search, Copy } from 'lucide-react';

export const VisitorLanding = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto pt-10 px-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">Welcome</h1>
        <p className="text-white/60 mt-2">Please select your visit type</p>
      </div>

      <GlassCard className="hover:bg-white/15 transition-colors cursor-pointer" onClick={() => navigate('/visitor/adhoc')}>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 rounded-full text-blue-200">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Ad-hoc Visitor</h3>
            <p className="text-sm text-white/50">Immediate entry for public areas. No elevator access.</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="hover:bg-white/15 transition-colors cursor-pointer" onClick={() => navigate('/visitor/prereg')}>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-purple-500/20 rounded-full text-purple-200">
            <Check size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Pre-registered</h3>
            <p className="text-sm text-white/50">Invited guests. Requires approval. Elevator access available.</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="hover:bg-white/15 transition-colors cursor-pointer" onClick={() => navigate('/visitor/status')}>
        <div className="flex items-center gap-4">
            <div className="p-4 bg-green-500/20 rounded-full text-green-200">
                <Search size={24} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-white">Check Status</h3>
                <p className="text-sm text-white/50">Have a code? Check your appointment status here.</p>
            </div>
        </div>
      </GlassCard>
    </div>
  );
};

export const VisitorStatusCheck = () => {
    const navigate = useNavigate();
    const { getVisitorByCode } = useStore();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCheck = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        // Simulation delay
        setTimeout(() => {
            const visitor = getVisitorByCode(code);
            setLoading(false);
            if (visitor) {
                navigate(`/visitor/wallet/${visitor.id}`);
            } else {
                setError('Invalid code. Please check your 5-digit code and try again.');
            }
        }, 800);
    };

    return (
        <div className="max-w-md mx-auto pt-10 px-4">
            <Button variant="secondary" onClick={() => navigate('/visitor')} className="mb-4 text-sm py-2 px-4">
                &larr; Back
            </Button>
            
            <GlassCard title="Check Appointment Status">
                <form onSubmit={handleCheck}>
                    <div className="mb-6">
                        <p className="text-white/60 text-sm mb-4">Enter your 5-digit unique code to view your pass and current status.</p>
                        <Input 
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                            placeholder="e.g., 12345"
                            className="text-center text-2xl tracking-widest font-mono"
                            maxLength={5}
                            autoFocus
                        />
                    </div>
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                    <Button type="submit" disabled={loading || code.length < 5} className="w-full">
                        {loading ? 'Checking...' : 'Find Appointment'}
                    </Button>
                </form>
            </GlassCard>
        </div>
    );
};

export const VisitorForm = ({ type }: { type: VisitorType }) => {
  const navigate = useNavigate();
  const { addVisitor } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    purpose: '',
    visitDate: new Date().toISOString().split('T')[0],
    transportMode: TransportMode.NON_CAR,
    licensePlate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const visitor = addVisitor({
        ...formData,
        type,
        // Adhoc only allows Car if Non-car is false, but UI handles that.
      });
      setLoading(false);
      navigate(`/visitor/wallet/${visitor.id}`);
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto pt-6 px-4">
      <Button variant="secondary" onClick={() => navigate('/visitor')} className="mb-4 text-sm py-2 px-4">
        &larr; Back
      </Button>
      
      <GlassCard title={type === VisitorType.ADHOC ? "Ad-hoc Registration" : "Invitation Check-in"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <Input 
            label="Full Name" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="John Doe"
          />
          <Input 
            label="Phone or Email" 
            required 
            value={formData.contact}
            onChange={e => setFormData({...formData, contact: e.target.value})}
            placeholder="+1 555 000 000"
          />
          <Input 
            label="Purpose of Visit" 
            required 
            value={formData.purpose}
            onChange={e => setFormData({...formData, purpose: e.target.value})}
            placeholder="Meeting, Delivery, etc."
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/80 mb-2 ml-1">Transport Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  formData.transportMode === TransportMode.NON_CAR 
                  ? 'bg-indigo-500/50 border-indigo-400 text-white' 
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                }`}
                onClick={() => setFormData({...formData, transportMode: TransportMode.NON_CAR})}
              >
                <User size={20} />
                <span className="text-xs font-bold">Walk-in / Taxi</span>
              </button>
              <button
                type="button"
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  formData.transportMode === TransportMode.CAR
                  ? 'bg-indigo-500/50 border-indigo-400 text-white' 
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                }`}
                onClick={() => setFormData({...formData, transportMode: TransportMode.CAR})}
              >
                <Car size={20} />
                <span className="text-xs font-bold">Personal Vehicle</span>
              </button>
            </div>
          </div>

          {formData.transportMode === TransportMode.CAR && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <Input 
                label="License Plate Number" 
                required 
                value={formData.licensePlate}
                onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})}
                placeholder="ABC-1234"
              />
              <p className="text-xs text-yellow-200/80 -mt-2 mb-4 bg-yellow-500/10 p-2 rounded">
                <AlertCircle size={12} className="inline mr-1" />
                LPR cameras will automatically open the gate for this vehicle.
              </p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="mt-4">
            {loading ? 'Processing...' : type === VisitorType.ADHOC ? 'Get Access Pass' : 'Submit Request'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export const VisitorWallet = () => {
    const { getVisitorByCode } = useStore();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    
    const visitorId = window.location.hash.split('/').pop(); 
    const visitor = getVisitorByCode(visitorId || '');

    if (!visitor) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-white p-4">
                <p>Visitor record not found.</p>
                <Button onClick={() => navigate('/visitor')} className="mt-4">Go Home</Button>
            </div>
        );
    }

    const refreshStatus = () => {
        navigate(0);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(visitor.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadQR = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        // Serialize SVG
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg);

        // Add namespaces if missing (sometimes needed for pure SVG data URI)
        if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;

        const img = new Image();
        img.onload = () => {
            // Fill white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw SVG
            ctx.drawImage(img, 25, 25, 450, 450);
            
            // Trigger download
            const a = document.createElement('a');
            a.download = `pass-${visitor.id}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Visitor Pass: ${visitor.name}`,
                    text: `My Visitor Access Code is: ${visitor.id}`,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing', error);
            }
        } else {
            handleCopyCode();
            alert('Code copied to clipboard!');
        }
    };

    return (
        <div className="max-w-md mx-auto pt-6 px-4 pb-20">
             <Button variant="secondary" onClick={() => navigate('/visitor')} className="mb-4 text-sm py-2 px-4">
                &larr; Home
            </Button>
            
            <GlassCard className="text-center relative">
                <div className="flex justify-center mb-4">
                    <StatusBadge status={visitor.status} />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-1">{visitor.name}</h2>
                <p className="text-white/50 text-sm mb-4">{visitor.type} • {visitor.transportMode}</p>
                
                {/* 5-Digit Code Display */}
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-6">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Unique Code</p>
                    <div className="flex items-center justify-center gap-3">
                         <p className="text-4xl font-mono font-bold text-white tracking-widest">{visitor.id}</p>
                         <button 
                            onClick={handleCopyCode} 
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                            title="Copy Code"
                         >
                            {copied ? <Check size={20} className="text-green-400"/> : <Copy size={20}/>}
                         </button>
                    </div>
                </div>

                {/* Show QR and Actions for Approved AND Pending */}
                {visitor.status !== VisitorStatus.REJECTED ? (
                    <div className="animate-in zoom-in duration-500">
                        <div className={visitor.status === VisitorStatus.PENDING ? "opacity-75 grayscale-[0.5] transition-all" : ""}>
                            <QRCodeDisplay 
                                value={visitor.id} 
                                type={visitor.qrType} 
                                label={visitor.status === VisitorStatus.PENDING ? "Pass Inactive - Pending Approval" : undefined}
                            />
                        </div>

                        <div className="flex gap-2 mt-6">
                            <Button 
                                variant="secondary" 
                                className="flex-1 text-sm flex items-center justify-center gap-2"
                                onClick={handleDownloadQR}
                            >
                                <Download size={16}/> Save
                            </Button>
                            <Button 
                                variant="secondary" 
                                className="flex-1 text-sm flex items-center justify-center gap-2"
                                onClick={handleShare}
                            >
                                <Share2 size={16}/> Share
                            </Button>
                        </div>
                        
                        {/* Status Specific Messages below actions */}
                        {visitor.status === VisitorStatus.APPROVED ? (
                             <div className="mt-6 grid grid-cols-2 gap-4 text-left">
                                <div className="bg-white/5 p-3 rounded-lg">
                                    <p className="text-xs text-white/40 uppercase">Valid Date</p>
                                    <p className="text-white font-medium">{visitor.visitDate}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg">
                                    <p className="text-xs text-white/40 uppercase">Access</p>
                                    <p className="text-white font-medium">
                                        {visitor.qrType === QRType.QR1 ? 'Front Gate' : 
                                         visitor.qrType === QRType.QR2 ? 'Elevator' : 
                                         visitor.qrType === QRType.QR3 ? 'Full Access' : 'LPR Entry'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 py-4 px-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                <div className="flex flex-col items-center">
                                     <div className="w-6 h-6 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mb-2"></div>
                                     <h3 className="text-yellow-200 font-bold text-sm">Awaiting Approval</h3>
                                     <p className="text-white/50 text-xs mt-1 px-2 text-center">
                                         You can save your pass now. It will automatically activate once approved.
                                     </p>
                                     <Button variant="outline" onClick={refreshStatus} className="mt-3 text-xs py-1.5 px-3 h-auto">
                                        <RefreshCw size={12} className="mr-1 inline" /> Check Status
                                     </Button>
                                 </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // REJECTED STATE
                    <div className="py-10 bg-red-500/10 rounded-xl border border-red-500/20">
                        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">Request Rejected</h3>
                        <p className="text-white/50 text-sm mt-2 px-4 mb-4">
                            Reason: {visitor.rejectionReason || 'Details not provided.'}
                        </p>
                        <Button onClick={() => navigate('/visitor/prereg')} variant="secondary">
                            Try Again
                        </Button>
                    </div>
                )}
            </GlassCard>
            
            {visitor.transportMode === TransportMode.CAR && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                    <Car className="text-yellow-400 shrink-0 mt-1" size={20} />
                    <div>
                        <p className="text-yellow-200 font-bold text-sm">Vehicle Access</p>
                        <p className="text-yellow-200/70 text-xs mt-1">
                            Your vehicle ({visitor.licensePlate}) is registered for LPR entry. Drive up to the gate slowly.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

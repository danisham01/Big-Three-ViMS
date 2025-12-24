import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, StatusBadge } from '../components/GlassComponents';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { VisitorType, TransportMode, VisitorStatus, QRType } from '../types';
import { User, Car, Check, AlertCircle, RefreshCw, Share2, Download, Copy, Building2, ChevronRight, ArrowLeft, HelpCircle, Phone, FileText, Briefcase, MapPin } from 'lucide-react';

export const VisitorLanding = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen pt-12 px-6 max-w-md mx-auto relative">
      
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-20 h-20 bg-[#1E1E2E] rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl mb-6">
            <Building2 className="text-blue-500" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Welcome to ViMS</h1>
        <p className="text-white/40 text-center text-sm font-medium">(Visitor management system)</p>
        <p className="text-white/60 text-center text-sm mt-4 max-w-[200px]">Please select your sign-in method to get started.</p>
      </div>

      {/* Cards Section */}
      <div className="flex flex-col gap-4 mb-4">
          <div onClick={() => navigate('/visitor/adhoc')} className="group cursor-pointer">
            <div className="bg-[#151520] hover:bg-[#1E1E2E] border border-white/5 rounded-[2rem] p-5 flex items-center justify-between transition-all duration-300 shadow-lg group-hover:shadow-blue-900/10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-blue-600 shadow-lg shadow-blue-600/30 flex items-center justify-center shrink-0">
                        <User className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Ad-hoc Visitor</h3>
                        <p className="text-white/40 text-xs mt-1">I don't have an appointment</p>
                    </div>
                </div>
                <ChevronRight className="text-white/20 group-hover:text-white transition-colors" />
            </div>
          </div>

          <div onClick={() => navigate('/visitor/prereg')} className="group cursor-pointer">
            <div className="bg-[#151520] hover:bg-[#1E1E2E] border border-white/5 rounded-[2rem] p-5 flex items-center justify-between transition-all duration-300 shadow-lg group-hover:shadow-emerald-900/10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center shrink-0">
                        <Check className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Pre-registered Visitor</h3>
                        <p className="text-white/40 text-xs mt-1">I have an invite code</p>
                    </div>
                </div>
                <ChevronRight className="text-white/20 group-hover:text-white transition-colors" />
            </div>
          </div>
      </div>

      {/* Staff Login Link */}
      <div className="text-center mb-auto">
        <p className="text-white/40 text-sm">
            Are you a staff? <Link to="/staff/login" className="text-blue-500 font-bold hover:underline">Login as Staff</Link>
        </p>
      </div>

      {/* Bottom Footer */}
      <div className="flex items-center justify-between py-8 mt-6">
        <button className="px-4 py-2 rounded-full bg-[#1E1E2E] border border-white/5 text-xs font-medium text-white/70 flex items-center gap-2">
            🌐 English
        </button>
        <button className="text-blue-500 text-sm font-medium hover:underline">
            Need Assistance?
        </button>
      </div>
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
    
    setTimeout(() => {
      const visitor = addVisitor({
        ...formData,
        type,
      });
      setLoading(false);
      navigate(`/visitor/wallet/${visitor.id}`);
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto pt-6 px-4 pb-20">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/visitor')} className="w-10 h-10 rounded-full bg-[#1E1E2E] border border-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
        </button>
        <h2 className="text-xs font-bold tracking-widest text-white/50 uppercase">Visitor Access</h2>
        <button className="w-10 h-10 rounded-full bg-[#1E1E2E] border border-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <HelpCircle size={20} />
        </button>
      </div>

      {/* Progress & Title */}
      <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 flex-1 bg-blue-600 rounded-full"></div>
            <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
            <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
            <span className="text-xs text-white/40 ml-2">Step 1 of 3</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Who are you?</h1>
          <p className="text-white/50 text-sm">Please enter your details to generate your pass.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Section 1: Personal Info */}
        <GlassCard title="Personal Info" className="!p-5 !pb-2">
            <Input 
                label="Full Name" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                icon={<User size={18} />}
            />
            <Input 
                label="Phone or Email" 
                required 
                value={formData.contact}
                onChange={e => setFormData({...formData, contact: e.target.value})}
                placeholder="+1 (555) 000-0000"
                icon={<Phone size={18} />}
            />
        </GlassCard>

        {/* Section 2: Visit Details */}
        <GlassCard title="Visit Details" className="!p-5 !pb-2">
            <Input 
                label="Purpose" 
                required 
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
                placeholder="e.g. Business Meeting"
                icon={<Briefcase size={18} />}
            />
        </GlassCard>

        {/* Section 3: Transportation */}
        <GlassCard title="Transportation" className="!p-5">
            <div className="bg-[#121217] p-1 rounded-xl flex mb-4">
                <button
                    type="button"
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.transportMode === TransportMode.CAR ? 'bg-[#252530] text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                    onClick={() => setFormData({...formData, transportMode: TransportMode.CAR})}
                >
                    <Car size={16} /> Car
                </button>
                <button
                    type="button"
                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.transportMode === TransportMode.NON_CAR ? 'bg-[#252530] text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                    onClick={() => setFormData({...formData, transportMode: TransportMode.NON_CAR})}
                >
                    <User size={16} /> Walk-in
                </button>
            </div>

            {formData.transportMode === TransportMode.CAR && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <Input 
                        label="License Plate" 
                        required 
                        value={formData.licensePlate}
                        onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})}
                        placeholder="ABC-1234"
                        icon={<FileText size={18} />}
                        className="uppercase font-mono"
                    />
                </div>
            )}
        </GlassCard>

        {/* Action Button */}
        <div className="mt-2 flex items-center justify-between gap-4">
            <button type="button" onClick={() => navigate('/visitor')} className="text-white/50 text-sm font-bold px-4 py-2 hover:text-white transition-colors">
                Back
            </button>
            <Button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 shadow-blue-500/20 shadow-xl">
                {loading ? 'Processing...' : 'Next Step'} <ChevronRight size={18} />
            </Button>
        </div>

      </form>
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
        setTimeout(() => {
            const visitor = getVisitorByCode(code);
            setLoading(false);
            if (visitor) {
                navigate(`/visitor/wallet/${visitor.id}`);
            } else {
                setError('Invalid code.');
            }
        }, 800);
    };

    return (
        <div className="max-w-md mx-auto pt-20 px-6">
            <button onClick={() => navigate('/visitor')} className="mb-6 w-10 h-10 rounded-full bg-[#1E1E2E] border border-white/5 flex items-center justify-center text-white/70 hover:text-white">
                <ArrowLeft size={20} />
            </button>
            
            <h1 className="text-3xl font-bold text-white mb-2">Check Status</h1>
            <p className="text-white/50 text-sm mb-8">Enter your 5-digit unique code to view your pass.</p>

            <form onSubmit={handleCheck} className="flex flex-col gap-4">
                <GlassCard className="!p-8">
                    <Input 
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="00000"
                        className="text-center text-3xl tracking-[0.5em] font-mono h-20"
                        maxLength={5}
                        autoFocus
                    />
                </GlassCard>
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-sm flex items-center justify-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
                <Button type="submit" disabled={loading || code.length < 5} className="w-full mt-4 h-14 text-lg">
                    {loading ? 'Checking...' : 'Find Appointment'}
                </Button>
            </form>
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

    const handleCopyCode = () => {
        navigator.clipboard.writeText(visitor.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadQR = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg);
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
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 25, 25, 450, 450);
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
        <div className="max-w-md mx-auto pt-6 px-4 pb-24">
             <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate('/visitor')} className="w-10 h-10 rounded-full bg-[#1E1E2E] border border-white/5 flex items-center justify-center text-white/70 hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-white font-bold">Access Pass</h2>
                <div className="w-10"></div>
            </div>
            
            <GlassCard className="text-center relative !p-0 overflow-hidden pb-6">
                <div className="bg-[#252530] p-6 border-b border-white/5">
                    <div className="flex justify-center mb-4">
                        <StatusBadge status={visitor.status} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{visitor.name}</h2>
                    <p className="text-white/50 text-sm flex items-center justify-center gap-2">
                        {visitor.type === VisitorType.ADHOC ? 'Ad-hoc' : 'Guest'} • <span className="flex items-center gap-1">{visitor.transportMode === TransportMode.CAR ? <Car size={14}/> : <User size={14}/>} {visitor.transportMode}</span>
                    </p>
                </div>
                
                <div className="p-6">
                    {/* 5-Digit Code Display */}
                    <div className="bg-[#121217] rounded-2xl p-4 mb-6 relative group cursor-pointer" onClick={handleCopyCode}>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-bold">Unique Access Code</p>
                        <p className="text-4xl font-mono font-bold text-white tracking-[0.2em] group-hover:text-blue-400 transition-colors">{visitor.id}</p>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-white/50 transition-colors">
                            {copied ? <Check size={20} className="text-green-500"/> : <Copy size={20}/>}
                        </div>
                    </div>

                    {visitor.status !== VisitorStatus.REJECTED ? (
                        <div className="animate-in zoom-in duration-500">
                            <div className={`p-4 bg-white rounded-2xl mx-auto w-fit mb-6 ${visitor.status === VisitorStatus.PENDING ? "opacity-60 grayscale" : ""}`}>
                                <QRCodeDisplay 
                                    value={visitor.id} 
                                    type={visitor.qrType} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <Button 
                                    variant="secondary" 
                                    className="text-xs py-3 flex items-center justify-center gap-2 bg-[#252530] hover:bg-[#303040]"
                                    onClick={handleDownloadQR}
                                >
                                    <Download size={14}/> Save to Gallery
                                </Button>
                                <Button 
                                    variant="secondary" 
                                    className="text-xs py-3 flex items-center justify-center gap-2 bg-[#252530] hover:bg-[#303040]"
                                    onClick={handleShare}
                                >
                                    <Share2 size={14}/> Share Pass
                                </Button>
                            </div>

                            {visitor.status === VisitorStatus.PENDING && (
                                <p className="text-xs text-yellow-500/80 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
                                    <RefreshCw size={12} className="inline mr-1 animate-spin"/> Awaiting approval. Pass will activate automatically.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="py-6 bg-red-500/10 rounded-xl border border-red-500/20">
                            <AlertCircle size={32} className="text-red-400 mx-auto mb-2" />
                            <h3 className="text-sm font-bold text-white">Request Rejected</h3>
                            <p className="text-white/50 text-xs mt-1 px-4">
                                {visitor.rejectionReason || 'No reason provided.'}
                            </p>
                        </div>
                    )}
                </div>
            </GlassCard>
            
            {visitor.transportMode === TransportMode.CAR && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
                        <Car size={20} />
                    </div>
                    <div>
                        <p className="text-yellow-200 font-bold text-sm">LPR Enabled</p>
                        <p className="text-yellow-200/60 text-xs mt-0.5">
                            Gate opens automatically for <span className="font-mono text-white/90 bg-white/10 px-1 rounded">{visitor.licensePlate}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, Select, StatusBadge } from '../components/GlassComponents';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { VisitorType, TransportMode, VisitorStatus, QRType } from '../types';
import { User, Car, Check, QrCode, AlertCircle, RefreshCw, Share2, Download } from 'lucide-react';

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
    // In real app, use useParams. Here we assume URL parsing is handled by parent or simplified 
    // Since HashRouter in a single file is complex, we will grab ID from URL manually in parent or props
    // But for this structure, let's just assume we are passing ID via window location hash for simplicity if params fail,
    // OR ideally rely on React Router properly.
    // Let's rely on React Router hooks.
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
        // Just force re-render or nav logic
        navigate(0);
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
                <p className="text-white/50 text-sm mb-6">{visitor.type} • {visitor.transportMode}</p>

                {visitor.status === VisitorStatus.APPROVED ? (
                    <div className="animate-in zoom-in duration-500">
                        <QRCodeDisplay value={visitor.id} type={visitor.qrType} />
                        
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

                        <div className="flex gap-2 mt-6">
                            <Button variant="secondary" className="flex-1 text-sm flex items-center justify-center gap-2">
                                <Download size={16}/> Save
                            </Button>
                            <Button variant="secondary" className="flex-1 text-sm flex items-center justify-center gap-2">
                                <Share2 size={16}/> Share
                            </Button>
                        </div>
                    </div>
                ) : visitor.status === VisitorStatus.PENDING ? (
                    <div className="py-10 bg-white/5 rounded-xl border border-white/10">
                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-lg font-bold text-white">Pending Approval</h3>
                        <p className="text-white/50 text-sm mt-2 px-4">
                            Your request has been sent to the host. Please refresh this page shortly.
                        </p>
                        <Button variant="outline" onClick={refreshStatus} className="mt-6">
                            <RefreshCw size={16} className="mr-2 inline" /> Check Status
                        </Button>
                    </div>
                ) : (
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

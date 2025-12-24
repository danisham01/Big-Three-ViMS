import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, StatusBadge } from '../components/GlassComponents';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { VisitorType, TransportMode, VisitorStatus, Visitor } from '../types';
import { User, Car, Check, Lock, ChevronRight, Mail, Share2, Download, LogOut, ArrowLeft, Calendar, FileText, Phone, Briefcase, UserCheck, Shield, Clock } from 'lucide-react';

// 1. Unified Login Page (Admin & Staff)
export const StaffLogin = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'staff' | 'admin'>('staff');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulation of login
    setTimeout(() => {
      setLoading(false);
      if (role === 'admin') {
        navigate('/operator'); // Admin goes to Operator Dashboard
      } else {
        navigate('/staff/dashboard'); // Staff goes to Staff Dashboard
      }
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#1E1E2E] rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl mb-4 mx-auto">
             {role === 'admin' ? <Shield className="text-emerald-500" size={32} /> : <UserCheck className="text-blue-500" size={32} />}
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{role === 'admin' ? 'Admin Portal' : 'Staff Portal'}</h1>
        <p className="text-white/40 text-sm">
            {role === 'admin' ? 'Manage system, approvals, and security.' : 'Manage guest invitations and history.'}
        </p>
      </div>

      <GlassCard className="w-full !p-6">
        {/* Role Switcher */}
        <div className="flex bg-[#121217] p-1 rounded-xl mb-6">
            <button 
                type="button"
                onClick={() => setRole('staff')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'staff' ? 'bg-[#252530] text-white shadow' : 'text-white/40'}`}
            >
                Staff
            </button>
            <button 
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'admin' ? 'bg-[#252530] text-white shadow' : 'text-white/40'}`}
            >
                Admin
            </button>
        </div>

        <form onSubmit={handleLogin}>
           <div className="mb-6">
             <Input 
                label="Username" 
                defaultValue={role} 
                readOnly 
                className="opacity-60 cursor-not-allowed" 
                icon={<User size={18}/>} 
             />
             <Input 
                label="Password" 
                type="password" 
                defaultValue="password" 
                readOnly 
                className="opacity-60 cursor-not-allowed" 
                icon={<Lock size={18}/>} 
             />
           </div>
           
           <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
             {loading ? 'Authenticating...' : `Login as ${role === 'admin' ? 'Admin' : 'Staff'}`}
           </Button>
        </form>
      </GlassCard>
      
      <button onClick={() => navigate('/visitor')} className="mt-8 text-white/40 text-sm hover:text-white transition-colors">
        &larr; Back to Visitor Home
      </button>
    </div>
  );
};

// 2. Staff Dashboard - Tabs for "New Registration" and "History"
export const StaffDashboard = () => {
    const navigate = useNavigate();
    const { addVisitor, visitors } = useStore();
    const [view, setView] = useState<'register' | 'history'>('register');
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        icNumber: '',
        purpose: '',
        startDate: '',
        endDate: '',
        transportMode: TransportMode.NON_CAR,
        licensePlate: ''
    });

    // Filter visitors created by Staff
    const staffHistory = visitors.filter(v => v.registeredBy === 'STAFF');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulate SMTP sending
        console.log(`[SMTP SIMULATION] Sending email to ${formData.email}...`);

        setTimeout(() => {
            const visitor = addVisitor({
                name: formData.name,
                contact: formData.phone,
                email: formData.email,
                icNumber: formData.icNumber,
                purpose: formData.purpose,
                visitDate: formData.startDate,
                endDate: formData.endDate,
                transportMode: formData.transportMode,
                licensePlate: formData.licensePlate,
                type: VisitorType.PREREGISTERED,
                status: VisitorStatus.APPROVED, // Auto-approve
                registeredBy: 'STAFF'
            });
            setLoading(false);
            navigate(`/staff/share/${visitor.id}?emailSent=true`);
        }, 1500);
    };

    return (
        <div className="max-w-md mx-auto pt-6 px-4 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-white">Staff Dashboard</h1>
                <Button variant="ghost" className="!p-2 text-white/50" onClick={() => navigate('/visitor')}>
                    <LogOut size={20} />
                </Button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 mb-6">
                <button 
                    onClick={() => setView('register')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${view === 'register' ? 'border-blue-500 text-white' : 'border-transparent text-white/40'}`}
                >
                    New Guest
                </button>
                <button 
                    onClick={() => setView('history')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${view === 'history' ? 'border-blue-500 text-white' : 'border-transparent text-white/40'}`}
                >
                    History
                </button>
            </div>

            {view === 'register' ? (
                <GlassCard title="Guest Details" className="!p-5 animate-in fade-in slide-in-from-right-4">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        {/* Basic Info */}
                        <Input 
                            label="Full Name" 
                            required 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="Guest Name"
                            icon={<User size={16} />}
                        />
                        <Input 
                            label="Email Address (For Pass)" 
                            required 
                            type="email"
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="guest@email.com"
                            icon={<Mail size={16} />}
                        />
                        <Input 
                            label="Phone Number" 
                            required 
                            type="tel"
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            placeholder="+60 12-345 6789"
                            icon={<Phone size={16} />}
                        />
                        <Input 
                            label="NRIC / Passport No." 
                            required 
                            value={formData.icNumber} 
                            onChange={e => setFormData({...formData, icNumber: e.target.value})}
                            placeholder="e.g. 900101-14-1234"
                            icon={<FileText size={16} />}
                        />
                        
                        {/* Visit Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <Input 
                                label="Start Date/Time" 
                                type="datetime-local"
                                required 
                                value={formData.startDate} 
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                icon={<Calendar size={16} />}
                                className="!px-2 text-xs"
                            />
                            <Input 
                                label="End Date/Time" 
                                type="datetime-local"
                                required 
                                value={formData.endDate} 
                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                                icon={<Calendar size={16} />}
                                className="!px-2 text-xs"
                            />
                        </div>

                        <Input 
                            label="Purpose of Visit" 
                            required 
                            value={formData.purpose} 
                            onChange={e => setFormData({...formData, purpose: e.target.value})}
                            placeholder="e.g. Project Discussion"
                            icon={<Briefcase size={16} />}
                        />

                        {/* Transport */}
                        <label className="block text-xs font-medium text-white/60 mb-1 ml-1 uppercase tracking-wider">Transportation</label>
                        <div className="bg-[#121217] p-1 rounded-xl flex mb-2">
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
                                    className="uppercase font-mono"
                                />
                            </div>
                        )}

                        <Button type="submit" disabled={loading} className="mt-4 flex items-center justify-center gap-2">
                            {loading ? (
                                <>Sending Email <span className="animate-pulse">...</span></>
                            ) : (
                                <>Generate & Email Pass <ChevronRight size={18} /></>
                            )}
                        </Button>
                    </form>
                </GlassCard>
            ) : (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4">
                    {staffHistory.length === 0 ? (
                        <div className="text-center py-10 opacity-40">
                            <UserCheck size={40} className="mx-auto mb-2" />
                            <p>No history yet.</p>
                        </div>
                    ) : (
                        staffHistory.map(v => (
                            <div key={v.id} onClick={() => navigate(`/staff/share/${v.id}`)} className="bg-[#151520] border border-white/5 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-[#1E1E2E] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{v.name}</h3>
                                        <p className="text-white/40 text-xs">{new Date(v.visitDate).toLocaleDateString()} • {v.transportMode}</p>
                                    </div>
                                </div>
                                <StatusBadge status={v.status} />
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// 3. Staff Share Page
export const StaffSharePass = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { getVisitorByCode } = useStore();
    
    // Check for email sent flag in URL
    const queryParams = new URLSearchParams(window.location.search);
    const emailSent = queryParams.get('emailSent') === 'true';

    const visitor = getVisitorByCode(id || '');

    if (!visitor) return <div className="text-white p-10 text-center">Visitor not found</div>;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Visitor Pass: ${visitor.name}`,
                    text: `Access Code: ${visitor.id}`,
                    url: window.location.href
                });
            } catch (error) { console.log('Error sharing', error); }
        } else {
            alert('Sharing not supported on this device.');
        }
    };
    
    const handleDownload = () => {
        alert('Downloading pass image...'); 
    };

    return (
        <div className="max-w-md mx-auto pt-8 px-4 pb-24">
            <button onClick={() => navigate('/staff/dashboard')} className="mb-4 flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={18} /> Back to Dashboard
            </button>
            
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-2">
                    <Check size={24} />
                </div>
                <h1 className="text-2xl font-bold text-white">Guest Registered!</h1>
                {emailSent && (
                    <p className="text-emerald-400 text-xs font-bold bg-emerald-500/10 py-1 px-3 rounded-full mx-auto w-fit mt-2 border border-emerald-500/20 flex items-center gap-1">
                        <Mail size={12} /> Email sent to {visitor.email}
                    </p>
                )}
            </div>

            <GlassCard className="text-center !p-0 overflow-hidden">
                <div className="bg-[#252530] p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white mb-1">{visitor.name}</h2>
                    <div className="flex flex-col gap-1 mt-2">
                        <p className="text-white/50 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                           <Clock size={12} /> {new Date(visitor.visitDate).toLocaleDateString()}
                        </p>
                        <p className="text-white/50 text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                           <FileText size={12} /> {visitor.icNumber || 'N/A'}
                        </p>
                    </div>
                </div>
                
                <div className="p-6">
                    <div className="bg-[#121217] rounded-xl p-4 mb-6">
                         <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-bold">Share this Code</p>
                         <p className="text-4xl font-mono font-bold text-blue-400 tracking-[0.2em]">{visitor.id}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl mb-6 mx-auto w-fit">
                         <QRCodeDisplay value={visitor.id} type={visitor.qrType} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button onClick={handleShare} variant="secondary" className="flex items-center justify-center gap-2">
                            <Share2 size={16} /> Share
                        </Button>
                        <Button onClick={handleDownload} variant="secondary" className="flex items-center justify-center gap-2">
                            <Download size={16} /> Save
                        </Button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};


import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, StatusBadge, Toast, LoadingOverlay, HistoryItemSkeleton, ConfirmModal } from '../components/GlassComponents';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
// Add QRType to the types import list
import { VisitorType, TransportMode, VisitorStatus, Visitor, UserRole, Notification, QRType } from '../types';
// Alias User as UserIcon for consistency in the file where UserIcon is used
import { User as UserIcon, Car, Check, Lock, ChevronRight, Mail, Share2, Download, LogOut, ArrowLeft, Calendar, FileText, Phone, Briefcase, UserCheck, Shield, Clock, AlertCircle, Eye, EyeOff, CheckCircle2, Bell } from 'lucide-react';

export const StaffLogin = () => {
  const navigate = useNavigate();
  const { login, currentUser } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
        if (currentUser.role === UserRole.ADMIN) navigate('/operator');
        else navigate('/staff/dashboard');
    }
  }, [currentUser, navigate]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setError('');
    setLoading(true);
    
    try {
        const success = await login(username.trim(), password);
        if (success) {
        } else {
            setError('Invalid credentials. Hint: use admin / password123');
        }
    } catch (err) {
        setError('An error occurred. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 max-w-md mx-auto">
      {loading && <LoadingOverlay message="Authenticating..." />}
      
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#1E1E2E] rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl mb-4 mx-auto">
             <Shield className="text-blue-500" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Staff Portal</h1>
        <p className="text-white/40 text-sm">
            Authenticate to manage guests, approvals, and security protocols.
        </p>
      </div>

      <GlassCard className="w-full !p-6">
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
           {error && (
               <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-xs mb-4">
                   <AlertCircle size={14} />
                   {error}
               </div>
           )}
           
           <Input 
                label="Username" 
                placeholder="Enter username" 
                value={username}
                error={fieldErrors.username}
                onChange={e => {
                  setUsername(e.target.value);
                  if(fieldErrors.username) setFieldErrors(prev => ({...prev, username: ''}));
                }}
                // Use UserIcon alias
                icon={<UserIcon size={18}/>} 
                required
           />
           <Input 
                label="Password" 
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                error={fieldErrors.password}
                onChange={e => {
                  setPassword(e.target.value);
                  if(fieldErrors.password) setFieldErrors(prev => ({...prev, password: ''}));
                }}
                icon={<Lock size={18}/>} 
                suffix={
                  <button 
                    type="button" 
                    onClick={togglePasswordVisibility}
                    className="flex items-center justify-center focus:outline-none hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                required
           />
           
           <Button type="submit" loading={loading} className="w-full mt-4">
             Sign In
           </Button>
        </form>
      </GlassCard>
      
      <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-white/20 text-xs text-center px-8">
              Authorized personnel only. All access is logged for security purposes.
          </p>
          <button onClick={() => navigate('/visitor')} className="text-white/40 text-sm hover:text-white transition-colors">
            &larr; Back to Visitor Home
          </button>
      </div>
    </div>
  );
};

export const StaffDashboard = () => {
    const navigate = useNavigate();
    const { addVisitor, visitors, notifications, markNotificationRead, currentUser, logout } = useStore();
    const [view, setView] = useState<'register' | 'history' | 'notifications'>('register');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    
    useEffect(() => {
        if (!currentUser) navigate('/staff/login');
    }, [currentUser, navigate]);

    useEffect(() => {
      if (view === 'history') {
        setHistoryLoading(true);
        const timer = setTimeout(() => setHistoryLoading(false), 800);
        return () => clearTimeout(timer);
      }
    }, [view]);

    // Notification Effect: Show toast for first unread notification
    const unreadNotifications = useMemo(() => {
      return notifications.filter(n => n.recipient === currentUser?.username && !n.read);
    }, [notifications, currentUser]);

    useEffect(() => {
      if (unreadNotifications.length > 0) {
        const latest = unreadNotifications[0];
        setToast({ show: true, message: latest.message });
        markNotificationRead(latest.id);
      }
    }, [unreadNotifications, markNotificationRead]);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', icNumber: '', purpose: '',
        startDate: new Date().toISOString().split('T')[0], endDate: '', transportMode: TransportMode.NON_CAR, licensePlate: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const staffHistory = visitors.filter(v => v.registeredBy === currentUser?.username);

    const validate = () => {
      const newErrors: { [key: string]: string } = {};
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setLoading(true);
        setTimeout(() => {
            const visitor = addVisitor({
                ...formData,
                name: formData.name.trim(),
                visitDate: formData.startDate,
                contact: formData.phone.trim(),
                email: formData.email.trim(),
                type: VisitorType.PREREGISTERED,
                status: VisitorStatus.PENDING, // Changed to PENDING to trigger the operator notification flow
                registeredBy: currentUser?.username || 'STAFF'
            });
            setLoading(false);
            setToast({ show: true, message: 'Invitation pending approval.' });
            setTimeout(() => {
                navigate(`/staff/share/${visitor.id}?emailSent=true`);
            }, 800);
        }, 1200);
    };

    if (!currentUser) return null;

    return (
        <div className="max-w-md mx-auto pt-6 px-4 pb-24">
            {loading && <LoadingOverlay message="Generating Digital Pass..." />}
            <Toast show={toast.show} message={toast.message} onHide={() => setToast({ ...toast, show: false })} />
            <ConfirmModal 
              show={showLogoutConfirm}
              title="Logout Session"
              message="Finish your current staff session? You will need to login again to invite guests."
              onConfirm={logout}
              onCancel={() => setShowLogoutConfirm(false)}
              confirmText="Logout"
            />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        {/* Use UserIcon alias */}
                        <UserIcon size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{currentUser.username}</p>
                        <h1 className="text-xl font-bold text-white">{currentUser.fullName}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setView('notifications')}
                        className={`relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors ${view === 'notifications' ? 'text-blue-500 border-blue-500/30 bg-blue-500/5' : 'text-white/40 hover:text-white'}`}
                    >
                        <Bell size={20} />
                        {notifications.filter(n => n.recipient === currentUser.username && !n.read).length > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#050508] rounded-full animate-pulse"></span>
                        )}
                    </button>
                    <Button variant="ghost" className="!p-2 text-red-500/60 hover:text-red-500" onClick={() => setShowLogoutConfirm(true)}>
                        <LogOut size={20} />
                    </Button>
                </div>
            </div>

            <div className="flex border-b border-white/10 mb-6">
                <button 
                    onClick={() => setView('register')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${view === 'register' ? 'border-blue-500 text-white' : 'border-transparent text-white/40'}`}
                >
                    Invite
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
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
                        <Input 
                          label="Full Name" 
                          required 
                          value={formData.name} 
                          error={errors.name}
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                          // Use UserIcon alias
                          icon={<UserIcon size={16} />} 
                        />
                        <Input 
                          label="Email" 
                          required 
                          type="email" 
                          value={formData.email} 
                          error={errors.email}
                          onChange={e => setFormData({...formData, email: e.target.value})} 
                          icon={<Mail size={16} />} 
                        />
                        <Input 
                          label="Phone" 
                          required 
                          type="tel" 
                          value={formData.phone} 
                          error={errors.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})} 
                          icon={<Phone size={16} />} 
                        />
                        <Input 
                          label="Purpose" 
                          required 
                          value={formData.purpose} 
                          error={errors.purpose}
                          onChange={e => setFormData({...formData, purpose: e.target.value})} 
                          icon={<Briefcase size={16} />} 
                        />
                        <Button type="submit" loading={loading} className="mt-4 flex items-center justify-center gap-2 group">
                             Generate Invite <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>
                </GlassCard>
            ) : view === 'history' ? (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4">
                    {historyLoading ? (
                      <>
                        <HistoryItemSkeleton />
                        <HistoryItemSkeleton />
                        <HistoryItemSkeleton />
                      </>
                    ) : staffHistory.length === 0 ? (
                        <div className="text-center py-10 opacity-40">
                            <UserCheck size={40} className="mx-auto mb-2" />
                            <p>No history yet.</p>
                        </div>
                    ) : (
                        staffHistory.map(v => (
                            <div key={v.id} onClick={() => navigate(`/staff/share/${v.id}`)} className="bg-[#151520] border border-white/5 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-[#1E1E2E] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                                        {/* Use UserIcon alias */}
                                        <UserIcon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{v.name}</h3>
                                        <p className="text-white/40 text-[10px]">{v.purpose}</p>
                                    </div>
                                </div>
                                <StatusBadge status={v.status} />
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
                    {notifications.filter(n => n.recipient === currentUser.username).length === 0 ? (
                        <div className="text-center py-12 text-white/20">
                            <Bell size={40} className="mx-auto mb-2 opacity-5" />
                            <p className="text-xs font-bold uppercase tracking-widest">No notifications</p>
                        </div>
                    ) : (
                        notifications.filter(n => n.recipient === currentUser.username).map(n => (
                            <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-white/5 border-white/5 opacity-60' : 'bg-blue-500/5 border-blue-500/20'}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.status === VisitorStatus.APPROVED ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    <div>
                                        <p className="text-xs font-medium text-white/90 leading-relaxed">{n.message}</p>
                                        <p className="text-[9px] text-white/30 mt-2 font-bold uppercase tracking-widest">
                                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const StaffSharePass = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { getVisitorByCode, currentUser } = useStore();
    const [toast, setToast] = useState({ show: false, message: '' });
    const [isSharing, setIsSharing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (!currentUser) navigate('/staff/login');
        if (searchParams.get('emailSent') === 'true') {
            setToast({ show: true, message: 'Invitation email sent!' });
        }
    }, [currentUser, navigate, searchParams]);

    const visitor = getVisitorByCode(id || '');

    if (!visitor) return <div className="text-white p-10 text-center">Visitor not found</div>;

    const handleShare = async () => {
        setIsSharing(true);
        const shareUrl = `${window.location.origin}/#/visitor/wallet/${visitor.id}`;
        await new Promise(r => setTimeout(r, 800));

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Visitor Pass: ${visitor.name}`,
                    text: `Hello ${visitor.name}, here is your access code: ${visitor.id}`,
                    url: shareUrl
                });
                setToast({ show: true, message: 'Pass shared successfully!' });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    navigator.clipboard.writeText(shareUrl);
                    setToast({ show: true, message: 'Link copied to clipboard!' });
                }
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            setToast({ show: true, message: 'Link copied to clipboard!' });
        }
        setIsSharing(false);
    };

    const handleDownload = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1200));
        setToast({ show: true, message: 'Pass saved to gallery!' });
        setIsSaving(false);
    };

    return (
        <div className="max-w-md mx-auto pt-8 px-4 pb-24">
            <Toast show={toast.show} message={toast.message} onHide={() => setToast({ ...toast, show: false })} />

            <button onClick={() => navigate('/staff/dashboard')} className="mb-4 flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft size={18} /> Back to Dashboard
            </button>
            
            <div className="text-center mb-6 animate-in slide-in-from-top-2 fade-in duration-700">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative">
                    <Check size={32} />
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-20"></div>
                </div>
                <h1 className="text-2xl font-bold text-white">Guest Invite Ready!</h1>
                <p className="text-white/40 text-xs mt-1">Status: {visitor.status}</p>
            </div>

            <GlassCard className="text-center !p-0 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-500">
                <div className="bg-[#252530] p-6 border-b border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
                    <h2 className="text-xl font-bold text-white mb-1">{visitor.name}</h2>
                    <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                         <span className="font-black text-blue-400">ID {visitor.id}</span>
                    </p>
                </div>
                <div className="p-6 relative">
                    <div className="bg-white p-4 rounded-2xl mb-8 mx-auto w-fit shadow-xl transform hover:scale-[1.02] transition-transform duration-300">
                         {/* Correctly use QRType which is now imported */}
                         <QRCodeDisplay value={visitor.id} type={visitor.status === VisitorStatus.APPROVED ? visitor.qrType : QRType.NONE} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <Button 
                            variant="primary" 
                            className="flex items-center justify-center gap-2" 
                            onClick={handleShare}
                            loading={isSharing}
                        >
                            <Share2 size={16} /> Share Pass
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="flex items-center justify-center gap-2" 
                            onClick={handleDownload}
                            loading={isSaving}
                        >
                            <Download size={16} /> Download
                        </Button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <CheckCircle2 size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Access Link Active</span>
                    </div>
                </div>
            </GlassCard>
            
            <div className="mt-8 p-6 bg-[#121217] rounded-3xl border border-white/5 animate-in slide-in-from-bottom-2 duration-700 delay-300">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Guest Instructions</h3>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                        <p className="text-xs text-white/60 leading-relaxed">Share the access link with the guest via WhatsApp, SMS, or Email.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                        <p className="text-xs text-white/60 leading-relaxed">Guest should present the QR code to the guard at the entrance.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

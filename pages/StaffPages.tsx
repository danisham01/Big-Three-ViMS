
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, Select, StatusBadge, Toast, LoadingOverlay, HistoryItemSkeleton, ConfirmModal } from '../components/GlassComponents';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { Logo } from '../components/Logo';
import { VisitorType, TransportMode, VisitorStatus, Visitor, UserRole, Notification, QRType } from '../types';
import { User as UserIcon, Car, Check, Lock, ChevronRight, Mail, Share2, Download, LogOut, ArrowLeft, Calendar, FileText, Phone, Briefcase, UserCheck, Shield, Clock, AlertCircle, Eye, EyeOff, CheckCircle2, Bell, MapPin, Hash, FileUp, Camera, Image as ImageIcon, Bike, X, CreditCard, Copy, ShieldCheck, RefreshCw } from 'lucide-react';
import { extractIdFields } from '../utils/ocr';

const PURPOSE_OPTIONS = [
  { value: '', label: 'Select Purpose' },
  { value: 'E-Hailing (Driver)', label: 'E-Hailing (Driver)' },
  { value: 'Food Services', label: 'Food Services' },
  { value: 'Courier Services', label: 'Courier Services' },
  { value: 'Garbage Truck Services', label: 'Garbage Truck Services' },
  { value: 'Safeguard', label: 'Safeguard' },
  { value: 'Public', label: 'Public' },
  { value: 'External TNB Staff', label: 'External TNB Staff' },
  { value: 'External Staff', label: 'External Staff' },
];

const SPECIFIED_LOCATIONS = [
  { value: '', label: 'Select Specified Location' },
  { value: 'Balai Islam', label: 'Balai Islam' },
  { value: 'Taska', label: 'Taska' },
  { value: 'Fasiliti Sukan', label: 'Fasiliti Sukan' },
  { value: 'Ruang Komuniti', label: 'Ruang Komuniti' },
];

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
        else if (currentUser.role === UserRole.LPR_READER) navigate('/lpr');
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
        if (!success) {
            setError('Invalid credentials. Hint: use lpr / 1 for LPR Terminal');
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
        <Logo size="lg" className="mb-4 mx-auto" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Staff Login</h1>
        <p className="text-slate-500 dark:text-white/40 text-sm">
            Authenticate to manage guests, approvals, and security protocols.
        </p>
      </div>

      <GlassCard className="w-full !p-6">
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
           {error && (
               <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs mb-4">
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
                    className="flex items-center justify-center focus:outline-none hover:text-blue-500 transition-colors text-slate-400 dark:text-white/40"
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
          <p className="text-slate-400 dark:text-white/20 text-xs text-center px-8">
              Authorized personnel only. All access is logged for security purposes.
          </p>
          <button onClick={() => navigate('/visitor')} className="text-slate-500 dark:text-white/40 text-sm hover:text-slate-900 dark:hover:text-white transition-colors">
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
    const docInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
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
        name: '', email: '', phone: '', icNumber: '', icPhoto: '', purpose: '',
        dropOffArea: '', specifiedLocation: '', staffNumber: '', location: '',
        startDate: '', endDate: '', supportingDocument: '', transportMode: TransportMode.NON_CAR, licensePlate: ''
    });

    // Default dates
    useState(() => {
      const now = new Date();
      const startStr = now.toISOString().slice(0, 16);
      const end = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default +24 hours for staff invites
      const endStr = end.toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, startDate: startStr, endDate: endStr }));
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const durationDays = useMemo(() => {
      if (!formData.startDate || !formData.endDate) return 0;
      const start = new Date(formData.startDate).getTime();
      const end = new Date(formData.endDate).getTime();
      if (isNaN(start) || isNaN(end)) return 0;
      return (end - start) / (1000 * 60 * 60 * 24);
    }, [formData.startDate, formData.endDate]);

    const isLongTerm = durationDays > 7;

    const staffHistory = visitors.filter(v => v.registeredBy === currentUser?.username);

    const validate = () => {
      const newErrors: { [key: string]: string } = {};
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s-()]{7,15}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Enter a valid phone number';
      }
      if (!formData.icNumber.trim()) newErrors.icNumber = 'IC Number is required';
      if (!formData.purpose) newErrors.purpose = 'Purpose is required';

      if (!formData.startDate) newErrors.startDate = 'Start time is required';
      if (!formData.endDate) newErrors.endDate = 'End time is required';
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End time must be after start time';
      }

      if (isLongTerm && !formData.supportingDocument) {
        newErrors.supportingDocument = 'Supporting document required for > 7 days';
      }

      const p = formData.purpose;
      if (['E-Hailing (Driver)', 'Food Services', 'Courier Services', 'Garbage Truck Services', 'Safeguard'].includes(p)) {
        if (!formData.dropOffArea.trim()) newErrors.dropOffArea = 'Area is required';
      }
      if (p === 'Public' && !formData.specifiedLocation) newErrors.specifiedLocation = 'Location is required';
      if (['External TNB Staff', 'External Staff'].includes(p)) {
        if (!formData.staffNumber.trim()) newErrors.staffNumber = 'Staff number is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.icPhoto) newErrors.icPhoto = 'ID Snapshot is required';
      }

      if (formData.transportMode === TransportMode.CAR && !formData.licensePlate.trim()) {
        newErrors.licensePlate = 'License plate is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const [ocrStatus, setOcrStatus] = useState<'idle' | 'scanning' | 'success' | 'partial' | 'error'>('idle');
    const [ocrMessage, setOcrMessage] = useState('');

    const runOcrAndFill = async (dataUrl: string) => {
      setFormData(prev => ({ ...prev, icPhoto: dataUrl }));
      setOcrStatus('scanning');
      setOcrMessage('Scanning ID…');
      try {
        const result = await extractIdFields(dataUrl);
        const updates: Partial<typeof formData> = {};
        if (result.name) updates.name = result.name;
        if (result.icNumber) updates.icNumber = result.icNumber.replace(/\s+/g, '');

        if (updates.name || updates.icNumber) {
          setFormData(prev => ({ ...prev, ...updates }));
          const partial = !(updates.name && updates.icNumber);
          setOcrStatus(partial ? 'partial' : 'success');
          setOcrMessage(partial ? 'Please verify details' : 'ID captured successfully');
        } else {
          setOcrStatus('error');
          setOcrMessage('Unable to read ID. Please enter details manually.');
        }
      } catch (err) {
        console.error(err);
        setOcrStatus('error');
        setOcrMessage('OCR failed. Please try again or enter manually.');
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'icPhoto' | 'supportingDocument') => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setFormData(prev => ({ ...prev, [field]: result }));
          if (field === 'icPhoto') {
            void runOcrAndFill(result);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ocrStatus === 'scanning') {
          setOcrMessage('Please wait for ID scan to finish.');
          return;
        }
        if (!validate()) return;
        
        setLoading(true);
        setTimeout(() => {
            try {
              const visitor = addVisitor({
                  ...formData,
                  name: formData.name.trim(),
                  visitDate: formData.startDate,
                  endDate: formData.endDate,
                  contact: formData.phone.trim(),
                  email: formData.email.trim(),
                  type: VisitorType.PREREGISTERED,
                  status: VisitorStatus.PENDING,
                  registeredBy: currentUser?.username || 'STAFF'
              });
              setLoading(false);
              setToast({ show: true, message: 'Invitation pending approval.' });
              setTimeout(() => {
                  navigate(`/staff/share/${visitor.id}?emailSent=true`);
              }, 800);
            } catch (err: any) {
              setLoading(false);
              setToast({ show: true, message: err.message });
            }
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
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400">
                        <UserIcon size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-widest">{currentUser.username}</p>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser.fullName}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setView('notifications')}
                        className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${view === 'notifications' ? 'text-blue-600 dark:text-blue-500 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <Bell size={20} />
                        {notifications.filter(n => n.recipient === currentUser.username && !n.read).length > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-slate-50 dark:border-[#050508] rounded-full animate-pulse"></span>
                        )}
                    </button>
                    <Button variant="ghost" className="!p-2 text-red-500/60 hover:text-red-500" onClick={() => setShowLogoutConfirm(true)}>
                        <LogOut size={20} />
                    </Button>
                </div>
            </div>

            <div className="flex border-b border-slate-200 dark:border-white/10 mb-6">
                <button onClick={() => setView('register')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${view === 'register' ? 'border-blue-500 text-blue-600 dark:text-white' : 'border-transparent text-slate-400 dark:text-white/40'}`}>Invite</button>
                <button onClick={() => setView('history')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${view === 'history' ? 'border-blue-500 text-blue-600 dark:text-white' : 'border-transparent text-slate-400 dark:text-white/40'}`}>History</button>
            </div>

            {view === 'register' ? (
                <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                    <GlassCard title="Identity Verification" className="!p-5 !pb-2">
                        <Input 
                            label="Full Name" 
                            required 
                            value={formData.name}
                            error={errors.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="John Doe"
                            icon={<UserIcon size={18} />}
                        />
                        <Input 
                            label="IC Number / ID" 
                            required 
                            value={formData.icNumber}
                            error={errors.icNumber}
                            onChange={e => setFormData({...formData, icNumber: e.target.value})}
                            placeholder="e.g. 900101-01-1234"
                            icon={<CreditCard size={18} />}
                        />

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-slate-500 dark:text-white/60 mb-2 ml-1 uppercase tracking-wider">
                              {['External TNB Staff', 'External Staff'].includes(formData.purpose) ? 'ID Snapshot (Required)' : 'IC / ID Photo'}
                            </label>
                            <div className="flex flex-col gap-3">
                                {formData.icPhoto ? (
                                    <div className="relative group rounded-2xl overflow-hidden aspect-video border border-slate-200 dark:border-white/10 bg-black/40">
                                        <img src={formData.icPhoto} alt="IC Preview" className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, icPhoto: '' }))}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex flex-col items-center justify-center gap-2 py-8 bg-slate-50 dark:bg-[#151520] hover:bg-slate-100 dark:hover:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 border-dashed rounded-2xl text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition-all"
                                        >
                                            <Camera size={24} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Snapshot</span>
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => { if(fileInputRef.current) { fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click(); } }}
                                            className="flex flex-col items-center justify-center gap-2 py-8 bg-slate-50 dark:bg-[#151520] hover:bg-slate-100 dark:hover:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 border-dashed rounded-2xl text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition-all"
                                        >
                                            <ImageIcon size={24} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Gallery</span>
                                        </button>
                                    </div>
                                )}
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment"
                                    className="hidden" 
                                    onChange={e => handleFileChange(e, 'icPhoto')}
                                />
                            </div>
                            {ocrStatus !== 'idle' && (
                              <p className={`mt-1 ml-1 text-[10px] font-semibold ${
                                ocrStatus === 'success' ? 'text-emerald-500' :
                                ocrStatus === 'partial' ? 'text-amber-500' :
                                ocrStatus === 'scanning' ? 'text-blue-500' : 'text-red-500'
                              }`}>
                                {ocrStatus === 'scanning' ? 'Scanning ID…' : ocrMessage}
                              </p>
                            )}
                            {errors.icPhoto && <p className="mt-1 ml-1 text-[10px] text-red-400 font-medium">{errors.icPhoto}</p>}
                        </div>
                    </GlassCard>

                    <GlassCard title="Contact Info" className="!p-5 !pb-2">
                        <Input 
                            label="Phone Number" 
                            required 
                            type="tel"
                            value={formData.phone}
                            error={errors.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            placeholder="+6012-3456789"
                            icon={<Phone size={18} />}
                        />
                        <Input 
                            label="Email Address" 
                            type="email"
                            value={formData.email}
                            error={errors.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="john@example.com (optional)"
                            icon={<Mail size={18} />}
                        />
                    </GlassCard>

                    <GlassCard title="Visit Details" className="!p-5 !pb-2">
                        <Select 
                            label="Purpose of Visit"
                            required
                            options={PURPOSE_OPTIONS}
                            value={formData.purpose}
                            error={errors.purpose}
                            onChange={e => setFormData({...formData, purpose: e.target.value})}
                        />

                        {['E-Hailing (Driver)', 'Food Services', 'Courier Services', 'Garbage Truck Services', 'Safeguard'].includes(formData.purpose) && (
                          <div className="animate-in slide-in-from-top-2">
                            <Input 
                              label="Designated Drop-off / Pickup Area"
                              required
                              value={formData.dropOffArea}
                              error={errors.dropOffArea}
                              onChange={e => setFormData({...formData, dropOffArea: e.target.value})}
                              placeholder="e.g. Block A Lobby"
                              icon={<MapPin size={18} />}
                            />
                          </div>
                        )}

                        {formData.purpose === 'Public' && (
                          <div className="animate-in slide-in-from-top-2">
                            <Select 
                              label="Specified Location"
                              required
                              options={SPECIFIED_LOCATIONS}
                              value={formData.specifiedLocation}
                              error={errors.specifiedLocation}
                              onChange={e => setFormData({...formData, specifiedLocation: e.target.value})}
                            />
                          </div>
                        )}

                        {['External TNB Staff', 'External Staff'].includes(formData.purpose) && (
                          <div className="animate-in slide-in-from-top-2 space-y-4">
                            <Input 
                              label="Staff Number"
                              required
                              value={formData.staffNumber}
                              error={errors.staffNumber}
                              onChange={e => setFormData({...formData, staffNumber: e.target.value})}
                              placeholder="TNB-12345"
                              icon={<Hash size={18} />}
                            />
                            <Input 
                              label="Location"
                              required
                              value={formData.location}
                              error={errors.location}
                              onChange={e => setFormData({...formData, location: e.target.value})}
                              placeholder="e.g. Server Room, Floor 5"
                              icon={<MapPin size={18} />}
                            />
                          </div>
                        )}

                        <div className="space-y-4 pt-2">
                            <Input 
                                label="Start Visit Date/Time" 
                                type="datetime-local"
                                required 
                                value={formData.startDate}
                                error={errors.startDate}
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                icon={<Calendar size={18} />}
                            />
                            <Input 
                                label="End Visit Date/Time" 
                                type="datetime-local"
                                required 
                                value={formData.endDate}
                                error={errors.endDate}
                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                                icon={<Calendar size={18} />}
                            />

                            {durationDays > 0 && (
                              <div className={`p-3 rounded-xl border flex items-center justify-between animate-in fade-in zoom-in ${isLongTerm ? 'bg-orange-100 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30' : 'bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'}`}>
                                <div className="flex items-center gap-2">
                                  <Clock size={16} className={isLongTerm ? 'text-orange-500 dark:text-orange-400' : 'text-blue-500 dark:text-blue-400'} />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/70">Visit Duration</span>
                                </div>
                                <span className={`text-xs font-bold ${isLongTerm ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                  {durationDays.toFixed(1)} Days
                                </span>
                              </div>
                            )}

                            {isLongTerm && (
                              <div className="animate-in slide-in-from-top-2 space-y-3">
                                <div className="p-3 bg-blue-100 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/30 rounded-xl flex gap-3">
                                  <AlertCircle className="text-blue-500 dark:text-blue-400 shrink-0" size={18} />
                                  <p className="text-[10px] leading-relaxed text-blue-700 dark:text-blue-200/70 font-medium">
                                    <span className="font-bold text-blue-900 dark:text-white block mb-0.5">Extended Stay Policy</span>
                                    Required for host/approver reference when visit duration exceeds 7 days.
                                  </p>
                                </div>
                                
                                <div className="relative">
                                  <label className="block text-xs font-medium text-slate-500 dark:text-white/60 mb-2 ml-1 uppercase tracking-wider">Supporting Document (Required)</label>
                                  <button 
                                    type="button"
                                    onClick={() => docInputRef.current?.click()}
                                    className={`w-full py-4 px-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-3 ${formData.supportingDocument ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                  >
                                    {formData.supportingDocument ? <><Check size={18} /> Document Attached</> : <><FileUp size={18} /> Upload PDF / Image</>}
                                  </button>
                                  <input 
                                    ref={docInputRef}
                                    type="file" 
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    // FIXED: Pass the required second argument to handleFileChange
                                    onChange={e => handleFileChange(e, 'supportingDocument')}
                                  />
                                  {errors.supportingDocument && <p className="mt-1 ml-1 text-[10px] text-red-500 dark:text-red-400 font-medium">{errors.supportingDocument}</p>}
                                </div>
                              </div>
                            )}
                        </div>
                    </GlassCard>

                    <GlassCard title="Transportation" className="!p-5">
                        <div className="bg-slate-100 dark:bg-[#121217] p-1 rounded-xl flex mb-4">
                            <button
                                type="button"
                                className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.transportMode === TransportMode.CAR ? 'bg-white dark:bg-[#252530] text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60'}`}
                                onClick={() => setFormData({...formData, transportMode: TransportMode.CAR})}
                            >
                                <Car size={16} /> Car
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${formData.transportMode === TransportMode.NON_CAR ? 'bg-white dark:bg-[#252530] text-slate-900 dark:text-white shadow-lg' : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60'}`}
                                onClick={() => setFormData({...formData, transportMode: TransportMode.NON_CAR})}
                            >
                                <div className="flex items-center gap-1">
                                    <UserIcon size={16} />
                                    <span className="opacity-40">/</span>
                                    <Bike size={16} />
                                </div>
                                <span>Walk-in / Bike</span>
                            </button>
                        </div>

                        {formData.transportMode === TransportMode.CAR && (
                            <Input 
                                label="License Plate" 
                                required 
                                value={formData.licensePlate}
                                error={errors.licensePlate}
                                onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})}
                                placeholder="ABC-1234"
                                icon={<FileText size={18} />}
                                className="uppercase font-mono"
                            />
                        )}
                    </GlassCard>

                    <Button type="submit" loading={loading} className="mt-2 flex items-center justify-center gap-2 group shadow-blue-500/20 shadow-xl">
                        Generate Invite <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </div>
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
                            <UserCheck size={40} className="mx-auto mb-2 text-slate-400 dark:text-white/40" />
                            <p className="text-slate-500 dark:text-white/40">No history yet.</p>
                        </div>
                    ) : (
                        staffHistory.map(v => (
                            <div key={v.id} onClick={() => navigate(`/staff/share/${v.id}`)} className="bg-white dark:bg-[#151520] border border-slate-200 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1E1E2E] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                        <UserIcon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-slate-900 dark:text-white font-bold">{v.name}</h3>
                                        <p className="text-slate-500 dark:text-white/40 text-[10px]">{v.purpose}</p>
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
                        <div className="text-center py-12 text-slate-400 dark:text-white/20">
                            <Bell size={40} className="mx-auto mb-2 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">No notifications</p>
                        </div>
                    ) : (
                        notifications.filter(n => n.recipient === currentUser.username).map(n => (
                            <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.read ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60' : 'bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20'}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.status === VisitorStatus.APPROVED ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-700 dark:text-white/90 leading-relaxed">{n.message}</p>
                                        <p className="text-[9px] text-slate-400 dark:text-white/30 mt-2 font-bold uppercase tracking-widest">
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

// NEW: StaffSharePass Component added to fix missing export error in App.tsx
export const StaffSharePass = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { getVisitorByCode } = useStore();
    const emailSent = searchParams.get('emailSent') === 'true';

    const visitor = getVisitorByCode(id || '');

    if (!visitor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Visitor Not Found</h2>
                <p className="text-slate-500 dark:text-white/50 text-sm mb-6">The requested invitation record does not exist.</p>
                <Button onClick={() => navigate('/staff/dashboard')}>Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto pt-6 px-4 pb-24">
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => navigate('/staff/dashboard')} className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xs font-bold tracking-widest text-slate-400 dark:text-white/50 uppercase">Invite Generated</h2>
                <div className="w-10"></div>
            </div>

            {emailSent && (
                <div className="mb-6 p-4 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in zoom-in">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Confirmation email has been sent to the guest.</p>
                </div>
            )}

            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-500 mx-auto mb-4 border border-blue-200 dark:border-blue-500/20">
                    <Share2 size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Share Access Pass</h1>
                <p className="text-slate-500 dark:text-white/50 text-sm">Send this digital pass to your guest for building access.</p>
            </div>

            <GlassCard className="!p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 p-1 border border-slate-200 dark:border-white/10">
                        <img 
                            src={visitor.icPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${visitor.name}`} 
                            alt="" 
                            className="w-full h-full object-cover rounded-xl bg-slate-100 dark:bg-white/5" 
                        />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{visitor.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-white/40">{visitor.purpose}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                        <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-widest mb-1">Pass ID</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{visitor.id}</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                        <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-widest mb-1">Validity</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {new Date(visitor.visitDate).toLocaleDateString()} - {visitor.endDate ? new Date(visitor.endDate).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/5 space-y-3">
                    <Button className="w-full" onClick={() => {
                        const url = `${window.location.origin}/#/visitor/wallet/${visitor.id}`;
                        navigator.clipboard.writeText(url);
                        alert("Digital pass link copied to clipboard!");
                    }}>
                        <Copy size={18} /> Copy Digital Link
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="secondary" className="w-full">
                            <Mail size={16} /> Email
                        </Button>
                        <Button variant="secondary" className="w-full">
                            <Share2 size={16} /> Share
                        </Button>
                    </div>
                </div>
            </GlassCard>

            <Button variant="ghost" className="w-full" onClick={() => navigate('/staff/dashboard')}>
                Return to Dashboard
            </Button>
        </div>
    );
};


import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, Select, StatusBadge, Toast, LoadingOverlay, HistoryItemSkeleton, ConfirmModal } from '../components/GlassComponents';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { VisitorType, TransportMode, VisitorStatus, Visitor, UserRole, Notification, QRType } from '../types';
import { User as UserIcon, Car, Check, Lock, ChevronRight, Mail, Share2, Download, LogOut, ArrowLeft, Calendar, FileText, Phone, Briefcase, UserCheck, Shield, Clock, AlertCircle, Eye, EyeOff, CheckCircle2, Bell, MapPin, Hash, FileUp, Camera, Image as ImageIcon, Bike, X, CreditCard, Copy, ShieldCheck, RefreshCw } from 'lucide-react';

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'icPhoto' | 'supportingDocument') => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, [field]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
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
                <button onClick={() => setView('register')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${view === 'register' ? 'border-blue-500 text-white' : 'border-transparent text-white/40'}`}>Invite</button>
                <button onClick={() => setView('history')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${view === 'history' ? 'border-blue-500 text-white' : 'border-transparent text-white/40'}`}>History</button>
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
                            <label className="block text-xs font-medium text-white/60 mb-2 ml-1 uppercase tracking-wider">
                              {['External TNB Staff', 'External Staff'].includes(formData.purpose) ? 'ID Snapshot (Required)' : 'IC / ID Photo'}
                            </label>
                            <div className="flex flex-col gap-3">
                                {formData.icPhoto ? (
                                    <div className="relative group rounded-2xl overflow-hidden aspect-video border border-white/10 bg-black/40">
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
                                            className="flex flex-col items-center justify-center gap-2 py-8 bg-[#151520] hover:bg-[#1E1E2E] border border-white/5 border-dashed rounded-2xl text-white/40 hover:text-white transition-all"
                                        >
                                            <Camera size={24} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Snapshot</span>
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => { if(fileInputRef.current) { fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click(); } }}
                                            className="flex flex-col items-center justify-center gap-2 py-8 bg-[#151520] hover:bg-[#1E1E2E] border border-white/5 border-dashed rounded-2xl text-white/40 hover:text-white transition-all"
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
                              <div className={`p-3 rounded-xl border flex items-center justify-between animate-in fade-in zoom-in ${isLongTerm ? 'bg-orange-500/10 border-orange-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
                                <div className="flex items-center gap-2">
                                  <Clock size={16} className={isLongTerm ? 'text-orange-400' : 'text-blue-400'} />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Visit Duration</span>
                                </div>
                                <span className={`text-xs font-bold ${isLongTerm ? 'text-orange-400' : 'text-blue-400'}`}>
                                  {durationDays.toFixed(1)} Days
                                </span>
                              </div>
                            )}

                            {isLongTerm && (
                              <div className="animate-in slide-in-from-top-2 space-y-3">
                                <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-xl flex gap-3">
                                  <AlertCircle className="text-blue-400 shrink-0" size={18} />
                                  <p className="text-[10px] leading-relaxed text-blue-200/70 font-medium">
                                    <span className="font-bold text-white block mb-0.5">Extended Stay Policy</span>
                                    Required for host/approver reference when visit duration exceeds 7 days.
                                  </p>
                                </div>
                                
                                <div className="relative">
                                  <label className="block text-xs font-medium text-white/60 mb-2 ml-1 uppercase tracking-wider">Supporting Document (Required)</label>
                                  <button 
                                    type="button"
                                    onClick={() => docInputRef.current?.click()}
                                    className={`w-full py-4 px-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-3 ${formData.supportingDocument ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                                  >
                                    {formData.supportingDocument ? <><Check size={18} /> Document Attached</> : <><FileUp size={18} /> Upload PDF / Image</>}
                                  </button>
                                  <input 
                                    ref={docInputRef}
                                    type="file" 
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={e => handleFileChange(e, 'supportingDocument')}
                                  />
                                  {errors.supportingDocument && <p className="mt-1 ml-1 text-[10px] text-red-400 font-medium">{errors.supportingDocument}</p>}
                                </div>
                              </div>
                            )}
                        </div>
                    </GlassCard>

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
                            <UserCheck size={40} className="mx-auto mb-2" />
                            <p>No history yet.</p>
                        </div>
                    ) : (
                        staffHistory.map(v => (
                            <div key={v.id} onClick={() => navigate(`/staff/share/${v.id}`)} className="bg-[#151520] border border-white/5 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-[#1E1E2E] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
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
    const [copied, setCopied] = useState(false);
    
    useEffect(() => {
        if (!currentUser) navigate('/staff/login');
        if (searchParams.get('emailSent') === 'true') {
            setToast({ show: true, message: 'Invitation record created!' });
        }
    }, [currentUser, navigate, searchParams]);

    const visitor = getVisitorByCode(id || '');

    if (!visitor) return (
      <div className="flex flex-col items-center justify-center h-screen text-white p-4">
          <p>Visitor record not found.</p>
          <Button onClick={() => navigate('/staff/dashboard')} className="mt-4">Back to Dashboard</Button>
      </div>
    );

    const handleCopyCode = () => {
        navigator.clipboard.writeText(visitor.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        setIsSharing(true);
        const shareUrl = `${window.location.origin}/#/visitor/wallet/${visitor.id}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Visitor Pass: ${visitor.name}`,
                    text: `Hello ${visitor.name}, here is your access code: ${visitor.id}`,
                    url: shareUrl
                });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    handleCopyCode();
                    setToast({ show: true, message: 'Link copied to clipboard!' });
                }
            }
        } else {
            handleCopyCode();
            setToast({ show: true, message: 'Link copied to clipboard!' });
        }
        setIsSharing(false);
    };

    const handleDownload = async () => {
        setIsSaving(true);
        const svg = document.getElementById('qr-code-svg');
        if (!svg) {
            setIsSaving(false);
            return;
        }
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svg);
        if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        if(!ctx) {
            setIsSaving(false);
            return;
        }
        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 25, 25, 450, 450);
            const a = document.createElement('a');
            a.download = `invite-${visitor.name}-${visitor.id}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
            setIsSaving(false);
            setToast({ show: true, message: 'Pass saved to gallery!' });
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    };

    return (
        <div className="max-w-md mx-auto pt-6 px-4 pb-24">
            <Toast show={toast.show} message={toast.message} onHide={() => setToast({ ...toast, show: false })} />

            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate('/staff/dashboard')} className="w-10 h-10 rounded-full bg-[#1E1E2E] border border-white/5 flex items-center justify-center text-white/70 hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-white font-bold">Review Invitation</h2>
                <div className="w-10"></div>
            </div>
            
            <GlassCard className="text-center relative !p-0 overflow-hidden pb-6 mb-4">
                <div className="bg-[#252530] p-6 border-b border-white/5">
                    <div className="flex justify-center mb-4">
                        <StatusBadge status={visitor.status} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{visitor.name}</h2>
                    <p className="text-white/50 text-sm flex items-center justify-center gap-2">
                        Guest Invite • <span className="flex items-center gap-1">{visitor.transportMode === TransportMode.CAR ? <Car size={14}/> : <div className="flex items-center gap-0.5"><UserIcon size={14}/><Bike size={14}/></div>} {visitor.transportMode === TransportMode.CAR ? 'Car' : 'Walk-in / Bike'}</span>
                    </p>
                </div>
                
                <div className="p-6">
                    {/* Unique Code Display */}
                    <div className="bg-[#121217] rounded-2xl p-4 mb-6 relative group cursor-pointer" onClick={handleCopyCode}>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-bold">Unique Access Code</p>
                        <p className="text-4xl font-mono font-bold text-white tracking-[0.2em] group-hover:text-blue-400 transition-colors">{visitor.id}</p>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-white/50 transition-colors">
                            {copied ? <Check size={20} className="text-green-500"/> : <Copy size={20}/>}
                        </div>
                    </div>

                    <div className="animate-in zoom-in duration-500">
                        {visitor.qrType !== QRType.NONE ? (
                            <>
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
                                        onClick={handleDownload}
                                        loading={isSaving}
                                    >
                                        <Download size={14}/> Save to Gallery
                                    </Button>
                                    <Button 
                                        variant="primary" 
                                        className="text-xs py-3 flex items-center justify-center gap-2"
                                        onClick={handleShare}
                                        loading={isSharing}
                                    >
                                        <Share2 size={14}/> Share Pass
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 bg-blue-500/10 rounded-3xl border border-blue-500/20 mb-6">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto mb-4">
                                    <ShieldCheck size={32} />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">LPR Activated</h3>
                                <p className="text-blue-200/60 text-sm mb-4">
                                    Guest vehicle entry via LPR. No QR required for this invite.
                                </p>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-blue-400 font-bold tracking-widest text-xl uppercase">
                                    {visitor.licensePlate}
                                </div>
                                <p className="text-[10px] text-white/20 uppercase tracking-widest mt-4 font-bold">Gate Access Only</p>
                            </div>
                        )}

                        {visitor.status === VisitorStatus.PENDING && (
                            <p className="text-xs text-yellow-500/80 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20 mb-4">
                                <RefreshCw size={12} className="inline mr-1 animate-spin"/> Awaiting admin approval before activation.
                            </p>
                        )}
                    </div>
                </div>
            </GlassCard>

            {visitor.transportMode === TransportMode.CAR && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
                        <Car size={20} />
                    </div>
                    <div>
                        <p className="text-yellow-200 font-bold text-sm">LPR Enabled</p>
                        <p className="text-yellow-200/60 text-xs mt-0.5">
                            Guest gate opens for <span className="font-mono text-white/90 bg-white/10 px-1 rounded">{visitor.licensePlate}</span>
                        </p>
                    </div>
                </div>
            )}

            <div className="p-6 bg-[#121217] rounded-3xl border border-white/5 animate-in slide-in-from-bottom-2 duration-700">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Staff Summary</h3>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                        <p className="text-xs text-white/60 leading-relaxed">Share the access link or the QR image with your guest.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                        <p className="text-xs text-white/60 leading-relaxed">The guest's visit is valid from <span className="text-white font-bold">{new Date(visitor.visitDate).toLocaleDateString()}</span>.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                        <p className="text-xs text-white/60 leading-relaxed">You will receive a notification once the admin approves this guest.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

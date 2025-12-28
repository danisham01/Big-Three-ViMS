
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, Select, StatusBadge, LoadingOverlay, Toast } from '../components/GlassComponents';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { VisitorType, TransportMode, VisitorStatus, QRType, UserRole } from '../types';
import { User, Car, Check, AlertCircle, RefreshCw, Share2, Download, Copy, Building2, ChevronRight, ArrowLeft, HelpCircle, Phone, FileText, Briefcase, Calendar, Clock, X, Search, ShieldCheck, Mail, Camera, Image as ImageIcon, CreditCard, Bike, MapPin, Hash, FileUp, Upload, Ban } from 'lucide-react';
import { StaffDashboard } from './StaffPages';
import { OperatorDashboard } from './OperatorPages';

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

export const VisitorLanding = () => {
  const navigate = useNavigate();
  const { currentUser } = useStore();

  // If user is logged in, show their specific "Tools" dashboard as the home page
  if (currentUser) {
    if (currentUser.role === UserRole.STAFF) {
      return <StaffDashboard />;
    }
    if (currentUser.role === UserRole.ADMIN) {
      return <OperatorDashboard />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen pt-12 px-6 max-w-md mx-auto relative">
      <div className="flex flex-col items-center justify-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-20 h-20 bg-[#1E1E2E] rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl mb-6">
            <Building2 className="text-blue-500" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Welcome to ViMS</h1>
        <p className="text-white/40 text-center text-sm font-medium">(Visitor management system)</p>
        <p className="text-white/60 text-center text-sm mt-4 max-w-[200px]">Please select your sign-in method to get started.</p>
      </div>

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

      <div className="text-center mb-auto">
        <p className="text-white/40 text-sm">
            Are you a staff? <Link to="/staff/login" className="text-blue-500 font-bold hover:underline">Login as Staff</Link>
        </p>
      </div>

    </div>
  );
};

export const VisitorForm = ({ type }: { type: VisitorType }) => {
  const navigate = useNavigate();
  const { addVisitor, checkBlacklist } = useStore();
  const [loading, setLoading] = useState(false);
  const [blacklistError, setBlacklistError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    icNumber: '',
    icPhoto: '',
    purpose: '',
    dropOffArea: '',
    specifiedLocation: '',
    staffNumber: '',
    location: '',
    visitDate: '', // Used as Start Date Time
    endDate: '',   // Used as End Date Time
    supportingDocument: '',
    transportMode: TransportMode.NON_CAR,
    licensePlate: ''
  });

  // Default values for dates
  useState(() => {
    const now = new Date();
    const startStr = now.toISOString().slice(0, 16);
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Default +2 hours
    const endStr = end.toISOString().slice(0, 16);
    setFormData(prev => ({ ...prev, visitDate: startStr, endDate: endStr }));
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const durationDays = useMemo(() => {
    if (!formData.visitDate || !formData.endDate) return 0;
    const start = new Date(formData.visitDate).getTime();
    const end = new Date(formData.endDate).getTime();
    if (isNaN(start) || isNaN(end)) return 0;
    const diff = end - start;
    return diff / (1000 * 60 * 60 * 24);
  }, [formData.visitDate, formData.endDate]);

  const isLongTerm = durationDays > 7;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) newErrors.name = 'Full name is required';
    
    const phoneTrimmed = formData.phone.trim();
    if (!phoneTrimmed) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{7,15}$/.test(phoneTrimmed)) {
      newErrors.phone = 'Enter a valid phone number';
    }

    if (!formData.icNumber.trim()) newErrors.icNumber = 'IC Number is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose of visit is required';

    // Date Validations
    if (!formData.visitDate) newErrors.visitDate = 'Start date/time is required';
    if (!formData.endDate) newErrors.endDate = 'End date/time is required';
    
    if (formData.visitDate && formData.endDate) {
      const start = new Date(formData.visitDate).getTime();
      const end = new Date(formData.endDate).getTime();
      if (end <= start) {
        newErrors.endDate = 'End time must be after start time';
      }
    }

    // Long term validation
    if (isLongTerm && !formData.supportingDocument) {
      newErrors.supportingDocument = 'Attachment required for visits over 7 days';
    }

    // Conditional Validations based on Purpose
    const p = formData.purpose;
    if (['E-Hailing (Driver)', 'Food Services', 'Courier Services', 'Garbage Truck Services', 'Safeguard'].includes(p)) {
      if (!formData.dropOffArea.trim()) newErrors.dropOffArea = 'Designated area is required';
    }
    if (p === 'Public') {
      if (!formData.specifiedLocation) newErrors.specifiedLocation = 'Please select a location';
    }
    if (['External TNB Staff', 'External Staff'].includes(p)) {
      if (!formData.staffNumber.trim()) newErrors.staffNumber = 'Staff number is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
      if (!formData.icPhoto) newErrors.icPhoto = 'ID Snapshot is required';
    }

    if (formData.transportMode === TransportMode.CAR) {
      if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
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
    setBlacklistError(null);
    if (!validate()) return;
    
    setLoading(true);
    setTimeout(() => {
      try {
        const visitor = addVisitor({
          ...formData,
          contact: formData.phone,
          type,
        });
        setLoading(false);
        navigate(`/visitor/wallet/${visitor.id}`);
      } catch (err: any) {
        setLoading(false);
        setBlacklistError(err.message);
      }
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto pt-6 px-4 pb-20">
      {loading && <LoadingOverlay message="Creating your digital pass..." />}
      
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/visitor')} className="w-10 h-10 rounded-full bg-[#1E1E2E] border border-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
        </button>
        <h2 className="text-xs font-bold tracking-widest text-white/50 uppercase">Visitor Access</h2>
        <button className="w-10 h-10 rounded-full bg-[#1E1E2E] border border-white/5 flex items-center justify-center text-white/70 hover:text-white">
            <HelpCircle size={20} />
        </button>
      </div>

      <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Registration</h1>
          <p className="text-white/50 text-sm">Complete your details for building access.</p>
      </div>

      {blacklistError && (
        <div className="mb-6 p-6 bg-red-600/10 border-2 border-red-500/30 rounded-3xl animate-in zoom-in text-center">
          <Ban size={48} className="text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-red-200/70 text-sm font-medium leading-relaxed">{blacklistError}</p>
          <p className="text-[10px] text-white/30 mt-4 uppercase tracking-[0.2em] font-black">Ref: BLACKLIST_ENTRY_ATTEMPT</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <GlassCard title="Identity Verification" className="!p-5 !pb-2">
            <Input 
                label="Full Name" 
                required 
                value={formData.name}
                error={errors.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                icon={<User size={18} />}
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

            {/* Conditional Fields based on Purpose */}
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

            {/* Visit Range */}
            <div className="space-y-4 pt-2">
                <Input 
                    label="Start Visit Date/Time" 
                    type="datetime-local"
                    required 
                    value={formData.visitDate}
                    error={errors.visitDate}
                    onChange={e => setFormData({...formData, visitDate: e.target.value})}
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
                        <User size={16} />
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

        <div className="mt-2 flex items-center justify-between gap-4">
            <button type="button" onClick={() => navigate('/visitor')} className="text-white/50 text-sm font-bold px-4 py-2 hover:text-white transition-colors">
                Cancel
            </button>
            <Button type="submit" loading={loading} className="flex-1 shadow-blue-500/20 shadow-xl">
                Register <ChevronRight size={18} />
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
        const trimmedCode = code.trim();
        if (trimmedCode.length < 5) {
            setError('Please enter all 5 digits');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            const visitor = getVisitorByCode(trimmedCode);
            setLoading(false);
            if (visitor) {
                navigate(`/visitor/wallet/${visitor.id}`);
            } else {
                setError('Invalid code. Record not found.');
            }
        }, 800);
    };

    return (
        <div className="max-w-md mx-auto pt-20 px-6">
            {loading && <LoadingOverlay message="Searching database..." />}
            
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
                <Button type="submit" loading={loading} disabled={code.length < 5} className="w-full mt-4 h-14 text-lg">
                    Find Appointment
                </Button>
            </form>
        </div>
    );
};

export const VisitorWallet = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getVisitorByCode, updateVisitor } = useStore();
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    
    const visitor = getVisitorByCode(id || '');

    const [rescheduleData, setRescheduleData] = useState({
        date: visitor?.visitDate ? visitor.visitDate.slice(0, 10) : '',
        time: visitor?.visitDate ? visitor.visitDate.slice(11, 16) : '09:00'
    });

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
            a.download = `pass-${visitor.id}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
            setIsSaving(false);
            setToast({ show: true, message: 'Pass saved to gallery!' });
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    };

    const handleShare = async () => {
        setIsSharing(true);
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
            setToast({ show: true, message: 'Code copied to clipboard!' });
        }
        setIsSharing(false);
    };

    const handleSaveReschedule = async () => {
        setSaveLoading(true);
        await new Promise(r => setTimeout(r, 1200));
        updateVisitor(visitor.id, { 
            visitDate: `${rescheduleData.date}T${rescheduleData.time}:00.000Z`
        });
        setSaveLoading(false);
        setIsRescheduling(false);
        setToast({ show: true, message: 'Visit rescheduled successfully!' });
    };

    const getDurationWarning = () => {
      const p = visitor.purpose;
      if (['E-Hailing (Driver)', 'Food Services', 'Courier Services'].includes(p)) {
        return "This visit must be completed within 45 minutes.";
      }
      if (['Garbage Truck Services', 'Safeguard'].includes(p)) {
        return "This visit must be completed within 2 hours.";
      }
      return null;
    };

    const durationWarning = getDurationWarning();

    return (
        <div className="max-w-md mx-auto pt-6 px-4 pb-24">
             <Toast show={toast.show} message={toast.message} onHide={() => setToast({ ...toast, show: false })} />
             <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate('/visitor')} className="w-10 h-10 rounded-full bg-[#1E1E2E] border border-white/5 flex items-center justify-center text-white/70 hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-white font-bold">Access Pass</h2>
                <div className="w-10"></div>
            </div>
            
            <GlassCard className="text-center relative !p-0 overflow-hidden pb-6 mb-4">
                <div className="bg-[#252530] p-6 border-b border-white/5">
                    <div className="flex justify-center mb-4">
                        <StatusBadge status={visitor.status} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{visitor.name}</h2>
                    <p className="text-white/50 text-sm flex items-center justify-center gap-2">
                        {visitor.type === VisitorType.ADHOC ? 'Ad-hoc' : 'Guest'} • <span className="flex items-center gap-1">{visitor.transportMode === TransportMode.CAR ? <Car size={14}/> : <div className="flex items-center gap-0.5"><User size={14}/><Bike size={14}/></div>} {visitor.transportMode === TransportMode.CAR ? 'Car' : 'Walk-in / Bike'}</span>
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

                    {visitor.status !== VisitorStatus.REJECTED ? (
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
                                            onClick={handleDownloadQR}
                                            loading={isSaving}
                                        >
                                            <Download size={14}/> Save to Gallery
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            className="text-xs py-3 flex items-center justify-center gap-2 bg-[#252530] hover:bg-[#303040]"
                                            onClick={handleShare}
                                            loading={isSharing}
                                        >
                                            <Share2 size={14}/> Share Pass
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="p-8 bg-blue-500/10 rounded-3xl border border-blue-500/20 mb-6 animate-pulse">
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto mb-4">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2">LPR Activated</h3>
                                    <p className="text-blue-200/60 text-sm mb-4">
                                        Vehicle entry via License Plate Recognition. No QR code required for this pass.
                                    </p>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 font-mono text-blue-400 font-bold tracking-widest text-xl uppercase">
                                        {visitor.licensePlate}
                                    </div>
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest mt-4 font-bold">Gate Access Only</p>
                                </div>
                            )}

                            {visitor.status === VisitorStatus.PENDING && (
                                <p className="text-xs text-yellow-500/80 bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
                                    <RefreshCw size={12} className="inline mr-1 animate-spin"/> Awaiting approval. Pass will activate automatically.
                                </p>
                            )}

                            {/* Duration Warning for Approved Visitors */}
                            {visitor.status === VisitorStatus.APPROVED && durationWarning && (
                              <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <Clock size={20} className="text-emerald-400 shrink-0" />
                                <p className="text-emerald-200 text-xs font-bold text-left">{durationWarning}</p>
                              </div>
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

            {/* Rescheduling Options for Pre-registered Users */}
            {visitor.type === VisitorType.PREREGISTERED && visitor.status !== VisitorStatus.REJECTED && (
                <GlassCard className="!p-5 border-blue-500/20">
                    {!isRescheduling ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Visit Range</p>
                                    <p className="text-xs font-bold text-white">{new Date(visitor.visitDate).toLocaleString()}</p>
                                    {visitor.endDate && <p className="text-[10px] text-white/30 mt-1">to {new Date(visitor.endDate).toLocaleString()}</p>}
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                className="!py-2 !px-4 text-xs"
                                onClick={() => setIsRescheduling(true)}
                            >
                                Reschedule
                            </Button>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Clock size={16} className="text-blue-400"/> Modify Visit Schedule
                            </h3>
                            <div className="grid grid-cols-1 gap-3 mb-4">
                                <Input 
                                    type="datetime-local" 
                                    label="New Start Time" 
                                    value={rescheduleData.date + 'T' + rescheduleData.time}
                                    onChange={(e) => {
                                      const parts = e.target.value.split('T');
                                      setRescheduleData({...rescheduleData, date: parts[0], time: parts[1]});
                                    }}
                                    className="!mb-0 !py-3 !px-4 !text-xs"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button 
                                    variant="ghost" 
                                    className="flex-1 !py-3 text-xs" 
                                    onClick={() => setIsRescheduling(false)}
                                    disabled={saveLoading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="primary" 
                                    className="flex-[2] !py-3 text-xs"
                                    onClick={handleSaveReschedule}
                                    loading={saveLoading}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    )}
                </GlassCard>
            )}
            
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

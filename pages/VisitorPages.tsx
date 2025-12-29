
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, Select, StatusBadge, LoadingOverlay, Toast } from '../components/GlassComponents';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { Logo } from '../components/Logo';
import { VisitorType, TransportMode, VisitorStatus, QRType, UserRole } from '../types';
import { User, Car, Check, AlertCircle, RefreshCw, Share2, Download, Copy, Building2, ChevronRight, ArrowLeft, HelpCircle, Phone, FileText, Briefcase, Calendar, Clock, X, Search, ShieldCheck, Mail, Camera, Image as ImageIcon, CreditCard, Bike, MapPin, Hash, FileUp, Upload, Ban, Scan, RotateCcw } from 'lucide-react';
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

// Custom Camera Modal Component
const CameraModal = ({ onCapture, onClose }: { onCapture: (dataUrl: string) => void, onClose: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setLoading(true);
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setLoading(false);
    } catch (err) {
      setError('Unable to access camera. Please ensure you have granted camera permissions.');
      setLoading(false);
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#1E1E2E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Camera size={18} /> Take Photo
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-red-400">
              <AlertCircle size={40} className="mx-auto mb-2" />
              <p className="text-sm">{error}</p>
              <button onClick={startCamera} className="mt-4 text-xs font-bold bg-white/10 px-4 py-2 rounded-xl text-white">Retry</button>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {loading && <div className="absolute inset-0 flex items-center justify-center"><RefreshCw className="animate-spin text-white/50" size={32} /></div>}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t border-white/5 bg-white/5">
          {capturedImage ? (
            <div className="flex gap-4">
              <button onClick={retake} className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Retake
              </button>
              <button onClick={confirm} className="flex-1 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-lg flex items-center justify-center gap-2">
                <Check size={16} /> Use Photo
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button 
                onClick={capture} 
                disabled={loading || !!error}
                className="w-16 h-16 rounded-full border-4 border-white/30 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-full h-full bg-white rounded-full"></div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
        <Logo size="xl" className="mb-6" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center">Welcome to ViMS</h1>
        <p className="text-slate-500 dark:text-white/40 text-center text-sm font-medium">(Visitor management system)</p>
        <p className="text-slate-600 dark:text-white/60 text-center text-sm mt-4 max-w-[200px]">Please select your sign-in method to get started.</p>
      </div>

      <div className="flex flex-col gap-4 mb-4">
          <div onClick={() => navigate('/visitor/adhoc')} className="group cursor-pointer">
            <div className="bg-white dark:bg-[#151520] hover:bg-slate-50 dark:hover:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 flex items-center justify-between transition-all duration-300 shadow-lg group-hover:shadow-blue-900/10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-blue-600 shadow-lg shadow-blue-600/30 flex items-center justify-center shrink-0">
                        <User className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Visitor</h3>
                        <p className="text-slate-500 dark:text-white/40 text-xs mt-1">I don't have an appointment</p>
                    </div>
                </div>
                <ChevronRight className="text-slate-300 dark:text-white/20 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </div>
          </div>

          <div onClick={() => navigate('/visitor/prereg')} className="group cursor-pointer">
            <div className="bg-white dark:bg-[#151520] hover:bg-slate-50 dark:hover:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 rounded-[2rem] p-5 flex items-center justify-between transition-all duration-300 shadow-lg group-hover:shadow-emerald-900/10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center shrink-0">
                        <Check className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Request an Appointment</h3>
                        <p className="text-slate-500 dark:text-white/40 text-xs mt-1">Pre-register</p>
                    </div>
                </div>
                <ChevronRight className="text-slate-300 dark:text-white/20 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </div>
          </div>
      </div>

      <div className="text-center mb-auto">
        <p className="text-slate-500 dark:text-white/40 text-sm">
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
  
  // Specific refs for inputs
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  
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

  // Constraints for Today
  const todayRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return {
      startStr: start.toISOString().slice(0, 16),
      endStr: end.toISOString().slice(0, 16),
      displayDate: now.toLocaleDateString(undefined, { dateStyle: 'full' })
    };
  }, []);

  // Initialize dates
  useEffect(() => {
    if (type === VisitorType.ADHOC) {
      // For Ad-hoc: Force whole day today
      setFormData(prev => ({ 
        ...prev, 
        visitDate: todayRange.startStr, 
        endDate: todayRange.endStr 
      }));
    } else {
      // For Pre-registered: Default to current hour +2 hours
      const now = new Date();
      const startStr = now.toISOString().slice(0, 16);
      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const endStr = end.toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, visitDate: startStr, endDate: endStr }));
    }
  }, [type, todayRange]);

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
    if (!formData.icPhoto) newErrors.icPhoto = 'IC/ID photo is required';
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
      {showCamera && (
        <CameraModal 
          onCapture={(img) => setFormData(prev => ({ ...prev, icPhoto: img }))} 
          onClose={() => setShowCamera(false)} 
        />
      )}
      
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/visitor')} className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
        </button>
        <h2 className="text-xs font-bold tracking-widest text-slate-400 dark:text-white/50 uppercase">Visitor Access</h2>
        <button className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white">
            <HelpCircle size={20} />
        </button>
      </div>

      <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Registration</h1>
          <p className="text-slate-500 dark:text-white/50 text-sm">Complete your details for building access.</p>
      </div>

      {blacklistError && (
        <div className="mb-6 p-6 bg-red-100 dark:bg-red-600/10 border-2 border-red-200 dark:border-red-500/30 rounded-3xl animate-in zoom-in text-center">
          <Ban size={48} className="text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h3>
          <p className="text-red-600 dark:text-red-200/70 text-sm font-medium leading-relaxed">{blacklistError}</p>
          <p className="text-[10px] text-slate-400 dark:text-white/30 mt-4 uppercase tracking-[0.2em] font-black">Ref: BLACKLIST_ENTRY_ATTEMPT</p>
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
                                onClick={() => setShowCamera(true)}
                                className="flex flex-col items-center justify-center gap-2 py-8 bg-slate-50 dark:bg-[#151520] hover:bg-slate-100 dark:hover:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 border-dashed rounded-2xl text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition-all"
                            >
                                <Camera size={24} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Snapshot</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => galleryInputRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-2 py-8 bg-slate-50 dark:bg-[#151520] hover:bg-slate-100 dark:hover:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 border-dashed rounded-2xl text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white transition-all"
                            >
                                <ImageIcon size={24} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Gallery</span>
                            </button>
                        </div>
                    )}
                    <input 
                        ref={galleryInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={e => handleFileChange(e, 'icPhoto')}
                    />
                </div>
                {errors.icPhoto && <p className="mt-1 ml-1 text-[10px] text-red-400 font-medium animate-in fade-in slide-in-from-top-1">{errors.icPhoto}</p>}
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

            {/* Visit Range Selection */}
            <div className="space-y-4 pt-2">
                {type === VisitorType.ADHOC ? (
                  /* Ad-hoc: Read-only Fixed whole day today */
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/5 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 mb-1">
                      <Calendar size={18} className="text-blue-500" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/70">Visit Duration</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white ml-8">
                      {todayRange.displayDate}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <Clock size={18} className="text-emerald-500" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/70">Access Window</p>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-8 uppercase">
                      All Day Access (00:00 - 23:59)
                    </p>
                  </div>
                ) : (
                  /* Pre-registered: Allow date/time selection */
                  <>
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
                      <div className={`p-3 rounded-xl border flex items-center justify-between animate-in fade-in zoom-in ${isLongTerm ? 'bg-orange-500/10 border-orange-500/30' : 'bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'}`}>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className={isLongTerm ? 'text-orange-500 dark:text-orange-400' : 'text-blue-500 dark:text-blue-400'} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/70">Visit Duration</span>
                        </div>
                        <span className={`text-xs font-bold ${isLongTerm ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {durationDays < 1 ? `${(durationDays * 24).toFixed(1)} Hours` : `${durationDays.toFixed(1)} Days`}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {isLongTerm && type !== VisitorType.ADHOC && (
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
            <button type="button" onClick={() => navigate('/visitor')} className="text-slate-500 dark:text-white/50 text-sm font-bold px-4 py-2 hover:text-slate-900 dark:hover:text-white transition-colors">
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
        // FIXED: Corrected event method call to e.preventDefault()
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
                setError('Invalid access code. Please try again.');
            }
        }, 1000);
    };

    return (
        <div className="max-w-md mx-auto pt-12 px-6">
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => navigate('/visitor')} className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xs font-bold tracking-widest text-slate-400 dark:text-white/50 uppercase">Check Status</h2>
                <div className="w-10"></div>
            </div>

            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-500 mx-auto mb-4 border border-blue-200 dark:border-blue-500/20">
                    <Search size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Track Application</h1>
                <p className="text-slate-500 dark:text-white/50 text-sm">Enter your 5-digit unique access code to check your approval status.</p>
            </div>

            <GlassCard className="!p-6">
                <form onSubmit={handleCheck}>
                    <Input 
                        placeholder="Enter 5-digit Code" 
                        value={code} 
                        onChange={(e) => setCode(e.target.value)}
                        className="text-center text-2xl tracking-[0.5em] font-mono font-bold"
                        maxLength={5}
                        type="tel"
                        error={error}
                        autoFocus
                    />
                    <Button type="submit" loading={loading} disabled={!code.trim()} className="w-full mt-2 h-14">
                        Check Status
                    </Button>
                </form>
            </GlassCard>
        </div>
    );
};

export const VisitorWallet = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getVisitorByCode } = useStore();
    const [downloading, setDownloading] = useState(false);

    const visitor = getVisitorByCode(id || '');

    if (!visitor) {
        return (
            // FIXED: Corrected className syntax from (flex... to className="flex...
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Visitor Not Found</h2>
                <p className="text-slate-500 dark:text-white/50 text-sm mb-6">The requested visitor pass does not exist or has expired.</p>
                <Button onClick={() => navigate('/visitor')}>Back to Home</Button>
            </div>
        );
    }

    const handleDownload = () => {
        setDownloading(true);
        // Logic to download/save pass
        setTimeout(() => {
            setDownloading(false);
            alert("Pass saved to gallery (simulated)");
        }, 1500);
    };

    return (
        <div className="max-w-md mx-auto pt-6 px-4 pb-24">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate('/visitor')} className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-xs font-bold tracking-widest text-slate-400 dark:text-white/50 uppercase">Digital Pass</h2>
                <button onClick={handleDownload} disabled={downloading} className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                    {downloading ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
                </button>
            </div>

            <GlassCard className="relative overflow-hidden !p-0 mb-6">
                {/* Header Background */}
                <div className={`h-32 ${visitor.status === VisitorStatus.APPROVED ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : visitor.status === VisitorStatus.REJECTED ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} relative`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#1E1E2E] p-1 shadow-xl">
                            <img 
                                src={visitor.icPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${visitor.name}`} 
                                alt="Profile" 
                                className="w-full h-full object-cover rounded-xl bg-slate-100 dark:bg-white/5" 
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-14 pb-8 px-6 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{visitor.name}</h1>
                    <div className="flex justify-center gap-2 mb-4">
                        <StatusBadge status={visitor.status} />
                        <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/5">
                            {visitor.type}
                        </span>
                    </div>

                    {visitor.status === VisitorStatus.APPROVED && visitor.qrType !== QRType.NONE && (
                        <div className="my-6">
                            <QRCodeDisplay value={visitor.id} type={visitor.qrType} label="SCAN FOR ENTRY" />
                        </div>
                    )}
                    
                    {visitor.status === VisitorStatus.APPROVED && visitor.qrType === QRType.NONE && (
                        <div className="my-6 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                            <Car size={32} className="mx-auto text-slate-400 mb-2"/>
                            <p className="text-xs font-bold text-slate-500 dark:text-white/60 uppercase tracking-widest">LPR Access Only</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 font-mono">{visitor.licensePlate}</p>
                        </div>
                    )}

                    {visitor.status === VisitorStatus.PENDING && (
                         <div className="my-6 p-6 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10">
                            <Clock size={32} className="mx-auto text-blue-400 mb-2"/>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Application Under Review</p>
                            <p className="text-xs text-blue-600/60 dark:text-blue-400/60 mt-1">Please wait for admin approval.</p>
                        </div>
                    )}

                    {visitor.status === VisitorStatus.REJECTED && (
                         <div className="my-6 p-6 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-100 dark:border-red-500/10">
                            <Ban size={32} className="mx-auto text-red-400 mb-2"/>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">Access Denied</p>
                            <p className="text-xs text-red-600/60 dark:text-red-400/60 mt-1">{visitor.rejectionReason || 'Your application was rejected.'}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-left mt-6">
                        <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                            <p className="text-[9px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-widest mb-1">Pass ID</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{visitor.id}</p>
                        </div>
                         <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                            <p className="text-[9px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-widest mb-1">Purpose</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{visitor.purpose}</p>
                        </div>
                         <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 col-span-2">
                            <p className="text-[9px] text-slate-400 dark:text-white/30 font-bold uppercase tracking-widest mb-1">Validity</p>
                            <div className="flex justify-between items-center">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{new Date(visitor.visitDate).toLocaleDateString()}</p>
                                <span className="text-slate-300 dark:text-white/20">&rarr;</span>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{visitor.endDate ? new Date(visitor.endDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>
            
            <p className="text-center text-[10px] text-slate-400 dark:text-white/30 font-medium max-w-xs mx-auto">
                Please present this pass at the security checkpoint. For assistance, contact reception.
            </p>
        </div>
    );
};

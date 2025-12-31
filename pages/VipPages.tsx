
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, Input, Select, StatusBadge, Toast, ConfirmModal, LoadingOverlay } from '../components/GlassComponents';
import { VipRecord, VipType, UserRole, VIP_DESIGNATIONS, VEHICLE_COLORS } from '../types';
import { Crown, Plus, Search, Filter, Trash2, Edit2, ShieldCheck, Car, Calendar, User, Phone, FileText, CheckCircle2, XCircle, AlertCircle, FileUp, Check, Save, X, ExternalLink, Clock, Palette } from 'lucide-react';

const VipBadge = ({ type }: { type: VipType }) => {
  if (type === VipType.VVIP) {
    return (
      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border border-yellow-300 shadow-sm flex items-center gap-1">
        <Crown size={12} className="fill-yellow-900" /> VVIP
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-800 dark:text-blue-100 border border-blue-200 dark:border-blue-500/30 flex items-center gap-1">
      <ShieldCheck size={12} /> VIP
    </span>
  );
};

// NEW: VIP Detail & Edit Modal
export const VipDetailModal = ({ vip, onClose, onUpdate, onDeactivate, navigate }: { 
  vip: VipRecord | null, 
  onClose: () => void, 
  onUpdate: (id: string, data: Partial<VipRecord>) => void,
  onDeactivate: (id: string) => void,
  navigate: (path: string) => void
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<VipRecord>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  useEffect(() => {
    if (vip) {
      setEditForm(vip);
      setIsEditing(false);
    }
  }, [vip]);

  if (!vip) return null;

  const handleSave = () => {
    // Basic validation
    if (!editForm.name || !editForm.licensePlate || !editForm.validFrom || !editForm.validUntil) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      onUpdate(vip.id, editForm);
      setIsSaving(false);
      setIsEditing(false);
    }, 800);
  };

  const handleDeactivate = () => {
    onDeactivate(vip.id);
    setShowDeactivateConfirm(false);
    onClose();
  };

  const renderField = (label: string, value: string | React.ReactNode) => (
    <div className="mb-4">
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1">{label}</p>
      <div className="text-sm font-bold text-slate-900 dark:text-white break-words">{value || 'N/A'}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <ConfirmModal 
        show={showDeactivateConfirm}
        title="Deactivate VIP"
        message="Are you sure? This will immediately revoke automatic gate access."
        onConfirm={handleDeactivate}
        onCancel={() => setShowDeactivateConfirm(false)}
        confirmText="Deactivate"
      />

      <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-white dark:bg-[#121217] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col relative animate-in zoom-in-95 duration-300 transition-colors">
        
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-6 bg-white/80 dark:bg-[#121217]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {isEditing ? 'Edit VIP Profile' : 'VIP Details'}
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Identity Header Card */}
          <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5">
             <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 text-3xl font-black shadow-lg ${editForm.vipType === VipType.VVIP ? 'bg-gradient-to-br from-amber-200 to-yellow-500 text-yellow-900' : 'bg-gradient-to-br from-blue-200 to-indigo-500 text-white'}`}>
                {editForm.name?.[0] || 'V'}
             </div>
             {isEditing ? (
               <div className="w-full space-y-3">
                 <div className="flex gap-2 justify-center">
                    <button type="button" onClick={() => setEditForm({...editForm, vipType: VipType.VVIP})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${editForm.vipType === VipType.VVIP ? 'bg-amber-100 text-amber-700' : 'bg-white/10 text-slate-400'}`}>VVIP</button>
                    <button type="button" onClick={() => setEditForm({...editForm, vipType: VipType.VIP})} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${editForm.vipType === VipType.VIP ? 'bg-blue-100 text-blue-700' : 'bg-white/10 text-slate-400'}`}>VIP</button>
                 </div>
                 <Input 
                   value={editForm.name || ''} 
                   onChange={e => setEditForm({...editForm, name: e.target.value})} 
                   placeholder="Full Name" 
                   className="text-center font-bold text-lg !mb-0" 
                 />
                 <Input 
                   value={editForm.designation || ''} 
                   onChange={e => setEditForm({...editForm, designation: e.target.value})} 
                   placeholder="Designation" 
                   className="text-center text-sm !mb-0" 
                 />
               </div>
             ) : (
               <>
                 <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{vip.name}</h1>
                 <p className="text-sm font-bold text-slate-500 dark:text-white/60 mb-3">{vip.designation === 'Other (Specify)' ? vip.customDesignation : vip.designation}</p>
                 <div className="flex items-center gap-2">
                    <VipBadge type={vip.vipType} />
                    {vip.status === 'ACTIVE' ? (
                      <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/30">Active</span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest border border-red-200 dark:border-red-500/30">{vip.status}</span>
                    )}
                 </div>
               </>
             )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {/* Contact Info */}
             <GlassCard className="!p-4 bg-white dark:bg-white/5" title="Identity & Contact">
               {isEditing ? (
                 <div className="space-y-2">
                   <Input label="Phone" value={editForm.contact || ''} onChange={e => setEditForm({...editForm, contact: e.target.value})} />
                   <Input label="IC / Passport" value={editForm.icNumber || ''} onChange={e => setEditForm({...editForm, icNumber: e.target.value})} />
                 </div>
               ) : (
                 <>
                   {renderField('Phone Number', vip.contact)}
                   {renderField('IC / ID', vip.icNumber)}
                 </>
               )}
             </GlassCard>

             {/* Vehicle Info */}
             <GlassCard className="!p-4 bg-white dark:bg-white/5" title="Vehicle Information">
               {isEditing ? (
                 <div className="space-y-2">
                   <Input label="Plate Number" value={editForm.licensePlate || ''} onChange={e => setEditForm({...editForm, licensePlate: e.target.value.toUpperCase()})} />
                   <Select 
                      label="Vehicle Color"
                      value={editForm.vehicleColor || ''} 
                      onChange={e => setEditForm({...editForm, vehicleColor: e.target.value})}
                      options={[{value: '', label: 'Select Color'}, ...VEHICLE_COLORS.map(c => ({value: c, label: c}))]}
                   />
                 </div>
               ) : (
                 <>
                   {renderField('License Plate', <span className="font-mono bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">{vip.licensePlate}</span>)}
                   {renderField('Vehicle Color', 
                      <div className="flex items-center gap-2">
                        {vip.vehicleColor && <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-white/20" style={{ backgroundColor: vip.vehicleColor.toLowerCase() }}></div>}
                        {vip.vehicleColor || 'N/A'}
                      </div>
                   )}
                 </>
               )}
             </GlassCard>

             {/* Validity */}
             <GlassCard className="!p-4 bg-white dark:bg-white/5 col-span-1 sm:col-span-2" title="Access Validity">
               {isEditing ? (
                 <div className="grid grid-cols-2 gap-4">
                   <Input type="datetime-local" label="Valid From" value={editForm.validFrom?.slice(0,16) || ''} onChange={e => setEditForm({...editForm, validFrom: e.target.value})} />
                   <Input type="datetime-local" label="Valid Until" value={editForm.validUntil?.slice(0,16) || ''} onChange={e => setEditForm({...editForm, validUntil: e.target.value})} />
                 </div>
               ) : (
                 <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Valid From</p>
                      <p className="text-xs font-bold">{new Date(vip.validFrom).toLocaleDateString()}</p>
                    </div>
                    <div className="h-full w-px bg-slate-300 dark:bg-white/10 mx-4"></div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Valid Until</p>
                      <p className="text-xs font-bold">{new Date(vip.validUntil).toLocaleDateString()}</p>
                    </div>
                 </div>
               )}
             </GlassCard>

             {/* Toggles */}
             <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4">
               {['autoApprove', 'autoOpenGate'].map(key => (
                 <div key={key} className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                   (editForm as any)[key] 
                   ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' 
                   : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5'
                 }`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-white/80">
                      {key === 'autoApprove' ? 'LPR Auto-Approve' : 'Gate Auto-Open'}
                    </span>
                    {isEditing ? (
                      <div 
                        onClick={() => setEditForm({...editForm, [key]: !(editForm as any)[key]})}
                        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${(editForm as any)[key] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${(editForm as any)[key] ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                    ) : (
                      (vip as any)[key] ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-slate-400" />
                    )}
                 </div>
               ))}
             </div>

             {/* Admin Info */}
             <GlassCard className="!p-4 bg-white dark:bg-white/5 col-span-1 sm:col-span-2" title="Administrative">
               {isEditing ? (
                 <Input label="Reason / Notes" value={editForm.reason || ''} onChange={e => setEditForm({...editForm, reason: e.target.value})} />
               ) : (
                 <>
                   {renderField('Notes', vip.reason)}
                   <div className="flex justify-between mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                      <div>
                        <p className="text-[8px] font-bold uppercase text-slate-400">Created By</p>
                        <p className="text-[10px] font-bold">{vip.createdBy} on {new Date(vip.createdAt).toLocaleDateString()}</p>
                      </div>
                      {vip.updatedBy && (
                        <div className="text-right">
                          <p className="text-[8px] font-bold uppercase text-slate-400">Last Updated</p>
                          <p className="text-[10px] font-bold">{vip.updatedBy} on {new Date(vip.updatedAt!).toLocaleDateString()}</p>
                        </div>
                      )}
                   </div>
                 </>
               )}
             </GlassCard>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-20 p-6 bg-white/90 dark:bg-[#121217]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 flex gap-3">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={() => { setIsEditing(false); setEditForm(vip); }} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSave} loading={isSaving} className="flex-1 shadow-lg shadow-blue-600/20">
                <Save size={18} /> Save Changes
              </Button>
            </>
          ) : (
            <>
              {vip.status === 'ACTIVE' && (
                <button 
                  onClick={() => setShowDeactivateConfirm(true)}
                  className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                >
                  Deactivate
                </button>
              )}
              <Button 
                variant="secondary" 
                onClick={() => navigate(`/lpr?view=history&search=${vip.licensePlate}`)}
                className="flex-1 !text-[10px] uppercase tracking-widest"
              >
                <ExternalLink size={16} /> Scan History
              </Button>
              <Button onClick={() => setIsEditing(true)} className="flex-[2] shadow-lg shadow-blue-600/20">
                <Edit2 size={18} /> Edit VIP
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const VipList = () => {
  const navigate = useNavigate();
  const { vipRecords, updateVip, deactivateVip, currentUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVip, setSelectedVip] = useState<VipRecord | null>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      navigate('/staff/dashboard');
    }
  }, [currentUser, navigate]);

  const filteredVips = useMemo(() => {
    return vipRecords.filter(v => {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.licensePlate.toLowerCase().includes(q) ||
        v.designation.toLowerCase().includes(q)
      );
    });
  }, [vipRecords, searchQuery]);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-32">
      <VipDetailModal 
        vip={selectedVip} 
        onClose={() => setSelectedVip(null)}
        onUpdate={updateVip}
        onDeactivate={deactivateVip}
        navigate={navigate}
      />

      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
            <Crown size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">VIP Management</h1>
            <p className="text-slate-500 dark:text-white/40 text-sm uppercase tracking-widest font-black">Priority Access Control</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/vip/create')}
          className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" size={18} />
        <input 
          type="text" 
          placeholder="Search Name, Plate, Designation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 shadow-xl"
        />
      </div>

      <div className="space-y-4">
        {filteredVips.length === 0 ? (
           <div className="text-center py-16 bg-white/50 dark:bg-[#1E1E2E]/30 rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
              <Crown size={40} className="mx-auto mb-4 opacity-10" />
              <p className="text-xs font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em]">No VIP Records Found</p>
           </div>
        ) : (
           <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f111c] shadow-xl">
             <table className="min-w-full text-sm">
               <thead className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 bg-white/80 dark:bg-white/5">
                 <tr>
                   <th className="text-left font-black px-5 py-3">VIP</th>
                   <th className="text-left font-black px-5 py-3">Plate</th>
                   <th className="text-left font-black px-5 py-3">Designation</th>
                   <th className="text-left font-black px-5 py-3">Status</th>
                   <th className="text-left font-black px-5 py-3">Validity</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                 {filteredVips.map(vip => (
                   <tr 
                     key={vip.id}
                     onClick={() => setSelectedVip(vip)}
                     className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                   >
                     <td className="px-5 py-4">
                       <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${vip.vipType === VipType.VVIP ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500'}`}>
                           {vip.name[0]}
                         </div>
                         <div>
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">{vip.name}</span>
                             <VipBadge type={vip.vipType} />
                           </div>
                           <p className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wide mt-0.5">
                             #{vip.id}
                           </p>
                         </div>
                       </div>
                     </td>
                     <td className="px-5 py-4">
                       <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-white/80 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">{vip.licensePlate}</span>
                     </td>
                     <td className="px-5 py-4 text-[12px] text-slate-600 dark:text-white/70">
                       {vip.designation === 'Other (Specify)' ? vip.customDesignation : vip.designation}
                     </td>
                     <td className="px-5 py-4">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full inline-flex items-center gap-1 ${vip.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300'}`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${vip.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                         {vip.status}
                       </span>
                     </td>
                     <td className="px-5 py-4 text-[12px] text-slate-500 dark:text-white/60">
                       <div className="flex flex-col leading-tight gap-0.5">
                         <span>From: {new Date(vip.validFrom).toLocaleDateString()}</span>
                         <span>Until: {new Date(vip.validUntil).toLocaleDateString()}</span>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>
    </div>
  );
};

export const VipForm = () => {
  const navigate = useNavigate();
  const { addVip, currentUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<VipRecord>>({
    vipType: VipType.VIP,
    designation: '',
    customDesignation: '',
    name: '',
    contact: '',
    icNumber: '',
    licensePlate: '',
    vehicleColor: '',
    validFrom: new Date().toISOString().slice(0, 16),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default 1 year
    autoApprove: true,
    autoOpenGate: true,
    accessPoints: ['ENTRY_LPR', 'EXIT_LPR'],
    reason: '',
    attachment: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
      navigate('/staff/dashboard');
    }
  }, [currentUser, navigate]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = 'Full Name is required';
    if (!formData.contact) newErrors.contact = 'Contact is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (formData.designation === 'Other (Specify)' && !formData.customDesignation) newErrors.customDesignation = 'Please specify designation';
    if (!formData.licensePlate) newErrors.licensePlate = 'License Plate is required';
    if (!formData.validFrom) newErrors.validFrom = 'Start date required';
    if (!formData.validUntil) newErrors.validUntil = 'End date required';
    if (formData.validFrom && formData.validUntil && new Date(formData.validUntil) <= new Date(formData.validFrom)) {
        newErrors.validUntil = 'End date must be after start date';
    }
    if (!formData.reason) newErrors.reason = 'Reason/Notes required for audit';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
        addVip({
            ...formData as any,
            createdBy: currentUser?.username || 'System'
        });
        setLoading(false);
        setToast({ show: true, message: 'VIP Record Created Successfully' });
        setTimeout(() => navigate('/vip'), 1000);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, attachment: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-32">
        {loading && <LoadingOverlay message="Registering VIP..." />}
        <Toast show={toast.show} message={toast.message} onHide={() => setToast({ ...toast, show: false })} />

        <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigate('/vip')} className="w-10 h-10 rounded-full bg-white dark:bg-[#1E1E2E] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <XCircle size={20} />
            </button>
            <h2 className="text-xs font-bold tracking-widest text-slate-400 dark:text-white/50 uppercase">New VIP Registration</h2>
            <div className="w-10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Classification */}
            <GlassCard title="1. Classification">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, vipType: VipType.VVIP})}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.vipType === VipType.VVIP ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-400 dark:text-white/30'}`}
                    >
                        <Crown size={24} className={formData.vipType === VipType.VVIP ? "fill-amber-500" : ""} />
                        <span className="text-xs font-black uppercase tracking-widest">VVIP</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, vipType: VipType.VIP})}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.vipType === VipType.VIP ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-400 dark:text-white/30'}`}
                    >
                        <ShieldCheck size={24} />
                        <span className="text-xs font-black uppercase tracking-widest">VIP</span>
                    </button>
                </div>

                <Select 
                    label="Designation / Rank"
                    required
                    options={[{value: '', label: 'Select Designation'}, ...VIP_DESIGNATIONS.map(d => ({ value: d, label: d }))]}
                    value={formData.designation}
                    error={errors.designation}
                    onChange={e => setFormData({...formData, designation: e.target.value})}
                />

                {formData.designation === 'Other (Specify)' && (
                    <div className="animate-in slide-in-from-top-2">
                        <Input 
                            label="Custom Designation"
                            required
                            placeholder="e.g. Special Guest of CEO"
                            value={formData.customDesignation}
                            error={errors.customDesignation}
                            onChange={e => setFormData({...formData, customDesignation: e.target.value})}
                        />
                    </div>
                )}
            </GlassCard>

            {/* Section 2: Identity */}
            <GlassCard title="2. Visitor Identity">
                <Input 
                    label="Full Name (with Titles)"
                    required
                    placeholder="e.g. Tan Sri Dato' ..."
                    value={formData.name}
                    error={errors.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    icon={<User size={18} />}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                        label="Mobile Number"
                        required
                        placeholder="+60..."
                        value={formData.contact}
                        error={errors.contact}
                        onChange={e => setFormData({...formData, contact: e.target.value})}
                        icon={<Phone size={18} />}
                        className="mb-0"
                    />
                    <Input 
                        label="IC / Passport (Optional)"
                        placeholder="ID Number"
                        value={formData.icNumber}
                        onChange={e => setFormData({...formData, icNumber: e.target.value})}
                        icon={<FileText size={18} />}
                        className="mb-0"
                    />
                </div>
            </GlassCard>

            {/* Section 3: Vehicle */}
            <GlassCard title="3. Vehicle Info (LPR)">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl mb-4 text-[10px] text-blue-600 dark:text-blue-300 font-medium flex items-start gap-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    Crucial for automatic gate opening. Ensure accurate plate number.
                </div>
                <Input 
                    label="Vehicle Plate Number"
                    required
                    placeholder="e.g. VIP 1"
                    value={formData.licensePlate}
                    error={errors.licensePlate}
                    onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})}
                    icon={<Car size={18} />}
                    className="font-mono text-lg tracking-wider uppercase"
                />
                <Select 
                    label="Vehicle Color (Optional)"
                    value={formData.vehicleColor} 
                    onChange={e => setFormData({...formData, vehicleColor: e.target.value})}
                    options={[{value: '', label: 'Select Color'}, ...VEHICLE_COLORS.map(c => ({value: c, label: c}))]}
                />
            </GlassCard>

            {/* Section 4: Access & Validity */}
            <GlassCard title="4. Access & Validity">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Input 
                        label="Valid From"
                        type="datetime-local"
                        required
                        value={formData.validFrom}
                        error={errors.validFrom}
                        onChange={e => setFormData({...formData, validFrom: e.target.value})}
                        icon={<Calendar size={18} />}
                        className="mb-0"
                    />
                    <Input 
                        label="Valid Until"
                        type="datetime-local"
                        required
                        value={formData.validUntil}
                        error={errors.validUntil}
                        onChange={e => setFormData({...formData, validUntil: e.target.value})}
                        icon={<Calendar size={18} />}
                        className="mb-0"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Auto-Approve LPR</p>
                            <p className="text-[10px] text-slate-500 dark:text-white/50">Automatically approve entry upon plate recognition.</p>
                        </div>
                        <div 
                            onClick={() => setFormData({...formData, autoApprove: !formData.autoApprove})}
                            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${formData.autoApprove ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.autoApprove ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Auto-Open Gate</p>
                            <p className="text-[10px] text-slate-500 dark:text-white/50">Directly trigger barrier gate (requires no guard action).</p>
                        </div>
                        <div 
                            onClick={() => setFormData({...formData, autoOpenGate: !formData.autoOpenGate})}
                            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${formData.autoOpenGate ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.autoOpenGate ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Section 5: Admin */}
            <GlassCard title="5. Administrative">
                <Input 
                    label="Reason / Notes"
                    required
                    placeholder="Justification for VIP status..."
                    value={formData.reason}
                    error={errors.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                />
                
                <div className="relative">
                    <label className="block text-xs font-medium text-slate-500 dark:text-white/60 mb-2 ml-1 uppercase tracking-wider">Supporting Document (Optional)</label>
                    <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-4 px-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-3 ${formData.attachment ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                    >
                    {formData.attachment ? <><Check size={18} /> File Attached</> : <><FileUp size={18} /> Upload Letter / Memo</>}
                    </button>
                    <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    />
                </div>
            </GlassCard>

            <Button type="submit" loading={loading} className="w-full h-14 shadow-xl shadow-blue-900/20">
                Register VIP
            </Button>
        </form>
    </div>
  );
};

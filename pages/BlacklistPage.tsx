
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { GlassCard, Button, Input, Toast, ConfirmModal, StatusBadge } from '../components/GlassComponents';
import { Ban, Search, UserX, Plus, X, ShieldAlert, History, User, CreditCard, Phone, Car, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

export const BlacklistPage = () => {
  const { blacklist, addToBlacklist, removeFromBlacklist, currentUser } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [confirmUnban, setConfirmUnban] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    icNumber: '',
    licensePlate: '',
    phone: '',
    reason: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.icNumber && !formData.licensePlate && !formData.phone) {
      newErrors.general = 'At least one identifier (IC, Plate, or Phone) is required';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for blacklisting is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addToBlacklist({
      ...formData,
      createdBy: currentUser?.fullName || 'System'
    });

    setFormData({ name: '', icNumber: '', licensePlate: '', phone: '', reason: '' });
    setIsAdding(false);
    setToast({ show: true, message: 'Visitor blacklisted successfully' });
  };

  const filteredBlacklist = useMemo(() => {
    return blacklist.filter(record => {
      const query = searchQuery.toLowerCase();
      return (
        record.name?.toLowerCase().includes(query) ||
        record.icNumber?.includes(query) ||
        record.licensePlate?.toLowerCase().includes(query) ||
        record.phone?.includes(query)
      );
    });
  }, [blacklist, searchQuery]);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-32">
      <Toast show={toast.show} message={toast.message} onHide={() => setToast({ ...toast, show: false })} />
      <ConfirmModal 
        show={!!confirmUnban}
        title="Revoke Blacklist"
        message="Are you sure you want to unban this visitor? They will be allowed to register and enter again."
        onConfirm={() => {
          if (confirmUnban) {
            removeFromBlacklist(confirmUnban);
            setConfirmUnban(null);
            setToast({ show: true, message: 'Visitor unbanned successfully' });
          }
        }}
        onCancel={() => setConfirmUnban(null)}
        confirmText="Unban"
        variant="primary"
      />

      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
            <Ban size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Access Control</h1>
            <p className="text-white/40 text-sm uppercase tracking-widest font-black">Blacklist Management</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <GlassCard className="max-w-md w-full !p-8 animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserX size={24} className="text-red-500" />
                Add to Blacklist
              </h2>
              <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                  <AlertTriangle size={14} /> {errors.general}
                </div>
              )}

              {/* 1. Name */}
              <Input 
                label="Visitor Name (Optional)" 
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                icon={<User size={18} />}
              />

              {/* 2. IC/Passport */}
              <Input 
                label="IC / Passport Number" 
                placeholder="e.g. 900101-01-1234"
                value={formData.icNumber}
                onChange={e => setFormData({...formData, icNumber: e.target.value})}
                icon={<CreditCard size={18} />}
              />

              {/* 3. Phone Number */}
              <Input 
                label="Phone Number" 
                placeholder="e.g. +60123456789"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                icon={<Phone size={18} />}
              />

              {/* 4. Vehicle Plate (Optional) */}
              <Input 
                label="Vehicle Plate Number (Optional)" 
                placeholder="e.g. ABC 1234"
                value={formData.licensePlate}
                onChange={e => setFormData({...formData, licensePlate: e.target.value})}
                icon={<Car size={18} />}
              />

              {/* 5. Reason */}
              <Input 
                label="Reason for Blacklist" 
                required
                placeholder="Describe why this person is banned..."
                value={formData.reason}
                error={errors.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                icon={<ShieldAlert size={18} />}
              />

              <Button type="submit" className="w-full h-14 bg-red-600 hover:bg-red-500 mt-2">
                Restrict Access
              </Button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* List & Search */}
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search IC, Plate, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E1E2E] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all placeholder:text-white/20 shadow-xl"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <h3 className="text-xs font-bold text-white/90 uppercase tracking-[0.2em]">Restricted Records</h3>
            <span className="ml-auto text-[10px] text-white/20 font-bold uppercase tracking-wider">{filteredBlacklist.length} Total</span>
          </div>

          {filteredBlacklist.length === 0 ? (
            <div className="text-center py-16 bg-[#1E1E2E]/30 rounded-3xl border border-dashed border-white/5">
              <History size={40} className="mx-auto mb-4 opacity-10" />
              <p className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Clean Records Found</p>
            </div>
          ) : (
            filteredBlacklist.map(record => (
              <div 
                key={record.id}
                className={`group relative overflow-hidden rounded-3xl border p-5 transition-all duration-300 ${
                  record.status === 'ACTIVE' 
                  ? 'bg-red-950/20 border-red-500/20 hover:border-red-500/50 shadow-xl shadow-red-950/10' 
                  : 'bg-white/5 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${record.status === 'ACTIVE' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/40'}`}>
                      {record.status === 'ACTIVE' ? <ShieldAlert size={20} /> : <RotateCcw size={20} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{record.name || 'Unnamed Record'}</h4>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Created {new Date(record.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      record.status === 'ACTIVE' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/10 text-white/40 border-white/10'
                    }`}>
                      {record.status}
                    </span>
                    <span className="mt-1 text-[8px] text-white/20 font-bold uppercase">By {record.createdBy}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {record.icNumber && (
                    <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                      <p className="text-[8px] text-white/30 font-bold uppercase mb-0.5">IC Number</p>
                      <p className="text-[10px] font-mono font-bold text-white/80">{record.icNumber}</p>
                    </div>
                  )}
                  {record.licensePlate && (
                    <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                      <p className="text-[8px] text-white/30 font-bold uppercase mb-0.5">Plate Number</p>
                      <p className="text-[10px] font-mono font-bold text-white/80 uppercase">{record.licensePlate}</p>
                    </div>
                  )}
                  {record.phone && (
                    <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                      <p className="text-[8px] text-white/30 font-bold uppercase mb-0.5">Phone</p>
                      <p className="text-[10px] font-mono font-bold text-white/80">{record.phone}</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 mb-4">
                  <p className="text-[9px] text-red-300/60 font-medium italic">"{record.reason}"</p>
                </div>

                {record.status === 'ACTIVE' && (
                  <button 
                    onClick={() => setConfirmUnban(record.id)}
                    className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} /> Revoke Ban
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

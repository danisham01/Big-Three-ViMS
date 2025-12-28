
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { GlassCard, Button, StatusBadge, Skeleton, VisitorCardSkeleton, HistoryItemSkeleton, Input, Toast, ConfirmModal } from '../components/GlassComponents';
import { VisitorStatus, Visitor, UserRole, TransportMode } from '../types';
import { CheckCircle, XCircle, Filter, User, Clock, Briefcase, LogOut, Search, Car, User as UserIcon, ListFilter, X, Calendar, ArrowRight, AlertCircle, Send, BellRing, Bike } from 'lucide-react';

export const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { visitors, updateVisitorStatus, currentUser, logout } = useStore();
  const [initialLoading, setInitialLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState<VisitorStatus | 'ALL'>('ALL');
  const [transportFilter, setTransportFilter] = useState<TransportMode | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== UserRole.ADMIN) {
        navigate('/staff/login');
    }
    
    const timer = setTimeout(() => {
        setInitialLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  const filterBySearch = (v: Visitor) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return v.name.toLowerCase().includes(query) || 
           v.id.includes(query) ||
           (v.licensePlate?.toLowerCase() || '').includes(query) ||
           v.purpose.toLowerCase().includes(query);
  };

  const pendingVisitors = useMemo(() => {
    return visitors.filter(v => v.status === VisitorStatus.PENDING && filterBySearch(v));
  }, [visitors, searchQuery]);

  const filteredHistory = useMemo(() => {
    return visitors.filter(v => {
      const matchesStatus = statusFilter === 'ALL' ? true : v.status === statusFilter;
      const matchesTransport = transportFilter === 'ALL' ? true : v.transportMode === transportFilter;
      const matchesSearch = filterBySearch(v);
      return matchesStatus && matchesTransport && matchesSearch;
    });
  }, [visitors, statusFilter, transportFilter, searchQuery]);

  const stats = {
    pending: visitors.filter(v => v.status === VisitorStatus.PENDING).length,
    approved: visitors.filter(v => v.status === VisitorStatus.APPROVED).length,
    rejected: visitors.filter(v => v.status === VisitorStatus.REJECTED).length,
  };

  const handleAction = async (id: string, status: VisitorStatus, reason?: string) => {
    setProcessingId(id);
    const visitor = visitors.find(v => v.id === id);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateVisitorStatus(id, status, reason);
    setProcessingId(null);

    if (visitor && visitor.registeredBy && visitor.registeredBy !== 'SELF') {
      setToast({ show: true, message: `Notification sent to staff (${visitor.registeredBy})` });
    } else {
      setToast({ show: true, message: `Visitor ${status.toLowerCase()}` });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-32">
      <Toast show={toast.show} message={toast.message} onHide={() => setToast({ ...toast, show: false })} />
      <ConfirmModal 
        show={showLogoutConfirm}
        title="Logout Confirmation"
        message="Are you sure you want to exit the Operator Console?"
        onConfirm={logout}
        onCancel={() => setShowLogoutConfirm(false)}
        confirmText="Logout"
      />
      
      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 border-2 border-white/20 p-0.5 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`} alt="Admin" className="w-full h-full rounded-full bg-white/10" />
             </div>
             <div>
                 <p className="text-[10px] text-blue-400 font-bold tracking-wider uppercase">{currentUser.role} Console</p>
                 <h1 className="text-xl font-bold text-white">{currentUser.fullName}</h1>
             </div>
        </div>
        <button onClick={() => setShowLogoutConfirm(true)} className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors">
            <LogOut size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Pending', count: stats.pending, color: 'blue', icon: Clock },
          { label: 'Approved', count: stats.approved, color: 'emerald', icon: CheckCircle },
          { label: 'Rejected', count: stats.rejected, color: 'red', icon: XCircle }
        ].map((stat, i) => (
          <div key={i} className={`bg-[#1E1E2E] border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden`}>
            {initialLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            ) : (
              <>
                <div className="text-[10px] text-white/40 mb-1 font-bold uppercase tracking-widest">{stat.label}</div>
                <div className="text-xl font-bold text-white">{stat.count}</div>
                <div className={`absolute -bottom-1 -right-1 opacity-5 rotate-12`}>
                    <stat.icon size={42} className={`text-${stat.color}-500`} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mb-8 sticky top-4 z-30">
        <GlassCard className="!p-2 !bg-[#1E1E2E]/80 backdrop-blur-2xl border-white/10 shadow-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, code, or plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-11 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-white/20"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-4 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            <h3 className="text-xs font-bold text-white/90 uppercase tracking-[0.2em]">Active Requests</h3>
            {!initialLoading && pendingVisitors.length > 0 && (
                <span className="ml-auto bg-blue-500/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-500/20">
                    {pendingVisitors.length} New
                </span>
            )}
        </div>

        <div className="flex flex-col gap-4">
            {initialLoading ? (
              <>
                <VisitorCardSkeleton />
                <VisitorCardSkeleton />
              </>
            ) : pendingVisitors.length === 0 ? (
                <div className="text-center py-12 bg-[#1E1E2E]/30 rounded-3xl border border-dashed border-white/5">
                    <Clock size={32} className="mx-auto mb-3 text-white/10" />
                    <p className="text-xs text-white/30 font-medium tracking-wide">
                        {searchQuery ? 'No pending matches found' : 'All caught up! No active requests.'}
                    </p>
                </div>
            ) : (
                pendingVisitors.map(visitor => (
                    <VisitorRequestCard 
                        key={visitor.id} 
                        visitor={visitor} 
                        isProcessing={processingId === visitor.id}
                        onApprove={() => handleAction(visitor.id, VisitorStatus.APPROVED)} 
                        onReject={(reason) => handleAction(visitor.id, VisitorStatus.REJECTED, reason)}
                    />
                ))
            )}
        </div>
      </section>

      <section className="pb-20">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-white/20 rounded-full"></div>
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-[0.2em]">Visitor Audit</h3>
            </div>
            {!initialLoading && <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">{filteredHistory.length} Total Records</span>}
        </div>

        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <div className="p-2 bg-white/5 rounded-xl text-white/30 shrink-0">
                    <Filter size={14} />
                </div>
                {[
                    { label: 'All', value: 'ALL' },
                    { label: 'Approved', value: VisitorStatus.APPROVED },
                    { label: 'Rejected', value: VisitorStatus.REJECTED },
                    { label: 'Pending', value: VisitorStatus.PENDING }
                ].map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value as any)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border ${
                            statusFilter === opt.value 
                            ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'border-white/5 bg-[#1E1E2E] text-white/40 hover:bg-white/10'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2">
                {[
                    { label: 'Vehicle Entry', value: TransportMode.CAR, icon: <Car size={12}/> },
                    { label: 'Walk-in / Bike', value: TransportMode.NON_CAR, icon: <div className="flex items-center gap-0.5"><UserIcon size={12}/><Bike size={12}/></div> }
                ].map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => setTransportFilter(transportFilter === opt.value ? 'ALL' : opt.value as any)}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-[10px] font-bold transition-all ${
                            transportFilter === opt.value 
                            ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'border-white/5 bg-[#1E1E2E] text-white/40 hover:bg-white/10'
                        }`}
                    >
                        {opt.icon}
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex flex-col gap-3">
            {initialLoading ? (
              <>
                <HistoryItemSkeleton />
                <HistoryItemSkeleton />
                <HistoryItemSkeleton />
                <HistoryItemSkeleton />
              </>
            ) : filteredHistory.length === 0 ? (
                <div className="text-center py-16 text-white/20">
                    <Search size={40} className="mx-auto mb-4 opacity-5" />
                    <p className="text-xs font-medium tracking-widest uppercase">No history records found</p>
                    <button onClick={() => {setStatusFilter('ALL'); setTransportFilter('ALL'); setSearchQuery('');}} className="mt-4 text-[10px] text-blue-500 font-bold hover:underline underline-offset-4">
                        Reset all filters
                    </button>
                </div>
            ) : (
                filteredHistory.map(visitor => (
                    <div key={visitor.id} className="group animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-2 rounded-2xl border border-white/5 bg-[#151520] p-4 transition-all duration-300 hover:bg-[#1E1E2E]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${visitor.name}`} alt="" className="h-full w-full p-1" />
                                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#151520] ${visitor.status === VisitorStatus.APPROVED ? 'bg-emerald-500' : visitor.status === VisitorStatus.REJECTED ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="truncate text-xs font-bold text-white transition-colors group-hover:text-blue-400">{visitor.name}</h4>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="bg-white/5 px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-tighter text-white/40 rounded">
                                            #{visitor.id}
                                        </span>
                                        <span className="flex items-center gap-1 italic text-[9px] font-medium text-white/30">
                                            {visitor.transportMode === TransportMode.CAR ? <Car size={10}/> : <div className="flex items-center"><UserIcon size={10}/><Bike size={10}/></div>}
                                            {visitor.transportMode === TransportMode.CAR ? (visitor.licensePlate || '??-????') : 'Walk-in / Bike'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                                <StatusBadge status={visitor.status} />
                                <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-tighter text-white/20">
                                    <Calendar size={10} />
                                    {new Date(visitor.visitDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        {visitor.status === VisitorStatus.REJECTED && visitor.rejectionReason && (
                          <div className="mt-1 flex items-start gap-2 rounded-xl bg-red-500/5 p-2 ring-1 ring-red-500/10">
                            <AlertCircle size={12} className="mt-0.5 shrink-0 text-red-400" />
                            <p className="text-[10px] font-medium leading-relaxed text-red-300/80 italic">
                              Denied: {visitor.rejectionReason}
                            </p>
                          </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </section>
    </div>
  );
};

interface VisitorRequestCardProps {
    visitor: Visitor;
    isProcessing?: boolean;
    onApprove?: () => void;
    onReject?: (reason: string) => void;
    readonly?: boolean;
}

const VisitorRequestCard: React.FC<VisitorRequestCardProps> = ({ visitor, isProcessing, onApprove, onReject, readonly = false }) => {
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleRejectClick = () => {
      if (showRejectInput) {
        if (!rejectionReason.trim()) return;
        onReject?.(rejectionReason);
      } else {
        setShowRejectInput(true);
      }
    };

    return (
        <div className={`group animate-in zoom-in relative overflow-hidden rounded-3xl border border-white/10 bg-[#1E1E2E] p-5 shadow-2xl transition-all duration-300 hover:border-blue-500/30 ${isProcessing ? 'pointer-events-none opacity-70' : ''}`}>
            <div className="pointer-events-none absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-blue-600/5 blur-[40px]"></div>
            
            <div className="relative z-10 mb-5 flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-0.5 shadow-inner ring-1 ring-white/10">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${visitor.name}`} alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h3 className="text-md font-black leading-tight text-white transition-colors group-hover:text-blue-400">{visitor.name}</h3>
                        <div className="mt-2 flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/40">
                                <Briefcase size={12} className="text-blue-500/60" /> {visitor.purpose}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/40">
                                {visitor.transportMode === TransportMode.CAR ? <Car size={12} className="text-indigo-400/60" /> : <div className="flex items-center gap-1"><UserIcon size={12} className="text-indigo-400/60" /><Bike size={12} className="text-indigo-400/60" /></div>}
                                <span className="uppercase tracking-widest">{visitor.transportMode === TransportMode.CAR ? 'Car' : 'Walk-in / Bike'}</span>
                                {visitor.transportMode === TransportMode.CAR && visitor.licensePlate && <span className="ml-1 font-mono text-white/20">[{visitor.licensePlate}]</span>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                  <StatusBadge status={visitor.status} />
                  <span className="mt-2 font-mono text-[10px] font-black tracking-widest text-white/20">ID {visitor.id}</span>
                </div>
            </div>

            {!readonly && (
                <div className="relative z-10 flex flex-col gap-3 mt-2">
                    {showRejectInput && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                         <Input 
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="!py-3 !text-xs !bg-red-500/5 !text-red-200 border-red-500/20 focus:ring-red-500/10 !mb-0"
                            autoFocus
                         />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleRejectClick} 
                            disabled={isProcessing || (showRejectInput && !rejectionReason.trim())}
                            className={`flex-1 py-3.5 rounded-2xl border transition-all duration-300 text-xs font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${
                              showRejectInput 
                              ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20' 
                              : 'border-red-500/10 text-red-500/60 hover:bg-red-500/10 hover:text-red-400'
                            }`}
                        >
                            {showRejectInput ? <><Send size={14}/> Submit Deny</> : 'Decline'}
                        </button>
                        
                        {!showRejectInput && (
                          <button 
                              onClick={onApprove} 
                              disabled={isProcessing}
                              className="flex-[2] py-3.5 rounded-2xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                              {isProcessing ? 'Processing...' : 'Authorize'} <ArrowRight size={14} />
                          </button>
                        )}

                        {showRejectInput && (
                          <button 
                            onClick={() => setShowRejectInput(false)}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-colors"
                          >
                            <X size={20} />
                          </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

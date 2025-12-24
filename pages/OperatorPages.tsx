import React, { useState } from 'react';
import { useStore } from '../store';
import { GlassCard, Button, StatusBadge } from '../components/GlassComponents';
import { VisitorStatus, Visitor } from '../types';
import { CheckCircle, XCircle, Filter, User, Clock, Briefcase } from 'lucide-react';

export const OperatorDashboard = () => {
  const { visitors, updateVisitorStatus } = useStore();
  
  // Pending visitors should be at the top
  const pendingVisitors = visitors.filter(v => v.status === VisitorStatus.PENDING);
  const otherVisitors = visitors.filter(v => v.status !== VisitorStatus.PENDING);
  
  // Stats
  const stats = {
    pending: visitors.filter(v => v.status === VisitorStatus.PENDING).length,
    approved: visitors.filter(v => v.status === VisitorStatus.APPROVED).length,
    rejected: visitors.filter(v => v.status === VisitorStatus.REJECTED).length,
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 border-2 border-white/20 p-0.5">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Operator`} alt="Admin" className="w-full h-full rounded-full bg-white/10" />
             </div>
             <div>
                 <p className="text-xs text-white/50 font-bold tracking-wider uppercase">Welcome Back</p>
                 <h1 className="text-xl font-bold text-white">Approval Queue</h1>
             </div>
        </div>
        <button className="w-10 h-10 rounded-xl bg-[#1E1E2E] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <Filter size={20} />
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-[#1E1E2E] border border-blue-500/20 rounded-2xl p-4 flex flex-col relative overflow-hidden">
            <div className="text-xs text-white/50 mb-1">Pending</div>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
            <div className="h-1 w-full bg-blue-500/20 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/2 rounded-full"></div>
            </div>
        </div>
        <div className="bg-[#1E1E2E] border border-emerald-500/20 rounded-2xl p-4 flex flex-col relative overflow-hidden">
            <div className="text-xs text-white/50 mb-1">Approved</div>
            <div className="text-2xl font-bold text-white">{stats.approved}</div>
            <div className="h-1 w-full bg-emerald-500/20 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-3/4 rounded-full"></div>
            </div>
        </div>
        <div className="bg-[#1E1E2E] border border-red-500/20 rounded-2xl p-4 flex flex-col relative overflow-hidden">
            <div className="text-xs text-white/50 mb-1">Rejected</div>
            <div className="text-2xl font-bold text-white">{stats.rejected}</div>
            <div className="h-1 w-full bg-red-500/20 mt-3 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-1/4 rounded-full"></div>
            </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest">Today's Requests</h3>
        <button className="text-blue-500 text-xs font-bold hover:text-blue-400">View All</button>
      </div>

      {/* Requests List */}
      <div className="flex flex-col gap-4">
        {pendingVisitors.length === 0 && (
            <div className="text-center py-10 opacity-50">
                <p>No pending approvals.</p>
            </div>
        )}
        
        {/* Render Pending Items First */}
        {pendingVisitors.map(visitor => (
            <VisitorRequestCard 
                key={visitor.id} 
                visitor={visitor} 
                onApprove={() => updateVisitorStatus(visitor.id, VisitorStatus.APPROVED)} 
                onReject={() => updateVisitorStatus(visitor.id, VisitorStatus.REJECTED, "Admin Rejected")}
            />
        ))}

        {/* Render History Items (Approved/Rejected) with less prominence */}
        {otherVisitors.slice(0, 5).map(visitor => (
            <div key={visitor.id} className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
               <VisitorRequestCard 
                    visitor={visitor} 
                    readonly
                /> 
            </div>
        ))}
      </div>

    </div>
  );
};

interface VisitorRequestCardProps {
    visitor: Visitor;
    onApprove?: () => void;
    onReject?: () => void;
    readonly?: boolean;
}

const VisitorRequestCard: React.FC<VisitorRequestCardProps> = ({ visitor, onApprove, onReject, readonly = false }) => {
    // Generate simulated company name based on ID seed
    const companies = ['TechCorp Solutions', 'Design Studio', 'Spark Electric', 'Logistics Pro', 'Global Consulting'];
    const company = companies[parseInt(visitor.id) % companies.length];
    
    return (
        <div className="bg-[#151520] border border-white/5 rounded-3xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all">
            {/* Top Row: Avatar & Name */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${visitor.name}`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight">{visitor.name}</h3>
                        <div className="flex items-center gap-1 text-white/40 text-xs mt-1">
                            <Briefcase size={12} /> {company}
                        </div>
                        <div className="flex items-center gap-1 text-blue-400 text-xs mt-1 font-medium">
                            <Clock size={12} /> Requested today
                        </div>
                    </div>
                </div>
                {/* Status Dot */}
                <div className={`w-2.5 h-2.5 rounded-full ${
                    visitor.status === VisitorStatus.PENDING ? 'bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 
                    visitor.status === VisitorStatus.APPROVED ? 'bg-emerald-500' : 'bg-red-500'
                }`}></div>
            </div>

            {/* Middle Row: Details */}
            <div className="bg-[#1E1E2E] rounded-xl p-3 mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/70">
                    <Briefcase size={14} className="text-white/30" />
                    <span>Purpose: <span className="text-white">{visitor.purpose}</span></span>
                </div>
                {visitor.licensePlate && (
                    <div className="flex items-center gap-2 text-sm text-white/70">
                        <div className="w-3.5 h-3.5 bg-yellow-500/20 rounded flex items-center justify-center text-[8px] font-bold text-yellow-500">P</div>
                        <span>Vehicle: <span className="font-mono text-white/90 bg-white/5 px-1 rounded text-xs">{visitor.licensePlate}</span></span>
                    </div>
                )}
            </div>

            {/* Bottom Row: Actions */}
            {!readonly && (
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onReject}
                        className="flex-1 py-3 rounded-xl border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <XCircle size={16} /> Reject
                    </button>
                    <button 
                        onClick={onApprove}
                        className="flex-1 py-3 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 text-white text-sm font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={16} /> Approve
                    </button>
                </div>
            )}
             {readonly && (
                 <div className="flex justify-end">
                     <StatusBadge status={visitor.status} />
                 </div>
             )}
        </div>
    );
};
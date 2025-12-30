
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { GlassCard } from './GlassComponents';
import { CalendarDays, Filter, ChevronDown, CheckCircle2, XCircle, ShieldAlert, Clock, HelpCircle, ArrowRight, BarChart3, Calendar } from 'lucide-react';

export const EntryAnalytics = () => {
  const { lprLogs } = useStore();
  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({ start: today, end: today });

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days > 0) {
        start.setDate(end.getDate() - days);
    }
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  const filteredData = useMemo(() => {
    const start = new Date(dateRange.start);
    start.setHours(0,0,0,0);
    const end = new Date(dateRange.end);
    end.setHours(23,59,59,999);

    return lprLogs.filter(log => {
      // Definition: scanType === "ENTRY"
      if (log.mode !== 'ENTRY') return false;
      const logTime = new Date(log.timestamp);
      return logTime >= start && logTime <= end;
    });
  }, [lprLogs, dateRange]);

  const counts = useMemo(() => {
    return {
      total: filteredData.length,
      approved: filteredData.filter(l => l.status === 'Approved').length,
      rejected: filteredData.filter(l => l.status === 'Rejected').length,
      blacklisted: filteredData.filter(l => l.status === 'Blacklisted').length,
      pending: filteredData.filter(l => l.status === 'Pending').length,
      unknown: filteredData.filter(l => l.status === 'Unknown').length,
    };
  }, [filteredData]);

  return (
    <section className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-4 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
             <h3 className="text-xs font-bold text-slate-700 dark:text-white/90 uppercase tracking-[0.2em]">Entry Gate Analytics</h3>
          </div>
          
          <div className="flex gap-2">
             <button onClick={() => handlePreset(0)} className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all ${dateRange.start === today && dateRange.end === today ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/10'}`}>Today</button>
             <button onClick={() => handlePreset(6)} className="px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider bg-white dark:bg-white/5 text-slate-500 dark:text-white/40 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all hidden sm:block">Last 7 Days</button>
          </div>
       </div>

       <GlassCard className="!p-0 overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-[#1E1E2E] dark:to-[#151520]">
          {/* Controls */}
          <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-wrap gap-4 items-center justify-between">
             <div className="flex items-center gap-2 text-slate-500 dark:text-white/50">
                <Calendar size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Date Range</span>
             </div>
             <div className="flex items-center gap-2 bg-white dark:bg-black/20 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                <input 
                  type="date" 
                  value={dateRange.start} 
                  max={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-wider outline-none p-1"
                />
                <span className="text-slate-300 dark:text-white/20">-</span>
                <input 
                  type="date" 
                  value={dateRange.end} 
                  min={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-wider outline-none p-1"
                />
             </div>
          </div>

          <div className="p-6">
             <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                {/* KPI */}
                <div className="flex-1">
                   <p className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-2">Total Entry Scans</p>
                   <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{counts.total}</span>
                      <span className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase">Events</span>
                   </div>
                </div>

                {/* Breakdown */}
                <div className="flex-1 w-full grid grid-cols-2 gap-3">
                   <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <CheckCircle2 size={14} className="text-emerald-500" />
                         <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Passed</span>
                      </div>
                      <span className="text-lg font-black text-emerald-800 dark:text-emerald-100">{counts.approved}</span>
                   </div>

                   <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <XCircle size={14} className="text-red-500" />
                         <span className="text-[9px] font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">Blocked</span>
                      </div>
                      <span className="text-lg font-black text-red-800 dark:text-red-100">{counts.rejected}</span>
                   </div>

                   <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 p-3 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Clock size={14} className="text-orange-500" />
                         <span className="text-[9px] font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wider">Hold</span>
                      </div>
                      <span className="text-lg font-black text-orange-800 dark:text-orange-100">{counts.pending}</span>
                   </div>

                   <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <HelpCircle size={14} className="text-slate-400" />
                         <span className="text-[9px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">Unknown</span>
                      </div>
                      <span className="text-lg font-black text-slate-700 dark:text-white">{counts.unknown}</span>
                   </div>
                </div>
             </div>

             {/* Blacklist Warning - Only show if > 0 */}
             {counts.blacklisted > 0 && (
                <div className="mt-4 p-3 bg-red-900/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-pulse">
                   <ShieldAlert size={16} className="text-red-600 dark:text-red-400" />
                   <p className="text-[10px] font-bold text-red-800 dark:text-red-300 uppercase tracking-widest">
                      Critical: {counts.blacklisted} Blacklisted Entry Attempt(s) Detected
                   </p>
                </div>
             )}
             
             {counts.total === 0 && (
               <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 text-center">
                  <p className="text-[10px] font-medium text-slate-400 dark:text-white/30 italic">No entry scans recorded for the selected period.</p>
               </div>
             )}
          </div>
       </GlassCard>
    </section>
  );
};

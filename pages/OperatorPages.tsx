import React, { useState } from 'react';
import { useStore } from '../store';
import { GlassCard, Button, StatusBadge } from '../components/GlassComponents';
import { VisitorStatus, VisitorType } from '../types';
import { CheckCircle, XCircle, Clock, MapPin, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const OperatorDashboard = () => {
  const { visitors, logs, updateVisitorStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'approvals' | 'logs'>('dashboard');

  const pendingVisitors = visitors.filter(v => v.status === VisitorStatus.PENDING);
  
  // Basic stats
  const totalToday = visitors.filter(v => v.visitDate === new Date().toISOString().split('T')[0]).length;
  const currentlyInside = visitors.filter(v => v.timeIn && !v.timeOut).length;

  // Chart Data
  const data = [
    { name: 'Adhoc', value: visitors.filter(v => v.type === VisitorType.ADHOC).length },
    { name: 'Pre-reg', value: visitors.filter(v => v.type === VisitorType.PREREGISTERED).length },
    { name: 'Inside', value: currentlyInside },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Operator Console</h1>
        <div className="flex bg-white/10 p-1 rounded-xl">
            {['dashboard', 'approvals', 'logs'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        activeTab === tab ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/60 hover:text-white'
                    }`}
                >
                    {tab} {tab === 'approvals' && pendingVisitors.length > 0 && 
                        <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingVisitors.length}</span>
                    }
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="flex items-center justify-between">
                    <div>
                        <p className="text-white/50 text-sm">Visitors Today</p>
                        <p className="text-4xl font-bold text-white mt-1">{totalToday}</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-full text-blue-300">
                        <CheckCircle size={32} />
                    </div>
                </GlassCard>
                <GlassCard className="flex items-center justify-between">
                    <div>
                        <p className="text-white/50 text-sm">Currently Inside</p>
                        <p className="text-4xl font-bold text-white mt-1">{currentlyInside}</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-full text-green-300">
                        <MapPin size={32} />
                    </div>
                </GlassCard>
                <GlassCard className="flex items-center justify-between">
                    <div>
                        <p className="text-white/50 text-sm">Pending Approval</p>
                        <p className="text-4xl font-bold text-white mt-1">{pendingVisitors.length}</p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-full text-yellow-300">
                        <Clock size={32} />
                    </div>
                </GlassCard>
            </div>

            <GlassCard title="Visitor Analytics">
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" stroke="#ffffff50" />
                            <YAxis stroke="#ffffff50" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#6366f1', '#a855f7', '#10b981'][index % 3]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="space-y-4">
            {pendingVisitors.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/20">
                    <CheckCircle size={48} className="text-green-500/50 mx-auto mb-4" />
                    <p className="text-white/50">No pending approvals.</p>
                </div>
            ) : (
                pendingVisitors.map(visitor => (
                    <React.Fragment key={visitor.id}>
                        <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-white">{visitor.name}</h3>
                                    <StatusBadge status={visitor.status} />
                                </div>
                                <p className="text-white/60 text-sm mt-1">{visitor.purpose} • {visitor.visitDate}</p>
                                <p className="text-white/40 text-xs mt-1">Transport: {visitor.transportMode} {visitor.licensePlate && `(${visitor.licensePlate})`}</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button 
                                    variant="secondary" 
                                    className="flex-1 md:flex-none bg-red-500/10 hover:bg-red-500/30 text-red-200 border-red-500/20"
                                    onClick={() => updateVisitorStatus(visitor.id, VisitorStatus.REJECTED, 'Did not meet criteria')}
                                >
                                    <XCircle size={18} className="mr-2 inline" /> Reject
                                </Button>
                                <Button 
                                    className="flex-1 md:flex-none bg-green-500 hover:bg-green-600"
                                    onClick={() => updateVisitorStatus(visitor.id, VisitorStatus.APPROVED)}
                                >
                                    <CheckCircle size={18} className="mr-2 inline" /> Approve
                                </Button>
                            </div>
                        </GlassCard>
                    </React.Fragment>
                ))
            )}
        </div>
      )}

      {activeTab === 'logs' && (
        <GlassCard>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white/70">
                    <thead className="text-white border-b border-white/10 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-3">Time</th>
                            <th className="p-3">Visitor</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Location</th>
                            <th className="p-3">Method</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-3 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                <td className="p-3 font-medium text-white">{log.visitorName}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                        log.action === 'ENTRY' ? 'bg-green-500/20 text-green-300' :
                                        log.action === 'EXIT' ? 'bg-orange-500/20 text-orange-300' :
                                        'bg-red-500/20 text-red-300'
                                    }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-3">{log.location}</td>
                                <td className="p-3 opacity-70">{log.method}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
      )}
    </div>
  );
};
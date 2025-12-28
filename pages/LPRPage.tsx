
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { useStore } from '../store';
import { GlassCard, Button, LoadingOverlay, Toast, Spinner, StatusBadge, ConfirmModal } from '../components/GlassComponents';
import { Visitor, VisitorStatus, TransportMode, LPRLog, UserRole } from '../types';
import { ArrowLeft, Camera, Scan, Car, ShieldCheck, AlertCircle, Ban, RefreshCw, UserCheck, Briefcase, Check, Search, Trash2, ListFilter, Info, MessageSquare, ChevronDown, LogOut, History, X, Phone, User, Clock, ShieldAlert, ExternalLink, Activity, Sparkles, TrendingUp, LogIn, LogOut as LogOutIcon } from 'lucide-react';

const LPR_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    plate: { type: Type.STRING, description: "The license plate number or 'NONE'" },
    make: { type: Type.STRING, description: "The vehicle brand/make or 'UNKNOWN'" },
    model: { type: Type.STRING, description: "The specific model of the vehicle or 'UNKNOWN'" },
    confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 100" }
  },
  required: ['plate', 'make', 'model', 'confidence']
};

const ScanDetailModal = ({ log, onClose, visitors, blacklist }: { log: LPRLog | null, onClose: () => void, visitors: Visitor[], blacklist: any[] }) => {
  if (!log) return null;

  const visitorMatch = log.visitorId ? visitors.find(v => v.id === log.visitorId) : null;
  const blacklistMatch = log.status === 'Blacklisted' ? blacklist.find(b => b.licensePlate?.toUpperCase().replace(/[^A-Z0-9]/g, '') === log.plate) : null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-md w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-[#121217] border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col relative animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="p-8 pb-4 text-center">
          <div className="w-full aspect-video rounded-3xl overflow-hidden mb-6 bg-black border border-white/10 shadow-inner">
            <img src={log.thumbnail} alt="Scan Snapshot" className="w-full h-full object-cover" />
          </div>
          <div className="bg-white text-black px-5 py-2 rounded-xl font-mono font-black text-2xl tracking-widest inline-block mb-4 shadow-[0_8px_16px_rgba(255,255,255,0.2)]">
            {log.plate}
          </div>
          <h2 className="text-2xl font-black text-white">{log.status}</h2>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            TIMESTAMP: {new Date(log.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="p-8 pt-4 space-y-6">
          <div className={`p-5 rounded-3xl border flex items-center gap-5 transition-all ${
            log.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
            log.status === 'Rejected' || log.status === 'Blacklisted' ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]' :
            log.status === 'Pending' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.1)]' :
            'bg-white/5 border-white/10 text-white/40'
          }`}>
             {log.status === 'Approved' ? <ShieldCheck size={28} /> : log.status === 'Pending' ? <RefreshCw className="animate-spin-slow" size={28} /> : <ShieldAlert size={28} />}
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5">Terminal Action ({log.mode})</p>
                <p className="text-lg font-black leading-none">
                  {log.status === 'Approved' ? 'Gate will open' : 
                   log.status === 'Pending' ? 'Awaiting approval' :
                   log.status === 'Unknown' ? 'No record found' : 'Gate will NOT open'}
                </p>
             </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest px-1">Registry Data</h3>
            <div className="bg-[#1E1E2E]/50 border border-white/5 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 border border-white/5"><User size={18} /></div>
                 <div>
                   <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Requestor</p>
                   <p className="text-sm font-bold text-white/90">{log.requestorName || 'UNIDENTIFIED'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 border border-white/5"><Phone size={18} /></div>
                 <div>
                   <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Contact</p>
                   <p className="text-sm font-mono font-bold text-white/90">{log.phoneNumber || 'N/A'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 border border-white/5"><Car size={18} /></div>
                 <div>
                   <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Vehicle Intel</p>
                   <p className="text-sm font-bold text-white/90 uppercase">{log.make} {log.model}</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-1">Movement Tracking</h3>
            <div className="bg-white/5 border border-white/5 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Date/Time Entry</p>
                    <p className="text-sm font-bold text-emerald-400">
                      {visitorMatch?.timeIn ? new Date(visitorMatch.timeIn).toLocaleString() : 'Not recorded'}
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Date/Time Exit</p>
                    <p className="text-sm font-bold text-red-400">
                      {visitorMatch?.timeOut ? new Date(visitorMatch.timeOut).toLocaleString() : 'Not recorded'}
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {log.status === 'Blacklisted' && blacklistMatch && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1">Security Alert</h3>
              <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-5">
                 <p className="text-sm text-red-200/70 italic leading-relaxed mb-4">"{blacklistMatch.reason}"</p>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Added By</p>
                      <p className="text-[10px] font-bold text-white/60">{blacklistMatch.createdBy}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Banned On</p>
                      <p className="text-[10px] font-bold text-white/60">{new Date(blacklistMatch.timestamp).toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-8 pt-0">
           <Button variant="secondary" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px]" onClick={onClose}>
             Close Details
           </Button>
        </div>
      </div>
    </div>
  );
};

export const LPRDetectionPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { visitors, checkBlacklist, blacklist, lprLogs, addLPRLog, clearLPRLogs, updateVisitor, currentUser, logout } = useStore();
  
  const currentView = searchParams.get('view') || 'scanner';
  const [lprMode, setLprMode] = useState<'ENTRY' | 'EXIT'>('ENTRY');

  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<LPRLog | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastScanTime = useRef<number>(0);

  useEffect(() => {
    if (!currentUser || currentUser.role !== UserRole.LPR_READER) {
      navigate('/staff/login');
    }
  }, [currentUser, navigate]);

  const startCamera = async () => {
    if (currentView !== 'scanner') return;
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (currentView === 'scanner') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [currentView]);

  const handleDetect = async () => {
    if (!videoRef.current || !canvasRef.current || detecting) return;

    setDetecting(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: "Identify the vehicle and license plate." }
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: LPR_SCHEMA
        }
      });

      const result = JSON.parse(response.text || '{}');
      const plate = result.plate?.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'NONE';

      if (plate !== 'NONE' && plate.length >= 3) {
        const blacklisted = checkBlacklist(undefined, plate, undefined);
        const match = visitors.find(v => 
          v.transportMode === TransportMode.CAR && 
          v.licensePlate?.toUpperCase().replace(/[^A-Z0-9]/g, '') === plate
        );

        let status: LPRLog['status'] = 'Unknown';
        if (blacklisted) status = 'Blacklisted';
        else if (match) {
          if (match.status === VisitorStatus.REJECTED) status = 'Rejected';
          else if (match.status === VisitorStatus.APPROVED) status = 'Approved';
          else status = 'Pending';
        }

        const now = new Date().toISOString();
        if (status === 'Approved' && match) {
          if (lprMode === 'ENTRY') {
             updateVisitor(match.id, { timeIn: now });
          } else {
             updateVisitor(match.id, { timeOut: now });
          }
        }

        addLPRLog({
          plate,
          make: result.make || 'UNKNOWN',
          model: result.model || 'UNKNOWN',
          confidence: result.confidence || 0,
          thumbnail: canvas.toDataURL('image/jpeg', 0.5),
          status,
          mode: lprMode,
          visitorId: match?.id,
          requestorName: match?.name || (blacklisted ? blacklisted.name : 'UNIDENTIFIED'),
          phoneNumber: match?.contact || (blacklisted ? blacklisted.phone : 'N/A')
        });
      }
    } catch (err) {
      console.error("LPR AI Error:", err);
    } finally {
      setDetecting(false);
      lastScanTime.current = Date.now();
    }
  };

  useEffect(() => {
    if (!autoScan || !cameraActive || currentView !== 'scanner') return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastScanTime.current > 6000 && !detecting) {
        handleDetect();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [autoScan, cameraActive, detecting, currentView]);

  const analytics = useMemo(() => {
    const logs = lprLogs.filter(l => l.mode === lprMode);
    const today = new Date().toDateString();
    const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === today);
    
    return {
      total: todayLogs.length,
      approved: todayLogs.filter(l => l.status === 'Approved').length,
      rejected: todayLogs.filter(l => l.status === 'Rejected').length,
      blacklisted: todayLogs.filter(l => l.status === 'Blacklisted').length,
      pending: todayLogs.filter(l => l.status === 'Pending').length,
      unknown: todayLogs.filter(l => l.status === 'Unknown').length,
      avgConf: todayLogs.length > 0 ? Math.round(todayLogs.reduce((a, b) => a + b.confidence, 0) / todayLogs.length) : 0
    };
  }, [lprLogs, lprMode]);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const logs = lprLogs.filter(l => l.mode === lprMode);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize today's ${lprMode.toLowerCase()} LPR scan activity for the building security team. 
        Data: ${JSON.stringify(logs.map(l => ({ plate: l.plate, status: l.status, timestamp: l.timestamp })))}
        Keep it professional and highlight any rejected or blacklisted attempts.`
      });
      setAiSummary(response.text || "Summary unavailable.");
    } catch (error) {
      setAiSummary("Error generating summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const filteredLogs = useMemo(() => {
    let base = [...lprLogs].reverse();
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      base = base.filter(l => 
        l.plate.toLowerCase().includes(q) || 
        l.requestorName?.toLowerCase().includes(q)
      );
    }
    return base;
  }, [lprLogs, searchQuery]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen text-white flex flex-col pb-32">
      <Toast show={toast.show} message={toast.message} onHide={() => setToast({ ...toast, show: false })} />
      <ScanDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} visitors={visitors} blacklist={blacklist} />
      <ConfirmModal 
        show={showLogoutConfirm}
        title="Terminal Logout"
        message="Are you sure you want to exit the LPR terminal?"
        onConfirm={logout}
        onCancel={() => setShowLogoutConfirm(false)}
        confirmText="Logout"
      />
      
      {/* Header */}
      <div className="p-6 pb-8 flex items-center justify-between sticky top-0 z-50 bg-[#050508]/60 backdrop-blur-2xl border-b border-white/5">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
             <Scan size={26} />
           </div>
           <div>
             <h1 className="text-xl font-black text-white leading-tight">LPR Terminal</h1>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80">
               Mode: {lprMode}
             </p>
           </div>
         </div>
         <button onClick={() => setShowLogoutConfirm(true)} className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all active:scale-90">
           <LogOut size={22} />
         </button>
      </div>

      <div className="max-w-2xl mx-auto w-full px-5 space-y-8 mt-8">
        
        {/* Mode Selector */}
        <div className="flex bg-[#1E1E2E] p-1.5 rounded-3xl border border-white/5 shadow-2xl">
           <button 
             onClick={() => setLprMode('ENTRY')}
             className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${lprMode === 'ENTRY' ? 'bg-blue-600 text-white shadow-xl' : 'text-white/30 hover:text-white/60'}`}
           >
             <LogIn size={18} /> Entry LPR
           </button>
           <button 
             onClick={() => setLprMode('EXIT')}
             className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${lprMode === 'EXIT' ? 'bg-indigo-600 text-white shadow-xl' : 'text-white/30 hover:text-white/60'}`}
           >
             <LogOutIcon size={18} /> Exit LPR
           </button>
        </div>

        {currentView === 'scanner' ? (
          <div className="animate-in fade-in slide-in-from-right-6 duration-700 space-y-8">
            {/* Mode-Specific Analytics */}
            <section className="grid grid-cols-3 gap-3">
              {[
                { label: `${lprMode} Today`, count: analytics.total, icon: Activity },
                { label: 'Security Hits', count: analytics.blacklisted + analytics.rejected, icon: ShieldAlert, color: 'text-red-400' },
                { label: 'AI Quality', count: `${analytics.avgConf}%`, icon: ShieldCheck, color: 'text-emerald-400' }
              ].map((stat, i) => (
                <div key={i} className={`bg-[#1E1E2E]/80 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden group`}>
                   <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1 z-10 relative">{stat.label}</p>
                   <p className={`text-2xl font-black z-10 relative ${stat.color || 'text-white'}`}>{stat.count}</p>
                </div>
              ))}
            </section>

            {/* Summarize Today (Gemini AI) */}
            <section>
               <GlassCard className="!p-6 !bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <Sparkles size={18} className="text-blue-400" />
                       <h3 className="text-xs font-black uppercase tracking-widest text-white/80">Summarize Today's {lprMode === 'ENTRY' ? 'Entries' : 'Exits'}</h3>
                    </div>
                    <Button 
                      variant="outline" 
                      className="!py-2 !px-4 text-[9px] font-black uppercase tracking-widest h-10"
                      onClick={handleSummarize}
                      loading={isSummarizing}
                    >
                      {aiSummary ? 'Regenerate' : 'Generate'}
                    </Button>
                  </div>
                  {aiSummary && (
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 animate-in slide-in-from-top-2">
                      <p className="text-[11px] leading-relaxed text-white/70 italic">
                        {aiSummary}
                      </p>
                    </div>
                  )}
               </GlassCard>
            </section>

            {/* Camera Viewfinder */}
            <section className="space-y-4">
              <div className={`relative group bg-[#000] rounded-[3rem] overflow-hidden aspect-[4/3] border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.8)] ring-1 ${lprMode === 'ENTRY' ? 'ring-blue-500/20' : 'ring-indigo-500/20'}`}>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-90" />
                <canvas ref={canvasRef} className="hidden" />

                <div className="absolute inset-0 pointer-events-none p-10 flex items-center justify-center">
                   <div className="w-full h-full border-2 border-white/5 rounded-[2.5rem] relative">
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5/6 h-2/5 border-2 ${lprMode === 'ENTRY' ? 'border-blue-500/30' : 'border-indigo-500/30'} border-dashed rounded-[2rem] flex items-center justify-center`}>
                         {autoScan && (
                           <div className="bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 animate-pulse">
                              <p className="text-[10px] font-black text-white/80 tracking-[0.3em] uppercase">Watching {lprMode}</p>
                           </div>
                         )}
                      </div>
                      <div className={`absolute top-0 left-0 w-full h-0.5 ${lprMode === 'ENTRY' ? 'bg-blue-500/10' : 'bg-indigo-500/10'} scanner-line`}></div>
                   </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
                  <button onClick={() => setAutoScan(!autoScan)} className={`h-16 w-16 rounded-[1.5rem] border transition-all duration-300 flex items-center justify-center shadow-2xl ${autoScan ? 'bg-white/20 border-white/50 text-white' : 'bg-black/80 border-white/10 text-white/20'}`}>
                    <RefreshCw size={24} className={autoScan ? 'animate-spin-slow' : ''} />
                  </button>
                  <button onClick={handleDetect} disabled={detecting} className={`flex-1 h-16 ${lprMode === 'ENTRY' ? 'bg-blue-600' : 'bg-indigo-600'} text-white rounded-[1.5rem] flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50 transition-all text-sm font-black uppercase tracking-widest`}>
                    {detecting ? <Spinner size={20} className="!text-white" /> : <Camera size={22} />}
                    <span>{detecting ? 'Analyzing...' : 'Manual Scan'}</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-6 duration-700 space-y-6">
            <section className="space-y-6">
              <div className="flex items-center justify-between px-1">
                 <div className="flex items-center gap-3">
                   <History size={24} className="text-blue-500" />
                   <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/80">LPR Registry Logs</h2>
                 </div>
                 <button onClick={clearLPRLogs} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white/20 hover:text-red-400 transition-all uppercase tracking-widest flex items-center gap-2">
                   <Trash2 size={14} /> Wipe Data
                 </button>
              </div>

              <div className="relative">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                <input 
                  type="text" 
                  placeholder="Search plates or requestors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1E1E2E] border border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-sm text-white focus:outline-none transition-all placeholder:text-white/20 shadow-2xl"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredLogs.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center bg-[#1E1E2E]/30 rounded-[3rem] border border-dashed border-white/10 opacity-40">
                    <Scan size={64} className="text-white/20 mb-4" />
                    <p className="text-xs font-black uppercase tracking-[0.2em]">No logs recorded</p>
                  </div>
                ) : (
                  filteredLogs.map(log => {
                    const isApproved = log.status === 'Approved';
                    const isRed = log.status === 'Rejected' || log.status === 'Blacklisted';
                    const isAmber = log.status === 'Pending';
                    const isEntry = log.mode === 'ENTRY';

                    return (
                      <div 
                        key={log.id} 
                        onClick={() => setSelectedLog(log)}
                        className={`group relative overflow-hidden rounded-[2.5rem] border transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer flex p-5 gap-5 shadow-2xl ${
                          isApproved ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-emerald-500/5' :
                          isRed ? 'bg-red-500/[0.03] border-red-500/20 shadow-red-500/5' :
                          isAmber ? 'bg-orange-500/[0.03] border-orange-500/20 shadow-orange-500/5' :
                          'bg-[#1E1E2E]/80 border-white/5'
                        }`}
                      >
                         <div className="w-28 aspect-video rounded-3xl overflow-hidden bg-black shrink-0 border border-white/10 relative shadow-lg">
                           <img src={log.thumbnail} alt="scan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                           <div className="absolute bottom-2 left-2 right-2">
                             <p className="text-[7px] font-black text-white/80 truncate uppercase tracking-tighter">{log.make} {log.model}</p>
                           </div>
                         </div>

                         <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                           <div className="flex items-start justify-between">
                             <div>
                               <h3 className="bg-white text-black px-3 py-1 rounded-xl font-mono font-black text-base tracking-widest inline-block mb-2 shadow-xl">
                                 {log.plate}
                               </h3>
                               <div className="flex items-center gap-1.5">
                                 <div className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : isRed ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                                 <p className={`text-[10px] font-black uppercase tracking-widest ${
                                   isApproved ? 'text-emerald-400' : 
                                   isRed ? 'text-red-400' : 
                                   isAmber ? 'text-orange-400' : 'text-white/40'
                                 }`}>
                                   {log.status} • <span className="text-[8px] opacity-60">{isEntry ? 'ENTRY SCAN' : 'EXIT SCAN'}</span>
                                 </p>
                               </div>
                               <p className="text-[9px] font-bold text-white/20 uppercase mt-0.5 tracking-tight">
                                  {isApproved ? 'Gate will open' : 
                                   isRed ? 'Gate will NOT open' :
                                   isAmber ? 'Awaiting approval' : 'No record found'}
                               </p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-tight">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                             </div>
                           </div>

                           <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/60">
                                    <User size={12} className="text-blue-500/50" />
                                    <span className="truncate max-w-[100px]">{log.requestorName || 'N/A'}</span>
                                 </div>
                              </div>
                              <div className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
                                 REVIEW <ExternalLink size={10} />
                              </div>
                           </div>
                         </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  );
};

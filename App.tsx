import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { StoreProvider } from './store';
import { VisitorLanding, VisitorForm, VisitorWallet } from './pages/VisitorPages';
import { OperatorDashboard } from './pages/OperatorPages';
import { GuardConsole } from './pages/GuardPages';
import { VisitorType } from './types';
import { Shield, Users, Eye } from 'lucide-react';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isVisitor = location.pathname.startsWith('/visitor');
  const isOperator = location.pathname.startsWith('/operator');
  const isGuard = location.pathname.startsWith('/guard');

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-indigo-500/30 text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-[calc(100vh-80px)]">
        {children}
      </main>

      {/* Role Switcher / Navigation (Sticky Bottom for Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe">
        <div className="max-w-md mx-auto flex justify-around p-3">
          <Link to="/visitor" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isVisitor ? 'text-blue-400 bg-white/10' : 'text-white/40 hover:text-white'}`}>
            <Users size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Visitor</span>
          </Link>
          <Link to="/operator" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isOperator ? 'text-purple-400 bg-white/10' : 'text-white/40 hover:text-white'}`}>
            <Eye size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
          </Link>
          <Link to="/guard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isGuard ? 'text-orange-400 bg-white/10' : 'text-white/40 hover:text-white'}`}>
            <Shield size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Guard</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<VisitorLanding />} />
            
            {/* Visitor Routes */}
            <Route path="/visitor" element={<VisitorLanding />} />
            <Route path="/visitor/adhoc" element={<VisitorForm type={VisitorType.ADHOC} />} />
            <Route path="/visitor/prereg" element={<VisitorForm type={VisitorType.PREREGISTERED} />} />
            <Route path="/visitor/wallet/:id" element={<VisitorWallet />} />
            
            {/* Operator Routes */}
            <Route path="/operator" element={<OperatorDashboard />} />
            
            {/* Guard Routes */}
            <Route path="/guard" element={<GuardConsole />} />
          </Routes>
        </Layout>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
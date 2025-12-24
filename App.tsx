import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { StoreProvider } from './store';
import { VisitorLanding, VisitorForm, VisitorWallet, VisitorStatusCheck } from './pages/VisitorPages';
import { OperatorDashboard } from './pages/OperatorPages';
import { GuardConsole } from './pages/GuardPages';
import { StaffLogin, StaffDashboard, StaffSharePass } from './pages/StaffPages';
import { VisitorType } from './types';
import { Shield, Users, Eye, Search, Home, LayoutDashboard, History, Settings } from 'lucide-react';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isVisitor = location.pathname.startsWith('/visitor');
  const isOperator = location.pathname.startsWith('/operator');
  const isGuard = location.pathname.startsWith('/guard');
  const isStatus = location.pathname === '/visitor/status';
  // Staff pages typically don't have the bottom nav or have a different one, but for simplicity we keep it or hide it.
  // Let's hide bottom nav for Staff pages to give it a "portal" feel, or keep generic home.
  const isStaff = location.pathname.startsWith('/staff');

  return (
    <div className="min-h-screen bg-[#050508] font-sans text-white overflow-x-hidden">
      {/* Darker Dynamic Background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0f172a] to-[#000000]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px]"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-[calc(100vh-80px)]">
        {children}
      </main>

      {/* Role Switcher / Navigation (Sticky Bottom for Mobile) */}
      {!isStaff && (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#121217]/90 backdrop-blur-xl border-t border-white/5 pb-safe rounded-t-3xl">
        <div className="max-w-md mx-auto flex justify-around p-3">
            {/* Using more generic icons to fit the 'Operator Console' look from screenshot, but mapping to existing routes */}
            <Link to="/visitor" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isVisitor && !isStatus ? 'text-blue-500' : 'text-gray-500'}`}>
                <Home size={22} strokeWidth={isVisitor && !isStatus ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link to="/visitor/status" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isStatus ? 'text-blue-500' : 'text-gray-500'}`}>
                <Search size={22} strokeWidth={isStatus ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Status</span>
            </Link>
            <Link to="/operator" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isOperator ? 'text-blue-500' : 'text-gray-500'}`}>
                <LayoutDashboard size={22} strokeWidth={isOperator ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Queue</span>
            </Link>
            <Link to="/guard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isGuard ? 'text-blue-500' : 'text-gray-500'}`}>
                <Shield size={22} strokeWidth={isGuard ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Guard</span>
            </Link>
        </div>
      </nav>
      )}
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
            <Route path="/visitor/status" element={<VisitorStatusCheck />} />
            <Route path="/visitor/wallet/:id" element={<VisitorWallet />} />
            
            {/* Operator Routes */}
            <Route path="/operator" element={<OperatorDashboard />} />
            
            {/* Guard Routes */}
            <Route path="/guard" element={<GuardConsole />} />

            {/* Staff Routes */}
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
            <Route path="/staff/share/:id" element={<StaffSharePass />} />

          </Routes>
        </Layout>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
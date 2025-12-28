
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import { VisitorLanding, VisitorForm, VisitorWallet, VisitorStatusCheck } from './pages/VisitorPages';
import { OperatorDashboard } from './pages/OperatorPages';
import { GuardConsole } from './pages/GuardPages';
import { StaffLogin, StaffDashboard, StaffSharePass } from './pages/StaffPages';
import { VisitorType, UserRole } from './types';
import { Shield, Users, Eye, Search, Home, LayoutDashboard, History, Settings, UserCircle, Briefcase } from 'lucide-react';

const Navigation = () => {
  const { currentUser } = useStore();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (p: string) => path === p || (p !== '/visitor' && path.startsWith(p));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#121217]/90 backdrop-blur-xl border-t border-white/5 pb-safe rounded-t-3xl">
      <div className="max-w-md mx-auto flex justify-around p-3">
          {/* Always Available */}
          <Link to="/visitor" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/visitor') && !path.includes('/status') ? 'text-blue-500' : 'text-gray-500'}`}>
              <Home size={22} />
              <span className="text-[10px] font-medium">Home</span>
          </Link>
          
          <Link to="/visitor/status" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/visitor/status') ? 'text-blue-500' : 'text-gray-500'}`}>
              <Search size={22} />
              <span className="text-[10px] font-medium">Status</span>
          </Link>

          {/* Role Based - STAFF or ADMIN */}
          {currentUser && (
              <Link to="/staff/dashboard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/staff') ? 'text-blue-500' : 'text-gray-500'}`}>
                  <Briefcase size={22} />
                  <span className="text-[10px] font-medium">Tools</span>
              </Link>
          )}

          {/* Role Based - ADMIN Only */}
          {currentUser && currentUser.role === UserRole.ADMIN && (
              <>
                  <Link to="/operator" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/operator') ? 'text-blue-500' : 'text-gray-500'}`}>
                      <LayoutDashboard size={22} />
                      <span className="text-[10px] font-medium">Queue</span>
                  </Link>
                  <Link to="/guard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/guard') ? 'text-blue-500' : 'text-gray-500'}`}>
                      <Shield size={22} />
                      <span className="text-[10px] font-medium">Guard</span>
                  </Link>
              </>
          )}

          {/* Login/Profile Link */}
          {!currentUser && (
              <Link to="/staff/login" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/staff/login') ? 'text-blue-500' : 'text-gray-500'}`}>
                  <UserCircle size={22} />
                  <span className="text-[10px] font-medium">Staff Login</span>
              </Link>
          )}
      </div>
    </nav>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#050508] font-sans text-white overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0f172a] to-[#000000]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px]"></div>
      </div>

      <main className="relative z-10 min-h-screen pb-24">
        {children}
      </main>

      <Navigation />
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
            <Route path="/visitor" element={<VisitorLanding />} />
            <Route path="/visitor/adhoc" element={<VisitorForm type={VisitorType.ADHOC} />} />
            <Route path="/visitor/prereg" element={<VisitorForm type={VisitorType.PREREGISTERED} />} />
            <Route path="/visitor/status" element={<VisitorStatusCheck />} />
            <Route path="/visitor/wallet/:id" element={<VisitorWallet />} />
            <Route path="/operator" element={<OperatorDashboard />} />
            <Route path="/guard" element={<GuardConsole />} />
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

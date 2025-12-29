
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import { ThemeProvider } from './components/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { VisitorLanding, VisitorForm, VisitorWallet, VisitorStatusCheck } from './pages/VisitorPages';
import { OperatorDashboard } from './pages/OperatorPages';
import { GuardConsole } from './pages/GuardPages';
import { StaffLogin, StaffDashboard, StaffSharePass } from './pages/StaffPages';
import { BlacklistPage } from './pages/BlacklistPage';
import { LPRDetectionPage } from './pages/LPRPage';
import { VipList, VipForm } from './pages/VipPages';
import { ChatBot } from './components/ChatBot';
import { VisitorType, UserRole } from './types';
import { Shield, Users, Eye, Search, Home, LayoutDashboard, History, Settings, UserCircle, Briefcase, Ban, Scan, Crown } from 'lucide-react';

const Navigation = () => {
  const { currentUser } = useStore();
  const location = useLocation();
  const path = location.pathname;
  const search = location.search;

  const isActive = (p: string) => path === p || (p !== '/visitor' && path.startsWith(p));
  const isLPRHistory = path === '/lpr' && search.includes('view=history');
  const isLPRHome = path === '/lpr' && !search.includes('view=history');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#121217]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 pb-safe rounded-t-3xl transition-colors duration-300">
      <div className="max-w-md mx-auto flex justify-around p-3">
          
          {/* LPR TERMINAL VIEW */}
          {currentUser && currentUser.role === UserRole.LPR_READER ? (
            <>
                <Link to="/lpr" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isLPRHome ? 'text-blue-500' : 'text-slate-400 dark:text-gray-500'}`}>
                    <Home size={22} />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>
                <Link to="/lpr?view=history" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isLPRHistory ? 'text-blue-500' : 'text-slate-400 dark:text-gray-500'}`}>
                    <History size={22} />
                    <span className="text-[10px] font-medium">History</span>
                </Link>
            </>
          ) : (
            <>
              {/* STANDARD VIEW */}
              <Link to="/visitor" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/visitor') && !path.includes('/status') ? 'text-blue-500' : 'text-slate-400 dark:text-gray-500'}`}>
                  <Home size={22} />
                  <span className="text-[10px] font-medium">Home</span>
              </Link>
              
              <Link to="/visitor/status" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/visitor/status') ? 'text-blue-500' : 'text-slate-400 dark:text-gray-500'}`}>
                  <Search size={22} />
                  <span className="text-[10px] font-medium">Status</span>
              </Link>

              {/* Staff/Admin - VIP Module */}
              {currentUser && (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.STAFF) && (
                  <Link to="/vip" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/vip') ? 'text-amber-500' : 'text-slate-400 dark:text-gray-500'}`}>
                      <Crown size={22} />
                      <span className="text-[10px] font-medium">VIP</span>
                  </Link>
              )}

              {/* Admin Tools */}
              {currentUser && currentUser.role === UserRole.ADMIN && (
                  <>
                      <Link to="/guard" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/guard') ? 'text-blue-500' : 'text-slate-400 dark:text-gray-500'}`}>
                          <Shield size={22} />
                          <span className="text-[10px] font-medium">Guard</span>
                      </Link>
                      <Link to="/blacklist" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/blacklist') ? 'text-red-500' : 'text-slate-400 dark:text-gray-500'}`}>
                          <Ban size={22} />
                          <span className="text-[10px] font-medium">Ban</span>
                      </Link>
                  </>
              )}

              {/* Login/Profile Link */}
              {!currentUser && (
                  <Link to="/staff/login" className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive('/staff/login') ? 'text-blue-500' : 'text-slate-400 dark:text-gray-500'}`}>
                      <UserCircle size={22} />
                      <span className="text-[10px] font-medium">Staff Login</span>
                  </Link>
              )}
            </>
          )}
      </div>
    </nav>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050508] font-sans text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-500">
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-blue-50 to-white dark:from-[#0f172a] dark:to-[#000000] transition-colors duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/20 dark:bg-blue-600/10 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[60%] h-[60%] rounded-full bg-indigo-200/20 dark:bg-indigo-900/10 blur-[120px]"></div>
      </div>

      <main className="relative z-10 min-h-screen pb-24">
        {/* Header with Theme Toggle */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        {children}
      </main>

      <ChatBot />
      <Navigation />
    </div>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <ThemeProvider>
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
              <Route path="/blacklist" element={<BlacklistPage />} />
              <Route path="/staff/login" element={<StaffLogin />} />
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/share/:id" element={<StaffSharePass />} />
              <Route path="/lpr" element={<LPRDetectionPage />} />
              {/* VIP Routes */}
              <Route path="/vip" element={<VipList />} />
              <Route path="/vip/create" element={<VipForm />} />
            </Routes>
          </Layout>
        </HashRouter>
      </ThemeProvider>
    </StoreProvider>
  );
};

export default App;

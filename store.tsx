
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Visitor, AccessLog, VisitorType, TransportMode, VisitorStatus, QRType, User, UserRole, Notification } from './types';

interface StoreContextType {
  visitors: Visitor[];
  logs: AccessLog[];
  notifications: Notification[];
  currentUser: User | null;
  addVisitor: (visitor: Omit<Visitor, 'id' | 'qrType' | 'status'> & { status?: VisitorStatus }) => Visitor;
  updateVisitorStatus: (id: string, status: VisitorStatus, reason?: string) => void;
  updateVisitor: (id: string, updates: Partial<Visitor>) => void;
  logAccess: (log: Omit<AccessLog, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  getVisitorByCode: (code: string) => Visitor | undefined;
  getVisitorByPlate: (plate: string) => Visitor | undefined;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const VALID_USERS = [
  { username: 'admin', password: 'password123', role: UserRole.ADMIN, fullName: 'System Admin' },
  { username: 'staff1', password: 'password123', role: UserRole.STAFF, fullName: 'Luqman Staff' },
  { username: 'guard1', password: 'password123', role: UserRole.ADMIN, fullName: 'Gate Guard (Admin Priv)' },
];

const determineQRType = (type: VisitorType, mode: TransportMode): QRType => {
  if (type === VisitorType.ADHOC) {
    return mode === TransportMode.NON_CAR ? QRType.QR1 : QRType.NONE;
  }
  return mode === TransportMode.CAR ? QRType.QR2 : QRType.QR3;
};

const generateUniqueCode = (existingVisitors: Visitor[]) => {
  let code = '';
  do {
    code = Math.floor(10000 + Math.random() * 90000).toString();
  } while (existingVisitors.some(v => v.id === code));
  return code;
};

const INITIAL_VISITORS: Visitor[] = [
  {
    id: '45892',
    name: 'Alice Walker',
    contact: '+15550101',
    email: 'alice@example.com',
    purpose: 'Business Meeting',
    visitDate: new Date().toISOString(),
    type: VisitorType.PREREGISTERED,
    transportMode: TransportMode.NON_CAR,
    status: VisitorStatus.PENDING,
    qrType: QRType.QR3,
    registeredBy: 'staff1'
  },
  {
    id: '12543',
    name: 'Bob Builder',
    contact: '+15550102',
    purpose: 'Maintenance',
    visitDate: new Date(Date.now() - 3600000).toISOString(),
    type: VisitorType.ADHOC,
    transportMode: TransportMode.CAR,
    licensePlate: 'ABC-999',
    status: VisitorStatus.APPROVED,
    qrType: QRType.NONE,
    timeIn: new Date(Date.now() - 3600000).toISOString(),
    registeredBy: 'SELF'
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vms_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [logs, setLogs] = useState<AccessLog[]>([
    {
       id: 'l-1',
       visitorId: '12543',
       visitorName: 'Bob Builder',
       timestamp: new Date(Date.now() - 3600000).toISOString(),
       action: 'ENTRY',
       location: 'FRONT_GATE',
       method: 'LPR'
    }
  ]);

  const login = async (username: string, pass: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const user = VALID_USERS.find(u => u.username === username && u.password === pass);
    if (user) {
      const sessionUser: User = { username: user.username, role: user.role, fullName: user.fullName };
      setCurrentUser(sessionUser);
      localStorage.setItem('vms_session', JSON.stringify(sessionUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vms_session');
  };

  const addVisitor = (data: Omit<Visitor, 'id' | 'qrType' | 'status'> & { status?: VisitorStatus }) => {
    const isAdhoc = data.type === VisitorType.ADHOC;
    const status = data.status || (isAdhoc ? VisitorStatus.APPROVED : VisitorStatus.PENDING);
    
    const newVisitor: Visitor = {
      ...data,
      id: generateUniqueCode(visitors),
      status: status,
      qrType: determineQRType(data.type, data.transportMode),
      registeredBy: data.registeredBy || 'SELF',
    };
    setVisitors(prev => [newVisitor, ...prev]);
    return newVisitor;
  };

  const updateVisitorStatus = (id: string, status: VisitorStatus, reason?: string) => {
    setVisitors(prev => prev.map(v => {
      if (v.id === id) {
        // Send notification to staff member who registered the visitor
        if (v.registeredBy && v.registeredBy !== 'SELF') {
          const newNotif: Notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            recipient: v.registeredBy,
            message: `Guest update: ${v.name} has been ${status.toLowerCase()}.`,
            visitorId: v.id,
            status: status,
            read: false,
            timestamp: new Date().toISOString()
          };
          setNotifications(curr => [newNotif, ...curr]);
        }
        return { ...v, status, rejectionReason: reason };
      }
      return v;
    }));
  };

  const updateVisitor = (id: string, updates: Partial<Visitor>) => {
    setVisitors(prev => prev.map(v => 
      v.id === id ? { ...v, ...updates } : v
    ));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const logAccess = (logData: Omit<AccessLog, 'id' | 'timestamp'>) => {
    const newLog: AccessLog = {
      ...logData,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev]);

    if (logData.action === 'ENTRY' || logData.action === 'EXIT') {
        setVisitors(prev => prev.map(v => {
            if (v.id === logData.visitorId) {
                if (logData.action === 'ENTRY' && !v.timeIn) {
                    return { ...v, timeIn: new Date().toISOString() };
                }
                if (logData.action === 'EXIT') {
                    return { ...v, timeOut: new Date().toISOString() };
                }
            }
            return v;
        }));
    }
  };

  const getVisitorByCode = (code: string) => visitors.find(v => v.id === code);
  const getVisitorByPlate = (plate: string) => visitors.find(v => v.licensePlate === plate);

  return (
    <StoreContext.Provider value={{ 
        visitors, 
        logs, 
        notifications,
        currentUser,
        addVisitor, 
        updateVisitorStatus, 
        updateVisitor,
        logAccess, 
        markNotificationRead,
        getVisitorByCode, 
        getVisitorByPlate,
        login,
        logout
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

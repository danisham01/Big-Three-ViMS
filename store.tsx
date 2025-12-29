
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Visitor, AccessLog, VisitorType, TransportMode, VisitorStatus, QRType, User, UserRole, Notification, BlacklistRecord, LPRLog, VipRecord, VipType } from './types';

interface StoreContextType {
  visitors: Visitor[];
  logs: AccessLog[];
  notifications: Notification[];
  blacklist: BlacklistRecord[];
  vipRecords: VipRecord[];
  lprLogs: LPRLog[];
  currentUser: User | null;
  addVisitor: (visitor: Omit<Visitor, 'id' | 'qrType' | 'status'> & { status?: VisitorStatus }) => Visitor;
  updateVisitorStatus: (id: string, status: VisitorStatus, reason?: string) => void;
  updateVisitor: (id: string, updates: Partial<Visitor>) => void;
  logAccess: (log: Omit<AccessLog, 'id' | 'timestamp'>) => void;
  addLPRLog: (log: Omit<LPRLog, 'id' | 'timestamp'>) => void;
  clearLPRLogs: () => void;
  markNotificationRead: (id: string) => void;
  getVisitorByCode: (code: string) => Visitor | undefined;
  getVisitorByPlate: (plate: string) => Visitor | undefined;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  addToBlacklist: (record: Omit<BlacklistRecord, 'id' | 'timestamp' | 'status'>) => void;
  removeFromBlacklist: (id: string) => void;
  checkBlacklist: (ic?: string, plate?: string, phone?: string) => BlacklistRecord | undefined;
  // VIP Methods
  addVip: (record: Omit<VipRecord, 'id' | 'createdAt' | 'status'>) => void;
  updateVip: (id: string, updates: Partial<VipRecord>, updatedBy?: string) => void;
  updateVipMovement: (id: string, mode: 'ENTRY' | 'EXIT', timestamp: string) => void;
  deactivateVip: (id: string, updatedBy?: string) => void;
  checkVip: (plate: string) => VipRecord | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const VALID_USERS = [
  { username: 'admin', password: '1', role: UserRole.ADMIN, fullName: 'System Admin' },
  { username: 'staff1', password: '1', role: UserRole.STAFF, fullName: 'Luqman Staff' },
  { username: 'guard1', password: '1', role: UserRole.ADMIN, fullName: 'Gate Guard (Admin Priv)' },
  { username: 'lpr', password: '1', role: UserRole.LPR_READER, fullName: 'LPR Scanning Terminal' },
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

const normalizePlate = (plate?: string) => plate?.toUpperCase().replace(/[^A-Z0-9]/g, '') || '';
const normalizePhone = (phone?: string) => phone?.replace(/[^0-9+]/g, '') || '';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistRecord[]>([]);
  const [lprLogs, setLprLogs] = useState<LPRLog[]>([]);
  // Mock VIP Data
  const [vipRecords, setVipRecords] = useState<VipRecord[]>([
    {
      id: 'vip-001',
      vipType: VipType.VVIP,
      designation: 'Director-General',
      name: 'Datuk Seri Ahmad',
      contact: '+60123456789',
      licensePlate: 'VIP 1',
      vehicleColor: 'Black',
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      autoApprove: true,
      autoOpenGate: true,
      accessPoints: ['ENTRY_LPR', 'EXIT_LPR'],
      reason: 'Official Visit',
      createdBy: 'System',
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    }
  ]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vms_session');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [logs, setLogs] = useState<AccessLog[]>([]);

  const checkBlacklist = (ic?: string, plate?: string, phone?: string) => {
    const normPlate = normalizePlate(plate);
    const normPhone = normalizePhone(phone);

    return blacklist.find(record => {
      if (record.status !== 'ACTIVE') return false;
      
      const icMatch = ic && record.icNumber === ic;
      const plateMatch = normPlate && normalizePlate(record.licensePlate) === normPlate;
      const phoneMatch = normPhone && normalizePhone(record.phone) === normPhone;

      return icMatch || plateMatch || phoneMatch;
    });
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

  // VIP Logic
  const addVip = (record: Omit<VipRecord, 'id' | 'createdAt' | 'status'>) => {
    const newVip: VipRecord = {
      ...record,
      id: `vip-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };
    setVipRecords(prev => [newVip, ...prev]);
  };

  const updateVip = (id: string, updates: Partial<VipRecord>, updatedBy?: string) => {
    setVipRecords(prev => prev.map(v => {
      if (v.id === id) {
        const updatedRecord = { 
          ...v, 
          ...updates, 
          updatedBy: updatedBy || v.updatedBy, 
          updatedAt: new Date().toISOString() 
        };
        // Audit log
        if (updatedBy) {
          logAccess({
            visitorId: id,
            visitorName: v.name,
            action: 'VIP_UPDATE',
            location: 'SYSTEM',
            method: 'SYSTEM',
            details: `VIP updated by ${updatedBy}`
          });
        }
        return updatedRecord;
      }
      return v;
    }));
  };

  const updateVipMovement = (id: string, mode: 'ENTRY' | 'EXIT', timestamp: string) => {
    setVipRecords(prev => prev.map(v => {
      if (v.id === id) {
        if (mode === 'ENTRY') {
          return { ...v, lastEntryTime: timestamp };
        } else {
          return { ...v, lastExitTime: timestamp };
        }
      }
      return v;
    }));
  };

  const deactivateVip = (id: string, updatedBy?: string) => {
    updateVip(id, { status: 'DEACTIVATED' }, updatedBy);
  };

  const checkVip = (plate: string) => {
    const normPlate = normalizePlate(plate);
    const now = new Date();
    
    return vipRecords.find(v => {
      if (v.status !== 'ACTIVE') return false;
      if (normalizePlate(v.licensePlate) !== normPlate) return false;
      
      const start = new Date(v.validFrom);
      const end = new Date(v.validUntil);
      
      return now >= start && now <= end;
    });
  };

  const addToBlacklist = (record: Omit<BlacklistRecord, 'id' | 'timestamp' | 'status'>) => {
    const newRecord: BlacklistRecord = {
      ...record,
      id: `bl-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
    };
    setBlacklist(prev => [newRecord, ...prev]);
  };

  const removeFromBlacklist = (id: string) => {
    setBlacklist(prev => prev.map(r => r.id === id ? { ...r, status: 'UNBANNED' } : r));
  };

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
    // Enforcement: Check Blacklist
    const blacklisted = checkBlacklist(data.icNumber, data.licensePlate, data.contact);
    if (blacklisted) {
      throw new Error(`Access Denied — Blacklisted. Reason: ${blacklisted.reason}`);
    }

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

  const addLPRLog = (logData: Omit<LPRLog, 'id' | 'timestamp'>) => {
    const newLog: LPRLog = {
      ...logData,
      id: `lpr-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setLprLogs(prev => [newLog, ...prev]);
  };

  const clearLPRLogs = () => setLprLogs([]);

  const getVisitorByCode = (code: string) => visitors.find(v => v.id === code);
  const getVisitorByPlate = (plate: string) => visitors.find(v => normalizePlate(v.licensePlate) === normalizePlate(plate));

  return (
    <StoreContext.Provider value={{ 
        visitors, 
        logs, 
        notifications,
        blacklist,
        vipRecords,
        lprLogs,
        currentUser,
        addVisitor, 
        updateVisitorStatus, 
        updateVisitor,
        logAccess,
        addLPRLog,
        clearLPRLogs,
        markNotificationRead,
        getVisitorByCode, 
        getVisitorByPlate,
        login,
        logout,
        addToBlacklist,
        removeFromBlacklist,
        checkBlacklist,
        addVip,
        updateVip,
        updateVipMovement,
        deactivateVip,
        checkVip
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

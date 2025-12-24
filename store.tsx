import React, { createContext, useContext, useState, useEffect } from 'react';
import { Visitor, AccessLog, VisitorType, TransportMode, VisitorStatus, QRType } from './types';

interface StoreContextType {
  visitors: Visitor[];
  logs: AccessLog[];
  addVisitor: (visitor: Omit<Visitor, 'id' | 'qrType' | 'status'> & { status?: VisitorStatus }) => Visitor;
  updateVisitorStatus: (id: string, status: VisitorStatus, reason?: string) => void;
  logAccess: (log: Omit<AccessLog, 'id' | 'timestamp'>) => void;
  getVisitorByCode: (code: string) => Visitor | undefined;
  getVisitorByPlate: (plate: string) => Visitor | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to determine QR Type based on rules
const determineQRType = (type: VisitorType, mode: TransportMode): QRType => {
  if (type === VisitorType.ADHOC) {
    return mode === TransportMode.NON_CAR ? QRType.QR1 : QRType.NONE;
  }
  // Preregistered
  return mode === TransportMode.CAR ? QRType.QR2 : QRType.QR3;
};

// Helper to generate 5-digit unique code
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
    registeredBy: 'SELF'
  },
  {
    id: '12543',
    name: 'Bob Builder',
    contact: '+15550102',
    purpose: 'Maintenance',
    visitDate: new Date().toISOString(),
    type: VisitorType.ADHOC,
    transportMode: TransportMode.CAR,
    licensePlate: 'ABC-999',
    status: VisitorStatus.APPROVED,
    qrType: QRType.NONE,
    timeIn: new Date(Date.now() - 3600000).toISOString(), // Entered 1 hour ago
    registeredBy: 'SELF'
  },
  {
    id: '98765',
    name: 'Charlie Chef',
    contact: '+15550103',
    purpose: 'Catering',
    visitDate: new Date().toISOString(),
    type: VisitorType.PREREGISTERED,
    transportMode: TransportMode.CAR,
    licensePlate: 'FOOD-1',
    status: VisitorStatus.APPROVED,
    qrType: QRType.QR2,
    registeredBy: 'STAFF'
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
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

  const addVisitor = (data: Omit<Visitor, 'id' | 'qrType' | 'status'> & { status?: VisitorStatus }) => {
    const isAdhoc = data.type === VisitorType.ADHOC;
    // If status is provided, use it, otherwise default logic
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
    setVisitors(prev => prev.map(v => 
      v.id === id ? { ...v, status, rejectionReason: reason } : v
    ));
  };

  const logAccess = (logData: Omit<AccessLog, 'id' | 'timestamp'>) => {
    const newLog: AccessLog = {
      ...logData,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev]);

    // Update visitor time-in/time-out
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
    <StoreContext.Provider value={{ visitors, logs, addVisitor, updateVisitorStatus, logAccess, getVisitorByCode, getVisitorByPlate }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
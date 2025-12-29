
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
  addVisitor: (visitor: Omit<Visitor, 'id' | 'qrType' | 'status' | 'createdAt'> & { status?: VisitorStatus }) => Visitor;
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

const determineQRType = (mode: TransportMode, purpose: string): QRType => {
  const isServiceOrPublic = [
    'E-Hailing (Driver)', 
    'Food Services', 
    'Courier Services', 
    'Garbage Truck Services', 
    'Safeguard', 
    'Public'
  ].includes(purpose);
  
  if (mode === TransportMode.CAR) {
      if (isServiceOrPublic) return QRType.NONE;
      return QRType.QR2; 
  } else {
      if (isServiceOrPublic) return QRType.QR1;
      return QRType.QR3; 
  }
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
  // --- EXTENSIVE MOCK DATA ---
  const now = new Date();
  
  const initialVisitors: Visitor[] = [
    // --- OVERSTAY DEMO CASES ---
    {
      id: '99001',
      name: 'James (Overstay Demo)',
      contact: '+6011-9998881',
      purpose: 'Courier Services',
      dropOffArea: 'Loading Dock 4',
      visitDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      endDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),   // 1 hour ago (EXPIRED)
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.CAR,
      licensePlate: 'VMS 101',
      status: VisitorStatus.APPROVED,
      qrType: QRType.NONE,
      timeIn: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), // Entered 3.5 hours ago
      registeredBy: 'staff1',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '99002',
      name: 'Sarah (Critical Overstay)',
      contact: '+6011-7776662',
      purpose: 'Public',
      specifiedLocation: 'Balai Islam',
      visitDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),   // 1 day ago (EXPIRED)
      type: VisitorType.ADHOC,
      transportMode: TransportMode.NON_CAR,
      status: VisitorStatus.APPROVED,
      qrType: QRType.QR1,
      timeIn: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(), // Entered 47 hours ago
      registeredBy: 'SELF',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    },

    // --- STAFF INVITE CATEGORY ---
    {
      id: '22001',
      name: 'Staff Invite - Food (Car - No QR)',
      contact: '+6012-1110001',
      purpose: 'Food Services',
      dropOffArea: 'Lobby A',
      visitDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.CAR,
      licensePlate: 'ABC 1234',
      status: VisitorStatus.APPROVED,
      qrType: QRType.NONE,
      registeredBy: 'staff1',
      createdAt: new Date().toISOString()
    },
    {
      id: '22002',
      name: 'Staff Invite - Food (Walk - QR1)',
      contact: '+6012-1110002',
      purpose: 'Food Services',
      dropOffArea: 'Lobby B',
      visitDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.NON_CAR,
      status: VisitorStatus.APPROVED,
      qrType: QRType.QR1,
      registeredBy: 'staff1',
      createdAt: new Date().toISOString()
    },
    {
      id: '22003',
      name: 'Staff Invite - Courier (Car - No QR)',
      contact: '+6012-1110003',
      purpose: 'Courier Services',
      dropOffArea: 'Mailroom',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.CAR,
      licensePlate: 'BQA 8899',
      status: VisitorStatus.REJECTED,
      rejectionReason: 'Invalid delivery permit.',
      qrType: QRType.NONE,
      registeredBy: 'staff1',
      createdAt: new Date().toISOString()
    },
    {
      id: '22004',
      name: 'Staff Invite - Garbage (Car - No QR)',
      contact: '+6012-1110004',
      purpose: 'Garbage Truck Services',
      dropOffArea: 'Loading Bay',
      visitDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.CAR,
      licensePlate: 'TRK 777',
      status: VisitorStatus.APPROVED,
      qrType: QRType.NONE,
      timeIn: new Date(Date.now() - 1800000).toISOString(),
      registeredBy: 'staff1',
      createdAt: new Date().toISOString()
    },
    {
      id: '22005',
      name: 'Staff Invite - Safeguard (Car - No QR)',
      contact: '+6012-1110005',
      purpose: 'Safeguard',
      dropOffArea: 'Vault Entrance',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.CAR,
      licensePlate: 'SEC 001',
      status: VisitorStatus.APPROVED,
      qrType: QRType.NONE,
      registeredBy: 'staff1',
      createdAt: new Date().toISOString()
    },
    {
      id: '22006',
      name: 'Staff Invite - Public (Walk - QR1)',
      contact: '+6012-1110006',
      purpose: 'Public',
      specifiedLocation: 'Balai Islam',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.NON_CAR,
      status: VisitorStatus.PENDING,
      qrType: QRType.QR1,
      registeredBy: 'staff1',
      createdAt: new Date().toISOString()
    },
    {
      id: '22007',
      name: 'Staff Invite - External TNB (Car - QR2)',
      contact: '+6012-1110007',
      purpose: 'External TNB Staff',
      staffNumber: 'TNB-99',
      location: 'Substation B',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.CAR,
      licensePlate: 'TNB 55',
      status: VisitorStatus.APPROVED,
      qrType: QRType.QR2,
      registeredBy: 'staff1',
      createdAt: new Date().toISOString()
    },

    // --- PRE-REG (Self-Requested) CATEGORY ---
    {
      id: '33001',
      name: 'Pre Reg - E-Hailing (Car - No QR)',
      contact: '+6017-2220001',
      purpose: 'E-Hailing (Driver)',
      dropOffArea: 'Lobby A',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.CAR,
      licensePlate: 'WXY 123',
      status: VisitorStatus.APPROVED,
      qrType: QRType.NONE,
      registeredBy: 'SELF',
      createdAt: new Date().toISOString()
    },
    {
      id: '33002',
      name: 'Pre Reg - Food (Walk - QR1)',
      contact: '+6017-2220002',
      purpose: 'Food Services',
      dropOffArea: 'Lobby C',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.NON_CAR,
      status: VisitorStatus.APPROVED,
      qrType: QRType.QR1,
      registeredBy: 'SELF',
      createdAt: new Date().toISOString()
    },
    {
      id: '33003',
      name: 'Pre Reg - Courier (Walk - QR1)',
      contact: '+6017-2220003',
      purpose: 'Courier Services',
      dropOffArea: 'Security Desk',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.NON_CAR,
      status: VisitorStatus.REJECTED,
      rejectionReason: 'Package delivery not allowed at this hour.',
      qrType: QRType.QR1,
      registeredBy: 'SELF',
      createdAt: new Date().toISOString()
    },
    {
      id: '33004',
      name: 'Pre Reg - Public (Car - No QR)',
      contact: '+6017-2220004',
      purpose: 'Public',
      specifiedLocation: 'Ruang Komuniti',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.CAR,
      licensePlate: 'VAF 4455',
      status: VisitorStatus.APPROVED,
      qrType: QRType.NONE,
      registeredBy: 'SELF',
      createdAt: new Date().toISOString()
    },
    {
      id: '33005',
      name: 'Pre Reg - Safeguard (Car - No QR)',
      contact: '+6017-2220005',
      purpose: 'Safeguard',
      dropOffArea: 'Gate 4',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.CAR,
      licensePlate: 'SGRD 9',
      status: VisitorStatus.PENDING,
      qrType: QRType.NONE,
      registeredBy: 'SELF',
      createdAt: new Date().toISOString()
    },
    {
      id: '33006',
      name: 'Pre Reg - Garbage (Car - No QR)',
      contact: '+6017-2220006',
      purpose: 'Garbage Truck Services',
      dropOffArea: 'Disposal Zone',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.CAR,
      licensePlate: 'WA 8822 G',
      status: VisitorStatus.APPROVED,
      qrType: QRType.NONE,
      registeredBy: 'SELF',
      createdAt: new Date().toISOString()
    },
    {
      id: '33007',
      name: 'Pre Reg - External Staff (Walk - QR3)',
      contact: '+6017-2220007',
      purpose: 'External Staff',
      staffNumber: 'S-88',
      location: 'Floor 12',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.NON_CAR,
      status: VisitorStatus.APPROVED,
      qrType: QRType.QR3,
      registeredBy: 'SELF',
      createdAt: new Date().toISOString()
    },
    {
      id: '33008',
      name: 'Pre Reg - Public (Walk - QR1)',
      contact: '+6017-2220008',
      purpose: 'Public',
      specifiedLocation: 'Taska',
      visitDate: new Date().toISOString(),
      type: VisitorType.PREREGISTERED,
      transportMode: TransportMode.NON_CAR,
      status: VisitorStatus.APPROVED,
      qrType: QRType.QR1,
      registeredBy: 'SELF',
      createdAt: new Date().toISOString()
    },

    // --- AD HOC (Self - At Gate) ---
    {
      id: '11001',
      name: 'Ad Hoc - E-Hailing (Car - No QR)',
      contact: '+6011-3330001',
      purpose: 'E-Hailing (Driver)',
      dropOffArea: 'Lobby A',
      visitDate: new Date().toISOString(),
      type: VisitorType.ADHOC,
      transportMode: TransportMode.CAR,
      licensePlate: 'PQR 5566',
      status: VisitorStatus.APPROVED,
      qrType: QRType.NONE,
      registeredBy: 'SELF',
      createdAt: new Date().toISOString()
    },
    {
      id: '11002',
      name: 'Ad Hoc - Food (Walk - QR1)',
      contact: '+6011-3330002',
      purpose: 'Food Services',
      dropOffArea: 'Security Post',
      visitDate: new Date().toISOString(),
      type: VisitorType.ADHOC,
      transportMode: TransportMode.NON_CAR,
      status: VisitorStatus.APPROVED,
      qrType: QRType.QR1,
      registeredBy: 'SELF',
      createdAt: new Date().toISOString()
    }
  ];

  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistRecord[]>([]);
  const [lprLogs, setLprLogs] = useState<LPRLog[]>([]);
  
  const [vipRecords, setVipRecords] = useState<VipRecord[]>([
    {
      id: 'vip-001',
      vipType: VipType.VVIP,
      designation: 'Director-General',
      name: 'Datuk Seri Ahmad VVIP',
      contact: '+60123456789',
      licensePlate: 'VIP 1',
      vehicleColor: 'Black',
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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

  const triggerLocalEmailClient = (v: Visitor) => {
    const subject = encodeURIComponent(`[APPROVED] Digital Access Pass for TNB HQ (Ref: ${v.id})`);
    const passUrl = `${window.location.origin}/#/visitor/wallet/${v.id}`;
    
    const initialApplicationDate = new Date(v.createdAt).toLocaleString('en-MY', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const body = encodeURIComponent(`
Hello ${v.name},

Your visit request has been APPROVED. Please find your access details below.

--- REGISTRATION SUMMARY ---
Initially Applied On: ${initialApplicationDate}
Visitor ID: ${v.id}
Status: AUTHORIZED
----------------------------

🔑 YOUR DIGITAL QR IMAGE
Please click the link below to view and save your unique entry QR code. You must show this image to the security guards or scan it at the automated lobby gates for entry:

👉 VIEW QR CODE: ${passUrl}

📍 LOCATION & DIRECTIONS
Address: Tenaga Nasional Berhad, TNB Platinum, 50000 Kuala Lumpur.
Google Maps: https://maps.google.com/?q=TNB+Platinum+HQ

🅿️ PARKING & ENTRY INSTRUCTIONS
- Vehicles: Use the left lane at the Main Gate. The LPR system will scan your plate ${v.licensePlate || 'N/A'}.
- Pedestrians: Proceed to Guard House and scan your QR at the speed gates.

⚠️ DO'S & DONT'S
- [DO] Keep your digital pass with you at all times.
- [DO] Check in with your host immediately upon arrival.
- [DON'T] Take photographs in server zones.
- [DON'T] Smoke within the premises.

We look forward to welcoming you!

Best regards,
Big Three
    `.trim());

    window.location.href = `mailto:${v.email || ''}?subject=${subject}&body=${body}`;
  };

  const triggerRejectionEmailClient = (v: Visitor, reason: string) => {
    const subject = encodeURIComponent(`[REJECTED] Update on your Visit Request - TNB HQ (Ref: ${v.id})`);
    
    const initialApplicationDate = new Date(v.createdAt).toLocaleString('en-MY', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const body = encodeURIComponent(`
Hello ${v.name},

This is an automated notification regarding your recent visit request for TNB HQ.

--- REGISTRATION SUMMARY ---
Initially Applied On: ${initialApplicationDate}
Visitor ID: ${v.id}
Current Status: DECLINED / REJECTED
----------------------------

❌ REASON FOR REJECTION
The security department provided the following reason for this decision:
"${reason || 'No specific reason provided.'}"

WHAT SHOULD YOU DO NOW?
If you believe this rejection is an error or if you wish to appeal this decision, please contact your host directly or reach out to our security helpdesk at +603-1111-1111.

Please do not attempt to enter the premises without a valid digital pass, as access will be denied at all checkpoints.

Best regards,
Big Three
    `.trim());

    window.location.href = `mailto:${v.email || ''}?subject=${subject}&body=${body}`;
  };

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

  const addVisitor = (data: Omit<Visitor, 'id' | 'qrType' | 'status' | 'createdAt'> & { status?: VisitorStatus }) => {
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
      qrType: determineQRType(data.transportMode, data.purpose),
      registeredBy: data.registeredBy || 'SELF',
      createdAt: new Date().toISOString(),
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

        if (status === VisitorStatus.APPROVED) {
           triggerLocalEmailClient(v);
        }

        if (status === VisitorStatus.REJECTED) {
           triggerRejectionEmailClient(v, reason || '');
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

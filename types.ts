
export enum VisitorType {
  ADHOC = 'ADHOC',
  PREREGISTERED = 'PREREGISTERED',
}

export enum TransportMode {
  CAR = 'CAR',
  NON_CAR = 'NON_CAR',
}

export enum VisitorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum QRType {
  QR1 = 'QR1', // Ad-hoc Non-car (Gate only)
  QR2 = 'QR2', // Pre-reg Car (Elevator only)
  QR3 = 'QR3', // Pre-reg Non-car (Gate + Elevator)
  QR4 = 'QR4', // Unused (Formerly Ad-hoc Car)
  NONE = 'NONE', // Ad-hoc Car (LPR Gate Only, No QR)
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  LPR_READER = 'LPR_READER',
}

export enum VipType {
  VVIP = 'VVIP',
  VIP = 'VIP',
}

export const VIP_DESIGNATIONS = [
  'Head of State / Royal',
  'Minister',
  'Deputy Minister',
  'Secretary-General',
  'Director-General',
  'Chief Executive Officer (CEO)',
  'Chief Operating Officer (COO)',
  'Chief Financial Officer (CFO)',
  'Chief Information Officer (CIO)',
  'Board Chairman',
  'Board Member',
  'Senior Advisor',
  'Ambassador / High Commissioner',
  'Chief of Police / Armed Forces Representative',
  'State Director',
  'General Manager',
  'Senior Manager',
  'Project Director',
  'VIP Guest (General)',
  'Other (Specify)'
];

export const VEHICLE_COLORS = [
  'Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Gold', 'Green', 'Brown', 'Yellow', 'Other'
];

export interface VipRecord {
  id: string;
  vipType: VipType;
  designation: string;
  customDesignation?: string;
  name: string;
  contact: string;
  icNumber?: string;
  
  licensePlate: string;
  vehicleColor?: string; // Simplified Vehicle Intel
  
  validFrom: string; // ISO String
  validUntil: string; // ISO String
  
  autoApprove: boolean;
  autoOpenGate: boolean;
  accessPoints: string[]; // ['ENTRY_LPR', 'EXIT_LPR']
  
  reason: string;
  attachment?: string; // base64
  
  // Movement Tracking
  lastEntryTime?: string;
  lastExitTime?: string;
  
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DEACTIVATED';
}

export interface User {
  username: string;
  role: UserRole;
  fullName: string;
}

export interface BlacklistRecord {
  id: string;
  name?: string;
  icNumber?: string;
  licensePlate?: string;
  phone?: string;
  reason: string;
  timestamp: string;
  createdBy: string;
  status: 'ACTIVE' | 'UNBANNED';
}

export interface Visitor {
  id: string;
  name: string;
  contact: string; // Phone number
  email?: string; // Specific email field
  icNumber?: string; // Identification Number
  icPhoto?: string; // Base64 encoded ID photo
  purpose: string;
  // New specific fields based on purpose
  dropOffArea?: string;
  specifiedLocation?: string;
  staffNumber?: string;
  location?: string; 
  
  visitDate: string; // ISO Date string (Start Date)
  endDate?: string; // ISO Date string (End Date)
  supportingDocument?: string; // Base64 encoded supporting document
  
  type: VisitorType;
  transportMode: TransportMode;
  licensePlate?: string;
  vehicleColor?: string; // New field for consistency
  status: VisitorStatus;
  rejectionReason?: string;
  qrType: QRType;
  timeIn?: string;
  timeOut?: string;
  registeredBy?: string; // Stores 'SELF' or the staff username
  createdAt: string; // Application timestamp
}

export interface Notification {
  id: string;
  recipient: string; // username of staff
  message: string;
  visitorId: string;
  status: VisitorStatus;
  read: boolean;
  timestamp: string;
}

export interface AccessLog {
  id: string;
  visitorId: string;
  visitorName: string;
  timestamp: string;
  action: 'ENTRY' | 'EXIT' | 'DENIED' | 'MANUAL_OVERRIDE' | 'BLACKLIST_HIT' | 'VIP_UPDATE';
  location: 'FRONT_GATE' | 'ELEVATOR' | 'SYSTEM';
  method: 'QR' | 'LPR' | 'MANUAL' | 'SYSTEM';
  details?: string;
}

export interface LPRLog {
  id: string;
  plate: string;
  vehicleColor?: string; // Simplified Vehicle Intel
  confidence?: number;
  thumbnail: string;
  timestamp: string;
  mode: 'ENTRY' | 'EXIT';
  status: 'Approved' | 'Rejected' | 'Blacklisted' | 'Pending' | 'Unknown';
  visitorId?: string;
  requestorName?: string;
  phoneNumber?: string;
  // New VIP Fields
  isVip?: boolean;
  vipType?: VipType;
  designation?: string;
}

export interface LprScanRecord {
  plate: string;
  status: 'KNOWN' | 'UNKNOWN';
  entryAt?: string;
  exitAt?: string;
  attemptedAt?: string;
  outcome?: 'PASSED' | 'BLOCKED' | 'UNKNOWN' | 'HOLD';
  reason?: string;
  gate?: 'ENTRY' | 'EXIT';
  lastSeenAt: string;
}

export interface Stats {
  totalVisitors: number;
  currentlyInside: number;
  pendingApprovals: number;
}

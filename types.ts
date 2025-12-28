
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
}

export interface User {
  username: string;
  role: UserRole;
  fullName: string;
}

export interface Visitor {
  id: string;
  name: string;
  contact: string; // Phone number
  email?: string; // Specific email field
  icNumber?: string; // Identification Number
  icPhoto?: string; // Base64 encoded ID photo
  purpose: string;
  visitDate: string; // ISO Date string (Start Date)
  endDate?: string; // ISO Date string (End Date)
  type: VisitorType;
  transportMode: TransportMode;
  licensePlate?: string;
  status: VisitorStatus;
  rejectionReason?: string;
  qrType: QRType;
  timeIn?: string;
  timeOut?: string;
  registeredBy?: string; // Stores 'SELF' or the staff username
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
  action: 'ENTRY' | 'EXIT' | 'DENIED' | 'MANUAL_OVERRIDE';
  location: 'FRONT_GATE' | 'ELEVATOR';
  method: 'QR' | 'LPR' | 'MANUAL';
  details?: string;
}

export interface Stats {
  totalVisitors: number;
  currentlyInside: number;
  pendingApprovals: number;
}

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
  NONE = 'NONE', // Ad-hoc Car (No QR, LPR only)
}

export interface Visitor {
  id: string;
  name: string;
  contact: string;
  purpose: string;
  visitDate: string; // ISO Date string
  type: VisitorType;
  transportMode: TransportMode;
  licensePlate?: string;
  status: VisitorStatus;
  rejectionReason?: string;
  qrType: QRType;
  timeIn?: string;
  timeOut?: string;
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

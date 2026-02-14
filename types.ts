export enum CaseStatus {
  OPEN = 'Open',
  CLOSED = 'Closed',
  PENDING = 'Pending',
  APPEAL = 'On Appeal'
}

export enum TaskPriority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'Individual' | 'Corporate';
  status: 'Active' | 'Inactive';
  lastContact: string;
}

export interface CaseHearing {
  id: string;
  date: string;
  purpose: string;
  nextHearingDate: string;
  notes: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string; // Derived from First Party vs Opposite Party
  clientId: string;
  clientName: string; // Denormalized for display
  court: string;
  type: string;
  status: CaseStatus;
  nextHearing: string;
  judge?: string;

  // Detailed fields from screenshot
  registerDate?: string;
  firstParty?: string;
  oppositeParty?: string;
  startYear?: string;
  caseStudy?: string;
  policeStation?: string;
  cnrNumber?: string;

  workplace?: string; // Added workplace field

  courtType?: string; // District, High, Supreme, Other
  courtName?: string;
  courtNumber?: string;
  actSection?: string;
  firNumber?: string;

  isActive?: boolean;

  relatedCaseNumber?: string;
  otherRequirements?: string;
  notes?: string;
  totalFees?: string;
  isDisposed?: boolean;

  hearingHistory?: CaseHearing[];
}

export interface Task {
  id: string;
  title: string;
  caseId?: string;
  clientId?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee: string;
  workplace?: string;
}

export interface LegalDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  caseId?: string;
  clientId?: string;
  tags: string[];
  content?: string;
  font?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Advocate' | 'Staff';
  email: string;
}
import { Case, CaseStatus, Client, LegalDocument, Task, TaskPriority, TaskStatus } from "./types";

export const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Rajesh Kumar', email: 'rajesh.k@example.com', phone: '+91 98765 43210', type: 'Individual', status: 'Active', lastContact: '2023-10-25' },
  { id: '2', name: 'TechSolutions Pvt Ltd', email: 'legal@techsolutions.com', phone: '+91 22 1234 5678', type: 'Corporate', status: 'Active', lastContact: '2023-10-24' },
  { id: '3', name: 'Amitabh Verma', email: 'a.verma@example.com', phone: '+91 99887 76655', type: 'Individual', status: 'Inactive', lastContact: '2023-09-15' },
  { id: '4', name: 'Green Field Estates', email: 'contact@greenfield.in', phone: '+91 11 2233 4455', type: 'Corporate', status: 'Active', lastContact: '2023-10-26' },
];

export const MOCK_CASES: Case[] = [
  { id: '101', caseNumber: 'CIV/2023/452', title: 'Kumar vs. State of MH', clientId: '1', clientName: 'Rajesh Kumar', court: 'Bombay High Court', type: 'Civil Litigation', status: CaseStatus.OPEN, nextHearing: '2023-11-15', workplace: 'Other Places' },
  { id: '102', caseNumber: 'COM/2023/889', title: 'TechSolutions vs. Vendor Corp', clientId: '2', clientName: 'TechSolutions Pvt Ltd', court: 'NCLT Mumbai', type: 'Corporate Dispute', status: CaseStatus.PENDING, nextHearing: '2023-11-20', workplace: 'Mati court' },
  { id: '103', caseNumber: 'FAM/2022/112', title: 'Verma Divorce Petition', clientId: '3', clientName: 'Amitabh Verma', court: 'Family Court Bandra', type: 'Family Law', status: CaseStatus.CLOSED, nextHearing: '-', workplace: 'Kanpur Court' },
  { id: '104', caseNumber: 'RERA/2023/005', title: 'Green Field Compliance', clientId: '4', clientName: 'Green Field Estates', court: 'MahaRERA', type: 'Real Estate', status: CaseStatus.OPEN, nextHearing: '2023-11-05', workplace: 'Ghatampur Court' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'File Affidavit for Kumar Case', caseId: '101', dueDate: '2023-11-10', priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS, assignee: 'Adv. Sharma', workplace: 'Other Places' },
  { id: 't2', title: 'Client Meeting - TechSolutions', caseId: '102', dueDate: '2023-11-12', priority: TaskPriority.MEDIUM, status: TaskStatus.TODO, assignee: 'Adv. Sharma', workplace: 'Mati court' },
  { id: 't3', title: 'Draft Notice for Green Field', caseId: '104', dueDate: '2023-11-01', priority: TaskPriority.HIGH, status: TaskStatus.DONE, assignee: 'Para. John', workplace: 'Ghatampur Court' },
  { id: 't4', title: 'Submit Court Fees', caseId: '101', dueDate: '2023-11-14', priority: TaskPriority.LOW, status: TaskStatus.TODO, assignee: 'Staff Admin', workplace: 'Kanpur Court' },
];

export const MOCK_DOCS: LegalDocument[] = [
  { id: 'd1', name: 'Vakilnama_Kumar.pdf', type: 'PDF', size: '1.2 MB', uploadDate: '2023-10-01', caseId: '101', tags: ['Vakilnama', 'Legal'] },
  { id: 'd2', name: 'Evidence_Photos.jpg', type: 'JPG', size: '4.5 MB', uploadDate: '2023-10-15', caseId: '101', tags: ['Evidence'] },
  { id: 'd3', name: 'Contract_Draft_v2.docx', type: 'DOCX', size: '500 KB', uploadDate: '2023-10-20', caseId: '102', tags: ['Draft', 'Contract'] },
  { id: 'd4', name: 'Court_Order_Oct23.pdf', type: 'PDF', size: '2.1 MB', uploadDate: '2023-10-25', caseId: '104', tags: ['Order', 'Important'] },
];

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
  { label: 'Workplace', path: '/workplace', icon: 'MapPin' },
  { label: 'Clients', path: '/clients', icon: 'Users' },
  { label: 'Cases', path: '/cases', icon: 'Briefcase' },
  { label: 'Task Board', path: '/tasks', icon: 'CheckSquare' },
  { label: 'Calendar', path: '/calendar', icon: 'Calendar' },
  { label: 'Documents', path: '/documents', icon: 'FileText' },
  { label: 'Text Editor', path: '/editor', icon: 'FileEdit' },
  { label: 'AI Assistant', path: '/ai-tools', icon: 'Bot' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
];
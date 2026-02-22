import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Client, Case, Task, LegalDocument } from '../types';
import { MOCK_CLIENTS, MOCK_CASES, MOCK_TASKS, MOCK_DOCS } from '../constants';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  isGCalConnected,
  connectGoogleCalendar as gcalConnect,
  clearToken,
  syncCalendarEvent,
  deleteCalendarEvent,
} from '../lib/googleCalendar';

// ─── Context Type ─────────────────────────────────────────────────

interface DataContextType {
  clients: Client[];
  cases: Case[];
  tasks: Task[];
  documents: LegalDocument[];
  loading: boolean;

  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  addCase: (caseItem: Omit<Case, 'id'>) => Promise<void>;
  updateCase: (id: string, caseItem: Partial<Case>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;

  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  downloadDocument: (doc: LegalDocument) => void;

  addDocument: (doc: Omit<LegalDocument, 'id'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // Google Calendar
  gcalConnected: boolean;
  gcalConnecting: boolean;
  gcalError: string | null;
  connectGoogleCalendar: () => Promise<void>;
  disconnectGoogleCalendar: () => void;

  // Supabase status
  supabaseReady: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ─── Helpers: map Supabase snake_case ↔ TypeScript camelCase ──────

function dbToCase(row: any): Case {
  return {
    id: row.id,
    caseNumber: row.case_number,
    title: row.title,
    clientId: row.client_id,
    clientName: row.client_name,
    court: row.court,
    type: row.type,
    status: row.status,
    nextHearing: row.next_hearing,
    judge: row.judge,
    registerDate: row.register_date,
    firstParty: row.first_party,
    oppositeParty: row.opposite_party,
    cnrNumber: row.cnr_number,
    courtType: row.court_type,
    courtName: row.court_name,
    courtNumber: row.court_number,
    actSection: row.act_section,
    firNumber: row.fir_number,
    notes: row.notes,
    totalFees: row.total_fees,
    isDisposed: row.is_disposed,
    hearingHistory: row.hearing_history || [],
    workplace: row.workplace,
    googleCalendarEventId: row.google_calendar_event_id,
  } as any;
}

function caseToDb(c: Partial<Case>): Record<string, any> {
  const row: Record<string, any> = {};
  if (c.caseNumber !== undefined) row.case_number = c.caseNumber;
  if (c.title !== undefined) row.title = c.title;
  if (c.clientId !== undefined) row.client_id = c.clientId;
  if (c.clientName !== undefined) row.client_name = c.clientName;
  if (c.court !== undefined) row.court = c.court;
  if (c.type !== undefined) row.type = c.type;
  if (c.status !== undefined) row.status = c.status;
  if (c.nextHearing !== undefined) row.next_hearing = c.nextHearing;
  if (c.judge !== undefined) row.judge = c.judge;
  if (c.registerDate !== undefined) row.register_date = c.registerDate;
  if (c.firstParty !== undefined) row.first_party = c.firstParty;
  if (c.oppositeParty !== undefined) row.opposite_party = c.oppositeParty;
  if (c.cnrNumber !== undefined) row.cnr_number = c.cnrNumber;
  if (c.courtType !== undefined) row.court_type = c.courtType;
  if (c.courtName !== undefined) row.court_name = c.courtName;
  if (c.courtNumber !== undefined) row.court_number = c.courtNumber;
  if (c.actSection !== undefined) row.act_section = c.actSection;
  if (c.firNumber !== undefined) row.fir_number = c.firNumber;
  if (c.notes !== undefined) row.notes = c.notes;
  if (c.totalFees !== undefined) row.total_fees = c.totalFees;
  if (c.isDisposed !== undefined) row.is_disposed = c.isDisposed;
  if (c.hearingHistory !== undefined) row.hearing_history = c.hearingHistory;
  if (c.workplace !== undefined) row.workplace = c.workplace;
  if ((c as any).googleCalendarEventId !== undefined) row.google_calendar_event_id = (c as any).googleCalendarEventId;
  return row;
}

function dbToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    caseId: row.case_id,
    clientId: row.client_id,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    assignee: row.assignee,
    deadline: row.deadline,
    workingDay: row.working_day,
    workplace: row.workplace,
    googleCalendarEventId: row.google_calendar_event_id,
  } as any;
}

function taskToDb(t: Partial<Task>): Record<string, any> {
  const row: Record<string, any> = {};
  if (t.title !== undefined) row.title = t.title;
  if (t.caseId !== undefined) row.case_id = t.caseId;
  if (t.clientId !== undefined) row.client_id = t.clientId;
  if (t.dueDate !== undefined) row.due_date = t.dueDate;
  if (t.priority !== undefined) row.priority = t.priority;
  if (t.status !== undefined) row.status = t.status;
  if (t.assignee !== undefined) row.assignee = t.assignee;
  if (t.deadline !== undefined) row.deadline = t.deadline;
  if (t.workingDay !== undefined) row.working_day = t.workingDay;
  if (t.workplace !== undefined) row.workplace = t.workplace;
  if ((t as any).googleCalendarEventId !== undefined) row.google_calendar_event_id = (t as any).googleCalendarEventId;
  return row;
}

function dbToClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    type: row.type,
    status: row.status,
    lastContact: row.last_contact,
  };
}

function clientToDb(c: Partial<Client>): Record<string, any> {
  const row: Record<string, any> = {};
  if (c.name !== undefined) row.name = c.name;
  if (c.email !== undefined) row.email = c.email;
  if (c.phone !== undefined) row.phone = c.phone;
  if (c.type !== undefined) row.type = c.type;
  if (c.status !== undefined) row.status = c.status;
  if (c.lastContact !== undefined) row.last_contact = c.lastContact;
  return row;
}

function dbToDoc(row: any): LegalDocument {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    size: row.size,
    uploadDate: row.upload_date,
    caseId: row.case_id,
    clientId: row.client_id,
    tags: row.tags || [],
    content: row.content,
    font: row.font,
  };
}

function docToDb(d: Partial<LegalDocument>): Record<string, any> {
  const row: Record<string, any> = {};
  if (d.name !== undefined) row.name = d.name;
  if (d.type !== undefined) row.type = d.type;
  if (d.size !== undefined) row.size = d.size;
  if (d.uploadDate !== undefined) row.upload_date = d.uploadDate;
  if (d.caseId !== undefined) row.case_id = d.caseId;
  if (d.clientId !== undefined) row.client_id = d.clientId;
  if (d.tags !== undefined) row.tags = d.tags;
  if (d.content !== undefined) row.content = d.content;
  if (d.font !== undefined) row.font = d.font;
  return row;
}

// ─── Provider ────────────────────────────────────────────────────

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [gcalConnected, setGcalConnected] = useState(isGCalConnected());
  const [gcalConnecting, setGcalConnecting] = useState(false);
  const [gcalError, setGcalError] = useState<string | null>(null);

  const supabaseReady = isSupabaseConfigured;

  // ── Load data (Supabase if configured, else localStorage fallback) ──
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (isSupabaseConfigured) {
        try {
          const [{ data: c }, { data: ca }, { data: t }, { data: d }] = await Promise.all([
            supabase.from('clients').select('*').order('created_at'),
            supabase.from('cases').select('*').order('created_at'),
            supabase.from('tasks').select('*').order('created_at'),
            supabase.from('documents').select('*').order('created_at'),
          ]);
          setClients(c ? c.map(dbToClient) : []);
          setCases(ca ? ca.map(dbToCase) : []);
          setTasks(t ? t.map(dbToTask) : []);
          setDocuments(d ? d.map(dbToDoc) : []);
        } catch (err) {
          console.error('Supabase load error:', err);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
      setLoading(false);
    };

    loadData();
  }, []);

  function loadFromLocalStorage() {
    try { setClients(JSON.parse(localStorage.getItem('lexflow_clients') || 'null') || MOCK_CLIENTS); } catch { setClients(MOCK_CLIENTS); }
    try { setCases(JSON.parse(localStorage.getItem('lexflow_cases') || 'null') || MOCK_CASES); } catch { setCases(MOCK_CASES); }
    try { setTasks(JSON.parse(localStorage.getItem('lexflow_tasks') || 'null') || MOCK_TASKS); } catch { setTasks(MOCK_TASKS); }
    try { setDocuments(JSON.parse(localStorage.getItem('lexflow_documents') || 'null') || MOCK_DOCS); } catch { setDocuments(MOCK_DOCS); }
  }

  // ── Google Calendar helpers ───────────────────────────────────────

  /** Auto-sync a hearing date for a case to Google Calendar */
  const syncCaseHearing = useCallback(async (
    caseData: Partial<Case> & { id?: string },
    existingEventId?: string | null
  ): Promise<string | null> => {
    if (!isGCalConnected()) return null;
    const hearingDate = caseData.nextHearing;
    if (!hearingDate || hearingDate === '-') return null;

    try {
      const eventId = await syncCalendarEvent(existingEventId || null, {
        summary: `⚖️ Hearing: ${caseData.title || 'Case Hearing'}`,
        description: [
          caseData.caseNumber ? `Case No: ${caseData.caseNumber}` : '',
          caseData.court ? `Court: ${caseData.court}` : '',
          caseData.clientName ? `Client: ${caseData.clientName}` : '',
          caseData.cnrNumber ? `CNR: ${caseData.cnrNumber}` : '',
          caseData.firstParty && caseData.oppositeParty
            ? `${caseData.firstParty} vs ${caseData.oppositeParty}` : '',
        ].filter(Boolean).join('\n'),
        start: { date: hearingDate },
        end: { date: hearingDate },
        colorId: '9', // blueberry
      });
      return eventId;
    } catch (err) {
      console.warn('Calendar sync failed for case hearing:', err);
      return null;
    }
  }, []);

  /** Auto-sync a task deadline to Google Calendar */
  const syncTaskDeadline = useCallback(async (
    taskData: Partial<Task> & { id?: string },
    existingEventId?: string | null
  ): Promise<string | null> => {
    if (!isGCalConnected()) return null;
    const deadline = taskData.deadline || taskData.dueDate;
    if (!deadline) return null;

    try {
      const priorityIcon = taskData.priority === 'High' ? '🔴' : taskData.priority === 'Medium' ? '🟡' : '🟢';
      const eventId = await syncCalendarEvent(existingEventId || null, {
        summary: `${priorityIcon} Task: ${taskData.title || 'Task'}`,
        description: [
          `Priority: ${taskData.priority || ''}`,
          taskData.assignee ? `Assignee: ${taskData.assignee}` : '',
          taskData.workingDay ? `Working Day: ${taskData.workingDay}` : '',
        ].filter(Boolean).join('\n'),
        start: { date: deadline },
        end: { date: deadline },
        colorId: taskData.priority === 'High' ? '11' : taskData.priority === 'Medium' ? '5' : '2', // tomato / banana / sage
      });
      return eventId;
    } catch (err) {
      console.warn('Calendar sync failed for task:', err);
      return null;
    }
  }, []);

  // ── Google Calendar connect/disconnect ───────────────────────────

  const connectGoogleCalendar = useCallback(async () => {
    setGcalConnecting(true);
    setGcalError(null);
    try {
      await gcalConnect();
      setGcalConnected(true);
    } catch (err: any) {
      setGcalError(err.message || 'Failed to connect Google Calendar');
    } finally {
      setGcalConnecting(false);
    }
  }, []);

  const disconnectGoogleCalendar = useCallback(() => {
    clearToken();
    setGcalConnected(false);
  }, []);

  // ── CLIENT CRUD ──────────────────────────────────────────────────

  const addClient = useCallback(async (client: Omit<Client, 'id'>) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('clients').insert(clientToDb(client)).select().single();
      if (error) throw error;
      setClients(prev => [...prev, dbToClient(data)]);
    } else {
      const newClient = { ...client, id: Date.now().toString() };
      setClients(prev => {
        const updated = [...prev, newClient];
        localStorage.setItem('lexflow_clients', JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  const updateClient = useCallback(async (id: string, data: Partial<Client>) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('clients').update(clientToDb(data)).eq('id', id);
      if (error) throw error;
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    } else {
      setClients(prev => {
        const updated = prev.map(c => c.id === id ? { ...c, ...data } : c);
        localStorage.setItem('lexflow_clients', JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      setClients(prev => prev.filter(c => c.id !== id));
    } else {
      setClients(prev => {
        const updated = prev.filter(c => c.id !== id);
        localStorage.setItem('lexflow_clients', JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  // ── CASE CRUD ────────────────────────────────────────────────────

  const addCase = useCallback(async (caseItem: Omit<Case, 'id'>) => {
    if (isSupabaseConfigured) {
      const dbRow = caseToDb(caseItem);
      const { data, error } = await supabase.from('cases').insert(dbRow).select().single();
      if (error) throw error;

      // Sync hearing to Google Calendar (don't let this block the main flow)
      syncCaseHearing({ ...caseItem }, null).then(async (eventId) => {
        if (eventId) {
          await supabase.from('cases').update({ google_calendar_event_id: eventId }).eq('id', data.id);
          setCases(prev => prev.map(c => c.id === data.id ? { ...c, googleCalendarEventId: eventId } : c));
        }
      }).catch(console.warn);

      setCases(prev => [...prev, dbToCase(data)]);
    } else {
      const newCase = { ...caseItem, id: Date.now().toString() };
      setCases(prev => {
        const updated = [...prev, newCase];
        localStorage.setItem('lexflow_cases', JSON.stringify(updated));
        return updated;
      });
    }
  }, [syncCaseHearing]);

  const updateCase = useCallback(async (id: string, data: Partial<Case>) => {
    const existing = cases.find(c => c.id === id);

    if (isSupabaseConfigured) {
      const dbRow = caseToDb(data);
      const { error } = await supabase.from('cases').update(dbRow).eq('id', id);
      if (error) throw error;

      // Sync hearing if nextHearing changed
      if (data.nextHearing !== undefined) {
        const eventId = await syncCaseHearing(
          { ...existing, ...data },
          (existing as any)?.googleCalendarEventId || null
        );
        if (eventId && eventId !== (existing as any)?.googleCalendarEventId) {
          await supabase.from('cases').update({ google_calendar_event_id: eventId }).eq('id', id);
          data = { ...data, googleCalendarEventId: eventId } as any;
        }
      }

      setCases(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    } else {
      setCases(prev => {
        const updated = prev.map(c => c.id === id ? { ...c, ...data } : c);
        localStorage.setItem('lexflow_cases', JSON.stringify(updated));
        return updated;
      });
    }
  }, [cases, syncCaseHearing]);

  const deleteCase = useCallback(async (id: string) => {
    const existing = cases.find(c => c.id === id);
    const eventId = (existing as any)?.googleCalendarEventId;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('cases').delete().eq('id', id);
      if (error) throw error;
      setCases(prev => prev.filter(c => c.id !== id));
    } else {
      setCases(prev => {
        const updated = prev.filter(c => c.id !== id);
        localStorage.setItem('lexflow_cases', JSON.stringify(updated));
        return updated;
      });
    }

    // Remove from Google Calendar
    if (eventId && isGCalConnected()) {
      deleteCalendarEvent(eventId).catch(console.warn);
    }
  }, [cases]);

  // ── TASK CRUD ────────────────────────────────────────────────────

  const addTask = useCallback(async (task: Omit<Task, 'id'>) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('tasks').insert(taskToDb(task)).select().single();
      if (error) throw error;

      // Sync to Google Calendar (don't let this block)
      syncTaskDeadline({ ...task }, null).then(async (eventId) => {
        if (eventId) {
          await supabase.from('tasks').update({ google_calendar_event_id: eventId }).eq('id', data.id);
          setTasks(prev => prev.map(t => t.id === data.id ? { ...t, googleCalendarEventId: eventId } : t));
        }
      }).catch(console.warn);

      setTasks(prev => [...prev, dbToTask(data)]);
    } else {
      const newTask = { ...task, id: Date.now().toString() };
      setTasks(prev => {
        const updated = [...prev, newTask];
        localStorage.setItem('lexflow_tasks', JSON.stringify(updated));
        return updated;
      });
    }
  }, [syncTaskDeadline]);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const existing = tasks.find(t => t.id === id);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').update(taskToDb(data)).eq('id', id);
      if (error) throw error;

      // Sync if deadline/dueDate changed
      if (data.deadline !== undefined || data.dueDate !== undefined || data.title !== undefined) {
        const eventId = await syncTaskDeadline(
          { ...existing, ...data },
          (existing as any)?.googleCalendarEventId || null
        );
        if (eventId && eventId !== (existing as any)?.googleCalendarEventId) {
          await supabase.from('tasks').update({ google_calendar_event_id: eventId }).eq('id', id);
          data = { ...data, googleCalendarEventId: eventId } as any;
        }
      }

      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    } else {
      setTasks(prev => {
        const updated = prev.map(t => t.id === id ? { ...t, ...data } : t);
        localStorage.setItem('lexflow_tasks', JSON.stringify(updated));
        return updated;
      });
    }
  }, [tasks, syncTaskDeadline]);

  const deleteTask = useCallback(async (id: string) => {
    const existing = tasks.find(t => t.id === id);
    const eventId = (existing as any)?.googleCalendarEventId;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
    } else {
      setTasks(prev => {
        const updated = prev.filter(t => t.id !== id);
        localStorage.setItem('lexflow_tasks', JSON.stringify(updated));
        return updated;
      });
    }

    if (eventId && isGCalConnected()) {
      deleteCalendarEvent(eventId).catch(console.warn);
    }
  }, [tasks]);

  // ── DOCUMENT CRUD ────────────────────────────────────────────────

  const addDocument = useCallback(async (doc: Omit<LegalDocument, 'id'>) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('documents').insert(docToDb(doc)).select().single();
      if (error) throw error;
      setDocuments(prev => [...prev, dbToDoc(data)]);
    } else {
      const newDoc = { ...doc, id: Date.now().toString() };
      setDocuments(prev => {
        const updated = [...prev, newDoc];
        localStorage.setItem('lexflow_documents', JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      setDocuments(prev => prev.filter(d => d.id !== id));
    } else {
      setDocuments(prev => {
        const updated = prev.filter(d => d.id !== id);
        localStorage.setItem('lexflow_documents', JSON.stringify(updated));
        return updated;
      });
    }
  }, []);

  const downloadDocument = useCallback((doc: LegalDocument) => {
    if (!doc.content) {
      alert("This file was uploaded as metadata-only and has no stored content to download. Please use the Editor for downloadable files.");
      return;
    }
    const blob = new Blob([doc.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ── Context Value ────────────────────────────────────────────────

  const value = useMemo(() => ({
    clients, cases, tasks, documents, loading,
    addClient, updateClient, deleteClient,
    addCase, updateCase, deleteCase,
    addTask, updateTask, deleteTask,
    addDocument, deleteDocument, downloadDocument,
    gcalConnected, gcalConnecting, gcalError,
    connectGoogleCalendar, disconnectGoogleCalendar,
    supabaseReady,
  }), [
    clients, cases, tasks, documents, loading,
    addClient, updateClient, deleteClient,
    addCase, updateCase, deleteCase,
    addTask, updateTask, deleteTask,
    addDocument, deleteDocument, downloadDocument,
    gcalConnected, gcalConnecting, gcalError,
    connectGoogleCalendar, disconnectGoogleCalendar,
    supabaseReady,
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
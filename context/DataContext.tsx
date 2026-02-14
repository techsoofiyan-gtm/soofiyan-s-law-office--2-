import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Client, Case, Task, LegalDocument } from '../types';
import { MOCK_CLIENTS, MOCK_CASES, MOCK_TASKS, MOCK_DOCS } from '../constants';

interface DataContextType {
  clients: Client[];
  cases: Case[];
  tasks: Task[];
  documents: LegalDocument[];
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addCase: (caseItem: Omit<Case, 'id'>) => void;
  updateCase: (id: string, caseItem: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addDocument: (doc: Omit<LegalDocument, 'id'>) => void;
  deleteDocument: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage or fallback to MOCKS
  const [clients, setClients] = useState<Client[]>(() => {
    try {
        const saved = localStorage.getItem('lexflow_clients');
        return saved ? JSON.parse(saved) : MOCK_CLIENTS;
    } catch(e) { return MOCK_CLIENTS; }
  });
  
  const [cases, setCases] = useState<Case[]>(() => {
    try {
        const saved = localStorage.getItem('lexflow_cases');
        return saved ? JSON.parse(saved) : MOCK_CASES;
    } catch(e) { return MOCK_CASES; }
  });
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
        const saved = localStorage.getItem('lexflow_tasks');
        return saved ? JSON.parse(saved) : MOCK_TASKS;
    } catch(e) { return MOCK_TASKS; }
  });
  
  const [documents, setDocuments] = useState<LegalDocument[]>(() => {
    try {
        const saved = localStorage.getItem('lexflow_documents');
        return saved ? JSON.parse(saved) : MOCK_DOCS;
    } catch(e) { return MOCK_DOCS; }
  });

  // Persist to localStorage
  useEffect(() => localStorage.setItem('lexflow_clients', JSON.stringify(clients)), [clients]);
  useEffect(() => localStorage.setItem('lexflow_cases', JSON.stringify(cases)), [cases]);
  useEffect(() => localStorage.setItem('lexflow_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('lexflow_documents', JSON.stringify(documents)), [documents]);

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: Date.now().toString() };
    setClients([...clients, newClient]);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const addCase = (caseItem: Omit<Case, 'id'>) => {
    const newCase = { ...caseItem, id: Date.now().toString() };
    setCases([...cases, newCase]);
  };

  const updateCase = (id: string, data: Partial<Case>) => {
    setCases(cases.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCase = (id: string) => {
    setCases(cases.filter(c => c.id !== id));
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: Date.now().toString() };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, data: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addDocument = (doc: Omit<LegalDocument, 'id'>) => {
    const newDoc = { ...doc, id: Date.now().toString() };
    setDocuments([...documents, newDoc]);
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  // Optimization: Memoize the context value
  const value = useMemo(() => ({
    clients, cases, tasks, documents,
    addClient, updateClient, deleteClient,
    addCase, updateCase, deleteCase,
    addTask, updateTask, deleteTask,
    addDocument, deleteDocument
  }), [clients, cases, tasks, documents]);

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
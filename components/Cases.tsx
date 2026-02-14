import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Search, Plus, Gavel, Calendar, MapPin, Filter, Trash2, Edit2, Eye, History, Save, X, ChevronRight, Clock, CheckCircle, Shield, BookOpen } from 'lucide-react';
import { CaseStatus, Case, CaseHearing } from '../types';
import Modal from './Modal';

const WORKPLACES = ["Ghatampur Court", "Mati court", "Kanpur Court", "Other Places"];

const Cases = () => {
  const { cases, clients, addCase, updateCase, deleteCase } = useData();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchTerm(q);
  }, [searchParams]);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  // Add Listing State
  const [showAddListing, setShowAddListing] = useState(false);
  const [newListing, setNewListing] = useState<Partial<CaseHearing>>({
    date: new Date().toISOString().split('T')[0],
    purpose: '',
    nextHearingDate: '',
    notes: ''
  });

  // Case Form State
  const initialFormState = {
    title: '',
    caseNumber: '',
    clientId: '',
    court: '',
    type: 'Civil',
    status: CaseStatus.OPEN,
    nextHearing: '',
    workplace: 'Kanpur Court',
    firstParty: '',
    oppositeParty: '',
    judge: '',
    notes: '',
    actSection: '',
    policeStation: ''
  };
  const [formData, setFormData] = useState<Partial<Case>>(initialFormState);

  // Memoized filter to improve performance with large lists
  const filteredCases = useMemo(() => cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.actSection && c.actSection.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.policeStation && c.policeStation.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [cases, searchTerm, statusFilter]);

  // --- CRUD Handlers ---

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (c: Case) => {
    setEditingId(c.id);
    setFormData({
        title: c.title,
        caseNumber: c.caseNumber,
        clientId: c.clientId,
        court: c.court,
        type: c.type,
        status: c.status,
        nextHearing: c.nextHearing,
        workplace: c.workplace || 'Kanpur Court',
        firstParty: c.firstParty || '',
        oppositeParty: c.oppositeParty || '',
        judge: c.judge || '',
        notes: c.notes || '',
        actSection: c.actSection || '',
        policeStation: c.policeStation || ''
    });
    setIsFormModalOpen(true);
  };

  const handleOpenDetails = (c: Case) => {
    setSelectedCase(c);
    setIsDetailsModalOpen(true);
    setShowAddListing(false);
    setNewListing({
        date: new Date().toISOString().split('T')[0],
        purpose: '',
        nextHearingDate: '',
        notes: ''
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(cl => cl.id === formData.clientId);
    const clientName = client ? client.name : 'Unknown Client';

    if (editingId) {
        updateCase(editingId, { ...formData, clientName });
    } else {
        addCase({ ...formData, clientName } as any);
    }
    setIsFormModalOpen(false);
  };

  // --- Listing History Handlers ---

  const handleAddListing = () => {
    if (!selectedCase) return;

    const listing: CaseHearing = {
        id: Date.now().toString(),
        date: newListing.date || new Date().toISOString().split('T')[0],
        purpose: newListing.purpose || 'Hearing',
        nextHearingDate: newListing.nextHearingDate || '',
        notes: newListing.notes || ''
    };

    const updatedHistory = [...(selectedCase.hearingHistory || []), listing];
    
    // Updates to apply to the case
    const updates: Partial<Case> = {
        hearingHistory: updatedHistory,
    };
    
    // Automatically update the main next hearing date if provided in listing
    if (newListing.nextHearingDate) {
        updates.nextHearing = newListing.nextHearingDate;
    }

    // Save to global state
    updateCase(selectedCase.id, updates);
    
    // Update local state for the modal view
    setSelectedCase({ ...selectedCase, ...updates });
    
    // Reset listing form
    setShowAddListing(false);
    setNewListing({
        date: new Date().toISOString().split('T')[0],
        purpose: '',
        nextHearingDate: '',
        notes: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cases</h1>
          <p className="text-slate-500 mt-1">Manage active court cases and hearings.</p>
        </div>
        <button 
            onClick={handleOpenAdd}
            className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Case
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by case title, number, Acts or client..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select 
                    className="border border-slate-200 rounded-lg text-sm py-2 pl-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value={CaseStatus.OPEN}>Open</option>
                    <option value={CaseStatus.PENDING}>Pending</option>
                    <option value={CaseStatus.CLOSED}>Closed</option>
                </select>
            </div>
        </div>
      </div>

      {/* Case Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.status === CaseStatus.OPEN ? 'bg-green-100 text-green-800' : 
                        c.status === CaseStatus.CLOSED ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                        {c.status}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if(window.confirm('Delete case?')) deleteCase(c.id) }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 line-clamp-1 mb-1" title={c.title}>{c.title}</h3>
                <p className="text-sm text-slate-500 font-mono mb-2">{c.caseNumber}</p>
                
                {c.actSection && (
                    <div className="mb-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 max-w-full truncate" title={c.actSection}>
                            <BookOpen className="w-3 h-3 mr-1 flex-shrink-0" />
                            {c.actSection}
                        </span>
                    </div>
                )}

                <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{c.court}</span>
                    </div>
                    {c.policeStation && (
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-slate-400" />
                            <span className="truncate">{c.policeStation}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Gavel className="w-4 h-4 text-slate-400" />
                        <span>{c.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Next: {c.nextHearing || 'Not scheduled'}</span>
                    </div>
                </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate max-w-[150px]">{c.clientName}</span>
                <button 
                    onClick={() => handleOpenDetails(c)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
          </div>
        ))}
      </div>
      {filteredCases.length === 0 && (
          <div className="text-center py-12 text-slate-500">
              {searchTerm ? `No cases found matching "${searchTerm}"` : "No cases found matching your criteria."}
          </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title={editingId ? "Edit Case" : "Register New Case"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Case Title *</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-std" placeholder="e.g. Smith vs Jones" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Case Number *</label>
                    <input type="text" required value={formData.caseNumber} onChange={e => setFormData({...formData, caseNumber: e.target.value})} className="input-std" placeholder="e.g. CIV/2023/101" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
                    <select required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} className="input-std">
                        <option value="">Select Client</option>
                        {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Workplace *</label>
                    <select required value={formData.workplace} onChange={e => setFormData({...formData, workplace: e.target.value})} className="input-std">
                        {WORKPLACES.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Court Name</label>
                    <input type="text" value={formData.court} onChange={e => setFormData({...formData, court: e.target.value})} className="input-std" placeholder="e.g. District Court Room 4" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Case Type</label>
                    <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="input-std" placeholder="e.g. Civil, Criminal" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Acts & Sections</label>
                    <input type="text" value={formData.actSection} onChange={e => setFormData({...formData, actSection: e.target.value})} className="input-std" placeholder="e.g. 13B Hindu Marriage Act" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Police Station</label>
                    <input type="text" value={formData.policeStation} onChange={e => setFormData({...formData, policeStation: e.target.value})} className="input-std" placeholder="e.g. City Kotwali" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Party</label>
                    <input type="text" value={formData.firstParty} onChange={e => setFormData({...formData, firstParty: e.target.value})} className="input-std" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Opposite Party</label>
                    <input type="text" value={formData.oppositeParty} onChange={e => setFormData({...formData, oppositeParty: e.target.value})} className="input-std" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as CaseStatus})} className="input-std">
                        {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Next Hearing</label>
                    <input type="date" value={formData.nextHearing} onChange={e => setFormData({...formData, nextHearing: e.target.value})} className="input-std" />
                </div>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors">
                {editingId ? 'Update Case' : 'Register Case'}
            </button>
        </form>
      </Modal>

      {/* View Details & History Modal */}
      {selectedCase && (
        <Modal 
            isOpen={isDetailsModalOpen} 
            onClose={() => setIsDetailsModalOpen(false)} 
            title="Case Details & History"
            maxWidth="max-w-4xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Basic Details */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Case Information</h4>
                        <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-100">
                            <div>
                                <span className="block text-xs text-slate-500">Case Title</span>
                                <span className="font-medium text-slate-900">{selectedCase.title}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500">Case Number</span>
                                <span className="font-mono text-sm text-slate-700">{selectedCase.caseNumber}</span>
                            </div>
                            {selectedCase.actSection && (
                                <div>
                                    <span className="block text-xs text-slate-500">Acts & Sections</span>
                                    <span className="text-sm text-slate-700 font-medium">{selectedCase.actSection}</span>
                                </div>
                            )}
                            <div>
                                <span className="block text-xs text-slate-500">Workplace / Court</span>
                                <span className="text-sm text-slate-700">{selectedCase.workplace}</span>
                                {selectedCase.court && <div className="text-xs text-slate-500">{selectedCase.court}</div>}
                            </div>
                            {selectedCase.policeStation && (
                                <div>
                                    <span className="block text-xs text-slate-500">Police Station</span>
                                    <span className="text-sm text-slate-700">{selectedCase.policeStation}</span>
                                </div>
                            )}
                            <div>
                                <span className="block text-xs text-slate-500">Client</span>
                                <span className="text-sm text-indigo-600 font-medium">{selectedCase.clientName}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                                <div>
                                    <span className="block text-xs text-slate-500">First Party</span>
                                    <span className="text-sm">{selectedCase.firstParty || '-'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500">Opp. Party</span>
                                    <span className="text-sm">{selectedCase.oppositeParty || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Current Status</h4>
                        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-500">Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    selectedCase.status === CaseStatus.OPEN ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                }`}>{selectedCase.status}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Next Hearing</span>
                                <span className="font-medium text-rose-600">{selectedCase.nextHearing || 'Not Set'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Listing History */}
                <div className="md:col-span-2 flex flex-col h-full min-h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <History className="w-4 h-4 text-indigo-500" />
                            Listing Dates History
                        </h4>
                        {!showAddListing && (
                            <button 
                                onClick={() => setShowAddListing(true)}
                                className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 font-medium transition-colors"
                            >
                                <Plus className="w-3 h-3" /> Add Listing
                            </button>
                        )}
                    </div>

                    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-4 overflow-y-auto relative">
                        {/* Add Listing Form Overlay */}
                        {showAddListing && (
                            <div className="mb-6 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm animate-in slide-in-from-top-2 duration-200">
                                <div className="flex justify-between items-center mb-3">
                                    <h5 className="font-semibold text-slate-800 text-sm">New Hearing Entry</h5>
                                    <button onClick={() => setShowAddListing(false)}><X className="w-4 h-4 text-slate-400" /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 block mb-1">Hearing Date</label>
                                        <input type="date" className="input-sm w-full" value={newListing.date} onChange={e => setNewListing({...newListing, date: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 block mb-1">Next Date Given</label>
                                        <input type="date" className="input-sm w-full" value={newListing.nextHearingDate} onChange={e => setNewListing({...newListing, nextHearingDate: e.target.value})} />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="text-xs font-medium text-slate-500 block mb-1">Business / Purpose</label>
                                    <input type="text" className="input-sm w-full" placeholder="e.g. Evidence Recording, Arguments" value={newListing.purpose} onChange={e => setNewListing({...newListing, purpose: e.target.value})} />
                                </div>
                                <div className="mb-3">
                                    <label className="text-xs font-medium text-slate-500 block mb-1">Remarks / Notes</label>
                                    <textarea className="input-sm w-full" rows={2} placeholder="Brief summary of proceedings..." value={newListing.notes} onChange={e => setNewListing({...newListing, notes: e.target.value})}></textarea>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setShowAddListing(false)} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                                    <button onClick={handleAddListing} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded flex items-center gap-1">
                                        <Save className="w-3 h-3" /> Save Record
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-slate-200">
                            {(!selectedCase.hearingHistory || selectedCase.hearingHistory.length === 0) ? (
                                <div className="text-center py-8 text-slate-400 text-sm pl-8">
                                    No hearing history recorded yet. Add the first entry above.
                                </div>
                            ) : (
                                // Sort by date descending
                                [...selectedCase.hearingHistory].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((hearing, idx) => (
                                    <div key={hearing.id || idx} className="relative pl-10 group">
                                        {/* Dot */}
                                        <div className="absolute left-3 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm bg-indigo-500 z-10"></div>
                                        
                                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800 text-sm">{hearing.date}</span>
                                                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-medium">{hearing.purpose}</span>
                                                </div>
                                            </div>
                                            
                                            {hearing.notes && (
                                                <p className="text-sm text-slate-600 mt-2 mb-2 bg-slate-50 p-2 rounded">{hearing.notes}</p>
                                            )}
                                            
                                            {hearing.nextHearingDate && (
                                                <div className="mt-2 text-xs flex items-center text-indigo-600 font-medium">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Next Date Given: {hearing.nextHearingDate}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
      )}

      {/* Styles injection for inputs used in this file */}
      <style>{`
        .input-std {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            outline: none;
            transition: all 0.2s;
        }
        .input-std:focus, .input-sm:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }
        .input-sm {
            padding: 0.375rem 0.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            outline: none;
        }
      `}</style>
    </div>
  );
};

export default Cases;
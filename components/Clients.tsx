import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Search, Plus, Phone, Mail, MoreHorizontal, FileText, Trash2, Edit } from 'lucide-react';
import Modal from './Modal';
import { Client } from '../types';

const Clients = () => {
  const { clients, cases, addClient, deleteClient, updateClient } = useData();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchTerm(q);
  }, [searchParams]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Individual' as 'Individual' | 'Corporate'
  });

  const filteredClients = useMemo(() => clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  ), [clients, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
        updateClient(editingId, formData);
    } else {
        addClient({
            ...formData,
            status: 'Active',
            lastContact: new Date().toISOString().split('T')[0]
        });
    }
    closeModal();
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', type: 'Individual' });
    setIsModalOpen(true);
  }

  const openEditModal = (client: Client) => {
    setEditingId(client.id);
    setFormData({ 
        name: client.name, 
        email: client.email, 
        phone: client.phone, 
        type: client.type 
    });
    setIsModalOpen(true);
  }

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Manage your individual and corporate clients.</p>
        </div>
        <button 
            onClick={openAddModal}
            className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Active Cases</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => {
                const clientCasesCount = cases.filter(c => c.clientId === client.id).length;
                return (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{client.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">ID: CLI-{client.id.slice(-4)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-600 mb-1">
                        <Mail className="w-3 h-3 mr-2" />
                        {client.email}
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Phone className="w-3 h-3 mr-2" />
                        {client.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        client.type === 'Corporate' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-100' 
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {client.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                           <FileText className="w-4 h-4 text-slate-400" />
                           <span className="font-medium text-slate-700">{clientCasesCount} Cases</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openEditModal(client)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600" title="Edit"
                         >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { if(window.confirm('Delete this client?')) deleteClient(client.id) }}
                          className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600" title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                  <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          {searchTerm ? `No clients found matching "${searchTerm}"` : "No clients found. Click \"Add Client\" to create one."}
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingId ? "Edit Client" : "Add New Client"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                    type="text" required 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Rajesh Kumar"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                    type="email" required 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="e.g. rajesh@example.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                    type="tel" required 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g. +91 9876543210"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Type</label>
                <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                </select>
            </div>
            <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium">Save Client</button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;
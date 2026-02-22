import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { FileText, Download, UploadCloud, Search, Image as ImageIcon, Trash2, File, Folder, ChevronRight, FileEdit, PenLine } from 'lucide-react';
import Modal from './Modal';
import { LegalDocument } from '../types';

const Documents = () => {
    const { documents, cases, clients, addDocument, deleteDocument } = useData();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

    // View State
    const [activeTab, setActiveTab] = useState<'all' | 'cases' | 'clients'>('all');
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    // Upload Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadForm, setUploadForm] = useState<{
        file: File | null;
        caseId: string;
        clientId: string;
        tags: string;
    }>({
        file: null,
        caseId: '',
        clientId: '',
        tags: ''
    });

    useEffect(() => {
        const q = searchParams.get('q');
        if (q !== null) setSearchTerm(q);
    }, [searchParams]);

    // Reset folder selection when tab changes
    useEffect(() => {
        setSelectedFolderId(null);
    }, [activeTab]);

    const filteredDocs = useMemo(() => documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.tags && doc.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
    ), [documents, searchTerm]);

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadForm.file) return;

        const file = uploadForm.file;
        const type = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        const size = (file.size / 1024 / 1024).toFixed(2) + ' MB';

        const tagsArray = uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean);
        if (tagsArray.length === 0) tagsArray.push('Uploaded');

        // Auto-link client if case is selected
        let finalClientId = uploadForm.clientId;
        if (uploadForm.caseId && !finalClientId) {
            const selectedCase = cases.find(c => c.id === uploadForm.caseId);
            if (selectedCase) finalClientId = selectedCase.clientId;
        }

        addDocument({
            name: file.name,
            type: type,
            size: size,
            uploadDate: new Date().toISOString().split('T')[0],
            caseId: uploadForm.caseId || undefined,
            clientId: finalClientId || undefined,
            tags: tagsArray
        });

        setIsModalOpen(false);
        setUploadForm({ file: null, caseId: '', clientId: '', tags: '' });
    };

    const handleDownload = (doc: LegalDocument) => {
        // Simulation of download
        const msg = `Downloading file: ${doc.name}\nSize: ${doc.size}\nType: ${doc.type}`;
        alert(msg);
    };

    const openUploadModal = () => {
        // Pre-fill based on current view context
        let prefillCase = '';
        let prefillClient = '';

        if (activeTab === 'cases' && selectedFolderId) {
            prefillCase = selectedFolderId;
            const c = cases.find(x => x.id === selectedFolderId);
            if (c) prefillClient = c.clientId;
        } else if (activeTab === 'clients' && selectedFolderId) {
            prefillClient = selectedFolderId;
        }

        setUploadForm(prev => ({ ...prev, file: null, caseId: prefillCase, clientId: prefillClient, tags: '' }));
        setIsModalOpen(true);
    };

    // --- Render Helpers ---

    const renderDocList = (docs: LegalDocument[]) => (
        <ul className="divide-y divide-slate-100 bg-white rounded-b-xl">
            {docs.map(doc => (
                <li key={doc.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group animate-in slide-in-from-bottom-1 duration-200">
                    <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.type === 'PDF' ? 'bg-red-50 text-red-600' :
                            ['JPG', 'PNG', 'JPEG'].includes(doc.type) ? 'bg-purple-50 text-purple-600' :
                                ['DOC', 'DOCX'].includes(doc.type) ? 'bg-blue-50 text-blue-600' :
                                    'bg-slate-100 text-slate-600'
                            }`}>
                            {['JPG', 'PNG', 'JPEG'].includes(doc.type) ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-medium text-slate-900 truncate max-w-[200px] sm:max-w-md">{doc.name}</h4>
                            <div className="flex items-center text-xs text-slate-500 mt-1 space-x-2">
                                <span>{doc.size}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">{doc.uploadDate}</span>
                                {doc.tags && doc.tags.map(tag => (
                                    <span key={tag} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 hidden md:inline-block">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {doc.content && (
                            <button
                                onClick={() => navigate(`/editor?id=${doc.id}`)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Open in Editor"
                            >
                                <PenLine className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Download"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { if (window.confirm('Delete this file?')) deleteDocument(doc.id) }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </li>
            ))}
            {docs.length === 0 && (
                <li className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <File className="w-6 h-6 text-slate-300" />
                    </div>
                    <p>No documents found in this view.</p>
                    <button onClick={openUploadModal} className="mt-3 text-indigo-600 text-sm font-medium hover:underline">Upload a new file</button>
                </li>
            )}
        </ul>
    );

    const renderFolders = () => {
        let items: { id: string, name: string, subtext: string, count: number }[] = [];

        if (activeTab === 'cases') {
            items = cases.map(c => ({
                id: c.id,
                name: c.title,
                subtext: c.caseNumber,
                count: filteredDocs.filter(d => d.caseId === c.id).length
            })).sort((a, b) => b.count - a.count);
        } else if (activeTab === 'clients') {
            items = clients.map(c => ({
                id: c.id,
                name: c.name,
                subtext: c.email,
                count: filteredDocs.filter(d => d.clientId === c.id).length
            })).sort((a, b) => b.count - a.count);
        }

        // Filter folders if search term is active
        if (searchTerm) {
            items = items.filter(i =>
                i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                i.subtext.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (items.length === 0) {
            return (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center col-span-full bg-white rounded-b-xl">
                    <Folder className="w-12 h-12 text-slate-200 mb-3" />
                    <p>No folders found.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-white rounded-b-xl">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedFolderId(item.id)}
                        className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 p-4 rounded-xl text-left transition-all group flex flex-col hover:shadow-md h-full"
                    >
                        <div className="flex items-start justify-between mb-3 w-full">
                            <Folder className="w-10 h-10 text-amber-300 fill-amber-300 group-hover:text-amber-400 group-hover:fill-amber-400 transition-colors" />
                            <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-slate-500 border border-slate-100 shadow-sm">{item.count} files</span>
                        </div>
                        <h4 className="font-medium text-slate-900 truncate w-full" title={item.name}>{item.name}</h4>
                        <p className="text-xs text-slate-500 truncate w-full mt-1">{item.subtext}</p>
                    </button>
                ))}
            </div>
        );
    };

    const renderContent = () => {
        // If we are in 'All' tab, show list
        if (activeTab === 'all') {
            return renderDocList(filteredDocs);
        }

        // If we are in 'Cases' or 'Clients' and a folder is selected, show list for that folder
        if (selectedFolderId) {
            let docs: LegalDocument[] = [];
            if (activeTab === 'cases') docs = filteredDocs.filter(d => d.caseId === selectedFolderId);
            if (activeTab === 'clients') docs = filteredDocs.filter(d => d.clientId === selectedFolderId);
            return renderDocList(docs);
        }

        // Otherwise show grid of folders
        return renderFolders();
    };

    const getBreadcrumb = () => {
        if (activeTab === 'all') return 'All Documents';

        const rootText = activeTab === 'cases' ? 'Case Folders' : 'Client Folders';
        if (!selectedFolderId) return rootText;

        let name = '';
        if (activeTab === 'cases') {
            name = cases.find(c => c.id === selectedFolderId)?.title || 'Unknown Case';
        } else {
            name = clients.find(c => c.id === selectedFolderId)?.name || 'Unknown Client';
        }

        return (
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 hover:text-slate-700 cursor-pointer hover:underline" onClick={() => setSelectedFolderId(null)}>{rootText}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-900 truncate max-w-[200px]">{name}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
                    <p className="text-slate-500 mt-1">Manage and organize legal files.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/editor')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <FileEdit className="w-4 h-4 mr-2" />
                        New Document
                    </button>
                    <button
                        onClick={openUploadModal}
                        className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Upload File
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm min-h-[500px] flex flex-col">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 rounded-t-xl">

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-lg self-start">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All Files
                        </button>
                        <button
                            onClick={() => setActiveTab('cases')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'cases' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            By Case
                        </button>
                        <button
                            onClick={() => setActiveTab('clients')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'clients' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            By Client
                        </button>
                    </div>

                    {/* Search & Breadcrumb Area */}
                    <div className="flex-1 flex items-center justify-end gap-4 min-w-0">
                        {/* Show breadcrumb if deep in folder */}
                        {selectedFolderId && (
                            <div className="mr-auto hidden md:block">
                                {getBreadcrumb()}
                            </div>
                        )}

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search current view..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Breadcrumb (only visible on small screens when deep nav) */}
                {selectedFolderId && (
                    <div className="p-3 border-b border-slate-100 md:hidden bg-slate-50/30">
                        {getBreadcrumb()}
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-b-xl">
                    {renderContent()}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Document">
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors group relative">
                        <input
                            type="file"
                            id="file-upload"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={e => setUploadForm({ ...uploadForm, file: e.target.files ? e.target.files[0] : null })}
                        />
                        <div className="pointer-events-none">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-indigo-600">Click to select file</span>
                            <span className="text-sm text-slate-500"> or drag and drop</span>
                            <p className="text-xs text-slate-400 mt-2 font-medium text-slate-600">
                                {uploadForm.file ? `Selected: ${uploadForm.file.name}` : "Supports PDF, DOCX, JPG, PNG"}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tag Case</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={uploadForm.caseId}
                                onChange={e => setUploadForm({ ...uploadForm, caseId: e.target.value })}
                            >
                                <option value="">No Case</option>
                                {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tag Client</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={uploadForm.clientId}
                                onChange={e => setUploadForm({ ...uploadForm, clientId: e.target.value })}
                            >
                                <option value="">No Client</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Affidavit, Evidence, Invoice"
                            value={uploadForm.tags}
                            onChange={e => setUploadForm({ ...uploadForm, tags: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                        <button type="submit" disabled={!uploadForm.file} className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed">Upload File</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Documents;
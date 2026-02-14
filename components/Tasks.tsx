import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Plus, MoreHorizontal, Trash2, MapPin, Search } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../types';
import Modal from './Modal';

const COURTS = ["Mati court", "Kanpur court", "Ghatampur court"];

const TaskCard: React.FC<{ task: Task, updateTask: any, deleteTask: any, clientName?: string }> = ({ task, updateTask, deleteTask, clientName }) => {
  const priorityColor = {
    'High': 'text-rose-600 bg-rose-50 border-rose-100',
    'Medium': 'text-amber-600 bg-amber-50 border-amber-100',
    'Low': 'text-emerald-600 bg-emerald-50 border-emerald-100',
  }[task.priority];

  const nextStatus = {
    [TaskStatus.TODO]: TaskStatus.IN_PROGRESS,
    [TaskStatus.IN_PROGRESS]: TaskStatus.DONE,
    [TaskStatus.DONE]: TaskStatus.TODO
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-3 group relative">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
          <button 
             onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
             className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded"
          >
              <Trash2 className="w-3.5 h-3.5" />
          </button>
      </div>

      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${priorityColor}`}>
          {task.priority}
        </span>
      </div>
      <h4 className="text-sm font-medium text-slate-900 mb-1">{task.title}</h4>
      {clientName && <p className="text-xs text-slate-500">Client: {clientName}</p>}
      {task.caseId && <p className="text-xs text-slate-500 mb-1">Case ID: {task.caseId}</p>}
      {task.workplace && (
        <p className="flex items-center text-xs text-slate-500 mb-3">
            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
            {task.workplace}
        </p>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-2">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
            {task.assignee.charAt(0)}
          </div>
          <span className="text-xs text-slate-500 ml-2">{task.dueDate}</span>
        </div>
        <button 
            onClick={() => updateTask(task.id, { status: nextStatus[task.status] })}
            className="text-xs text-indigo-600 hover:underline"
        >
            Move &rarr;
        </button>
      </div>
    </div>
  );
};

const Column: React.FC<{ 
    title: string, 
    status: TaskStatus, 
    tasks: Task[], 
    clients: any[],
    updateTask: any, 
    deleteTask: any, 
    onAdd: () => void 
}> = ({ title, status, tasks, clients, updateTask, deleteTask, onAdd }) => (
  <div className="flex-1 min-w-[300px] bg-slate-50 rounded-xl p-4 flex flex-col h-full max-h-[calc(100vh-14rem)]">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-slate-700 flex items-center">
        {title}
        <span className="ml-2 px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs">
          {tasks.length}
        </span>
      </h3>
      <button onClick={onAdd} className="text-slate-400 hover:text-slate-600">
        <Plus className="w-4 h-4" />
      </button>
    </div>
    <div className="overflow-y-auto pr-2 space-y-3 flex-1">
      {tasks.length > 0 ? (
          tasks.map(t => {
              const client = clients.find(c => c.id === t.clientId);
              return <TaskCard key={t.id} task={t} updateTask={updateTask} deleteTask={deleteTask} clientName={client?.name} />
          })
      ) : (
          <div className="text-center text-slate-400 text-sm py-4 italic">No tasks</div>
      )}
    </div>
  </div>
);

const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask, cases, clients } = useData();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomWorkplace, setIsCustomWorkplace] = useState(false);
  const [formData, setFormData] = useState({
      title: '',
      caseId: '',
      clientId: '',
      dueDate: '',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      assignee: 'Adv. Soofiyan',
      workplace: ''
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchTerm(q);
  }, [searchParams]);

  const filteredTasks = useMemo(() => tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.caseId && t.caseId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.assignee && t.assignee.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [tasks, searchTerm]);

  const todoTasks = useMemo(() => filteredTasks.filter(t => t.status === TaskStatus.TODO), [filteredTasks]);
  const inProgressTasks = useMemo(() => filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS), [filteredTasks]);
  const doneTasks = useMemo(() => filteredTasks.filter(t => t.status === TaskStatus.DONE), [filteredTasks]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addTask(formData);
      setIsModalOpen(false);
  }

  const openModal = (status = TaskStatus.TODO) => {
      setFormData({
        title: '',
        caseId: '',
        clientId: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: TaskPriority.MEDIUM,
        status: status,
        assignee: 'Adv. Soofiyan',
        workplace: ''
      });
      setIsCustomWorkplace(false);
      setIsModalOpen(true);
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Board</h1>
          <p className="text-slate-500 mt-1">Manage case tasks and deadlines.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter tasks..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => openModal()}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
            <Plus className="w-4 h-4 mr-2" />
            Create Task
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 h-full pb-4">
          <Column 
            title="To Do" status={TaskStatus.TODO} tasks={todoTasks} clients={clients}
            updateTask={updateTask} deleteTask={deleteTask} onAdd={() => openModal(TaskStatus.TODO)} 
           />
          <Column 
            title="In Progress" status={TaskStatus.IN_PROGRESS} tasks={inProgressTasks} clients={clients}
            updateTask={updateTask} deleteTask={deleteTask} onAdd={() => openModal(TaskStatus.IN_PROGRESS)} 
          />
          <Column 
            title="Done" status={TaskStatus.DONE} tasks={doneTasks} clients={clients}
            updateTask={updateTask} deleteTask={deleteTask} onAdd={() => openModal(TaskStatus.DONE)} 
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Task">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                <input 
                    type="text" required 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Draft Affidavit"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Related Client</label>
                    <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.clientId}
                        onChange={e => setFormData({...formData, clientId: e.target.value})}
                    >
                        <option value="">No specific client</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Related Case</label>
                    <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.caseId}
                        onChange={e => setFormData({...formData, caseId: e.target.value})}
                    >
                        <option value="">No specific case</option>
                        {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Workplace / Court</label>
                <div className="flex gap-2">
                    <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={isCustomWorkplace ? 'Other place' : formData.workplace}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'Other place') {
                                setIsCustomWorkplace(true);
                                setFormData({...formData, workplace: ''});
                            } else {
                                setIsCustomWorkplace(false);
                                setFormData({...formData, workplace: val});
                            }
                        }}
                    >
                        <option value="">Select Workplace</option>
                        {COURTS.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="Other place">Other place</option>
                    </select>
                    {isCustomWorkplace && (
                        <input 
                            type="text"
                            placeholder="Enter location"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.workplace}
                            onChange={(e) => setFormData({...formData, workplace: e.target.value})}
                            autoFocus
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                    <input 
                        type="date" required 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.dueDate}
                        onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.priority}
                        onChange={e => setFormData({...formData, priority: e.target.value as TaskPriority})}
                    >
                        {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                <input 
                    type="text" required 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.assignee}
                    onChange={e => setFormData({...formData, assignee: e.target.value})}
                />
            </div>
            <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Create Task</button>
            </div>
          </form>
      </Modal>
    </div>
  );
};

export default Tasks;
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Clock, Target, CalendarPlus } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { openGoogleCalendarEvent } from '../utils/calendarUtils';
import { COURTS } from '../constants';

interface TaskFormProps {
    initialData?: Partial<Task>;
    onSuccess: () => void;
    onCancel: () => void;
    editingTaskId?: string | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSuccess, onCancel, editingTaskId }) => {
    const { addTask, updateTask, cases, clients } = useData();
    const [isCustomWorkplace, setIsCustomWorkplace] = useState(!COURTS.includes(initialData?.workplace || '') && !!initialData?.workplace);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        caseId: initialData?.caseId || '',
        clientId: initialData?.clientId || '',
        dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
        priority: initialData?.priority || TaskPriority.MEDIUM,
        status: initialData?.status || TaskStatus.TODO,
        assignee: initialData?.assignee || 'Adv. Soofiyan',
        workplace: initialData?.workplace || '',
        deadline: initialData?.deadline || '',
        workingDay: initialData?.workingDay || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTaskId) {
                await updateTask(editingTaskId, formData);
            } else {
                await addTask(formData);
            }
            onSuccess();
        } catch (err: any) {
            console.error('Task operation failed:', err);
            alert('Failed to save task: ' + (err.message || 'Unknown error'));
        }
    };

    const handleSyncToCalendar = () => {
        const dateToUse = formData.workingDay || formData.deadline || formData.dueDate;
        if (!dateToUse) {
            alert('Please set a Working Day, Deadline, or Due Date first.');
            return;
        }
        const caseName = formData.caseId ? cases.find(c => c.id === formData.caseId)?.title : '';
        const clientName = formData.clientId ? clients.find(c => c.id === formData.clientId)?.name : '';

        let description = `Task: ${formData.title}`;
        if (caseName) description += `\nCase: ${caseName}`;
        if (clientName) description += `\nClient: ${clientName}`;
        if (formData.deadline) description += `\nDeadline: ${formData.deadline}`;
        description += `\nPriority: ${formData.priority}`;

        openGoogleCalendarEvent({
            title: formData.title,
            date: dateToUse,
            description,
            location: formData.workplace || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                <input
                    type="text" required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Draft Affidavit"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Related Client</label>
                    <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.clientId}
                        onChange={e => setFormData({ ...formData, clientId: e.target.value })}
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
                        onChange={e => setFormData({ ...formData, caseId: e.target.value })}
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
                                setFormData({ ...formData, workplace: '' });
                            } else {
                                setIsCustomWorkplace(false);
                                setFormData({ ...formData, workplace: val });
                            }
                        }}
                    >
                        <option value="">Select Workplace</option>
                        {COURTS.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        <option value="Other place">Other place</option>
                    </select>
                    {isCustomWorkplace && (
                        <input
                            type="text"
                            placeholder="Enter location"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.workplace}
                            onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
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
                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    >
                        {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-rose-500" /> Deadline
                    </label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.deadline}
                        onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-blue-500" /> Working Day
                    </label>
                    <input
                        type="date"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.workingDay}
                        onChange={e => setFormData({ ...formData, workingDay: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">The specific day to work on this task</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                <input
                    type="text" required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.assignee}
                    onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                />
            </div>

            <div className="pt-4 flex gap-3">
                <button
                    type="button"
                    onClick={handleSyncToCalendar}
                    className="flex items-center gap-1.5 px-3 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium text-sm"
                >
                    <CalendarPlus className="w-4 h-4" />
                    Sync to Google Calendar
                </button>
                <div className="flex-1" />
                <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">{editingTaskId ? 'Update Task' : 'Create Task'}</button>
            </div>
        </form>
    );
};

export default TaskForm;

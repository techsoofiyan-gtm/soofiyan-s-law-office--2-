import React from 'react';
import { useData } from '../context/DataContext';
import { Briefcase, CheckSquare, MapPin } from 'lucide-react';

const WORKPLACES = ["Ghatampur Court", "Mati court", "Kanpur Court"];

const Workplace = () => {
  const { cases, tasks } = useData();

  const getWorkplaceItems = (workplaceName: string) => {
    const isOther = workplaceName === 'Other Places';

    const relevantCases = cases.filter(c => {
      // Check both workplace field and court field for backward compatibility
      const wp = c.workplace || c.court || '';
      if (!wp) return false;
      
      if (isOther) {
         return !WORKPLACES.some(w => wp.toLowerCase().includes(w.toLowerCase()));
      }
      return wp.toLowerCase().includes(workplaceName.toLowerCase());
    });

    const relevantTasks = tasks.filter(t => {
      const wp = t.workplace || '';
      if (!wp) return false;

      if (isOther) {
         return !WORKPLACES.some(w => wp.toLowerCase().includes(w.toLowerCase()));
      }
      return wp.toLowerCase().includes(workplaceName.toLowerCase());
    });

    return { cases: relevantCases, tasks: relevantTasks };
  };

  const renderCard = (title: string) => {
    const { cases, tasks } = getWorkplaceItems(title);
    
    return (
       <div key={title} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl">
             <h3 className="font-semibold text-slate-800 flex items-center gap-2">
               <MapPin className="w-4 h-4 text-indigo-500" />
               {title}
             </h3>
             <div className="flex gap-2 text-xs font-medium">
               <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{cases.length} Cases</span>
               <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{tasks.length} Tasks</span>
             </div>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-200">
             {/* Cases List */}
             {cases.length > 0 && (
               <div>
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                   <Briefcase className="w-3 h-3" /> Active Cases
                 </h4>
                 <div className="space-y-2">
                   {cases.map(c => (
                     <div key={c.id} className="p-3 bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-lg transition-colors group">
                       <div className="flex justify-between items-start">
                         <p className="text-sm font-medium text-slate-900 line-clamp-1" title={c.title}>{c.title}</p>
                         <span className={`text-[10px] px-1.5 py-0.5 rounded border ${c.status === 'Open' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{c.status}</span>
                       </div>
                       <p className="text-xs text-slate-500 mt-1">{c.caseNumber}</p>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Tasks List */}
             {tasks.length > 0 && (
               <div className={cases.length > 0 ? "pt-2 border-t border-slate-100" : ""}>
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                   <CheckSquare className="w-3 h-3" /> Pending Tasks
                 </h4>
                 <div className="space-y-2">
                   {tasks.map(t => (
                     <div key={t.id} className="p-3 bg-slate-50 hover:bg-white border border-slate-100 hover:border-amber-200 rounded-lg transition-colors">
                        <div className="flex justify-between items-start">
                           <p className="text-sm text-slate-800 line-clamp-2">{t.title}</p>
                           {t.priority === 'High' && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" title="High Priority"></span>}
                        </div>
                        <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                           <span>{t.dueDate}</span>
                           <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">{t.status}</span>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {cases.length === 0 && tasks.length === 0 && (
               <div className="text-center py-8 text-slate-400 text-sm">
                 No active items found for this workplace.
               </div>
             )}
          </div>
       </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Workplaces</h1>
        <p className="text-slate-500 mt-1">Overview of cases and tasks by court location.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {WORKPLACES.map(place => renderCard(place))}
        {renderCard("Other Places")}
      </div>
    </div>
  );
};

export default Workplace;
import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ChevronLeft, ChevronRight, Briefcase, CheckSquare } from 'lucide-react';

const Calendar = () => {
    const { cases, tasks } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const days = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        // Previous month padding
        const prevMonthDays = daysInMonth(year, month - 1);
        const padding = Array.from({ length: startDay }, (_, i) => ({
            day: prevMonthDays - startDay + i + 1,
            month: month - 1,
            year: month === 0 ? year - 1 : year,
            isCurrentMonth: false
        }));

        // Current month days
        const current = Array.from({ length: days }, (_, i) => ({
            day: i + 1,
            month: month,
            year: year,
            isCurrentMonth: true
        }));

        // Next month padding
        const remaining = 42 - padding.length - current.length;
        const nextPadding = Array.from({ length: remaining }, (_, i) => ({
            day: i + 1,
            month: month + 1,
            year: month === 11 ? year + 1 : year,
            isCurrentMonth: false
        }));

        return [...padding, ...current, ...nextPadding];
    }, [currentDate]);

    const getItemsForDate = (day: number, month: number, year: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const dateCases = cases.filter((c: any) => c.nextHearing === dateStr);
        const dateTasks = tasks.filter((t: any) => t.deadline === dateStr || t.dueDate === dateStr);

        return { cases: dateCases, tasks: dateTasks };
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
                    <p className="text-slate-500 mt-1">Track case hearings and task deadlines.</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    <div className="px-4 font-bold text-slate-800 min-w-[150px] text-center">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </div>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <button onClick={goToToday} className="px-3 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">Today</button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                {/* Day Header */}
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto">
                    {monthData.map((data, idx) => {
                        const { cases: dateCases, tasks: dateTasks } = getItemsForDate(data.day, data.month, data.year);
                        const isToday = new Date().toDateString() === new Date(data.year, data.month, data.day).toDateString();

                        return (
                            <div
                                key={idx}
                                className={`min-h-[100px] p-2 border-b border-r border-slate-100 transition-colors hover:bg-slate-50/50 flex flex-col ${!data.isCurrentMonth ? 'bg-slate-50/30' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' :
                                        data.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                                        }`}>
                                        {data.day}
                                    </span>
                                </div>

                                <div className="flex-1 space-y-1 overflow-hidden">
                                    {dateCases.length > 0 && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100 truncate shadow-sm">
                                            <Briefcase className="w-2.5 h-2.5" />
                                            {dateCases.length} {dateCases.length === 1 ? 'Hearing' : 'Hearings'}
                                        </div>
                                    )}
                                    {dateTasks.length > 0 && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold border border-amber-100 truncate shadow-sm">
                                            <CheckSquare className="w-2.5 h-2.5" />
                                            {dateTasks.length} {dateTasks.length === 1 ? 'Task' : 'Tasks'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 px-2 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-50 border border-blue-200" />
                    <span>Case Hearings</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-50 border border-amber-200" />
                    <span>Task Deadlines</span>
                </div>
            </div>
        </div>
    );
};

export default Calendar;

import React, { useMemo } from 'react';
import { Briefcase, Scale, Clock, AlertCircle, ArrowUpRight, ArrowRight, Gavel, Calendar, Edit2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';

const StatCard: React.FC<{
  title: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
        <p className="text-xs text-slate-400 mt-1">{subtext}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { cases, tasks, documents } = useData();

  // Memoize calculations to prevent re-runs on unrelated renders
  const stats = useMemo(() => {
    const activeCases = cases.filter(c => c.status === 'Open' || c.status === 'Pending').length;
    const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'High' && t.status !== 'Done');

    // Date Logic
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const todayStr = formatDate(today);
    const tomorrowStr = formatDate(tomorrow);

    const todaysListings = cases.filter(c => c.nextHearing === todayStr);
    const tomorrowsListings = cases.filter(c => c.nextHearing === tomorrowStr);

    const upcomingHearings = cases
      .filter(c => c.nextHearing && c.nextHearing !== '-')
      .sort((a, b) => new Date(a.nextHearing).getTime() - new Date(b.nextHearing).getTime())
      .slice(0, 3);

    const nextHearing = upcomingHearings.length > 0 ? upcomingHearings[0] : null;

    return {
      activeCases,
      pendingTasks,
      highPriorityTasks,
      todaysListings,
      tomorrowsListings,
      upcomingHearings,
      nextHearing,
      today,
      todayStr,
      tomorrowStr
    };
  }, [cases, tasks]); // Recalculate only when cases or tasks change

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-md border border-slate-200">
          {stats.today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Cases"
          value={stats.activeCases.toString()}
          subtext="Total active files"
          icon={Scale}
          color="bg-indigo-600"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks.toString()}
          subtext={`${stats.highPriorityTasks.length} high priority`}
          icon={Clock}
          color="bg-amber-500"
        />
        <StatCard
          title="Documents"
          value={documents.length.toString()}
          subtext="Total files stored"
          icon={Briefcase}
          color="bg-emerald-500"
        />
        <StatCard
          title="Next Hearing"
          value={stats.nextHearing ? new Date(stats.nextHearing.nextHearing).getDate().toString() : '-'}
          subtext={stats.nextHearing ? stats.nextHearing.title : 'No upcoming hearings'}
          icon={AlertCircle}
          color="bg-rose-500"
        />
      </div>

      {/* Daily Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Listings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50 rounded-t-xl">
            <h2 className="font-semibold text-indigo-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today's Listings ({stats.todayStr})
            </h2>
            <span className="text-xs font-medium bg-white text-indigo-600 px-2 py-1 rounded border border-indigo-100">
              {stats.todaysListings.length} Cases
            </span>
          </div>
          <div className="p-4 space-y-3">
            {stats.todaysListings.length > 0 ? (
              stats.todaysListings.map(c => (
                <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center group hover:border-indigo-200 transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium text-slate-900 text-sm truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">{c.caseNumber}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <Gavel className="w-3 h-3" /> {c.court}
                      </span>
                    </div>
                  </div>
                  <Link to="/cases" className="p-2 bg-white text-slate-400 hover:text-indigo-600 rounded border border-slate-200 hover:border-indigo-200 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-50/30 rounded-lg border border-dashed border-slate-200">
                No hearings listed for today.
              </div>
            )}
          </div>
        </div>

        {/* Tomorrow's Listings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50 rounded-t-xl">
            <h2 className="font-semibold text-amber-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Tomorrow's Listings ({stats.tomorrowStr})
            </h2>
            <span className="text-xs font-medium bg-white text-amber-600 px-2 py-1 rounded border border-amber-100">
              {stats.tomorrowsListings.length} Cases
            </span>
          </div>
          <div className="p-4 space-y-3">
            {stats.tomorrowsListings.length > 0 ? (
              stats.tomorrowsListings.map(c => (
                <div key={c.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center group hover:border-amber-200 transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium text-slate-900 text-sm truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">{c.caseNumber}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <Gavel className="w-3 h-3" /> {c.court}
                      </span>
                    </div>
                  </div>
                  <Link to="/cases" className="p-2 bg-white text-slate-400 hover:text-amber-600 rounded border border-slate-200 hover:border-amber-200 transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm bg-slate-50/30 rounded-lg border border-dashed border-slate-200">
                No hearings listed for tomorrow.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Hearings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Hearings</h2>
            <Link to="/calendar" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
              View Calendar <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {stats.upcomingHearings.map(hearing => (
              <div key={hearing.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex flex-col items-center justify-center text-xs font-bold border border-indigo-100">
                  <span>{hearing.nextHearing.split('-')[2]}</span>
                  <span className="uppercase text-[10px]">{new Date(hearing.nextHearing).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{hearing.title}</p>
                  <p className="text-xs text-slate-500">{hearing.court}</p>
                  <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                    {hearing.caseNumber}
                  </span>
                </div>
                <Link to={`/cases`} className="text-slate-400 hover:text-indigo-600">
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
            {stats.upcomingHearings.length === 0 && <p className="text-sm text-slate-500 text-center">No upcoming hearings scheduled.</p>}
          </div>
        </div>

        {/* Priority Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">High Priority Tasks</h2>
            <Link to="/tasks" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
              View Board <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {stats.highPriorityTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg group">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${task.status === 'Done' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500">Due: {task.dueDate}</p>
                    {task.workingDay && <p className="text-xs text-blue-600">Working Day: {task.workingDay}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/tasks" className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all" title="Edit Task">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
            {stats.highPriorityTasks.length === 0 && <p className="text-sm text-slate-500 text-center">No high priority tasks.</p>}

            <Link to="/tasks" className="w-full block text-center py-2 border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
              + Add Quick Task
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
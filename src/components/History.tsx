import { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { MeterEntry, MonthlyStats } from '../types';
import { formatNumber, cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';

interface HistoryProps {
  entries: MeterEntry[];
  stats: {
    monthlyStats: MonthlyStats[];
    allSorted: MeterEntry[];
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function History({ entries, stats, onEdit, onDelete }: HistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const filteredDaily = useMemo(() => {
    return stats.allSorted.filter(e => {
      const dateObj = parseISO(e.date);
      const monthMatches = selectedMonth ? format(dateObj, 'MMM') === selectedMonth : true;
      const searchMatches = format(dateObj, 'MMMM yyyy').toLowerCase().includes(searchTerm.toLowerCase()) || e.date.includes(searchTerm);
      return monthMatches && searchMatches;
    });
  }, [stats.allSorted, searchTerm, selectedMonth]);

  const filteredMonthly = useMemo(() => {
    return stats.monthlyStats.filter(ms => {
      const monthMatches = selectedMonth ? ms.monthName.substring(0, 3) === selectedMonth : true;
      const searchMatches = ms.monthName.toLowerCase().includes(searchTerm.toLowerCase()) || ms.year.toString().includes(searchTerm);
      return monthMatches && searchMatches;
    });
  }, [stats.monthlyStats, searchTerm, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Search & Tabs */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search month or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 outline-none transition-all font-medium text-sm shadow-sm"
          />
        </div>

        {/* Month Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
          <button
            onClick={() => setSelectedMonth(null)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border",
              selectedMonth === null 
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
            )}
          >
            All Time
          </button>
          {months.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border",
                selectedMonth === m 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                  : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('daily')}
            className={cn(
              "flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all",
              activeTab === 'daily' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-400"
            )}
          >
            Daily Log
          </button>
          <button 
            onClick={() => setActiveTab('monthly')}
            className={cn(
              "flex-1 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all",
              activeTab === 'monthly' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-400"
            )}
          >
            Monthly Summary
          </button>
        </div>
      </div>

      {activeTab === 'daily' ? (
        <div className="space-y-3">
          {filteredDaily.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center rounded-xl font-bold text-sm border border-slate-100 dark:border-slate-700">
                      {format(parseISO(entry.date), 'dd')}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{format(parseISO(entry.date), 'EEE, MMM d, yyyy')}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reading: {formatNumber(entry.reading)}</p>
                   </div>
                </div>
                <div className="flex gap-1">
                  {deleteConfirmId === entry.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-900/30 rounded-lg p-1 animate-in fade-in zoom-in duration-200">
                       <button 
                         onClick={() => setDeleteConfirmId(null)}
                         className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase hover:text-slate-700"
                       >
                         No
                       </button>
                       <button 
                         onClick={() => {
                           onDelete(entry.id);
                           setDeleteConfirmId(null);
                         }}
                         className="px-2 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-md shadow-sm"
                       >
                         Yes
                       </button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => onEdit(entry.id)} className="p-2 text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirmId(entry.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Consumption</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{formatNumber(entry.consumed)} kWh</span>
              </div>
            </div>
          ))}
          {filteredDaily.length === 0 && (
            <div className="text-center py-20 text-slate-400">
               <p>No daily records found.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMonthly.map((ms) => (
             <div key={`${ms.year}-${ms.month}`} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 group-hover:text-indigo-600 transition-colors border border-slate-100 dark:border-slate-700">
                   <Calendar size={20} />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{ms.monthName} {ms.year}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">{ms.entryCount} Logs</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">{formatNumber(ms.totalConsumed)} <span className="text-xs font-normal text-slate-400">kWh</span></p>
               </div>
             </div>
          ))}
          {filteredMonthly.length === 0 && (
            <div className="text-center py-20 text-slate-400">
               <p>No monthly records found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

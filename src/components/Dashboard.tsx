import { Zap, TrendingUp, TrendingDown, Calendar, Calculator } from 'lucide-react';
import { MonthlyStats, MeterEntry, Settings } from '../types';
import { formatNumber, formatCurrency, cn } from '../lib/utils';
import { format, subDays, parseISO, isSameDay } from 'date-fns';

interface DashboardProps {
  stats: {
    latest?: MeterEntry;
    prev?: MeterEntry;
    totalConsumedCurrent: number;
    avgCurrentMonth: number;
    monthlyStats: MonthlyStats[];
  };
  settings: Settings;
  onEdit: (id: string) => void;
}

export default function Dashboard({ stats, settings, onEdit }: DashboardProps) {
  const { latest, prev, totalConsumedCurrent, avgCurrentMonth } = stats;

  const diff = latest && prev ? latest.consumed - prev.consumed : null;
  const percentageChange = diff !== null && prev && prev.consumed !== 0 
    ? (diff / prev.consumed) * 100 
    : 0;

  const estimatedBill = totalConsumedCurrent * settings.unitRate;
  
  // Projection
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const projectedTotal = (totalConsumedCurrent / currentDay) * daysInMonth;
  const projectedBill = projectedTotal * settings.unitRate;

  return (
    <div className="space-y-6">
      {/* Primary KPI */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Monthly Usage</p>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">
              {formatNumber(totalConsumedCurrent)} <span className="text-xl font-normal text-slate-400">kWh</span>
            </h2>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-indigo-100 dark:shadow-none shadow-inner">
            <Zap size={22} fill="currentColor" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Bill</p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(estimatedBill, settings.currency)}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projected</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(projectedBill, settings.currency)}</p>
          </div>
        </div>
      </section>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-4">
        {/* Daily Comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2.5 rounded-xl",
              diff !== null && diff > 0 
                ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" 
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
            )}>
              {diff !== null && diff > 0 ? <TrendingUp size={20} strokeWidth={2.5} /> : <TrendingDown size={20} strokeWidth={2.5} />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Performance</p>
              <p className="text-sm font-bold mt-0.5">
                {diff !== null ? `${diff > 0 ? '+' : ''}${formatNumber(diff)} kWh vs yesterday` : 'Initial reading set'}
              </p>
            </div>
          </div>
          {latest && (
            <div className="text-right">
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                diff !== null && diff > 0 ? "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
              )}>
                {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Avg & High/Low */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-0.5">Daily Average</p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold">{formatNumber(avgCurrentMonth)}</p>
                <span className="text-xs font-medium text-slate-400 tracking-tighter">kWh</span>
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-0.5">Usage Alert</p>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  diff && diff > 0 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                )} />
                <p className="text-sm font-bold">{diff && diff > 0 ? 'Surge' : 'Optimal'}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Monthly Summary Mini List */}
      <section className="space-y-4 pt-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Consumption Log</h3>
        </div>
        <div className="space-y-3">
          {stats.monthlyStats.slice(0, 3).map((ms) => (
            <div key={`${ms.year}-${ms.month}`} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center group hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{ms.monthName} {ms.year}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{ms.entryCount} Logs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-indigo-400 tracking-tight">{formatNumber(ms.totalConsumed)} <span className="text-xs font-normal text-slate-400">kWh</span></p>
              </div>
            </div>
          ))}
          {stats.monthlyStats.length === 0 && (
            <div className="py-12 text-center bg-white/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
               <Calculator className="mx-auto text-slate-300 mb-2" size={32} />
               <p className="text-sm text-slate-400">No data found yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

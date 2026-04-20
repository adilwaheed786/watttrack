import { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';
import { MeterEntry, MonthlyStats } from '../types';
import { format, parseISO } from 'date-fns';

interface TrendsProps {
  entries: MeterEntry[];
  monthlyStats: MonthlyStats[];
}

export default function Trends({ entries, monthlyStats }: TrendsProps) {
  const dailyData = useMemo(() => {
    return entries.slice(-14).map(e => ({
      date: format(parseISO(e.date), 'MMM d'),
      consumed: e.consumed
    }));
  }, [entries]);

  const monthlyData = useMemo(() => {
    return [...monthlyStats].reverse().map(ms => ({
      name: ms.monthName.substring(0, 3),
      total: ms.totalConsumed,
      full: `${ms.monthName} ${ms.year}`
    }));
  }, [monthlyStats]);

  const maxMonth = Math.max(...monthlyStats.map(m => m.totalConsumed), 0);
  const minMonth = Math.min(...monthlyStats.map(m => m.totalConsumed), maxMonth || 100);

  return (
    <div className="space-y-8 pb-4">
      {/* Daily Area Chart */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 px-1">Last 14 Days Usage</h3>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  backgroundColor: '#1e293b',
                  color: '#fff'
                }}
                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="consumed" 
                stroke="#4f46e5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorConsumed)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Monthly Bar Chart */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 px-1">Monthly Comparison</h3>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                 contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  backgroundColor: '#1e293b',
                  color: '#fff'
                }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                 {monthlyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.total === maxMonth ? '#4f46e5' : entry.total === minMonth ? '#fb7185' : '#e2e8f0'} 
                      className="dark:fill-slate-800"
                    />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-indigo-600" />
            <span>Highest</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-rose-500" />
            <span>Lowest</span>
          </div>
        </div>
      </section>
    </div>
  );
}

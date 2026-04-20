import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  LayoutDashboard, 
  History as HistoryIcon, 
  LineChart, 
  Settings as SettingsIcon,
  Moon,
  Sun,
  Zap,
  ChevronDown,
  Layers
} from 'lucide-react';
import { useMeterData } from './hooks/useMeterData';
import { useTheme } from './hooks/useTheme';
import { cn } from './lib/utils';

// View Components
import Dashboard from './components/Dashboard';
import History from './components/History';
import Trends from './components/Trends';
import Settings from './components/Settings';
import EntryModal from './components/EntryModal';
import MeterModal from './components/MeterModal';

type View = 'dashboard' | 'history' | 'trends' | 'settings';

export default function App() {
  const { 
    entries, 
    stats, 
    settings, 
    meters, 
    activeMeterId, 
    activeMeter,
    addMeter,
    deleteMeter,
    switchMeter,
    addEntry, 
    deleteEntry, 
    editEntry, 
    updateSettings 
  } = useMeterData();
  const { isDark, toggle: toggleTheme } = useTheme();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMeterModalOpen, setIsMeterModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditItem(id);
    setIsModalOpen(true);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'trends', label: 'Trends', icon: LineChart },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-30 px-6 py-5 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-indigo-200 dark:shadow-indigo-900/20 shadow-lg">
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">VoltTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
             onClick={() => setIsMeterModalOpen(true)}
             className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
          >
             <Layers size={14} className="text-indigo-600 dark:text-indigo-400" />
             <span className="text-[11px] font-bold uppercase tracking-tight max-w-[80px] truncate">{activeMeter?.name || 'Meter'}</span>
             <ChevronDown size={12} className="text-slate-400" />
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === 'dashboard' && <Dashboard stats={stats} settings={settings} onEdit={handleEdit} />}
            {activeView === 'history' && <History stats={stats} entries={entries} onEdit={handleEdit} onDelete={deleteEntry} />}
            {activeView === 'trends' && <Trends entries={entries} monthlyStats={stats.monthlyStats} />}
            {activeView === 'settings' && <Settings settings={settings} onUpdate={updateSettings} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => { setEditItem(null); setIsModalOpen(true); }}
        className="fixed bottom-28 right-6 p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all z-40 group"
      >
        <Plus size={24} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-6 py-4 pb-8 flex justify-between items-center z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as View)}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all active:scale-90",
              activeView === item.id 
                ? "text-indigo-600 dark:text-indigo-400" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-xl transition-colors",
              activeView === item.id ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
            )}>
              <item.icon size={20} strokeWidth={activeView === item.id ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <EntryModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onAdd={addEntry} 
            onEdit={editEntry}
            editItem={editItem ? entries.find(e => e.id === editItem) : null}
            latestReading={stats.latest?.reading || 0}
          />
        )}
        {isMeterModalOpen && (
          <MeterModal 
            isOpen={isMeterModalOpen}
            onClose={() => setIsMeterModalOpen(false)}
            meters={meters}
            activeMeterId={activeMeterId}
            onAdd={addMeter}
            onDelete={deleteMeter}
            onSwitch={switchMeter}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

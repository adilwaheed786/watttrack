import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { X, Calendar as CalendarIcon, Zap, AlertCircle } from 'lucide-react';
import { MeterEntry } from '../types';
import { format } from 'date-fns';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (date: string, reading: number) => void;
  onEdit: (id: string, reading: number) => void;
  editItem: MeterEntry | null;
  latestReading: number;
}

export default function EntryModal({ isOpen, onClose, onAdd, onEdit, editItem, latestReading }: EntryModalProps) {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reading, setReading] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setDate(editItem.date);
      setReading(editItem.reading.toString());
    } else {
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setReading('');
    }
    setError(null);
  }, [editItem, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const readingNum = parseFloat(reading);
    if (isNaN(readingNum)) {
      setError('Please enter a valid reading');
      return;
    }

    if (!editItem && readingNum < latestReading) {
       setError(`Reading cannot be lower than previous (${latestReading})`);
       return;
    }

    try {
      if (editItem) {
        onEdit(editItem.id, readingNum);
      } else {
        onAdd(date, readingNum);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{editItem ? 'Edit Reading' : 'Add Reading'}</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
              <CalendarIcon size={12} /> Date
            </label>
            <input 
              type="date" 
              required
              readOnly={!!editItem}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 font-bold text-lg disabled:opacity-50 shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
              <Zap size={12} /> Reading (kWh)
            </label>
            <input 
              type="number" 
              step="0.1"
              required
              autoFocus
              placeholder="0.0"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 font-mono font-bold text-3xl shadow-inner"
            />
            {!editItem && (
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter px-1 mt-1">Previous: {latestReading} kWh</p>
            )}
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl text-[11px] flex items-center gap-3 font-bold ring-1 ring-rose-200 dark:ring-rose-800 shadow-sm">
               <AlertCircle size={16} />
               {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 active:scale-95 transition-all mt-4 h-16 text-lg hover:bg-indigo-700"
          >
            {editItem ? 'Save Changes' : 'Confirm Entry'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

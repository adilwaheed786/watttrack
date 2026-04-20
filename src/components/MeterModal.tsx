import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { X, Tag, Info, Trash2, Plus } from 'lucide-react';
import { Meter } from '../types';

interface MeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, type: string) => void;
  onDelete?: (id: string) => void;
  meters: Meter[];
  activeMeterId: string;
  onSwitch: (id: string) => void;
}

export default function MeterModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  onDelete, 
  meters, 
  activeMeterId, 
  onSwitch 
}: MeterModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Electric');
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name, type);
    setName('');
    setShowAddForm(false);
  };

  if (!isOpen) return null;

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
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{confirmDelete ? 'Confirm Delete' : 'Manage Meters'}</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {confirmDelete ? (
          <div className="space-y-6 py-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/40 text-center">
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Are you sure?</p>
              <p className="text-xs text-rose-500 dark:text-rose-500/80 mt-1">This will delete all records for this meter. This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-bold transition-all"
              >
                No, Keep it
              </button>
              <button 
                onClick={() => {
                  if (confirmDelete && onDelete) {
                    onDelete(confirmDelete);
                    setConfirmDelete(null);
                  }
                }}
                className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-all hover:bg-rose-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
              {meters.map((meter) => (
                <div 
                  key={meter.id}
                  onClick={() => { onSwitch(meter.id); onClose(); }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                    activeMeterId === meter.id 
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600" 
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activeMeterId === meter.id ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                      <Tag size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{meter.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{meter.type}</p>
                    </div>
                  </div>
                  {onDelete && meters.length > 1 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(meter.id);
                      }}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {!showAddForm ? (
              <button 
                onClick={() => setShowAddForm(true)}
                className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all font-bold text-sm flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Add New Meter
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Meter Name</label>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="e.g. Ground Floor"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 font-bold text-lg shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Meter Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 font-bold text-lg shadow-inner appearance-none"
                  >
                    <option value="Electric">Electric</option>
                    <option value="Solar">Solar</option>
                    <option value="Gas">Gas</option>
                    <option value="Water">Water</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 transition-all hover:bg-indigo-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

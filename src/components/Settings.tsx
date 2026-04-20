import { useState, FormEvent } from 'react';
import { Save, Info, Wallet, Globe } from 'lucide-react';
import { Settings as SettingsType } from '../types';

interface SettingsProps {
  settings: SettingsType;
  onUpdate: (settings: SettingsType) => void;
}

export default function Settings({ settings, onUpdate }: SettingsProps) {
  const [formData, setFormData] = useState<SettingsType>({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
          <Wallet size={16} /> Bill Estimation
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Rate per unit (kWh)</label>
            <div className="relative group">
               <input 
                  type="number" 
                  step="0.001"
                  value={formData.unitRate}
                  onChange={(e) => setFormData({ ...formData, unitRate: Number(e.target.value) })}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 font-mono font-bold text-lg transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700 shadow-sm"
                />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Currency</label>
            <div className="relative group">
               <input 
                  type="text" 
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="e.g. USD, ₹, £"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 font-bold text-lg transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700 shadow-sm"
                />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-indigo-700"
          >
            <Save size={18} />
            {saved ? 'Settings Saved!' : 'Save Changes'}
          </button>
        </form>
      </section>

      <section className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-inner">
         <div className="flex gap-4">
            <div className="p-2.5 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 h-fit rounded-xl">
               <Info size={18} />
            </div>
            <div className="space-y-1.5">
               <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">How estimation works</h4>
               <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  We multiply your consumed units by the rate to estimate your bill. Tax and service charges from your provider are not included.
               </p>
            </div>
         </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
         <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
          <Globe size={16} /> App Info
        </h3>
        <div className="space-y-2">
           <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-tighter">Version</span>
              <span className="font-mono text-slate-500">1.0.0 (PWA)</span>
           </div>
           <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-tighter">Storage</span>
              <span className="font-mono text-slate-500">Browser (Local)</span>
           </div>
        </div>
      </section>
    </div>
  );
}

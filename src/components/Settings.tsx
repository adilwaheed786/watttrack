import { useState, FormEvent } from 'react';
import { Save, Info, Wallet, Globe, Download, CheckCircle2, Monitor } from 'lucide-react';
import { Settings as SettingsType } from '../types';
import { usePWA } from '../hooks/usePWA';

interface SettingsProps {
  settings: SettingsType;
  onUpdate: (settings: SettingsType) => void;
}

export default function Settings({ settings, onUpdate }: SettingsProps) {
  const [formData, setFormData] = useState<SettingsType>({ ...settings });
  const [saved, setSaved] = useState(false);
  const { isInstallable, isInstalled, install } = usePWA();

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
          <Globe size={16} /> App Management
        </h3>
        <div className="space-y-4">
           {!isInstalled && (
             <div className="space-y-3">
               {isInstallable ? (
                 <button 
                   onClick={install}
                   className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                 >
                   <Download size={18} /> Install App Automatically
                 </button>
               ) : (
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <Info size={12} /> How to Install
                   </p>
                   <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                     To install this app on your phone:
                     <br />
                     1. Tap the <span className="font-bold text-indigo-600">Menu</span> (browser dots) or <span className="font-bold text-indigo-600">Share</span> icon.
                     <br />
                     2. Select <span className="font-bold text-indigo-600">"Add to Home Screen"</span> or <span className="font-bold text-indigo-600">"Install App"</span>.
                   </p>
                 </div>
               )}
             </div>
           )}

           {isInstalled && (
             <div className="w-full py-4 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold flex items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-900/30">
               <CheckCircle2 size={18} /> App Installed & Ready
             </div>
           )}

           <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-800/50">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                 <span className="text-slate-400">Version</span>
                 <span className="text-slate-500">1.2.0 (Stable)</span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                 <span className="text-slate-400">Platform</span>
                 <span className="text-slate-500 flex items-center gap-1">
                   {isInstalled ? <Download size={10} /> : <Monitor size={10} />}
                   {isInstalled ? 'Offline Ready' : 'Web Preview'}
                 </span>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}

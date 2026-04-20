import { useState, useEffect, useMemo } from 'react';
import { format, parseISO, isSameMonth, subMonths, isSameDay } from 'date-fns';
import { MeterEntry, Settings, MonthlyStats, Meter } from '../types';

const STORAGE_KEY = 'wattwatch_data';
const SETTINGS_KEY = 'wattwatch_settings';
const METERS_KEY = 'wattwatch_meters';
const ACTIVE_METER_KEY = 'wattwatch_active_meter';

export function useMeterData() {
  const [entries, setEntries] = useState<MeterEntry[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [activeMeterId, setActiveMeterId] = useState<string>('');
  const [settings, setSettings] = useState<Settings>({
    unitRate: 45, // A more realistic default for PKR
    currency: 'PKR',
  });

  // Load data on mount
  useEffect(() => {
    let initialMeters: Meter[] = [];
    const savedMeters = localStorage.getItem(METERS_KEY);
    if (savedMeters) {
      try {
        initialMeters = JSON.parse(savedMeters);
      } catch (e) {
        console.error('Failed to parse meters', e);
      }
    }

    const savedEntries = localStorage.getItem(STORAGE_KEY);
    let initialEntries: MeterEntry[] = [];
    if (savedEntries) {
      try {
        initialEntries = JSON.parse(savedEntries);
      } catch (e) {
        console.error('Failed to parse entries', e);
      }
    }

    // Migration: ensure at least one meter exists
    if (initialMeters.length === 0) {
      const defaultMeter: Meter = {
        id: crypto.randomUUID(),
        name: 'Main Meter',
        type: 'Electric',
        createdAt: new Date().toISOString()
      };
      initialMeters = [defaultMeter];
      // Assign legacy entries to the default meter
      initialEntries = initialEntries.map(e => e.meterId ? e : { ...e, meterId: defaultMeter.id });
    }

    setMeters(initialMeters);
    setEntries(initialEntries);

    const savedActiveId = localStorage.getItem(ACTIVE_METER_KEY);
    if (savedActiveId && initialMeters.some(m => m.id === savedActiveId)) {
      setActiveMeterId(savedActiveId);
    } else {
      setActiveMeterId(initialMeters[0].id);
    }

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  // Sync to local storage
  const saveToStorage = (newEntries: MeterEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
  };

  const saveMeters = (newMeters: Meter[]) => {
    setMeters(newMeters);
    localStorage.setItem(METERS_KEY, JSON.stringify(newMeters));
  };

  const switchMeter = (id: string) => {
    setActiveMeterId(id);
    localStorage.setItem(ACTIVE_METER_KEY, id);
  };

  const addMeter = (name: string, type: string) => {
    const newMeter: Meter = {
      id: crypto.randomUUID(),
      name,
      type,
      createdAt: new Date().toISOString()
    };
    const updated = [...meters, newMeter];
    saveMeters(updated);
    switchMeter(newMeter.id);
  };

  const deleteMeter = (id: string) => {
    if (meters.length <= 1) return; // Keep at least one
    const updated = meters.filter(m => m.id !== id);
    const updatedEntries = entries.filter(e => e.meterId !== id);
    saveMeters(updated);
    saveToStorage(updatedEntries);
    if (activeMeterId === id) {
      switchMeter(updated[0].id);
    }
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const activeMeterEntries = useMemo(() => {
    return entries.filter(e => e.meterId === activeMeterId);
  }, [entries, activeMeterId]);

  const addEntry = (date: string, reading: number) => {
    // Check for duplicate date in active meter
    if (activeMeterEntries.some(e => isSameDay(parseISO(e.date), parseISO(date)))) {
      throw new Error('An entry for this date already exists.');
    }

    const dateObj = parseISO(date);
    const newEntry: MeterEntry = {
      id: crypto.randomUUID(),
      meterId: activeMeterId,
      date,
      reading,
      consumed: 0, 
      month: dateObj.getMonth(),
      year: dateObj.getFullYear(),
    };

    const updatedAll = [...entries, newEntry];
    
    // Sort and re-calculate only for this meter
    const sortedActive = updatedAll
      .filter(e => e.meterId === activeMeterId)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    const withConsumption = sortedActive.map((curr, idx) => {
      if (idx === 0) return { ...curr, consumed: 0 };
      const prev = sortedActive[idx - 1];
      return { ...curr, consumed: curr.reading - prev.reading };
    });

    const finalEntries = [
      ...entries.filter(e => e.meterId !== activeMeterId),
      ...withConsumption
    ];

    saveToStorage(finalEntries);
  };

  const deleteEntry = (id: string) => {
    const remaining = entries.filter(e => e.id !== id);
    
    const sortedActive = remaining
      .filter(e => e.meterId === activeMeterId)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    const withConsumption = sortedActive.map((curr, idx) => {
      if (idx === 0) return { ...curr, consumed: 0 };
      const prev = sortedActive[idx - 1];
      return { ...curr, consumed: curr.reading - prev.reading };
    });

    const finalEntries = [
      ...remaining.filter(e => e.meterId !== activeMeterId),
      ...withConsumption
    ];
    saveToStorage(finalEntries);
  };

  const editEntry = (id: string, reading: number) => {
    const updated = entries.map(e => e.id === id ? { ...e, reading } : e);
    
    // Re-calculate for active meter
    const sortedActive = updated
      .filter(e => e.meterId === activeMeterId)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    const withConsumption = sortedActive.map((curr, idx) => {
      if (idx === 0) return { ...curr, consumed: 0 };
      const prev = sortedActive[idx - 1];
      return { ...curr, consumed: curr.reading - prev.reading };
    });

    const finalEntries = [
      ...updated.filter(e => e.meterId !== activeMeterId),
      ...withConsumption
    ];
    saveToStorage(finalEntries);
  };

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthEntries = activeMeterEntries.filter(e => isSameMonth(parseISO(e.date), now));
    const totalConsumedCurrent = currentMonthEntries.reduce((sum, e) => sum + e.consumed, 0);
    
    const sorted = [...activeMeterEntries].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    const latest = sorted[0];
    const prev = sorted[1];

    // Group by month
    const monthlyGroups: { [key: string]: MeterEntry[] } = {};
    activeMeterEntries.forEach(e => {
      const key = `${e.year}-${e.month}`;
      if (!monthlyGroups[key]) monthlyGroups[key] = [];
      monthlyGroups[key].push(e);
    });

    const monthlyStats: MonthlyStats[] = Object.entries(monthlyGroups).map(([key, monthEntries]) => {
      const [year, month] = key.split('-').map(Number);
      const total = monthEntries.reduce((sum, e) => sum + e.consumed, 0);
      return {
        year,
        month,
        totalConsumed: total,
        entryCount: monthEntries.length,
        avgDaily: monthEntries.length > 0 ? total / monthEntries.length : 0,
        monthName: format(new Date(year, month), 'MMMM'),
      };
    }).sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month));

    return {
      latest,
      prev,
      totalConsumedCurrent,
      avgCurrentMonth: currentMonthEntries.length > 0 ? totalConsumedCurrent / currentMonthEntries.length : 0,
      monthlyStats,
      allSorted: sorted
    };
  }, [activeMeterEntries]);

  return {
    entries: activeMeterEntries,
    meters,
    activeMeterId,
    activeMeter: meters.find(m => m.id === activeMeterId),
    addMeter,
    deleteMeter,
    switchMeter,
    settings,
    addEntry,
    deleteEntry,
    editEntry,
    updateSettings,
    stats,
  };
}

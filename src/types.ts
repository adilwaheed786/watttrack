export interface Meter {
  id: string;
  name: string;
  type: string; // e.g. "Main", "Solar", "Generator"
  createdAt: string;
}

export interface MeterEntry {
  id: string;
  meterId: string;
  date: string; // ISO string YYYY-MM-DD
  reading: number; // Meter reading (cumulative)
  consumed: number; // Calculated consumption (this reading - previous reading)
  month: number; // 0-indexed
  year: number;
}

export interface Settings {
  unitRate: number;
  currency: string;
}

export interface MonthlyStats {
  month: number;
  year: number;
  totalConsumed: number;
  avgDaily: number;
  entryCount: number;
  monthName: string;
}

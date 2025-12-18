import React, { createContext, ReactNode, useContext, useState } from 'react';

export type SurveyType = 'morning' | 'night';

export interface JournalEntry {
  id: string;
  date: string; // ISO date
  surveyType: SurveyType;
  goalsCompleted: number;
  schedulePercent: number; // 0-100
  rewards: { coins: number; xp: number; fury: number };
  text?: string;
}

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  getEntriesByDate: (date: string) => JournalEntry[];
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const addEntry = (entry: JournalEntry) => {
    setEntries(prev => [entry, ...prev]);
  };

  const getEntriesByDate = (date: string) => entries.filter(e => e.date === date);

  return <JournalContext.Provider value={{ entries, addEntry, getEntriesByDate }}>{children}</JournalContext.Provider>;
}

export function useJournal() {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used within JournalProvider');
  return ctx;
}

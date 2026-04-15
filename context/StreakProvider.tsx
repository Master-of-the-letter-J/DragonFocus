import React, { createContext, ReactNode, useContext, useState } from 'react';

interface StreakContextType {
  streak: number; // Current streak count
  lastSurveyDate: string | null; // ISO date string
  incrementStreak: () => void;
  resetStreak: () => void;
  setStreak: (value: number) => void;
  adjustStreak: (delta: number) => void;
  getStreak: () => number;
  setLastSurveyDate: (date: string) => void;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export function StreakProvider({ children }: { children: ReactNode }) {
  const [streak, setStreak] = useState(0);
  const [lastSurveyDate, setLastSurveyDate] = useState<string | null>(null);

  const incrementStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (lastSurveyDate === today) {
      // Already filled survey today, don't increment again
      return;
    }

    const lastDate = lastSurveyDate ? new Date(lastSurveyDate) : null;
    const todayDate = new Date(today);

    if (lastDate) {
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        // Consecutive day
        setStreak(prev => prev + 1);
      } else if (diffDays > 1) {
        // Streak broken, restart
        setStreak(1);
      }
    } else {
      // First survey
      setStreak(1);
    }

    setLastSurveyDate(today);
  };

  const resetStreak = () => {
    setStreak(0);
    setLastSurveyDate(null);
  };

  const setStreakValue = (value: number) => {
    setStreak(Math.max(0, Math.floor(value)));
  };

  const adjustStreak = (delta: number) => {
    setStreak(prev => Math.max(0, Math.floor(prev + delta)));
  };

  const getStreak = () => streak;

  return (
    <StreakContext.Provider
      value={{
        streak,
        lastSurveyDate,
        incrementStreak,
        resetStreak,
        setStreak: setStreakValue,
        adjustStreak,
        getStreak,
        setLastSurveyDate,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within StreakProvider');
  }
  return context;
}

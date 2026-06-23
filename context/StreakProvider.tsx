import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { createContext, ReactNode, useContext } from 'react';

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

interface StreakState {
  streak: number;
  lastSurveyDate: string | null;
}

const INITIAL_STREAK_STATE: StreakState = {
  streak: 0,
  lastSurveyDate: null,
};

export function StreakProvider({ children }: { children: ReactNode }) {
  const { state, setState } = usePersistedState(APP_STORAGE_KEYS.streak, INITIAL_STREAK_STATE, {
    normalize: (storedValue, initialValue) => ({ ...initialValue, ...(storedValue ?? {}) }),
  });

  const streak = state.streak;
  const lastSurveyDate = state.lastSurveyDate;

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
        setState(prev => ({ ...prev, streak: prev.streak + 1 }));
      } else if (diffDays > 1) {
        // Streak broken, restart
        setState(prev => ({ ...prev, streak: 1 }));
      }
    } else {
      // First survey
      setState(prev => ({ ...prev, streak: 1 }));
    }

    setState(prev => ({ ...prev, lastSurveyDate: today }));
  };

  const resetStreak = () => {
    setState(INITIAL_STREAK_STATE);
  };

  const setStreakValue = (value: number) => {
    setState(prev => ({ ...prev, streak: Math.max(0, Math.floor(value)) }));
  };

  const adjustStreak = (delta: number) => {
    setState(prev => ({ ...prev, streak: Math.max(0, Math.floor(prev.streak + delta)) }));
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
        setLastSurveyDate: date => setState(prev => ({ ...prev, lastSurveyDate: date })),
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

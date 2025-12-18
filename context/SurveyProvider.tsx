import React, { createContext, ReactNode, useContext, useState } from 'react';

interface SurveyOptions {
  showQuote: boolean;
  enableJournalMorning: boolean;
  enableJournalNight: boolean;
  enableMoodQuestion: boolean;
  enableProjectQuestion: boolean;
  dayChecklistType: 'simple' | 'importance' | 'category';
}

interface SurveyContextType {
  morningSurveyCompleted: boolean;
  nightSurveyCompleted: boolean;
  lastMorningSurveyDate: string | null;
  lastNightSurveyDate: string | null;
  completeMorningSurvey: () => void;
  completeNightSurvey: () => void;
  resetDailySurveys: () => void;
  canTakeMorningSurvey: () => boolean;
  canTakeNightSurvey: () => boolean;
  getMorningProgress: () => number; // 0-100
  getNightProgress: () => number; // 0-100
  // Options
  options: SurveyOptions;
  setOption: <K extends keyof SurveyOptions>(key: K, value: SurveyOptions[K]) => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [morningSurveyCompleted, setMorningSurveyCompleted] = useState(false);
  const [nightSurveyCompleted, setNightSurveyCompleted] = useState(false);
  const [lastMorningSurveyDate, setLastMorningSurveyDate] = useState<string | null>(null);
  const [lastNightSurveyDate, setLastNightSurveyDate] = useState<string | null>(null);
  const [surveyProgress, setSurveyProgress] = useState(0); // 0-100
  const [options, setOptions] = useState<SurveyOptions>({
    showQuote: true,
    enableJournalMorning: true,
    enableJournalNight: true,
    enableMoodQuestion: true,
    enableProjectQuestion: true,
    dayChecklistType: 'simple',
  });

  const today = new Date().toISOString().split('T')[0];

  const resetDailySurveys = () => {
    if (lastMorningSurveyDate !== today) {
      setMorningSurveyCompleted(false);
    }
    if (lastNightSurveyDate !== today) {
      setNightSurveyCompleted(false);
    }
  };

  const completeMorningSurvey = () => {
    setMorningSurveyCompleted(true);
    setLastMorningSurveyDate(today);
  };

  const completeNightSurvey = () => {
    setNightSurveyCompleted(true);
    setLastNightSurveyDate(today);
  };

  const canTakeMorningSurvey = (): boolean => {
    // Can take if not completed today
    return lastMorningSurveyDate !== today;
  };

  const canTakeNightSurvey = (): boolean => {
    // Can take if not completed today
    return lastNightSurveyDate !== today;
  };

  const getMorningProgress = (): number => {
    return morningSurveyCompleted && lastMorningSurveyDate === today ? 100 : 0;
  };

  const getNightProgress = (): number => {
    return nightSurveyCompleted && lastNightSurveyDate === today ? 100 : 0;
  };

  const setOption = <K extends keyof SurveyOptions>(key: K, value: SurveyOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SurveyContext.Provider
      value={{
        morningSurveyCompleted,
        nightSurveyCompleted,
        lastMorningSurveyDate,
        lastNightSurveyDate,
        completeMorningSurvey,
        completeNightSurvey,
        resetDailySurveys,
        canTakeMorningSurvey,
        canTakeNightSurvey,
        getMorningProgress,
        getNightProgress,
        options,
        setOption,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey must be used within SurveyProvider');
  }
  return context;
}

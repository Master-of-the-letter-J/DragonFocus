import React, { createContext, ReactNode, useContext, useState } from 'react';

interface DragonClickingContextType {
  totalClicks: number;
  clicksToday: number;
  addClick: () => void;
  resetDailyClicks: () => void;
  getCoinsPerClick: (yinValue: number) => number;
  getMaxClicksPerDay: (scarLevel: number) => number;
  canClickToday: (scarLevel: number) => boolean;
}

const DragonClickingContext = createContext<DragonClickingContextType | undefined>(undefined);

export function DragonClickingProvider({ children }: { children: ReactNode }) {
  const [totalClicks, setTotalClicks] = useState(0);
  const [clicksToday, setClicksToday] = useState(0);
  const [lastClickResetDate, setLastClickResetDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Check if we need to reset daily clicks
  const checkAndResetDailyClicks = () => {
    const today = new Date().toISOString().split('T')[0];
    if (today !== lastClickResetDate) {
      setClicksToday(0);
      setLastClickResetDate(today);
    }
  };

  const addClick = () => {
    checkAndResetDailyClicks();
    setTotalClicks(prev => prev + 1);
    setClicksToday(prev => prev + 1);
  };

  const resetDailyClicks = () => {
    setClicksToday(0);
    setLastClickResetDate(new Date().toISOString().split('T')[0]);
  };

  const getCoinsPerClick = (yinValue: number): number => {
    // +1 Coin Every 100 + yin * 5 clicks
    // So 1 coin per (100 + yin * 5) clicks
    return 1 / (100 + yinValue * 5);
  };

  const getMaxClicksPerDay = (scarLevel: number): number => {
    // Maximum Amount / Day is Dependent on Scar Level * 10
    return scarLevel * 10;
  };

  const canClickToday = (scarLevel: number): boolean => {
    checkAndResetDailyClicks();
    return clicksToday < getMaxClicksPerDay(scarLevel);
  };

  return (
    <DragonClickingContext.Provider
      value={{
        totalClicks,
        clicksToday,
        addClick,
        resetDailyClicks,
        getCoinsPerClick,
        getMaxClicksPerDay,
        canClickToday,
      }}
    >
      {children}
    </DragonClickingContext.Provider>
  );
}

export function useDragonClicking() {
  const context = useContext(DragonClickingContext);
  if (!context) {
    throw new Error('useDragonClicking must be used within DragonClickingProvider');
  }
  return context;
}

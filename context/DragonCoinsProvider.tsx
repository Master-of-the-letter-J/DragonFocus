import React, { createContext, ReactNode, useContext, useState } from 'react';

interface DragonCoinsContextType {
  coins: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  getCoins: () => number;
  calculateSurveyCoins: (isMorningOrNight: boolean, streak: number, scarLevel: number, isPremium: boolean) => number;
  addMorningSurveyCoins: (streak: number, scarLevel: number, isPremium: boolean) => void;
  addNightSurveyCoins: (streak: number, scarLevel: number, isPremium: boolean) => void;
  addAdditionalSurveyCoins: (streak: number, scarLevel: number, isPremium: boolean) => void;
  addClickingCoins: (yinValue: number, scarLevel: number, isPremium: boolean) => void;
}

const DragonCoinsContext = createContext<DragonCoinsContextType | undefined>(undefined);

export function DragonCoinsProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState(0);

  const addCoins = (amount: number) => {
    setCoins(prev => Math.max(0, prev + amount));
  };

  const spendCoins = (amount: number): boolean => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      return true;
    }
    return false;
  };

  const getCoins = () => coins;

  const calculateSurveyCoins = (isMorningOrNight: boolean, streak: number, scarLevel: number, isPremium: boolean): number => {
    let baseCoins = isMorningOrNight ? 10 : 10; // +10 Morning/Night
    let streakBonus = streak >= 1 ? 1 * streak : 0; // +1 * Streak
    let multiplier = scarLevel * 0.1 + 1; // Scar level multiplier: 1.0 + (level * 0.1)
    
    if (isPremium) {
      multiplier *= 2; // Premium 2x multiplier
    }

    return Math.floor((baseCoins + streakBonus) * multiplier);
  };

  const addMorningSurveyCoins = (streak: number, scarLevel: number, isPremium: boolean) => {
    const coins = calculateSurveyCoins(true, streak, scarLevel, isPremium);
    addCoins(coins);
  };

  const addNightSurveyCoins = (streak: number, scarLevel: number, isPremium: boolean) => {
    const coins = calculateSurveyCoins(true, streak, scarLevel, isPremium);
    addCoins(coins);
  };

  const addAdditionalSurveyCoins = (streak: number, scarLevel: number, isPremium: boolean) => {
    let baseCoins = 1;
    let streakBonus = streak >= 1 ? 1 * streak : 0;
    let multiplier = scarLevel * 0.1 + 1;
    
    if (isPremium) {
      multiplier *= 2;
    }

    addCoins(Math.floor((baseCoins + streakBonus) * multiplier));
  };

  const addClickingCoins = (yinValue: number, scarLevel: number, isPremium: boolean) => {
    // +10/(yang/10) ay where yang = 100 - yin
    const yangValue = 100 - yinValue;
    const baseCoins = 10 / (yangValue / 10);
    let multiplier = scarLevel * 0.1 + 1;
    
    if (isPremium) {
      multiplier *= 2;
    }

    addCoins(Math.floor(baseCoins * multiplier));
  };

  return (
    <DragonCoinsContext.Provider
      value={{
        coins,
        addCoins,
        spendCoins,
        getCoins,
        calculateSurveyCoins,
        addMorningSurveyCoins,
        addNightSurveyCoins,
        addAdditionalSurveyCoins,
        addClickingCoins,
      }}
    >
      {children}
    </DragonCoinsContext.Provider>
  );
}

export function useDragonCoins() {
  const context = useContext(DragonCoinsContext);
  if (!context) {
    throw new Error('useDragonCoins must be used within DragonCoinsProvider');
  }
  return context;
}

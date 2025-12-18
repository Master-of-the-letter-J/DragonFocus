import React, { createContext, ReactNode, useContext, useState } from 'react';

export type ScarLevelName = 
  | 'Beginner'
  | 'Apprentice'
  | 'Rider'
  | 'Whisperer'
  | 'Journeyman'
  | 'Trainer'
  | 'Warden'
  | 'Dragon Warrior'
  | 'Dragon Master'
  | 'Dragon Grandmaster'
  | 'Ultimate Dragon Warrior';

export interface ScarLevelInfo {
  level: number;
  name: ScarLevelName;
  requiredXP: number;
  multiplier: number;
  features: string[];
  premiumFeatures?: string[];
}

const SCAR_LEVELS: ScarLevelInfo[] = [
  {
    level: 0,
    name: 'Beginner',
    requiredXP: 0,
    multiplier: 1.0,
    features: ['Morning/Night Surveys', 'Day Goals', 'Mood', 'Streaks', 'Stats Table'],
  },
  {
    level: 1,
    name: 'Apprentice',
    requiredXP: 50,
    multiplier: 1.1,
    features: ['Schedules', 'Custom Checklists', 'Goal Categories', 'Goal Importance', 'Shop (Multiplier Snacks)'],
  },
  {
    level: 2,
    name: 'Rider',
    requiredXP: 100,
    multiplier: 1.2,
    features: ['Journal', 'Quotes', 'Short Answer Goals', 'Prompts', 'Cosmetics', 'Mood Snacks'],
  },
  {
    level: 3,
    name: 'Whisperer',
    requiredXP: 250,
    multiplier: 1.3,
    features: ['Custom Dropdowns', 'More Cosmetics', 'Special Snacks'],
  },
  {
    level: 4,
    name: 'Journeyman',
    requiredXP: 500,
    multiplier: 1.4,
    features: ['Clicking Dragon', 'Achievements', 'New Theme', 'More Cosmetics'],
  },
  {
    level: 5,
    name: 'Trainer',
    requiredXP: 1000,
    multiplier: 1.5,
    features: ['Clicking Dragon Upgrades', 'Coin Generators', 'New Theme', 'More Cosmetics', 'Glowing Icon'],
  },
  {
    level: 6,
    name: 'Warden',
    requiredXP: 2500,
    multiplier: 1.6,
    features: ['Coin Snacks', 'Cosmetics'],
  },
  {
    level: 7,
    name: 'Dragon Warrior',
    requiredXP: 5000,
    multiplier: 1.7,
    features: ['Health Snacks', 'Rename Dragon (Wyrm)', 'Cosmetics'],
  },
  {
    level: 8,
    name: 'Dragon Master',
    requiredXP: 10000,
    multiplier: 1.8,
    features: ['Cosmetics'],
  },
  {
    level: 9,
    name: 'Dragon Grandmaster',
    requiredXP: 25000,
    multiplier: 1.9,
    features: ['Cosmetics'],
  },
  {
    level: 10,
    name: 'Ultimate Dragon Warrior',
    requiredXP: 100000,
    multiplier: 2.0,
    features: ['Cosmetics', 'New Background', 'Best Icon'],
    premiumFeatures: ['Dragon Pact Premium Features'],
  },
];

interface ScarLevelContextType {
  currentScarLevel: number;
  currentXP: number;
  addXP: (amount: number) => void;
  getCurrentLevelInfo: () => ScarLevelInfo;
  getNextLevelInfo: () => ScarLevelInfo | null;
  getXPToNextLevel: () => number;
  levelUp: () => void;
  getMultiplier: (isPremium: boolean) => number;
  hasFeature: (feature: string) => boolean;
  setScarLevel: (level: number) => void;
  setXP: (xp: number) => void;
}

const ScarLevelContext = createContext<ScarLevelContextType | undefined>(undefined);

export function ScarLevelProvider({ children }: { children: ReactNode }) {
  const [currentScarLevel, setCurrentScarLevel] = useState(0);
  const [currentXP, setCurrentXP] = useState(0);

  const getCurrentLevelInfo = (): ScarLevelInfo => {
    return SCAR_LEVELS[currentScarLevel] || SCAR_LEVELS[SCAR_LEVELS.length - 1];
  };

  const getNextLevelInfo = (): ScarLevelInfo | null => {
    if (currentScarLevel >= SCAR_LEVELS.length - 1) {
      return null;
    }
    return SCAR_LEVELS[currentScarLevel + 1];
  };

  const getXPToNextLevel = (): number => {
    const nextLevel = getNextLevelInfo();
    if (!nextLevel) return 0;
    return nextLevel.requiredXP - currentXP;
  };

  const addXP = (amount: number) => {
    const newXP = currentXP + amount;
    setCurrentXP(newXP);

    // Check if we should level up
    let newLevel = currentScarLevel;
    for (let i = currentScarLevel + 1; i < SCAR_LEVELS.length; i++) {
      if (newXP >= SCAR_LEVELS[i].requiredXP) {
        newLevel = i;
      } else {
        break;
      }
    }

    if (newLevel > currentScarLevel) {
      setCurrentScarLevel(newLevel);
    }
  };

  const levelUp = () => {
    const nextLevel = getNextLevelInfo();
    if (nextLevel) {
      const xpNeeded = nextLevel.requiredXP;
      setCurrentScarLevel(prev => prev + 1);
      setCurrentXP(xpNeeded);
    }
  };

  const getMultiplier = (isPremium: boolean): number => {
    const baseMultiplier = getCurrentLevelInfo().multiplier;
    return isPremium ? baseMultiplier * 2 : baseMultiplier;
  };

  const hasFeature = (feature: string): boolean => {
    const currentLevel = getCurrentLevelInfo();
    return currentLevel.features.includes(feature);
  };

  const setScarLevelValue = (level: number) => {
    const clampedLevel = Math.max(0, Math.min(level, SCAR_LEVELS.length - 1));
    setCurrentScarLevel(clampedLevel);
    setCurrentXP(SCAR_LEVELS[clampedLevel].requiredXP);
  };

  const setXPValue = (xp: number) => {
    setCurrentXP(Math.max(0, xp));
  };

  return (
    <ScarLevelContext.Provider
      value={{
        currentScarLevel,
        currentXP,
        addXP,
        getCurrentLevelInfo,
        getNextLevelInfo,
        getXPToNextLevel,
        levelUp,
        getMultiplier,
        hasFeature,
        setScarLevel: setScarLevelValue,
        setXP: setXPValue,
      }}
    >
      {children}
    </ScarLevelContext.Provider>
  );
}

export function useScarLevel() {
  const context = useContext(ScarLevelContext);
  if (!context) {
    throw new Error('useScarLevel must be used within ScarLevelProvider');
  }
  return context;
}

import React, { createContext, ReactNode, useContext, useState } from 'react';

export type DragonAge = 'Egg' | 'Hatchling' | 'Dragonet' | 'Juvenile' | 'Young Adult' | 'Adult' | 'Elder Dragon' | 'Wyrm';

export interface DragonStage {
  name: DragonAge;
  minAge: number;
  maxAge: number;
  maxHP: number;
}

const DRAGON_STAGES: DragonStage[] = [
  { name: 'Egg', minAge: 0, maxAge: 10, maxHP: 50 },
  { name: 'Hatchling', minAge: 10, maxAge: 20, maxHP: 75 },
  { name: 'Dragonet', minAge: 20, maxAge: 30, maxHP: 100 },
  { name: 'Juvenile', minAge: 30, maxAge: 90, maxHP: 150 },
  { name: 'Young Adult', minAge: 90, maxAge: 180, maxHP: 200 },
  { name: 'Adult', minAge: 180, maxAge: 270, maxHP: 300 },
  { name: 'Elder Dragon', minAge: 270, maxAge: 365, maxHP: 400 },
  { name: 'Wyrm', minAge: 365, maxAge: Infinity, maxHP: 600 },
];

interface DragonContextType {
  age: number;
  hp: number;
  maxHP: number;
  currentStage: DragonStage;
  dragonName: string;
  incrementAge: () => void;
  damageHp: (amount: number) => void;
  healHp: (amount: number) => void;
  setHp: (amount: number) => void;
  regenerateHP: (yinValue: number) => void;
  addHealthFromSurvey: () => void;
  dailyHealthPenalty: (yinValue: number) => void;
  getStageForAge: (age: number) => DragonStage;
  setDragonName: (name: string) => void;
}

const DragonContext = createContext<DragonContextType | undefined>(undefined);

export function DragonProvider({ children }: { children: ReactNode }) {
  const [age, setAge] = useState(0);
  const [hp, setHp] = useState(100);
  const [dragonName, setDragonName] = useState('My Dragon');

  const getStageForAge = (ageValue: number): DragonStage => {
    return DRAGON_STAGES.find(stage => ageValue >= stage.minAge && ageValue < stage.maxAge) || DRAGON_STAGES[DRAGON_STAGES.length - 1];
  };

  const currentStage = getStageForAge(age);
  const maxHP = currentStage.maxHP;

  const incrementAge = () => {
    setAge(prev => prev + 1);
    // When age changes, adjust HP cap if needed
    const newStage = getStageForAge(age + 1);
    if (newStage.maxHP > maxHP) {
      // Healing on level up
      setHp(prev => Math.min(prev + 5, newStage.maxHP));
    }
  };

  const damageHp = (amount: number) => {
    setHp(prev => Math.max(0, prev - amount));
  };

  const healHp = (amount: number) => {
    setHp(prev => Math.min(maxHP, prev + amount));
  };

  const setHpValue = (amount: number) => {
    setHp(Math.max(0, Math.min(maxHP, amount)));
  };

  const regenerateHP = (yinValue: number) => {
    // Regenerates as Yin is earned
    const regenerationAmount = Math.floor(yinValue / 10); // Adjust scaling as needed
    healHp(regenerationAmount);
  };

  const addHealthFromSurvey = () => {
    // +5 every new survey
    healHp(5);
  };

  const dailyHealthPenalty = (yinValue: number) => {
    // -10 Skipping Day, Up to -10/Day when under 50 Yin
    if (yinValue < 50) {
      damageHp(10);
    }
  };

  return (
    <DragonContext.Provider
      value={{
        age,
        hp,
        maxHP,
        currentStage,
        dragonName,
        incrementAge,
        damageHp,
        healHp,
        setHp: setHpValue,
        regenerateHP,
        addHealthFromSurvey,
        dailyHealthPenalty,
        getStageForAge,
        setDragonName,
      }}
    >
      {children}
    </DragonContext.Provider>
  );
}

export function useDragon() {
  const context = useContext(DragonContext);
  if (!context) {
    throw new Error('useDragon must be used within DragonProvider');
  }
  return context;
}

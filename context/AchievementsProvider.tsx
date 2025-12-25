import React, { createContext, ReactNode, useContext, useState } from 'react';

interface Achievement {
  id: string;
  title: string;
  description?: string;
  earned?: boolean;
  earnedAt?: string | null;
}

interface AchievementsContextType {
  achievements: Achievement[];
  unlock: (id: string) => void;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'starter', title: 'Getting Started', description: 'Complete your first survey', earned: false, earnedAt: null },
  ]);

  const unlock = (id: string) => {
    setAchievements(prev => prev.map(a => a.id === id ? { ...a, earned: true, earnedAt: new Date().toISOString() } : a));
  };

  return (
    <AchievementsContext.Provider value={{ achievements, unlock }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error('useAchievements must be used within AchievementsProvider');
  return ctx;
}

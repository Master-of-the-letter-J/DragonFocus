import React, { createContext, ReactNode, useContext, useState } from 'react';

interface Generator {
  id: string;
  name: string;
  level: number;
  ratePerMinute: number;
}

interface GeneratorsContextType {
  generators: Generator[];
  upgrade: (id: string) => void;
}

const GeneratorsContext = createContext<GeneratorsContextType | undefined>(undefined);

export function GeneratorsProvider({ children }: { children: ReactNode }) {
  const [generators, setGenerators] = useState<Generator[]>([
    { id: 'treasury', name: 'Treasury', level: 1, ratePerMinute: 1 },
  ]);

  const upgrade = (id: string) => {
    setGenerators(prev => prev.map(g => g.id === id ? { ...g, level: g.level + 1, ratePerMinute: Math.round(g.ratePerMinute * 1.5) } : g));
  };

  return (
    <GeneratorsContext.Provider value={{ generators, upgrade }}>
      {children}
    </GeneratorsContext.Provider>
  );
}

export function useGenerators() {
  const ctx = useContext(GeneratorsContext);
  if (!ctx) throw new Error('useGenerators must be used within GeneratorsProvider');
  return ctx;
}

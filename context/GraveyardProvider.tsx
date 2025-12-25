// context/GraveyardProvider.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface GraveyardEntry {
	id: string;
	name: string;
	age: number;
	stage: string;
	hp: number;
	maxHP: number;
	healthState: 'Depression' | 'Mediocre' | 'Jolly';
	generation: number;
	date: string; // YYYY-MM-DD
	cause: string;
}

interface GraveyardContextType {
	graveyard: GraveyardEntry[];
	addEntry: (entry: GraveyardEntry) => void;
	removeEntry: (id: string) => void;
	clearGraveyard: () => void;
}

const GraveyardContext = createContext<GraveyardContextType | undefined>(undefined);

export function GraveyardProvider({ children }: { children: ReactNode }) {
	const [graveyard, setGraveyard] = useState<GraveyardEntry[]>([]);

	const addEntry = (entry: GraveyardEntry) => {
		setGraveyard(prev => [entry, ...prev]); // newest first
	};

	const removeEntry = (id: string) => {
		setGraveyard(prev => prev.filter(e => e.id !== id));
	};

	const clearGraveyard = () => {
		setGraveyard([]);
	};

	return (
		<GraveyardContext.Provider
			value={{
				graveyard,
				addEntry,
				removeEntry,
				clearGraveyard,
			}}>
			{children}
		</GraveyardContext.Provider>
	);
}

export function useGraveyard() {
	const ctx = useContext(GraveyardContext);
	if (!ctx) throw new Error('useGraveyard must be used within GraveyardProvider');
	return ctx;
}

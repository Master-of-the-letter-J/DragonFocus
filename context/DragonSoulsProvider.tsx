import React, { createContext, ReactNode, useContext, useState } from 'react';

interface DragonSoulsContextType {
	souls: number;
	addSouls: (amount: number) => void;
	spendSouls: (amount: number) => boolean;
	getSouls: () => number;
	resetSouls: () => void;
}

const DragonSoulsContext = createContext<DragonSoulsContextType | undefined>(undefined);

export function DragonSoulsProvider({ children }: { children: ReactNode }) {
	const [souls, setSouls] = useState(0);

	const addSouls = (amount: number) => {
		setSouls(prev => Math.max(0, prev + amount));
	};

	const spendSouls = (amount: number) => {
		if (souls < amount) return false;
		setSouls(prev => Math.max(0, prev - amount));
		return true;
	};

	const getSouls = () => souls;
	const resetSouls = () => setSouls(0);

	return <DragonSoulsContext.Provider value={{ souls, addSouls, spendSouls, getSouls, resetSouls }}>{children}</DragonSoulsContext.Provider>;
}

export function useDragonSouls() {
	const context = useContext(DragonSoulsContext);
	if (!context) {
		throw new Error('useDragonSouls must be used within DragonSoulsProvider');
	}
	return context;
}

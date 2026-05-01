import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { createContext, ReactNode, useContext } from 'react';

interface DragonSoulState {
	souls: number;
	totalSoulsEarned: number;
}

interface DragonSoulsContextType {
	souls: number;
	totalSoulsEarned: number;
	addSouls: (amount: number) => void;
	spendSouls: (amount: number) => boolean;
	awardAscensionSouls: (amount: number) => void;
	getSouls: () => number;
	getTotalSoulsEarned: () => number;
	resetSouls: () => void;
}

const DragonSoulsContext = createContext<DragonSoulsContextType | undefined>(undefined);

const INITIAL_DRAGON_SOUL_STATE: DragonSoulState = {
	souls: 0,
	totalSoulsEarned: 0,
};

export function DragonSoulsProvider({ children }: { children: ReactNode }) {
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.dragonSouls, INITIAL_DRAGON_SOUL_STATE);

	const addSouls = (amount: number) => {
		if (amount <= 0) return;
		setState(current => ({
			...current,
			souls: Math.max(0, current.souls + amount),
		}));
	};

	const spendSouls = (amount: number) => {
		if (amount <= 0) return true;
		if (state.souls < amount) return false;
		setState(current => ({
			...current,
			souls: Math.max(0, current.souls - amount),
		}));
		return true;
	};

	const awardAscensionSouls = (amount: number) => {
		const safeAmount = Math.max(0, Math.floor(amount));
		setState(current => ({
			souls: safeAmount,
			totalSoulsEarned: Math.max(0, current.totalSoulsEarned + safeAmount),
		}));
	};

	const getSouls = () => state.souls;
	const getTotalSoulsEarned = () => state.totalSoulsEarned;
	const resetSouls = () => setState(INITIAL_DRAGON_SOUL_STATE);

	return (
		<DragonSoulsContext.Provider
			value={{
				souls: state.souls,
				totalSoulsEarned: state.totalSoulsEarned,
				addSouls,
				spendSouls,
				awardAscensionSouls,
				getSouls,
				getTotalSoulsEarned,
				resetSouls,
			}}>
			{children}
		</DragonSoulsContext.Provider>
	);
}

export function useDragonSouls() {
	const context = useContext(DragonSoulsContext);
	if (!context) {
		throw new Error('useDragonSouls must be used within DragonSoulsProvider');
	}
	return context;
}

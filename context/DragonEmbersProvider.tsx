import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { ReactNode, createContext, useContext } from 'react';

interface DragonEmberState {
	embers: number;
	totalEmbersEarned: number;
}

interface DragonEmbersContextType {
	embers: number;
	totalEmbersEarned: number;
	earnEmbers: (amount: number) => void;
	restoreEmbers: (amount: number) => void;
	spendEmbers: (amount: number) => boolean;
	getEmbers: () => number;
	getTotalEmbersEarned: () => number;
	resetEmbers: () => void;
}

const INITIAL_DRAGON_EMBER_STATE: DragonEmberState = {
	embers: 0,
	totalEmbersEarned: 0,
};

const DragonEmbersContext = createContext<DragonEmbersContextType | undefined>(undefined);

export function DragonEmbersProvider({ children }: { children: ReactNode }) {
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.dragonEmbers, INITIAL_DRAGON_EMBER_STATE);

	const earnEmbers = (amount: number) => {
		if (amount <= 0) return;
		setState(current => ({
			embers: Math.max(0, current.embers + amount),
			totalEmbersEarned: Math.max(0, current.totalEmbersEarned + amount),
		}));
	};

	const restoreEmbers = (amount: number) => {
		if (amount <= 0) return;
		setState(current => ({
			...current,
			embers: Math.max(0, current.embers + amount),
		}));
	};

	const spendEmbers = (amount: number) => {
		if (amount <= 0) return true;
		if (state.embers < amount) return false;

		setState(current => ({
			...current,
			embers: Math.max(0, current.embers - amount),
		}));
		return true;
	};

	const resetEmbers = () => {
		setState(INITIAL_DRAGON_EMBER_STATE);
	};

	return (
		<DragonEmbersContext.Provider
			value={{
				embers: state.embers,
				totalEmbersEarned: state.totalEmbersEarned,
				earnEmbers,
				restoreEmbers,
				spendEmbers,
				getEmbers: () => state.embers,
				getTotalEmbersEarned: () => state.totalEmbersEarned,
				resetEmbers,
			}}>
			{children}
		</DragonEmbersContext.Provider>
	);
}

export function useDragonEmbers() {
	const context = useContext(DragonEmbersContext);
	if (!context) {
		throw new Error('useDragonEmbers must be used within DragonEmbersProvider');
	}
	return context;
}

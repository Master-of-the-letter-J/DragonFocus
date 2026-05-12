import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { ReactNode, createContext, useContext } from 'react';

interface DragonOrbState {
	orbs: number;
	totalOrbsEarned: number;
	totalShardOrbsEarned: number;
	totalAttackOrbsEarned: number;
}

interface DragonOrbsContextType {
	orbs: number;
	totalOrbsEarned: number;
	totalShardOrbsEarned: number;
	totalAttackOrbsEarned: number;
	earnOrbs: (amount: number, source?: 'shards' | 'attack' | 'other') => void;
	restoreOrbs: (amount: number) => void;
	spendOrbs: (amount: number) => boolean;
	getOrbs: () => number;
	getTotalOrbsEarned: () => number;
	resetOrbs: () => void;
}

const INITIAL_DRAGON_ORB_STATE: DragonOrbState = {
	orbs: 0,
	totalOrbsEarned: 0,
	totalShardOrbsEarned: 0,
	totalAttackOrbsEarned: 0,
};

const round3 = (value: number) => Math.round(value * 1000) / 1000;

const DragonOrbsContext = createContext<DragonOrbsContextType | undefined>(undefined);

export function DragonOrbsProvider({ children }: { children: ReactNode }) {
	const { state, setState } = usePersistedState(APP_STORAGE_KEYS.dragonOrbs, INITIAL_DRAGON_ORB_STATE, {
		normalize: (storedValue, initialValue) => ({ ...initialValue, ...(storedValue ?? {}) }),
	});

	const earnOrbs = (amount: number, source: 'shards' | 'attack' | 'other' = 'other') => {
		if (amount <= 0) return;
		const safeAmount = round3(amount);
		setState(current => ({
			...current,
			orbs: round3(Math.max(0, current.orbs + safeAmount)),
			totalOrbsEarned: round3(current.totalOrbsEarned + safeAmount),
			totalShardOrbsEarned: source === 'shards' ? round3(current.totalShardOrbsEarned + safeAmount) : current.totalShardOrbsEarned,
			totalAttackOrbsEarned: source === 'attack' ? round3(current.totalAttackOrbsEarned + safeAmount) : current.totalAttackOrbsEarned,
		}));
	};

	const restoreOrbs = (amount: number) => {
		if (amount <= 0) return;
		setState(current => ({
			...current,
			orbs: round3(Math.max(0, current.orbs + amount)),
		}));
	};

	const spendOrbs = (amount: number) => {
		if (amount <= 0) return true;
		if (state.orbs < amount) return false;
		setState(current => ({
			...current,
			orbs: round3(Math.max(0, current.orbs - amount)),
		}));
		return true;
	};

	const resetOrbs = () => setState(INITIAL_DRAGON_ORB_STATE);

	return (
		<DragonOrbsContext.Provider
			value={{
				orbs: state.orbs,
				totalOrbsEarned: state.totalOrbsEarned,
				totalShardOrbsEarned: state.totalShardOrbsEarned,
				totalAttackOrbsEarned: state.totalAttackOrbsEarned,
				earnOrbs,
				restoreOrbs,
				spendOrbs,
				getOrbs: () => state.orbs,
				getTotalOrbsEarned: () => state.totalOrbsEarned,
				resetOrbs,
			}}>
			{children}
		</DragonOrbsContext.Provider>
	);
}

export function useDragonOrbs() {
	const context = useContext(DragonOrbsContext);
	if (!context) {
		throw new Error('useDragonOrbs must be used within DragonOrbsProvider');
	}
	return context;
}

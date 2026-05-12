import { APP_STORAGE_KEYS, usePersistedState } from '@/constants/storage';
import React, { createContext, ReactNode, useContext } from 'react';
import { useDragonOrbs } from './DragonOrbsProvider';

interface DragonShardsContextType {
	shards: number;
	addShards: (amount: number, options?: { grantOrbs?: boolean }) => void;
	spendShards: (amount: number) => boolean;
	getShards: () => number;
	resetShards?: () => void;
}

const DragonShardsContext = createContext<DragonShardsContextType | undefined>(undefined);

export function DragonShardsProvider({ children }: { children: ReactNode }) {
	const { state: shards, setState: setShards } = usePersistedState(APP_STORAGE_KEYS.dragonShards, 0);
	const orbs = useDragonOrbs();

	const addShards = (amount: number, options: { grantOrbs?: boolean } = {}) => {
		if (amount > 0 && options.grantOrbs !== false) {
			orbs.earnOrbs(amount * 2, 'shards');
		}
		setShards(prev => Math.max(0, prev + amount));
	};

	const spendShards = (amount: number): boolean => {
		if (shards >= amount) {
			setShards(prev => prev - amount);
			return true;
		}
		return false;
	};

	const getShards = () => shards;

	const resetShards = () => setShards(0);

	return <DragonShardsContext.Provider value={{ shards, addShards, spendShards, getShards, resetShards }}>{children}</DragonShardsContext.Provider>;
}

export function useShards() {
	const context = useContext(DragonShardsContext);
	if (!context) {
		throw new Error('useShards must be used within DragonShardsProvider');
	}
	return context;
}

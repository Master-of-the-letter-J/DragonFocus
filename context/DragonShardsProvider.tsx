import React, { createContext, ReactNode, useContext, useState } from 'react';

interface DragonShardsContextType {
	shards: number;
	addShards: (amount: number) => void;
	spendShards: (amount: number) => boolean;
	getShards: () => number;
	resetShards?: () => void;
}

const DragonShardsContext = createContext<DragonShardsContextType | undefined>(undefined);

export function DragonShardsProvider({ children }: { children: ReactNode }) {
	const [shards, setShards] = useState(0);

	const addShards = (amount: number) => {
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

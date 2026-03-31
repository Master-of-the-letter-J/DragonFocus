import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface PopulationContextType {
	population: number;
	deathCount: number;
	addPopulation: (amount: number) => void;
	setPopulation: (amount: number) => void;
	dailyPopulationUpdate: (yang: number, dragonAge: number) => void;
	onDragonRevival: () => void; // Add 1M when dragon revived
}

const PopulationContext = createContext<PopulationContextType | undefined>(undefined);

const STARTING_POPULATION = 8_000_000_000; // 8 billion

export function PopulationProvider({ children }: { children: ReactNode }) {
	const [population, setPopulationState] = useState(STARTING_POPULATION);
	const [deathCount, setDeathCount] = useState(0);

	const addPopulation = useCallback((amount: number) => {
		setPopulationState(prev => Math.max(0, prev + amount));
	}, []);

	const setPopulation = useCallback((amount: number) => {
		setPopulationState(Math.max(0, amount));
	}, []);

	const dailyPopulationUpdate = useCallback((yang: number, dragonAge: number) => {
		setPopulationState(prev => {
			let newPop = prev;
			let deaths = 0;

			// +1% growth daily
			newPop += prev * 0.01;

			// Decrease scales linearly once Yang exceeds 50.
			if (yang > 50) {
				const overYangRatio = Math.max(0, Math.min(1, (yang - 50) / 50));
				const maxDecreasePercent = 5 + Math.min(20, dragonAge / 73);
				const decreasePercent = (maxDecreasePercent / 100) * overYangRatio;
				const popDecrease = Math.floor(prev * decreasePercent);
				newPop -= popDecrease;
				deaths += popDecrease;
				const flatLoss = Math.floor(50_000 * overYangRatio);
				newPop -= flatLoss;
				deaths += flatLoss;
			}

			// Update death count
			setDeathCount(prev => prev + deaths);

			return Math.max(0, newPop);
		});
	}, []);

	const onDragonRevival = useCallback(() => {
		addPopulation(1_000_000); // +1 million on revival
	}, [addPopulation]);

	return (
		<PopulationContext.Provider
			value={{
				population,
				deathCount,
				addPopulation,
				setPopulation,
				dailyPopulationUpdate,
				onDragonRevival,
			}}>
			{children}
		</PopulationContext.Provider>
	);
}

export function usePopulation() {
	const ctx = useContext(PopulationContext);
	if (!ctx) throw new Error('usePopulation must be used within PopulationProvider');
	return ctx;
}

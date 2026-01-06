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

			// Decrease based on yang (max 5% + (Age/73 clamped to 20)%)
			if (yang > 50) {
				const maxDecrease = 5 + Math.min(20, dragonAge / 73);
				const decreasePercent = maxDecrease / 100;
				const popDecrease = Math.floor(prev * decreasePercent);
				newPop -= popDecrease;
				deaths += popDecrease;
			}

			// Flat 50,000 per day when yang is 100
			if (yang >= 100) {
				newPop -= 50_000;
				deaths += 50_000;
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
